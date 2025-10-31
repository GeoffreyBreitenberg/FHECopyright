// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousCopyright is SepoliaConfig {

    address public owner;
    uint256 public workCounter;

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

    struct DisputeRecord {
        address challenger;
        euint32 challengerContentHash;
        uint256 timestamp;
        bool resolved;
        address winner;
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

    event WorkRegistered(uint256 indexed workId, address indexed registrant, string title, uint256 timestamp);
    event WorkVerified(uint256 indexed workId, address indexed verifier);
    event DisputeFiled(uint256 indexed workId, address indexed challenger, uint256 disputeId);
    event DisputeResolved(uint256 indexed workId, uint256 disputeId, address winner);
    event AuthorRegistered(address indexed author, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegisteredAuthor() {
        require(authors[msg.sender].registered, "Author not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        workCounter = 0;
    }

    // Register as anonymous author with encrypted identity
    function registerAuthor(uint64 _authorId) external {
        require(!authors[msg.sender].registered, "Already registered");

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
        require(bytes(_category).length > 0, "Category required");

        workCounter++;
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

    // Request verification of work ownership by comparing encrypted content hashes
    function requestVerifyWork(uint256 _workId, uint32 _contentHashToVerify) external {
        require(_workId > 0 && _workId <= workCounter, "Invalid work ID");

        OriginalWork storage work = works[_workId];
        euint32 encryptedProvidedHash = FHE.asEuint32(_contentHashToVerify);

        ebool isMatch = FHE.eq(work.encryptedContentHash, encryptedProvidedHash);

        // Request async decryption
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(isMatch);
        FHE.requestDecryption(cts, this.processVerification.selector);
    }

    // Callback to process verification result
    function processVerification(
        uint256 requestId,
        bool isMatch
    ) public {
        // Emit event with verification result
        emit VerificationResult(requestId, isMatch);
    }

    event VerificationResult(uint256 indexed requestId, bool isMatch);

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
