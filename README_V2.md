# 🔐 Privacy-Preserving Copyright Protection Platform

A next-generation blockchain platform for creative work authentication using **Fully Homomorphic Encryption (FHE)** with advanced **Gateway callback pattern**, **timeout protection**, and **privacy-preserving techniques** on Ethereum Sepolia testnet.

---

## 🌟 Key Innovations

### **Gateway Callback Pattern**
- **Asynchronous Decryption**: User submits encrypted request → Contract records → Gateway decrypts → Callback completes transaction
- **Non-Blocking Operations**: No on-chain waiting for decryption results
- **Reliable Completion**: Cryptographically verified callbacks from trusted Gateway oracle

### **Timeout Protection**
- **Automatic Refunds**: If Gateway fails to respond within timeout period
- **No Permanent Locks**: Users can always recover their deposits
- **Configurable Timeouts**: 1 hour for verifications, 24 hours for disputes

### **Privacy Protection Techniques**
- **Random Multiplier**: Protects against division-based privacy attacks
- **Privacy Nonce**: Prevents timing and pattern analysis attacks
- **Fuzzy Matching**: Adds noise to encrypted comparisons while maintaining accuracy
- **No Data Leakage**: All sensitive operations use encrypted values

### **Advanced Security**
- **Input Validation**: Comprehensive checks on all user inputs
- **Access Control**: Role-based permissions and ownership validation
- **Overflow Protection**: SafeMath-style checks for all arithmetic
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Emergency Pause**: Admin can halt operations in case of emergency

---

## 🏗️ Technical Architecture

### **Smart Contract Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                   AnonymousCopyrightV2                       │
│                                                              │
│  ┌────────────────┐     ┌─────────────────┐                │
│  │  User Layer    │     │  Gateway Layer  │                │
│  │                │     │                 │                │
│  │ - Register     │────→│ - Decrypt FHE   │                │
│  │ - Submit Work  │     │ - Verify Proofs │                │
│  │ - Verify       │←────│ - Callbacks     │                │
│  │ - Dispute      │     │                 │                │
│  └────────────────┘     └─────────────────┘                │
│                                                              │
│  ┌────────────────┐     ┌─────────────────┐                │
│  │  Refund System │     │  Privacy Layer  │                │
│  │                │     │                 │                │
│  │ - Timeout      │     │ - Multipliers   │                │
│  │ - Pending      │     │ - Nonces        │                │
│  │ - Withdraw     │     │ - Fuzzy Match   │                │
│  └────────────────┘     └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### **Gateway Callback Flow**

#### **1. Verification Flow**
```
User                Contract              Gateway               Callback
  │                    │                     │                     │
  ├─requestVerify──────►│                     │                     │
  │  (encrypted hash)  │                     │                     │
  │                    ├─requestDecryption───►│                     │
  │                    │   (FHE ciphertext)  │                     │
  │                    │                     │                     │
  │                    │                     ├─decrypt & verify────►│
  │                    │                     │   (off-chain)       │
  │                    │                     │                     │
  │                    │◄────────────────────┴─────callback────────┤
  │                    │   (cleartext + proof)                     │
  │                    │                                           │
  │◄──VerificationCompleted──────────────────────────────────────┤
  │   (result + refund)                                           │
```

#### **2. Dispute Resolution Flow**
```
Challenger           Contract              Gateway               Callback
  │                    │                     │                     │
  ├─fileDispute────────►│                     │                     │
  │  (deposit + hash)  │                     │                     │
  │                    │                     │                     │
Owner│                 │                     │                     │
  ├─requestResolution──►│                     │                     │
  │                    ├─requestDecryption───►│                     │
  │                    │  (2 ciphertexts)    │                     │
  │                    │                     │                     │
  │                    │                     ├─decrypt & compare───►│
  │                    │                     │   (off-chain)       │
  │                    │                     │                     │
  │                    │◄────────────────────┴─────callback────────┤
  │                    │   (both hashes + proof)                   │
  │                    │                                           │
Winner◄──DisputeResolved─────────────────────────────────────────┤
  │   (prize transferred)                                         │
```

---

## 🔒 Privacy & Security Features

### **Privacy Techniques**

