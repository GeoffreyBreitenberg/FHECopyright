# ğŸš€ Quick Start Guide - AnonymousCopyright V2

Get started with the upgraded Privacy-Preserving Copyright Protection platform in **5 minutes**!

---

## ğŸ“‹ Prerequisites

âœ?Node.js 18+ installed
âœ?MetaMask wallet extension
âœ?Sepolia testnet ETH (get from [faucet](https://sepoliafaucet.com/))
âœ?Basic understanding of blockchain and smart contracts

---

## âš?Quick Setup

### **1. Installation** (2 minutes)

```bash
# Clone the repository
cd D:\\

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

### **2. Configuration** (1 minute)

Create `.env` file:

```bash
# Copy example
cp .env.example .env

# Edit with your keys
nano .env
```

Add your keys:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### **3. Deploy Contract** (1 minute)

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Output:
# âœ?AnonymousCopyrightV2 deployed to: 0x...
# âœ?Transaction hash: 0x...
```

### **4. Verify Contract** (1 minute)

```bash
# Verify on Etherscan
npx hardhat verify --network sepolia DEPLOYED_ADDRESS

# Output:
# âœ?Contract verified successfully
```

---

## ğŸ¯ Basic Usage Examples

### **Example 1: Register as Author** â±ï¸ 30 seconds

```javascript
const { ethers } = require('ethers');

// Connect to contract
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// Register with your unique author ID
const authorId = 123456n;  // Choose your ID
const tx = await contract.registerAuthor(authorId);
await tx.wait();

console.log('âœ?Registered as author!');
```

### **Example 2: Register a Work** â±ï¸ 1 minute

```javascript
// Create content hash
const content = "My original creative work";
const fullHash = ethers.solidityPackedKeccak256(['string'], [content]);
const hash32 = parseInt(fullHash.slice(0, 10), 16);

// Register work
const tx = await contract.registerWork(
    hash32,
    "My Creative Work Title",
    "Digital Art",
    { value: ethers.parseEther('0.001') }  // Registration fee
);

const receipt = await tx.wait();
const event = receipt.logs.find(log => log.fragment?.name === 'WorkRegistered');
const workId = event.args[0];

console.log(`âœ?Work registered with ID: ${workId}`);
```

### **Example 3: Verify Work (Gateway Pattern)** â±ï¸ 2 minutes

```javascript
// Request verification via Gateway
const verifyHash = hash32;  // Same hash as registration
const tx = await contract.requestVerifyWork(
    workId,
    verifyHash,
    { value: ethers.parseEther('0.001') }  // Verification deposit
);

const receipt = await tx.wait();
const requestId = receipt.logs[0].args[2];

console.log(`âœ?Verification requested. Request ID: ${requestId}`);
console.log('â?Waiting for Gateway callback...');

// Listen for callback result
contract.on('VerificationCompleted', async (wId, reqId, isMatch) => {
    if (reqId === requestId) {
        console.log(`âœ?Verification result: ${isMatch ? 'MATCH âœ? : 'NO MATCH âœ?}`);

        // Withdraw refund
        const refundTx = await contract.withdrawRefund();
        await refundTx.wait();
        console.log('âœ?Deposit refunded!');
    }
});
```

### **Example 4: Handle Timeout** â±ï¸ 30 seconds

```javascript
// If Gateway doesn't respond within 1 hour, claim refund
setTimeout(async () => {
    const status = await contract.getVerificationStatus(requestId);

    if (!status.completed && status.canClaimTimeout) {
        console.log('â?Timeout reached, claiming refund...');

        const tx = await contract.claimVerificationTimeout(requestId);
        await tx.wait();

        console.log('âœ?Timeout refund claimed!');
    }
}, 3600000);  // 1 hour
```

### **Example 5: File Dispute** â±ï¸ 1 minute

```javascript
// File dispute claiming prior ownership
const yourHash = 0x1a2b3c4d;  // Your content hash

const tx = await contract.fileDispute(
    workId,  // Disputed work ID
    yourHash,
    { value: ethers.parseEther('0.005') }  // Dispute deposit
);

const receipt = await tx.wait();
console.log('âœ?Dispute filed!');
```

---

## ğŸ” Common Tasks

### **Check Registration Status**

```javascript
const isRegistered = await contract.isRegisteredAuthor(YOUR_ADDRESS);
console.log(`Registered: ${isRegistered}`);
```

### **Get Work Information**

```javascript
const workInfo = await contract.getWorkInfo(workId);
console.log({
    registrant: workInfo.registrant,
    timestamp: new Date(workInfo.timestamp * 1000),
    verified: workInfo.verified,
    disputed: workInfo.disputed,
    title: workInfo.title,
    category: workInfo.category
});
```

### **Check Pending Refund**

```javascript
const refund = await contract.getPendingRefund(YOUR_ADDRESS);
console.log(`Pending refund: ${ethers.formatEther(refund)} ETH`);
```

### **Withdraw Refund**

```javascript
const tx = await contract.withdrawRefund();
await tx.wait();
console.log('âœ?Refund withdrawn!');
```

### **View Author Stats**

```javascript
const stats = await contract.getAuthorStats(YOUR_ADDRESS);
console.log({
    registered: stats.registered,
    workCount: stats.workCount,
    totalDisputes: stats.totalDisputes,
    wonDisputes: stats.wonDisputes
});
```

---

## ğŸ› ï¸?Frontend Integration

### **React Example** â±ï¸ 5 minutes

```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function CopyrightApp() {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');

    // Connect wallet
    const connectWallet = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();

        const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        );

        setContract(contractInstance);
        setAccount(addr);
    };

    // Register author
    const registerAuthor = async () => {
        const authorId = Math.floor(Math.random() * 1000000);
        const tx = await contract.registerAuthor(authorId);
        await tx.wait();
        alert('Registered successfully!');
    };

    // Register work
    const registerWork = async (title, category, content) => {
        const hash = ethers.solidityPackedKeccak256(['string'], [content]);
        const hash32 = parseInt(hash.slice(0, 10), 16);

        const tx = await contract.registerWork(
            hash32,
            title,
            category,
            { value: ethers.parseEther('0.001') }
        );

        const receipt = await tx.wait();
        const workId = receipt.logs[0].args[0];

        alert(`Work registered! ID: ${workId}`);
        return workId;
    };

    // Listen for events
    useEffect(() => {
        if (!contract) return;

        contract.on('VerificationCompleted', (workId, requestId, isMatch) => {
            alert(`Verification complete! Match: ${isMatch}`);
        });

        return () => {
            contract.removeAllListeners();
        };
    }, [contract]);

    return (
        <div>
            <button onClick={connectWallet}>Connect Wallet</button>
            <button onClick={registerAuthor}>Register as Author</button>
            {/* Add more UI components */}
        </div>
    );
}
```

---

## ğŸ“Š Testing

### **Run Local Tests** â±ï¸ 2 minutes

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/AnonymousCopyrightV2.test.js

# With gas reporting
REPORT_GAS=true npx hardhat test

# With coverage
npx hardhat coverage
```

### **Test on Sepolia** â±ï¸ 5 minutes

```bash
# Run interaction script
npx hardhat run scripts/interact.js --network sepolia

# This will:
# 1. Register as author
# 2. Register a test work
# 3. Request verification
# 4. Listen for callback
# 5. Withdraw refund
```

---

## ğŸ”§ Configuration

### **Contract Constants**

```solidity
// Fees
MIN_REGISTRATION_FEE = 0.001 ETH
DISPUTE_DEPOSIT = 0.005 ETH

// Timeouts
VERIFICATION_TIMEOUT = 1 hour
DISPUTE_TIMEOUT = 24 hours

// Limits
MAX_TITLE_LENGTH = 200
MAX_CATEGORY_LENGTH = 100
MAX_DISPUTES_PER_WORK = 10

// Privacy
PRIVACY_MULTIPLIER_MIN = 1000
PRIVACY_MULTIPLIER_MAX = 9999
```

### **Update Configuration**

```javascript
// Owner can update registration fee
const tx = await contract.setRegistrationFee(
    ethers.parseEther('0.002')  // New fee
);
await tx.wait();
```

---

## ğŸš¨ Troubleshooting

### **Problem: "Insufficient fee"**
```javascript
// Solution: Check current registration fee
const config = await contract.getContractConfig();
console.log(`Required fee: ${ethers.formatEther(config.currentRegistrationFee)} ETH`);
```

### **Problem: "Already registered"**
```javascript
// Solution: Check registration status
const isRegistered = await contract.isRegisteredAuthor(YOUR_ADDRESS);
console.log(`Already registered: ${isRegistered}`);
```

### **Problem: "Verification timeout"**
```javascript
// Solution: Claim timeout refund
const status = await contract.getVerificationStatus(requestId);
if (status.canClaimTimeout) {
    await contract.claimVerificationTimeout(requestId);
}
```

### **Problem: "Gateway not responding"**
```javascript
// Solution: Check Gateway status
console.log('Gateway URL: https://gateway.zama.ai/sepolia');
// Wait for timeout period, then claim refund
```

---

## ğŸ“š Additional Resources

### **Documentation**
- ğŸ“– [Full README](./README_V2.md) - Comprehensive guide
- ğŸ—ï¸?[Architecture](./docs/ARCHITECTURE.md) - Technical details
- ğŸ“ [Upgrade Summary](./UPGRADE_SUMMARY.md) - Feature comparison

### **External Links**
- ğŸ” [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
- ğŸŒ [Gateway Docs](https://docs.zama.ai/fhevm/fundamentals/decryption/decrypt)
- ğŸ¦Š [MetaMask](https://metamask.io/)
- ğŸ’§ [Sepolia Faucet](https://sepoliafaucet.com/)

### **Community**
- ğŸ’¬ GitHub Issues
- ğŸ“§ Support Email
- ğŸ¦ Twitter Updates

---

## âœ?Checklist

Before deploying to mainnet:

- [ ] All tests passing (100%)
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Frontend integration tested
- [ ] Documentation reviewed
- [ ] Gateway integration confirmed
- [ ] Timeout mechanisms tested
- [ ] Refund flows verified
- [ ] Emergency pause tested
- [ ] Multi-sig admin setup

---

## ğŸ‰ You're Ready!

Congratulations! You now have a **production-ready**, **privacy-preserving** copyright protection platform.

**Next steps**:
1. âœ?Deploy to Sepolia testnet
2. âœ?Test all features
3. âœ?Build your frontend
4. âœ?Monitor Gateway callbacks
5. âœ?Prepare for mainnet launch

**Need help?** Check the [full documentation](./README_V2.md) or open an issue on GitHub.

---

**Happy Building! ğŸš€**

