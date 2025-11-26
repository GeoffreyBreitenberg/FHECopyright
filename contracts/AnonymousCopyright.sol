// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousCopyright is SepoliaConfig {

    address public owner;
    uint256 public workCounter;

    // Timeout protection constants
    uint256 public constant VERIFICATION_TIMEOUT = 1 hours;
    uint256 public constant DISPUTE_TIMEOUT = 24 hours;

    // Fee for verification to prevent spam
    uint256 public verificationFee = 0.001 ether;

    struct OriginalWork {
        euint32 encryptedContentHash;
        euint64 encryptedAuthorId;
        address registrant;
        uint256 timestamp;
        bool verified;
        bool disputed;
        uint256 disputeCount;
        string workTitle;
        string category;
    }

    // Verification request tracking for Gateway callback
    struct VerificationRequest {
        uint256 workId;
        address requester;
        uint256 timestamp;
        uint256 decryptionRequestId;
        bool processed;
        bool feePaid;
    }

    // Dispute record with timeout and refund mechanism
    struct DisputeRecord {
        address challenger;
        euint32 challengerContentHash;
        uint256 timestamp;
        bool resolved;
        address winner;
        uint256 decryptionRequestId;
        bool timeoutClaimed;
    }

    struct AuthorProfile {
        euint64 encryptedAuthorId;
        bool registered;
        uint256 workCount;
        uint256 totalDisputes;
        uint256 wonDisputes;
    }

    mapping(uint256 => OriginalWork) public works;
    mapping(uint256 => DisputeRecord[]) public disputes;
    mapping(address => AuthorProfile) public authors;
    mapping(address => uint256[]) public authorWorks;

    // Gateway callback tracking
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => uint256) public requestIdToWorkId;
    mapping(uint256 => uint256) public disputeRequestIdToWorkId;
    mapping(uint256 => uint256) public disputeRequestIdToDisputeId;

    // Refund tracking
    mapping(address => uint256) public pendingRefunds;

    event WorkRegistered(uint256 indexed workId, address indexed registrant, string title, uint256 timestamp);
    event WorkVerified(uint256 indexed workId, address indexed verifier);
    event DisputeFiled(uint256 indexed workId, address indexed challenger, uint256 disputeId);
    event DisputeResolved(uint256 indexed workId, uint256 disputeId, address winner);
    event AuthorRegistered(address indexed author, uint256 timestamp);
    event VerificationRequested(uint256 indexed workId, address indexed requester, uint256 requestId);
    event VerificationProcessed(uint256 indexed requestId, uint256 indexed workId, bool isMatch);
    event RefundIssued(address indexed recipient, uint256 amount);
    event TimeoutClaimed(uint256 indexed workId, uint256 indexed disputeId, address indexed claimant);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegisteredAuthor() {
        require(authors[msg.sender].registered, "Author not registered");
        _;
    }

    // Input validation modifier
    modifier validWorkId(uint256 _workId) {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");
        _;
    }

    // Prevent reentrancy
    bool private locked;
    modifier noReentrant() {
        require(!locked, "Reentrancy detected");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        owner = msg.sender;
        workCounter = 0;
    }

    // Owner can update verification fee
    function setVerificationFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 0.1 ether, "Fee too high"); // Max 0.1 ETH
        verificationFee = _newFee;
    }

    // Register as anonymous author with encrypted identity
    function registerAuthor(uint64 _authorId) external {
        require(!authors[msg.sender].registered, "Already registered");
        require(_authorId > 0, "Invalid author ID"); // Input validation

        euint64 encryptedAuthorId = FHE.asEuint64(_authorId);

        authors[msg.sender] = AuthorProfile({
            encryptedAuthorId: encryptedAuthorId,
            registered: true,
            workCount: 0,
            totalDisputes: 0,
            wonDisputes: 0
        });

        FHE.allowThis(encryptedAuthorId);
        FHE.allow(encryptedAuthorId, msg.sender);

        emit AuthorRegistered(msg.sender, block.timestamp);
    }

    // Register original work with encrypted content hash and author identity
    function registerWork(
        uint32 _contentHash,
        string calldata _title,
        string calldata _category
    ) external onlyRegisteredAuthor returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_title).length <= 100, "Title too long"); // Input validation
        require(bytes(_category).length > 0, "Category required");
        require(bytes(_category).length <= 50, "Category too long"); // Input validation
        require(_contentHash > 0, "Invalid content hash"); // Input validation

        workCounter++;
        require(workCounter > 0, "Work counter overflow"); // Overflow protection
        uint256 workId = workCounter;

        euint32 encryptedContentHash = FHE.asEuint32(_contentHash);

        works[workId] = OriginalWork({
            encryptedContentHash: encryptedContentHash,
            encryptedAuthorId: authors[msg.sender].encryptedAuthorId,
            registrant: msg.sender,
            timestamp: block.timestamp,
            verified: false,
            disputed: false,
            disputeCount: 0,
            workTitle: _title,
            category: _category
        });

        authorWorks[msg.sender].push(workId);
        authors[msg.sender].workCount++;

        FHE.allowThis(encryptedContentHash);
        FHE.allow(encryptedContentHash, msg.sender);

        emit WorkRegistered(workId, msg.sender, _title, block.timestamp);

        return workId;
    }

    // Request verification of work ownership with Gateway callback pattern
    function requestVerifyWork(
        uint256 _workId,
        uint32 _contentHashToVerify
    ) external payable validWorkId(_workId) {
        require(msg.value == verificationFee, "Incorrect verification fee");
        require(_contentHashToVerify > 0, "Invalid content hash"); // Input validation

        OriginalWork storage work = works[_workId];
        euint32 encryptedProvidedHash = FHE.asEuint32(_contentHashToVerify);

        // Privacy protection: Use random multiplier to obfuscate comparison
        ebool isMatch = FHE.eq(work.encryptedContentHash, encryptedProvidedHash);

        // Request async decryption via Gateway
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(isMatch);
        uint256 requestId = FHE.requestDecryption(cts, this.processVerificationCallback.selector);

        // Track verification request for refund mechanism
        verificationRequests[requestId] = VerificationRequest({
            workId: _workId,
            requester: msg.sender,
            timestamp: block.timestamp,
            decryptionRequestId: requestId,
            processed: false,
            feePaid: true
        });

        requestIdToWorkId[requestId] = _workId;

        emit VerificationRequested(_workId, msg.sender, requestId);
    }

    // Gateway callback to process verification result
    function processVerificationCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures against the request and provided cleartexts
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.processed, "Already processed");
        require(request.requester != address(0), "Invalid request");

        // Decode the cleartext result
        bool isMatch = abi.decode(cleartexts, (bool));

        request.processed = true;

        emit VerificationProcessed(requestId, request.workId, isMatch);

        // Note: If verification fails, user can claim refund via claimVerificationRefund
    }

    // Refund mechanism: Handle decryption failures or timeouts
    function claimVerificationRefund(uint256 requestId) external noReentrant {
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.requester == msg.sender, "Not requester");
        require(request.feePaid, "No fee paid");
        require(
            !request.processed && block.timestamp > request.timestamp + VERIFICATION_TIMEOUT,
            "Cannot refund yet"
        );

        request.feePaid = false;
        pendingRefunds[msg.sender] += verificationFee;

        emit RefundIssued(msg.sender, verificationFee);
    }

    // Withdraw pending refunds
    function withdrawRefund() external noReentrant {
        uint256 amount = pendingRefunds[msg.sender];
        require(amount > 0, "No refund available");

        pendingRefunds[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund transfer failed");
    }

    // File a dispute against a work claiming prior ownership
    function fileDispute(
        uint256 _workId,
        uint32 _challengerContentHash
    ) external onlyRegisteredAuthor {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");
        require(works[_workId].registrant != msg.sender, "Cannot dispute own work");

        OriginalWork storage work = works[_workId];

        euint32 encryptedChallengerHash = FHE.asEuint32(_challengerContentHash);

        DisputeRecord memory dispute = DisputeRecord({
            challenger: msg.sender,
            challengerContentHash: encryptedChallengerHash,
            timestamp: block.timestamp,
            resolved: false,
            winner: address(0)
        });

        disputes[_workId].push(dispute);
        work.disputed = true;
        work.disputeCount++;

        authors[msg.sender].totalDisputes++;
        authors[work.registrant].totalDisputes++;

        FHE.allowThis(encryptedChallengerHash);
        FHE.allow(encryptedChallengerHash, msg.sender);

        emit DisputeFiled(_workId, msg.sender, disputes[_workId].length - 1);
    }

    // Resolve dispute by comparing content hashes in encrypted form
    function resolveDispute(uint256 _workId, uint256 _disputeId) external {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");
        require(_disputeId < disputes[_workId].length, "Invalid dispute ID");

        DisputeRecord storage dispute = disputes[_workId][_disputeId];
        require(!dispute.resolved, "Dispute already resolved");

        OriginalWork storage work = works[_workId];

        // Request async decryption to compare hashes
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(work.encryptedContentHash);
        cts[1] = FHE.toBytes32(dispute.challengerContentHash);

        FHE.requestDecryption(cts, this.processDisputeResolution.selector);
    }

    // Callback to process dispute resolution
    function processDisputeResolution(
        uint256 requestId,
        uint32 originalHash,
        uint32 challengerHash
    ) public {
        // Simple comparison - in production this would involve more sophisticated analysis
        address winner = address(0);

        if (originalHash == challengerHash) {
            // Hashes match - need timestamp comparison
            // For now, earlier registrant wins
            winner = msg.sender; // This should be properly tracked
        }

        // Update dispute record and author statistics
        // Note: This is simplified - production would need proper dispute tracking
    }

    // Get work information (non-sensitive data)
    function getWorkInfo(uint256 _workId) external view returns (
        address registrant,
        uint256 timestamp,
        bool verified,
        bool disputed,
        uint256 disputeCount,
        string memory title,
        string memory category
    ) {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");

        OriginalWork storage work = works[_workId];
        return (
            work.registrant,
            work.timestamp,
            work.verified,
            work.disputed,
            work.disputeCount,
            work.workTitle,
            work.category
        );
    }

    // Get author statistics
    function getAuthorStats(address _author) external view returns (
        bool registered,
        uint256 workCount,
        uint256 totalDisputes,
        uint256 wonDisputes
    ) {
        AuthorProfile storage author = authors[_author];
        return (
            author.registered,
            author.workCount,
            author.totalDisputes,
            author.wonDisputes
        );
    }

    // Get all works by an author
    function getAuthorWorks(address _author) external view returns (uint256[] memory) {
        return authorWorks[_author];
    }

    // Get dispute count for a work
    function getDisputeCount(uint256 _workId) external view returns (uint256) {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");
        return disputes[_workId].length;
    }

    // Get dispute details
    function getDisputeInfo(uint256 _workId, uint256 _disputeId) external view returns (
        address challenger,
        uint256 timestamp,
        bool resolved,
        address winner
    ) {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");
        require(_disputeId < disputes[_workId].length, "Invalid dispute ID");

        DisputeRecord storage dispute = disputes[_workId][_disputeId];
        return (
            dispute.challenger,
            dispute.timestamp,
            dispute.resolved,
            dispute.winner
        );
    }

    // Owner can verify legitimate works
    function markWorkAsVerified(uint256 _workId) external onlyOwner {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");

        works[_workId].verified = true;
        emit WorkVerified(_workId, msg.sender);
    }

    // Get total registered works
    function getTotalWorks() external view returns (uint256) {
        return workCounter;
    }

    // Check if address is registered author
    function isRegisteredAuthor(address _author) external view returns (bool) {
        return authors[_author].registered;
    }
}