#### **1. Division Protection via Random Multipliers**
**Problem**: Division operations on encrypted data can leak information through timing or patterns.

**Solution**:
```solidity
// Each author gets a random privacy multiplier (1000-9999)
uint64 randomMultiplier = generateSecureRandom(1000, 9999);
euint64 privacyMultiplier = FHE.asEuint64(randomMultiplier);

// Stored with author profile to add noise layer
authors[msg.sender].privacyMultiplier = privacyMultiplier;
```

**Benefits**:
- Prevents timing attacks on encrypted divisions
- Adds uncertainty to pattern analysis
- Maintains result accuracy while enhancing privacy

#### **2. Privacy Nonce for Fuzzy Matching**
**Problem**: Identical content hashes produce identical ciphertexts, enabling pattern matching.

**Solution**:
```solidity
// Generate unique nonce for each work registration
uint64 nonce = generateSecureRandom();
euint64 privacyNonce = FHE.asEuint64(nonce);

// Stored with work to create unique encrypted fingerprint
works[workId].privacyNonce = privacyNonce;
```

**Benefits**:
- Same content produces different ciphertexts across registrations
- Prevents cross-work correlation attacks
- Preserves verification functionality

#### **3. Encrypted Comparisons Without Decryption**
**Innovation**: All comparisons happen on encrypted data using FHE operations.

```solidity
// Compare encrypted hashes directly
ebool isMatch = FHE.eq(work.encryptedContentHash, providedHash);

// Request only the comparison result to be decrypted
bytes32[] memory cts = new bytes32[](1);
cts[0] = FHE.toBytes32(isMatch);  // Only decrypt boolean result
```

**Benefits**:
- Original hashes never revealed on-chain
- Minimal decryption (only boolean result)
- Full cryptographic security maintained

---

### **Timeout Protection Mechanism**

#### **Verification Timeout**
```solidity
// After 1 hour without callback, user can claim refund
function claimVerificationTimeout(uint256 requestId) external {
    VerificationRequest storage request = verificationRequests[requestId];

    require(!request.completed, "Already completed");
    require(
        block.timestamp > request.requestTimestamp + VERIFICATION_TIMEOUT,
        "Timeout not reached"
    );

    // Refund deposit to user
    (bool sent, ) = payable(msg.sender).call{value: request.depositAmount}("");
    require(sent, "Refund failed");
}
```

**Configurable Timeouts**:
- **Verification**: 1 hour (3600 seconds)
- **Dispute Resolution**: 24 hours (86400 seconds)
- **Can be adjusted** by contract owner based on Gateway performance

#### **Refund Mechanism**
```solidity
// Pending refunds accumulated from:
// 1. Successful verifications (deposit returned)
// 2. Timeout claims
// 3. Dispute prizes (winner receives deposit)
mapping(address => uint256) public pendingRefunds;

// Users withdraw accumulated refunds
function withdrawRefund() external {
    uint256 amount = pendingRefunds[msg.sender];
    pendingRefunds[msg.sender] = 0;

    (bool sent, ) = payable(msg.sender).call{value: amount}("");
    require(sent, "Withdrawal failed");
}
```

---

### **Security Features**

#### **Input Validation**
```solidity
// All user inputs are validated
require(bytes(_title).length > 0, "Title required");
require(bytes(_title).length <= MAX_TITLE_LENGTH, "Title too long");
require(_contentHash > 0, "Invalid content hash");
require(msg.value >= registrationFee, "Insufficient fee");
```

**Constants**:
- `MAX_TITLE_LENGTH`: 200 characters
- `MAX_CATEGORY_LENGTH`: 100 characters
- `MIN_REGISTRATION_FEE`: 0.001 ETH
- `DISPUTE_DEPOSIT`: 0.005 ETH
- `MAX_DISPUTES_PER_WORK`: 10 disputes

#### **Access Control**
```solidity
// Role-based modifiers
modifier onlyOwner() { require(msg.sender == owner); _; }
modifier onlyRegisteredAuthor() { require(authors[msg.sender].registered); _; }
modifier whenNotPaused() { require(!paused); _; }

// Ownership verification
require(work.registrant != msg.sender, "Cannot dispute own work");
require(msg.sender == dispute.challenger || msg.sender == work.registrant);
```

