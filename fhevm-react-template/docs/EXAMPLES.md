# Examples Guide

Comprehensive guide to using the Universal FHEVM SDK with real-world examples.

---

## Table of Contents

1. [Anonymous Copyright Protection](#anonymous-copyright-protection)
2. [Common Patterns](#common-patterns)
3. [Integration Examples](#integration-examples)
4. [Best Practices](#best-practices)

---

## Anonymous Copyright Protection

A complete production-ready dApp demonstrating FHE for anonymous copyright registration.

### Overview

**Location**: `examples/anonymous-copyright/`

**Features**:
- 🔒 Encrypted content hashes (euint32)
- 👤 Anonymous author IDs (euint64)
- ⚖️ Dispute resolution with encrypted proofs
- 🛡️ Owner-based access control
- ✅ 56+ comprehensive tests
- 📊 Full CI/CD pipeline

### Quick Start

```bash
cd examples/anonymous-copyright

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy
```

### Contract Functions

#### 1. Register as Author

```solidity
function registerAuthor(uint64 _authorId) external
```

**Usage**:
```javascript
const { ethers } = require('hardhat');

// Get contract
const contract = await ethers.getContractAt(
  "AnonymousCopyright",
  "0x..."
);

// Register author with encrypted ID
const authorId = 123456;
const tx = await contract.registerAuthor(authorId);
await tx.wait();

console.log("Author registered!");
```

**What Happens**:
1. Author ID is encrypted with euint64
2. Stored in contract storage
3. AuthorRegistered event emitted
4. Author can now register works

---

#### 2. Register Work

```solidity
function registerWork(
    uint32 _contentHash,
    string calldata _title,
    string calldata _category
) external returns (uint256)
```

**Usage**:
```javascript
// Register work with encrypted content hash
const contentHash = 987654321;
const tx = await contract.registerWork(
  contentHash,
  "My Original Artwork",
  "Digital Art"
);

const receipt = await tx.wait();

// Get work ID from event
const workId = receipt.logs[0].args.workId;
console.log(`Work registered with ID: ${workId}`);
```

**What Happens**:
1. Content hash is encrypted with euint32
2. Work metadata stored (title, category)
3. Work linked to registrant
4. WorkRegistered event emitted
5. Returns unique work ID

---

#### 3. Verify Ownership

```solidity
function requestVerifyWork(
    uint256 _workId,
    uint32 _contentHashToVerify
) external
```

**Usage**:
```javascript
// Verify work ownership
const workId = 1;
const contentHash = 987654321;

const tx = await contract.requestVerifyWork(workId, contentHash);
await tx.wait();

// Check if verified
const workInfo = await contract.getWorkInfo(workId);
console.log(`Verified: ${workInfo.verified}`);
```

**What Happens**:
1. Provided hash encrypted with euint32
2. FHE equality comparison with stored hash
3. If match, work marked as verified
4. WorkVerified event emitted

---

#### 4. File Dispute

```solidity
function fileDispute(
    uint256 _workId,
    uint32 _challengerContentHash
) external
```

**Usage**:
```javascript
// File dispute with encrypted proof
const workId = 1;
const challengerHash = 111222333;

const tx = await contract.fileDispute(workId, challengerHash);
await tx.wait();

console.log("Dispute filed!");
```

**What Happens**:
1. Challenger hash encrypted with euint32
2. Dispute record created
3. Work marked as disputed
4. DisputeFiled event emitted
5. Owner can resolve dispute

---

### Complete Workflow Example

```javascript
const { ethers } = require('hardhat');

async function completeWorkflow() {
  // Get signers
  const [owner, alice, bob] = await ethers.getSigners();

  // Deploy contract
  const AnonymousCopyright = await ethers.getContractFactory(
    "AnonymousCopyright"
  );
  const contract = await AnonymousCopyright.deploy();
  await contract.waitForDeployment();

  console.log("✅ Contract deployed");

  // 1. Alice registers as author
  const tx1 = await contract.connect(alice).registerAuthor(123456);
  await tx1.wait();
  console.log("✅ Alice registered as author");

  // 2. Alice registers her work
  const contentHash = 987654321;
  const tx2 = await contract.connect(alice).registerWork(
    contentHash,
    "Alice's Masterpiece",
    "Digital Art"
  );
  const receipt = await tx2.wait();
  const workId = receipt.logs[0].args.workId;
  console.log(`✅ Work registered with ID: ${workId}`);

  // 3. Alice verifies her work
  const tx3 = await contract.connect(alice).requestVerifyWork(
    workId,
    contentHash
  );
  await tx3.wait();

  const workInfo = await contract.getWorkInfo(workId);
  console.log(`✅ Work verified: ${workInfo.verified}`);

  // 4. Bob files a dispute (will fail - different hash)
  try {
    const bobHash = 111222333;
    const tx4 = await contract.connect(bob).fileDispute(workId, bobHash);
    await tx4.wait();
    console.log("✅ Dispute filed by Bob");
  } catch (error) {
    console.log("❌ Dispute failed (expected - different content)");
  }

  // 5. Get final work information
  const finalInfo = await contract.getWorkInfo(workId);
  console.log("\nFinal Work Info:");
  console.log(`  Title: ${finalInfo.title}`);
  console.log(`  Category: ${finalInfo.category}`);
  console.log(`  Registrant: ${finalInfo.registrant}`);
  console.log(`  Verified: ${finalInfo.verified}`);
  console.log(`  Disputed: ${finalInfo.disputed}`);
}

completeWorkflow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Run It**:
```bash
hardhat run scripts/complete-workflow.js
```

---

## Common Patterns

### Pattern 1: Basic Encryption

**Use Case**: Encrypt a single value for contract submission

```javascript
import { createFhevmClient, encryptUint32 } from '@fhevm/sdk';

async function encryptAndSubmit(value) {
  // 1. Create client
  const client = await createFhevmClient({
    network: 'sepolia',
    contractAddress: contractAddress
  });

  // 2. Encrypt value
  const encrypted = await encryptUint32(client, value);

  // 3. Submit to contract
  const tx = await contract.submit(
    encrypted.handles[0],
    encrypted.inputProof
  );

  await tx.wait();
  console.log('Value submitted!');
}
```

---

### Pattern 2: Batch Encryption

**Use Case**: Encrypt multiple values efficiently

```javascript
import { batchEncrypt } from '@fhevm/sdk';

async function batchSubmit(values) {
  // Prepare encryption requests
  const requests = values.map(v => ({
    type: 'uint32',
    value: v
  }));

  // Encrypt in batch
  const encrypted = await batchEncrypt(client, requests);

  // Submit in single transaction
  await contract.batchSubmit(
    encrypted.map(e => e.handles[0]),
    encrypted[0].inputProof
  );
}
```

---

### Pattern 3: User Decryption

**Use Case**: Decrypt values with user authorization

```javascript
import { userDecrypt } from '@fhevm/sdk';
import { ethers } from 'ethers';

async function decryptResult(encryptedValue) {
  // Get user's signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  // Decrypt with EIP-712 signature
  const decrypted = await userDecrypt(
    client,
    encryptedValue,
    contractAddress,
    userAddress,
    signer
  );

  return decrypted;
}
```

---

### Pattern 4: Event-Driven Decryption

**Use Case**: Automatically decrypt when events are emitted

```javascript
async function listenAndDecrypt() {
  // Listen for contract events
  contract.on("ResultReady", async (user, encryptedResult) => {
    console.log(`Result ready for ${user}`);

    // Only decrypt if it's for current user
    if (user === userAddress) {
      try {
        const decrypted = await userDecrypt(
          client,
          encryptedResult,
          contractAddress,
          userAddress,
          signer
        );

        console.log('Your result:', decrypted.toString());
      } catch (error) {
        console.error('Decryption failed:', error);
      }
    }
  });
}
```

---

### Pattern 5: Conditional Operations

**Use Case**: FHE equality checks for conditional logic

```solidity
// Contract: Encrypted voting
function vote(uint32 _encryptedChoice) external {
    // Store encrypted vote
    euint32 vote = FHE.asEuint32(_encryptedChoice);
    votes[msg.sender] = vote;

    // Compare with encrypted options
    ebool votedForA = FHE.eq(vote, encryptedOptionA);
    ebool votedForB = FHE.eq(vote, encryptedOptionB);

    // Update counts (encrypted)
    optionACount = FHE.select(votedForA, FHE.add(optionACount, 1), optionACount);
    optionBCount = FHE.select(votedForB, FHE.add(optionBCount, 1), optionBCount);
}
```

---

## Integration Examples

### React Integration

**Complete React Component**:

```typescript
import React, { useState, useEffect } from 'react';
import { useFhevmClient, useEncrypt, useContract } from '@fhevm/sdk/hooks';
import { ethers } from 'ethers';
import AnonymousCopyrightABI from './abi.json';

function CopyrightRegistration() {
  // State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [works, setWorks] = useState([]);

  // Hooks
  const { client, isReady: clientReady } = useFhevmClient({
    network: 'sepolia',
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS
  });

  const { encrypt, isEncrypting } = useEncrypt(client);

  const provider = new ethers.BrowserProvider(window.ethereum);
  const { contract } = useContract(
    process.env.REACT_APP_CONTRACT_ADDRESS,
    AnonymousCopyrightABI,
    provider
  );

  // Register work
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!contract || !clientReady) {
      alert('Please wait for initialization');
      return;
    }

    try {
      // Encrypt content hash
      const encrypted = await encrypt(parseInt(contentHash));

      // Submit transaction
      const tx = await contract.registerWork(
        encrypted.handles[0],
        encrypted.inputProof,
        title,
        category
      );

      await tx.wait();
      alert('Work registered successfully!');

      // Clear form
      setTitle('');
      setCategory('');
      setContentHash('');

      // Refresh works
      loadWorks();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register work');
    }
  };

  // Load user's works
  const loadWorks = async () => {
    if (!contract) return;

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const workIds = await contract.getUserWorks(address);
      const worksData = await Promise.all(
        workIds.map(id => contract.getWorkInfo(id))
      );

      setWorks(worksData);
    } catch (error) {
      console.error('Failed to load works:', error);
    }
  };

  // Load works on mount
  useEffect(() => {
    if (contract) {
      loadWorks();
    }
  }, [contract]);

  // Render
  return (
    <div className="container">
      <h1>Copyright Registration</h1>

      {!clientReady ? (
        <div>Initializing FHE client...</div>
      ) : (
        <>
          <form onSubmit={handleRegister}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Content Hash:</label>
              <input
                type="number"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isEncrypting}
            >
              {isEncrypting ? 'Encrypting...' : 'Register Work'}
            </button>
          </form>

          <div className="works-list">
            <h2>My Works</h2>
            {works.length === 0 ? (
              <p>No works registered yet</p>
            ) : (
              <ul>
                {works.map((work, index) => (
                  <li key={index}>
                    <h3>{work.title}</h3>
                    <p>Category: {work.category}</p>
                    <p>Verified: {work.verified ? 'Yes' : 'No'}</p>
                    <p>Disputed: {work.disputed ? 'Yes' : 'No'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CopyrightRegistration;
```

---

### Next.js Integration

**Page Component** (`pages/register.tsx`):

```typescript
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const CopyrightForm = dynamic(
  () => import('../components/CopyrightForm'),
  { ssr: false }
);

export default function RegisterPage({ contractAddress }) {
  return (
    <div>
      <h1>Register Your Work</h1>
      <CopyrightForm contractAddress={contractAddress} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      contractAddress: process.env.CONTRACT_ADDRESS
    }
  };
};
```

---

### Node.js Script Integration

**Backend Service**:

```javascript
const { ethers } = require('ethers');
const { createFhevmClient, encryptUint32 } = require('@fhevm/sdk');

class CopyrightService {
  constructor(contractAddress, privateKey) {
    this.contractAddress = contractAddress;
    this.provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = null;
    this.client = null;
  }

  async initialize() {
    // Load contract
    const abi = require('./abi.json');
    this.contract = new ethers.Contract(
      this.contractAddress,
      abi,
      this.wallet
    );

    // Initialize FHE client
    this.client = await createFhevmClient({
      network: 'sepolia',
      contractAddress: this.contractAddress,
      provider: this.provider
    });
  }

  async registerWork(contentHash, title, category) {
    // Encrypt content hash
    const encrypted = await encryptUint32(this.client, contentHash);

    // Submit transaction
    const tx = await this.contract.registerWork(
      encrypted.handles[0],
      encrypted.inputProof,
      title,
      category
    );

    const receipt = await tx.wait();

    // Extract work ID
    const event = receipt.logs.find(
      log => log.fragment?.name === 'WorkRegistered'
    );

    return {
      workId: event.args.workId.toString(),
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  async getWork(workId) {
    const workInfo = await this.contract.getWorkInfo(workId);

    return {
      title: workInfo.title,
      category: workInfo.category,
      registrant: workInfo.registrant,
      verified: workInfo.verified,
      disputed: workInfo.disputed,
      timestamp: workInfo.timestamp.toString()
    };
  }
}

// Usage
async function main() {
  const service = new CopyrightService(
    process.env.CONTRACT_ADDRESS,
    process.env.PRIVATE_KEY
  );

  await service.initialize();

  const result = await service.registerWork(
    987654321,
    "Backend Registered Work",
    "Software"
  );

  console.log('Registered:', result);
}

main().catch(console.error);
```

---

## Best Practices

### 1. Error Handling

**Always handle encryption errors**:
```javascript
try {
  const encrypted = await encryptUint32(client, value);
  // Use encrypted value
} catch (error) {
  if (error.code === 'VALUE_OUT_OF_RANGE') {
    alert('Value must be between 0 and 2^32-1');
  } else if (error.code === 'CLIENT_NOT_READY') {
    alert('Please wait for initialization');
  } else {
    alert('Encryption failed: ' + error.message);
  }
}
```

### 2. Client Initialization

**Wait for client to be ready**:
```javascript
const { client, isReady } = useFhevmClient(config);

if (!isReady) {
  return <LoadingSpinner />;
}

// Now safe to use client
```

### 3. Transaction Confirmation

**Always wait for transaction confirmation**:
```javascript
const tx = await contract.registerWork(...);

// Don't just wait for transaction to be sent
const receipt = await tx.wait();

// Confirm success
if (receipt.status === 1) {
  console.log('Transaction successful!');
} else {
  console.error('Transaction failed!');
}
```

### 4. Gas Estimation

**Estimate gas before submitting**:
```javascript
try {
  const gasEstimate = await contract.registerWork.estimateGas(
    encrypted.handles[0],
    encrypted.inputProof,
    title,
    category
  );

  console.log(`Estimated gas: ${gasEstimate.toString()}`);

  // Submit with gas limit
  const tx = await contract.registerWork(..., {
    gasLimit: gasEstimate * 120n / 100n  // 20% buffer
  });
} catch (error) {
  console.error('Gas estimation failed:', error);
}
```

### 5. Event Listening

**Clean up event listeners**:
```javascript
useEffect(() => {
  if (!contract) return;

  const handleWorkRegistered = (workId, registrant, title) => {
    console.log(`Work ${workId} registered`);
  };

  // Add listener
  contract.on("WorkRegistered", handleWorkRegistered);

  // Clean up on unmount
  return () => {
    contract.off("WorkRegistered", handleWorkRegistered);
  };
}, [contract]);
```

---

## More Examples

For more examples, see:

- [Anonymous Copyright README](../examples/anonymous-copyright/README.md)
- [Testing Guide](../examples/anonymous-copyright/TESTING.md)
- [Deployment Guide](../examples/anonymous-copyright/DEPLOYMENT.md)

---

**Ready to build? Start with the [Quick Start Guide](./QUICKSTART.md)!**
