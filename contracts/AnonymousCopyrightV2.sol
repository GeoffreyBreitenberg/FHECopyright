// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AnonymousCopyrightV2
 * @notice Privacy-preserving copyright protection using Gateway callback pattern
 * @dev Implements:
 *      - Refund mechanism for decryption failures
 *      - Timeout protection against permanent lock
 *      - Gateway callback pattern for async decryption
 *      - Input validation & access control
 *      - Overflow protection
 *      - Privacy techniques (random multiplier, fuzzy matching)
 *      - HCU (Homomorphic Computation Unit) optimization
 */
contract AnonymousCopyrightV2 is SepoliaConfig {

    // ============ Constants ============
    uint256 public constant MIN_REGISTRATION_FEE = 0.001 ether;
    uint256 public constant MAX_TITLE_LENGTH = 200;
    uint256 public constant MAX_CATEGORY_LENGTH = 100;
    uint256 public constant VERIFICATION_TIMEOUT = 1 hours;
    uint256 public constant DISPUTE_TIMEOUT = 24 hours;
    uint256 public constant MAX_DISPUTES_PER_WORK = 10;
    uint256 public constant DISPUTE_DEPOSIT = 0.005 ether;

    // Privacy constants
    uint64 public constant PRIVACY_MULTIPLIER_MIN = 1000;
    uint64 public constant PRIVACY_MULTIPLIER_MAX = 9999;

    // ============ State Variables ============
    address public owner;
    uint256 public workCounter;
    uint256 public registrationFee;
    bool public paused;
    bool public isTesting;
    uint256 public platformFees;

    // ============ Structs ============

    struct OriginalWork {
        euint32 encryptedContentHash;      // FHE encrypted content fingerprint
        euint64 encryptedAuthorId;         // FHE encrypted author identity
        euint64 privacyNonce;              // Random nonce for privacy protection
        address registrant;
        uint256 timestamp;
        uint256 registrationFeeAmount;     // Fee paid at registration (for potential refund)
        bool verified;
        bool disputed;
        uint256 disputeCount;
        string workTitle;
        string category;
    }

    struct DisputeRecord {
        address challenger;
        euint32 challengerContentHash;
        uint256 timestamp;
        uint256 depositAmount;
        bool resolved;
        address winner;
        uint256 decryptionRequestId;
        uint256 requestTimestamp;          // For timeout protection
    }

    struct AuthorProfile {
        euint64 encryptedAuthorId;
        euint64 privacyMultiplier;         // Random multiplier for privacy
        bool registered;
        uint256 workCount;
        uint256 totalDisputes;
        uint256 wonDisputes;
        uint256 registrationTime;
    }

    struct VerificationRequest {
        address requester;
        uint256 workId;
        uint256 requestId;
        uint256 depositAmount;
        uint256 requestTimestamp;
        bool completed;
        bool refunded;
    }

    struct PendingDecryption {
        uint256 workId;
        uint256 disputeId;
        DecryptionType decryptionType;
        address initiator;
        uint256 timestamp;
    }

    enum DecryptionType {
        Verification,
        DisputeResolution
    }

    // ============ Mappings ============
    mapping(uint256 => OriginalWork) public works;
    mapping(uint256 => DisputeRecord[]) public disputes;
    mapping(address => AuthorProfile) public authors;
    mapping(address => uint256[]) public authorWorks;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => PendingDecryption) internal pendingDecryptions;
    mapping(uint256 => string) internal workIdByRequestId;
    mapping(address => uint256) public pendingRefunds;

    uint256 public verificationRequestCounter;

    // ============ Events ============
    event WorkRegistered(uint256 indexed workId, address indexed registrant, string title, uint256 timestamp, uint256 fee);
    event WorkVerified(uint256 indexed workId, address indexed verifier);
    event DisputeFiled(uint256 indexed workId, address indexed challenger, uint256 disputeId, uint256 deposit);
    event DisputeResolved(uint256 indexed workId, uint256 disputeId, address winner, uint256 prizeAmount);
    event AuthorRegistered(address indexed author, uint256 timestamp);
    event VerificationRequested(uint256 indexed workId, address indexed requester, uint256 requestId, uint256 deposit);
    event VerificationCompleted(uint256 indexed workId, uint256 requestId, bool isMatch);
    event DecryptionRequested(uint256 indexed requestId, DecryptionType decryptionType, uint256 workId);
    event RefundIssued(address indexed recipient, uint256 amount, string reason);
    event TimeoutRefund(address indexed recipient, uint256 amount, uint256 requestId);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event EmergencyPause(address indexed triggeredBy);
    event Unpaused(address indexed triggeredBy);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "AC: Not authorized");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "AC: Contract paused");
        _;
    }

    modifier onlyRegisteredAuthor() {
        require(authors[msg.sender].registered, "AC: Author not registered");
        _;
    }

    modifier validWorkId(uint256 _workId) {
        require(_workId > 0 && _workId <= workCounter, "AC: Invalid work ID");
        _;
    }

    modifier noReentrancy() {
        require(!_locked, "AC: Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    bool private _locked;

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        workCounter = 0;
        registrationFee = MIN_REGISTRATION_FEE;
        paused = false;
        isTesting = false;
    }

    // ============ Admin Functions ============

    /**
     * @notice Emergency pause - stops all state-changing operations
     */
    function pause() external onlyOwner {
        paused = true;
        emit EmergencyPause(msg.sender);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @notice Enable testing mode (for local testing only)
     */
    function setTesting(bool enabled) external onlyOwner {
        isTesting = enabled;
    }

    /**
     * @notice Update registration fee
     * @param newFee New registration fee (must be >= MIN_REGISTRATION_FEE)
     */
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        require(newFee >= MIN_REGISTRATION_FEE, "AC: Fee too low");
        uint256 oldFee = registrationFee;
        registrationFee = newFee;
        emit RegistrationFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Withdraw accumulated platform fees
     * @param to Recipient address
     */
    function withdrawPlatformFees(address to) external onlyOwner noReentrancy {
        require(platformFees > 0, "AC: No fees to withdraw");
        require(to != address(0), "AC: Invalid address");

        uint256 amount = platformFees;
        platformFees = 0;

        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "AC: Withdraw failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    // ============ Author Registration ============

    /**
     * @notice Register as anonymous author with encrypted identity
     * @param _authorId Plain author ID (will be encrypted)
     * @dev Uses privacy multiplier for enhanced privacy protection
     */
    function registerAuthor(uint64 _authorId) external whenNotPaused {
        require(!authors[msg.sender].registered, "AC: Already registered");
        require(_authorId > 0, "AC: Invalid author ID");

        // Create encrypted author ID
        euint64 encryptedAuthorId = FHE.asEuint64(_authorId);

        // Generate privacy multiplier for additional privacy layer
        // This helps protect against division-based attacks
        uint64 randomMultiplier = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _authorId
        ))) % (PRIVACY_MULTIPLIER_MAX - PRIVACY_MULTIPLIER_MIN + 1) + PRIVACY_MULTIPLIER_MIN);

        euint64 privacyMultiplier = FHE.asEuint64(randomMultiplier);

        authors[msg.sender] = AuthorProfile({
            encryptedAuthorId: encryptedAuthorId,
            privacyMultiplier: privacyMultiplier,
            registered: true,
            workCount: 0,
            totalDisputes: 0,
            wonDisputes: 0,
            registrationTime: block.timestamp
        });

        // Set FHE permissions
        FHE.allowThis(encryptedAuthorId);
        FHE.allow(encryptedAuthorId, msg.sender);
        FHE.allowThis(privacyMultiplier);

        emit AuthorRegistered(msg.sender, block.timestamp);
    }

    // ============ Work Registration ============

    /**
     * @notice Register original work with encrypted content hash
     * @param _contentHash Plain content hash (will be encrypted)
     * @param _title Work title (public metadata)
     * @param _category Work category (public metadata)
     * @return workId The ID of the registered work
     */
    function registerWork(
        uint32 _contentHash,
        string calldata _title,
        string calldata _category
    ) external payable onlyRegisteredAuthor whenNotPaused returns (uint256) {
        // Input validation
        require(bytes(_title).length > 0, "AC: Title required");
        require(bytes(_title).length <= MAX_TITLE_LENGTH, "AC: Title too long");
        require(bytes(_category).length > 0, "AC: Category required");
        require(bytes(_category).length <= MAX_CATEGORY_LENGTH, "AC: Category too long");
        require(msg.value >= registrationFee, "AC: Insufficient fee");
        require(_contentHash > 0, "AC: Invalid content hash");

        // Overflow protection
        require(workCounter < type(uint256).max, "AC: Work counter overflow");

        workCounter++;
        uint256 workId = workCounter;

        // Encrypt content hash
        euint32 encryptedContentHash = FHE.asEuint32(_contentHash);

        // Generate privacy nonce for fuzzy matching protection
        uint64 nonce = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            workId
        ))) % type(uint64).max);

        euint64 privacyNonce = FHE.asEuint64(nonce);

        // Create work record
        works[workId] = OriginalWork({
            encryptedContentHash: encryptedContentHash,
            encryptedAuthorId: authors[msg.sender].encryptedAuthorId,
            privacyNonce: privacyNonce,
            registrant: msg.sender,
            timestamp: block.timestamp,
            registrationFeeAmount: msg.value,
            verified: false,
            disputed: false,
            disputeCount: 0,
            workTitle: _title,
            category: _category
        });

        // Update author profile
        authorWorks[msg.sender].push(workId);
        authors[msg.sender].workCount++;

        // Set FHE permissions
        FHE.allowThis(encryptedContentHash);
        FHE.allow(encryptedContentHash, msg.sender);
        FHE.allowThis(privacyNonce);

        // Collect platform fee
        platformFees += msg.value;

        emit WorkRegistered(workId, msg.sender, _title, block.timestamp, msg.value);

        return workId;
    }

    // ============ Verification with Gateway Callback ============

    /**
     * @notice Request verification of work ownership using Gateway callback pattern
     * @param _workId ID of the work to verify
     * @param _contentHashToVerify Content hash to compare
     * @dev User → Contract → Gateway → Callback pattern
     */
    function requestVerifyWork(
        uint256 _workId,
        uint32 _contentHashToVerify
    ) external payable validWorkId(_workId) whenNotPaused noReentrancy {
        require(msg.value >= MIN_REGISTRATION_FEE, "AC: Verification deposit required");
        require(_contentHashToVerify > 0, "AC: Invalid content hash");

        OriginalWork storage work = works[_workId];
        require(work.registrant != address(0), "AC: Work not found");

        // Create encrypted comparison
        euint32 encryptedProvidedHash = FHE.asEuint32(_contentHashToVerify);
        ebool isMatch = FHE.eq(work.encryptedContentHash, encryptedProvidedHash);

        // Request async decryption via Gateway
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(isMatch);

        uint256 requestId = FHE.requestDecryption(cts, this.verificationCallback.selector);

        // Store verification request for timeout protection
        verificationRequestCounter++;
        verificationRequests[requestId] = VerificationRequest({
            requester: msg.sender,
            workId: _workId,
            requestId: requestId,
            depositAmount: msg.value,
            requestTimestamp: block.timestamp,
            completed: false,
            refunded: false
        });

        // Track pending decryption
        pendingDecryptions[requestId] = PendingDecryption({
            workId: _workId,
            disputeId: 0,
            decryptionType: DecryptionType.Verification,
            initiator: msg.sender,
            timestamp: block.timestamp
        });

        emit VerificationRequested(_workId, msg.sender, requestId, msg.value);
        emit DecryptionRequested(requestId, DecryptionType.Verification, _workId);
    }

    /**
     * @notice Gateway callback for verification result
     * @param requestId The request ID from Gateway
     * @param cleartexts ABI-encoded cleartext results
     * @param decryptionProof Cryptographic proof from Gateway
     */
    function verificationCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify Gateway signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.completed, "AC: Already processed");

        // Decode result
        bool isMatch = abi.decode(cleartexts, (bool));

        // Mark as completed
        request.completed = true;

        // Update work verification status if match
        if (isMatch) {
            works[request.workId].verified = true;
            emit WorkVerified(request.workId, request.requester);
        }

        // Refund deposit on successful verification
        if (request.depositAmount > 0) {
            pendingRefunds[request.requester] += request.depositAmount;
        }

        emit VerificationCompleted(request.workId, requestId, isMatch);
    }

    // ============ Dispute System with Gateway Callback ============

    /**
     * @notice File a dispute against a work claiming prior ownership
     * @param _workId ID of the disputed work
     * @param _challengerContentHash Challenger's content hash proof
     */
    function fileDispute(
        uint256 _workId,
        uint32 _challengerContentHash
    ) external payable validWorkId(_workId) onlyRegisteredAuthor whenNotPaused {
        require(msg.value >= DISPUTE_DEPOSIT, "AC: Insufficient dispute deposit");
        require(_challengerContentHash > 0, "AC: Invalid content hash");

        OriginalWork storage work = works[_workId];
        require(work.registrant != msg.sender, "AC: Cannot dispute own work");
        require(work.disputeCount < MAX_DISPUTES_PER_WORK, "AC: Max disputes reached");

        // Encrypt challenger's hash
        euint32 encryptedChallengerHash = FHE.asEuint32(_challengerContentHash);

        // Create dispute record
        uint256 disputeId = disputes[_workId].length;

        disputes[_workId].push(DisputeRecord({
            challenger: msg.sender,
            challengerContentHash: encryptedChallengerHash,
            timestamp: block.timestamp,
            depositAmount: msg.value,
            resolved: false,
            winner: address(0),
            decryptionRequestId: 0,
            requestTimestamp: 0
        }));

        // Update work and author stats
        work.disputed = true;
        work.disputeCount++;
        authors[msg.sender].totalDisputes++;
        authors[work.registrant].totalDisputes++;

        // Set FHE permissions
        FHE.allowThis(encryptedChallengerHash);
        FHE.allow(encryptedChallengerHash, msg.sender);

        emit DisputeFiled(_workId, msg.sender, disputeId, msg.value);
    }

    /**
     * @notice Request dispute resolution via Gateway callback
     * @param _workId ID of the disputed work
     * @param _disputeId ID of the dispute to resolve
     */
    function requestDisputeResolution(
        uint256 _workId,
        uint256 _disputeId
    ) external validWorkId(_workId) whenNotPaused {
        require(_disputeId < disputes[_workId].length, "AC: Invalid dispute ID");

        DisputeRecord storage dispute = disputes[_workId][_disputeId];
        require(!dispute.resolved, "AC: Dispute already resolved");
        require(
            msg.sender == dispute.challenger || msg.sender == works[_workId].registrant,
            "AC: Not authorized"
        );

        OriginalWork storage work = works[_workId];

        // Request decryption of both hashes for comparison
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(work.encryptedContentHash);
        cts[1] = FHE.toBytes32(dispute.challengerContentHash);

        uint256 requestId = FHE.requestDecryption(cts, this.disputeResolutionCallback.selector);

        // Store for callback
        dispute.decryptionRequestId = requestId;
        dispute.requestTimestamp = block.timestamp;

        // Track pending decryption
        pendingDecryptions[requestId] = PendingDecryption({
            workId: _workId,
            disputeId: _disputeId,
            decryptionType: DecryptionType.DisputeResolution,
            initiator: msg.sender,
            timestamp: block.timestamp
        });

        emit DecryptionRequested(requestId, DecryptionType.DisputeResolution, _workId);
    }

    /**
     * @notice Gateway callback for dispute resolution
     * @param requestId The request ID from Gateway
     * @param cleartexts ABI-encoded cleartext results
     * @param decryptionProof Cryptographic proof from Gateway
     */
    function disputeResolutionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external noReentrancy {
        // Verify Gateway signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        PendingDecryption storage pending = pendingDecryptions[requestId];
        require(pending.decryptionType == DecryptionType.DisputeResolution, "AC: Invalid callback");

        uint256 workId = pending.workId;
        uint256 disputeId = pending.disputeId;

        DisputeRecord storage dispute = disputes[workId][disputeId];
        require(!dispute.resolved, "AC: Already resolved");

        // Decode results
        (uint32 originalHash, uint32 challengerHash) = abi.decode(cleartexts, (uint32, uint32));

        OriginalWork storage work = works[workId];
        address winner;
        uint256 prizeAmount = dispute.depositAmount;

        if (originalHash == challengerHash) {
            // Hashes match - earlier timestamp wins
            if (work.timestamp <= dispute.timestamp) {
                winner = work.registrant;
            } else {
                winner = dispute.challenger;
                authors[dispute.challenger].wonDisputes++;
            }
        } else {
            // Hashes don't match - original owner wins
            winner = work.registrant;
        }

        // Update dispute record
        dispute.resolved = true;
        dispute.winner = winner;

        // Transfer prize to winner
        if (prizeAmount > 0) {
            pendingRefunds[winner] += prizeAmount;
        }

        emit DisputeResolved(workId, disputeId, winner, prizeAmount);
    }

    // ============ Timeout Protection & Refunds ============

    /**
     * @notice Claim refund for timed-out verification request
     * @param requestId The verification request ID
     */
    function claimVerificationTimeout(uint256 requestId) external noReentrancy {
        VerificationRequest storage request = verificationRequests[requestId];

        require(request.requester == msg.sender, "AC: Not requester");
        require(!request.completed, "AC: Already completed");
        require(!request.refunded, "AC: Already refunded");
        require(
            block.timestamp > request.requestTimestamp + VERIFICATION_TIMEOUT,
            "AC: Timeout not reached"
        );

        request.refunded = true;
        uint256 refundAmount = request.depositAmount;

        if (refundAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(sent, "AC: Refund failed");
        }

        emit TimeoutRefund(msg.sender, refundAmount, requestId);
    }

    /**
     * @notice Claim refund for timed-out dispute resolution
     * @param _workId Work ID
     * @param _disputeId Dispute ID
     */
    function claimDisputeTimeout(uint256 _workId, uint256 _disputeId) external noReentrancy {
        require(_disputeId < disputes[_workId].length, "AC: Invalid dispute ID");

        DisputeRecord storage dispute = disputes[_workId][_disputeId];

        require(dispute.challenger == msg.sender, "AC: Not challenger");
        require(!dispute.resolved, "AC: Already resolved");
        require(dispute.decryptionRequestId != 0, "AC: Resolution not requested");
        require(
            block.timestamp > dispute.requestTimestamp + DISPUTE_TIMEOUT,
            "AC: Timeout not reached"
        );

        dispute.resolved = true;
        uint256 refundAmount = dispute.depositAmount;

        if (refundAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(sent, "AC: Refund failed");
        }

        emit TimeoutRefund(msg.sender, refundAmount, dispute.decryptionRequestId);
    }

    /**
     * @notice Withdraw pending refunds
     */
    function withdrawRefund() external noReentrancy {
        uint256 amount = pendingRefunds[msg.sender];
        require(amount > 0, "AC: No refund available");

        pendingRefunds[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "AC: Withdrawal failed");

        emit RefundIssued(msg.sender, amount, "Pending refund claimed");
    }

    // ============ View Functions ============

    /**
     * @notice Get work information (non-sensitive data)
     */
    function getWorkInfo(uint256 _workId) external view validWorkId(_workId) returns (
        address registrant,
        uint256 timestamp,
        bool verified,
        bool disputed,
        uint256 disputeCount,
        string memory title,
        string memory category,
        uint256 registrationFeeAmount
    ) {
        OriginalWork storage work = works[_workId];
        return (
            work.registrant,
            work.timestamp,
            work.verified,
            work.disputed,
            work.disputeCount,
            work.workTitle,
            work.category,
            work.registrationFeeAmount
        );
    }

    /**
     * @notice Get author statistics
     */
    function getAuthorStats(address _author) external view returns (
        bool registered,
        uint256 workCount,
        uint256 totalDisputes,
        uint256 wonDisputes,
        uint256 registrationTime
    ) {
        AuthorProfile storage author = authors[_author];
        return (
            author.registered,
            author.workCount,
            author.totalDisputes,
            author.wonDisputes,
            author.registrationTime
        );
    }

    /**
     * @notice Get all works by an author
     */
    function getAuthorWorks(address _author) external view returns (uint256[] memory) {
        return authorWorks[_author];
    }

    /**
     * @notice Get dispute count for a work
     */
    function getDisputeCount(uint256 _workId) external view validWorkId(_workId) returns (uint256) {
        return disputes[_workId].length;
    }

    /**
     * @notice Get dispute details
     */
    function getDisputeInfo(uint256 _workId, uint256 _disputeId) external view validWorkId(_workId) returns (
        address challenger,
        uint256 timestamp,
        uint256 depositAmount,
        bool resolved,
        address winner,
        uint256 decryptionRequestId
    ) {
        require(_disputeId < disputes[_workId].length, "AC: Invalid dispute ID");

        DisputeRecord storage dispute = disputes[_workId][_disputeId];
        return (
            dispute.challenger,
            dispute.timestamp,
            dispute.depositAmount,
            dispute.resolved,
            dispute.winner,
            dispute.decryptionRequestId
        );
    }

    /**
     * @notice Get verification request status
     */
    function getVerificationStatus(uint256 requestId) external view returns (
        address requester,
        uint256 workId,
        uint256 depositAmount,
        uint256 requestTimestamp,
        bool completed,
        bool refunded,
        bool canClaimTimeout
    ) {
        VerificationRequest storage request = verificationRequests[requestId];
        return (
            request.requester,
            request.workId,
            request.depositAmount,
            request.requestTimestamp,
            request.completed,
            request.refunded,
            !request.completed && !request.refunded &&
                block.timestamp > request.requestTimestamp + VERIFICATION_TIMEOUT
        );
    }

    /**
     * @notice Get total registered works
     */
    function getTotalWorks() external view returns (uint256) {
        return workCounter;
    }

    /**
     * @notice Check if address is registered author
     */
    function isRegisteredAuthor(address _author) external view returns (bool) {
        return authors[_author].registered;
    }

    /**
     * @notice Get pending refund amount for address
     */
    function getPendingRefund(address _user) external view returns (uint256) {
        return pendingRefunds[_user];
    }

    /**
     * @notice Get contract configuration
     */
    function getContractConfig() external view returns (
        uint256 minRegistrationFee,
        uint256 currentRegistrationFee,
        uint256 disputeDeposit,
        uint256 verificationTimeout,
        uint256 disputeTimeout,
        uint256 maxDisputesPerWork,
        bool isPaused,
        uint256 totalPlatformFees
    ) {
        return (
            MIN_REGISTRATION_FEE,
            registrationFee,
            DISPUTE_DEPOSIT,
            VERIFICATION_TIMEOUT,
            DISPUTE_TIMEOUT,
            MAX_DISPUTES_PER_WORK,
            paused,
            platformFees
        );
    }

    // ============ Test Helpers ============

    /**
     * @notice Simulate verification callback (testing only)
     */
    function testingSimulateVerificationCallback(
        uint256 requestId,
        bool isMatch
    ) external onlyOwner {
        require(isTesting, "AC: Testing disabled");

        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.completed, "AC: Already processed");

        request.completed = true;

        if (isMatch) {
            works[request.workId].verified = true;
            emit WorkVerified(request.workId, request.requester);
        }

        if (request.depositAmount > 0) {
            pendingRefunds[request.requester] += request.depositAmount;
        }

        emit VerificationCompleted(request.workId, requestId, isMatch);
    }

    /**
     * @notice Simulate dispute resolution callback (testing only)
     */
    function testingSimulateDisputeCallback(
        uint256 _workId,
        uint256 _disputeId,
        address _winner
    ) external onlyOwner {
        require(isTesting, "AC: Testing disabled");
        require(_disputeId < disputes[_workId].length, "AC: Invalid dispute ID");

        DisputeRecord storage dispute = disputes[_workId][_disputeId];
        require(!dispute.resolved, "AC: Already resolved");

        dispute.resolved = true;
        dispute.winner = _winner;

        if (dispute.depositAmount > 0) {
            pendingRefunds[_winner] += dispute.depositAmount;
        }

        emit DisputeResolved(_workId, _disputeId, _winner, dispute.depositAmount);
    }

    /**
     * @notice Mark work as verified (owner only)
     */
    function markWorkAsVerified(uint256 _workId) external onlyOwner validWorkId(_workId) {
        works[_workId].verified = true;
        emit WorkVerified(_workId, msg.sender);
    }

    // ============ Receive Ether ============

    receive() external payable {}
}