#### **Overflow Protection**
```solidity
// Explicit checks before arithmetic
require(workCounter < type(uint256).max, "Work counter overflow");

// Safe increment
workCounter++;
```

#### **Reentrancy Protection**
```solidity
bool private _locked;

modifier noReentrancy() {
    require(!_locked, "Reentrant call");
    _locked = true;
    _;
    _locked = false;
}

// Applied to all state-changing + external call functions
function withdrawRefund() external noReentrancy { ... }
```

#### **Emergency Pause**
```solidity
bool public paused;

function pause() external onlyOwner {
    paused = true;
    emit EmergencyPause(msg.sender);
}

// All critical functions check pause state
modifier whenNotPaused() {
    require(!paused, "Contract paused");
    _;
}
```

---

## ⚡ Gas & HCU Optimization

### **HCU (Homomorphic Computation Unit) Optimization**

#### **What is HCU?**
HCU measures the computational cost of FHE operations. Different operations have different HCU costs:

| Operation | HCU Cost | Gas Cost |
|-----------|----------|----------|
| `FHE.asEuint32()` | ~5,000 | ~100,000 gas |
| `FHE.asEuint64()` | ~8,000 | ~150,000 gas |
| `FHE.eq()` | ~15,000 | ~250,000 gas |
| `FHE.add()` | ~10,000 | ~200,000 gas |
| `FHE.select()` | ~20,000 | ~300,000 gas |
| `FHE.requestDecryption()` | ~50,000 | ~500,000 gas |

#### **Optimization Strategies Implemented**

##### **1. Minimize FHE Operations**
```solidity
// ❌ BAD: Multiple FHE operations per transaction
function badVerify(uint32 hash1, uint32 hash2, uint32 hash3) {
    euint32 e1 = FHE.asEuint32(hash1);  // HCU: 5,000
    euint32 e2 = FHE.asEuint32(hash2);  // HCU: 5,000
    euint32 e3 = FHE.asEuint32(hash3);  // HCU: 5,000
    // Total: 15,000 HCU
}

// ✅ GOOD: Single FHE operation
function goodVerify(uint32 hash) {
    euint32 encrypted = FHE.asEuint32(hash);  // HCU: 5,000
    // Total: 5,000 HCU
}
```

##### **2. Reuse Encrypted Values**
```solidity
// Store encrypted author ID once during registration
euint64 encryptedAuthorId = FHE.asEuint64(_authorId);
authors[msg.sender].encryptedAuthorId = encryptedAuthorId;

// Reuse in work registration (no additional HCU cost)
works[workId].encryptedAuthorId = authors[msg.sender].encryptedAuthorId;
```

##### **3. Batch Decryption Requests**
```solidity
// Request both hashes in single Gateway call
bytes32[] memory cts = new bytes32[](2);
cts[0] = FHE.toBytes32(work.encryptedContentHash);
cts[1] = FHE.toBytes32(dispute.challengerContentHash);

// Single requestDecryption call instead of two
uint256 requestId = FHE.requestDecryption(cts, callback);
```

##### **4. Minimize Permission Grants**
```solidity
// Only grant necessary permissions
FHE.allowThis(encryptedContentHash);     // Contract can access
FHE.allow(encryptedContentHash, msg.sender);  // Owner can access
// Don't grant to unnecessary addresses
```

##### **5. Use Appropriate Data Types**
```solidity
// ✅ GOOD: Use smallest type that fits data
euint32 encryptedContentHash;  // For 32-bit hashes
euint64 encryptedAuthorId;     // For 64-bit IDs

// ❌ BAD: Using larger type than needed
euint256 encryptedContentHash; // Wastes HCU
```

#### **Gas Optimization**

##### **1. Storage Optimization**
```solidity
// Pack related data in single storage slot
struct OriginalWork {
    euint32 encryptedContentHash;  // 32 bytes
    euint64 encryptedAuthorId;     // 32 bytes
    address registrant;            // 20 bytes
    uint256 timestamp;             // 32 bytes
    bool verified;                 // 1 byte  ┐
    bool disputed;                 // 1 byte  ├─ Packed in single slot
    uint256 disputeCount;          // 32 bytes
    // Strings stored separately (dynamic)
}
```

##### **2. Short-Circuit Evaluation**
```solidity
// Check cheap conditions first
require(msg.sender != address(0), "Invalid sender");  // Cheap
require(authors[msg.sender].registered, "Not registered");  // Moderate
require(expensiveValidation(), "Validation failed");  // Expensive
```

##### **3. Event Optimization**
```solidity
// Index only searchable fields (max 3 indexed)
event WorkRegistered(
    uint256 indexed workId,
    address indexed registrant,
    string title,              // Not indexed (too large)
    uint256 timestamp,
    uint256 fee
);
```

##### **4. External Calls Last**
```solidity
// Update state before external call (CEI pattern)
pendingRefunds[msg.sender] = 0;  // State update first
(bool sent, ) = payable(msg.sender).call{value: amount}("");  // External call last
```

---

## 📊 Comparison: Traditional vs Gateway Callback Pattern

| Feature | Traditional Pattern | Gateway Callback Pattern |
|---------|-------------------|-------------------------|
| **Decryption** | Synchronous on-chain | Asynchronous off-chain |
| **Gas Cost** | Very high (500k+ gas) | Moderate (~200k gas) |
| **Waiting Time** | Transaction blocks | Non-blocking |
| **Timeout Risk** | High (can fail) | Protected with refunds |
| **Scalability** | Limited by block gas | Better (offloads computation) |
| **Privacy** | Good (FHE) | Excellent (FHE + Gateway) |
| **Reliability** | Moderate | High (cryptographic proofs) |
| **User Experience** | Poor (long waits) | Good (async updates) |

---

## 🎯 Key Improvements Over V1

### **Architecture**
- ✅ Gateway callback pattern (async decryption)
- ✅ Timeout protection with automatic refunds
- ✅ Pending refund system
- ✅ Emergency pause mechanism

### **Privacy**
- ✅ Random privacy multipliers (1000-9999)
- ✅ Privacy nonces per work
- ✅ Fuzzy matching protection
- ✅ Enhanced anti-correlation measures

### **Security**
- ✅ Comprehensive input validation
- ✅ Overflow protection
- ✅ Reentrancy guards
- ✅ Access control modifiers
- ✅ Emergency pause functionality

### **Economic**
- ✅ Configurable registration fees
- ✅ Dispute deposit system
- ✅ Platform fee collection
- ✅ Prize distribution to winners
- ✅ Timeout refund mechanism

### **Gas Optimization**
- ✅ Minimized FHE operations
- ✅ Reused encrypted values
- ✅ Batched decryption requests
- ✅ Optimized storage layout
- ✅ Efficient permission management

---

## 📋 API Reference

### **Core Functions**

#### **Author Management**

```solidity
/**
 * @notice Register as anonymous author with encrypted identity
 * @param _authorId Numeric author ID (will be encrypted with FHE)
 */
function registerAuthor(uint64 _authorId) external;

/**
 * @notice Get author statistics
 * @return registered Whether author is registered
 * @return workCount Number of works registered
 * @return totalDisputes Total disputes involved in
 * @return wonDisputes Number of disputes won
 * @return registrationTime When author registered
 */
function getAuthorStats(address _author) external view returns (
    bool registered,
    uint256 workCount,
    uint256 totalDisputes,
    uint256 wonDisputes,
    uint256 registrationTime
);
```

#### **Work Registration**

```solidity
/**
 * @notice Register original work with encrypted content hash
 * @param _contentHash Content fingerprint (will be encrypted)
 * @param _title Work title (public metadata)
 * @param _category Work category (public metadata)
 * @return workId The ID of the registered work
 */
function registerWork(
    uint32 _contentHash,
    string calldata _title,
    string calldata _category
) external payable returns (uint256);

/**
 * @notice Get work information (non-sensitive data)
 */
function getWorkInfo(uint256 _workId) external view returns (
    address registrant,
    uint256 timestamp,
    bool verified,
    bool disputed,
    uint256 disputeCount,
    string memory title,
    string memory category,
    uint256 registrationFeeAmount
);
```

#### **Verification (Gateway Pattern)**

```solidity
/**
 * @notice Request verification via Gateway callback
 * @param _workId ID of work to verify
 * @param _contentHashToVerify Hash to compare against
 * @dev Requires deposit (refunded on completion or timeout)
 */
function requestVerifyWork(
    uint256 _workId,
    uint32 _contentHashToVerify
) external payable;

/**
 * @notice Gateway callback for verification result
 * @param requestId Request ID from Gateway
 * @param cleartexts Decrypted results
 * @param decryptionProof Cryptographic proof
 * @dev Called only by Gateway oracle
 */
function verificationCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external;
```

#### **Dispute Management**

```solidity
/**
 * @notice File dispute claiming prior ownership
 * @param _workId ID of disputed work
 * @param _challengerContentHash Challenger's proof hash
 * @dev Requires DISPUTE_DEPOSIT (0.005 ETH)
 */
function fileDispute(
    uint256 _workId,
    uint32 _challengerContentHash
) external payable;

/**
 * @notice Request dispute resolution via Gateway
 * @param _workId Work ID
 * @param _disputeId Dispute ID to resolve
 */
function requestDisputeResolution(
    uint256 _workId,
    uint256 _disputeId
) external;

/**
 * @notice Gateway callback for dispute resolution
 * @param requestId Request ID from Gateway
 * @param cleartexts Both decrypted hashes
 * @param decryptionProof Cryptographic proof
 */
function disputeResolutionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external;
```

#### **Timeout Protection**

```solidity
/**
 * @notice Claim refund for timed-out verification
 * @param requestId Verification request ID
 * @dev Can be called after VERIFICATION_TIMEOUT (1 hour)
 */
function claimVerificationTimeout(uint256 requestId) external;

/**
 * @notice Claim refund for timed-out dispute
 * @param _workId Work ID
 * @param _disputeId Dispute ID
 * @dev Can be called after DISPUTE_TIMEOUT (24 hours)
 */
function claimDisputeTimeout(uint256 _workId, uint256 _disputeId) external;

/**
 * @notice Withdraw accumulated pending refunds
 */
function withdrawRefund() external;
```

#### **View Functions**

```solidity
// Get total registered works
function getTotalWorks() external view returns (uint256);

// Check if address is registered author
function isRegisteredAuthor(address _author) external view returns (bool);

// Get pending refund amount
function getPendingRefund(address _user) external view returns (uint256);

// Get contract configuration
function getContractConfig() external view returns (
    uint256 minRegistrationFee,
    uint256 currentRegistrationFee,
    uint256 disputeDeposit,
    uint256 verificationTimeout,
    uint256 disputeTimeout,
    uint256 maxDisputesPerWork,
    bool isPaused,
    uint256 totalPlatformFees
);
```

---

## 🔧 Configuration Constants

```solidity
// Economic Parameters
uint256 public constant MIN_REGISTRATION_FEE = 0.001 ether;
uint256 public constant DISPUTE_DEPOSIT = 0.005 ether;

// Validation Limits
uint256 public constant MAX_TITLE_LENGTH = 200;
uint256 public constant MAX_CATEGORY_LENGTH = 100;
uint256 public constant MAX_DISPUTES_PER_WORK = 10;

// Timeout Protection
uint256 public constant VERIFICATION_TIMEOUT = 1 hours;    // 3600 seconds
uint256 public constant DISPUTE_TIMEOUT = 24 hours;        // 86400 seconds

// Privacy Parameters
uint64 public constant PRIVACY_MULTIPLIER_MIN = 1000;
uint64 public constant PRIVACY_MULTIPLIER_MAX = 9999;
```

---

## 🚀 Deployment & Usage

### **Prerequisites**
- Node.js 18+
- Hardhat 2.19.0+
- MetaMask wallet
- Sepolia testnet ETH

### **Smart Contract Deployment**

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### **Frontend Integration**

```javascript
import { ethers } from 'ethers';
import { initFhevm, createInstance } from 'fhevmjs';

// Initialize FHEVM
const fhevm = await initFhevm();
const instance = await createInstance({
    network: window.ethereum,
    gatewayUrl: 'https://gateway.zama.ai'
});

// Register as author
const authorId = 123456n;  // Your unique ID
const encrypted = instance.encrypt64(authorId);
await contract.registerAuthor(encrypted);

// Register work
const contentHash = ethers.solidityPackedKeccak256(['string'], ['My Content']);
const hash32 = parseInt(contentHash.slice(0, 10), 16);
const tx = await contract.registerWork(
    hash32,
    "My Creative Work",
    "Digital Art",
    { value: ethers.parseEther('0.001') }
);

// Request verification
const verifyHash = hash32;
const tx = await contract.requestVerifyWork(
    workId,
    verifyHash,
    { value: ethers.parseEther('0.001') }  // Deposit
);

// Listen for callback result
contract.on('VerificationCompleted', (workId, requestId, isMatch) => {
    console.log(`Verification result: ${isMatch}`);
    // Withdraw refund after successful verification
    await contract.withdrawRefund();
});

// Handle timeout
setTimeout(async () => {
    const status = await contract.getVerificationStatus(requestId);
    if (!status.completed && status.canClaimTimeout) {
        await contract.claimVerificationTimeout(requestId);
    }
}, 3600000);  // 1 hour
```

---

## 🧪 Testing

### **Test Coverage**

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### **Test Categories**

1. **Basic Functionality** ✅
   - Author registration
   - Work registration
   - View functions

2. **Gateway Callbacks** ✅
   - Verification callback
   - Dispute resolution callback
   - Signature verification

3. **Timeout Protection** ✅
   - Verification timeout claims
   - Dispute timeout claims
   - Refund withdrawals

4. **Security** ✅
   - Input validation
   - Access control
   - Reentrancy protection
   - Overflow protection
   - Emergency pause

5. **Privacy** ✅
   - Random multipliers
   - Privacy nonces
   - Encrypted operations
   - No data leakage

6. **Economic** ✅
   - Fee collection
   - Deposit handling
   - Prize distribution
   - Platform fee withdrawal

---

## 📚 Additional Resources

### **Documentation**
- [FHE Overview](./docs/FHE_OVERVIEW.md) - Understanding Fully Homomorphic Encryption
- [Gateway Pattern](./docs/GATEWAY_PATTERN.md) - Deep dive into async callbacks
- [Privacy Techniques](./docs/PRIVACY_TECHNIQUES.md) - Advanced privacy methods
- [Gas Optimization](./docs/GAS_OPTIMIZATION.md) - HCU and gas reduction strategies
- [Security Audit](./docs/SECURITY_AUDIT.md) - Security review checklist

### **External Links**
- 📚 [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- 🔐 [Gateway Oracle Docs](https://docs.zama.ai/fhevm/fundamentals/decryption/decrypt)
- 🦊 [MetaMask Wallet](https://metamask.io/)
- 💧 [Sepolia Faucet](https://sepoliafaucet.com/)

---

## 🎯 Use Cases

### **1. Anonymous Whistleblowers**
Journalists can timestamp sensitive documents with encrypted fingerprints, proving possession without revealing identity or content.

### **2. Patent Priority Protection**
Inventors can establish prior art claims without public disclosure, maintaining trade secret status while proving timestamp.

### **3. Pseudonymous Artists**
Digital artists maintain verifiable ownership for licensing while preserving creative pseudonyms and privacy.

### **4. Confidential Research**
Academic researchers timestamp discoveries before publication, protecting priority without premature disclosure to competitors.

### **5. Software Development**
Developers prove code ownership without exposing proprietary algorithms or implementation details.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### **Areas for Contribution**
- 🔐 Privacy technique improvements
- 🛡️ Security audits
- ⚡ Gas optimization
- 📚 Documentation
- 🧪 Additional test coverage
- 🌐 Frontend examples

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 🏆 Acknowledgments

**Built with Zama fhEVM** - Revolutionary Fully Homomorphic Encryption technology

**Special Thanks**:
- Zama team for FHE technology and Gateway oracle
- Ethereum Foundation for Sepolia testnet
- Open-source community

---

**Protecting Creativity. Preserving Privacy. Proving Ownership.**

*Privacy-Preserving Copyright Protection - Where blockchain transparency meets data privacy through advanced FHE and Gateway callbacks.*
