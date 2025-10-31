# Deployment Guide

Complete deployment documentation for the Anonymous Copyright Protection System on Ethereum Sepolia testnet.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Compilation](#compilation)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Verification](#verification)
9. [Interaction](#interaction)
10. [Network Information](#network-information)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** (for version control)
- **MetaMask** or another Ethereum wallet
- **Sepolia ETH** for deployment (get from faucets)

### Required Accounts & API Keys

1. **Ethereum Wallet**:
   - Create a wallet in MetaMask
   - Export private key (never share this!)

2. **Etherscan API Key**:
   - Register at https://etherscan.io
   - Create API key at https://etherscan.io/myapikey

3. **Sepolia Testnet ETH**:
   - https://sepoliafaucet.com
   - https://www.infura.io/faucet/sepolia
   - https://faucet.quicknode.com/ethereum/sepolia

---

## Environment Setup

### 1. Clone and Navigate

```bash
# Navigate to the project directory
cd fhevm-react-template/examples/anonymous-copyright
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Hardhat and related tools
- Ethers.js v6
- FHEVM Solidity library
- Verification plugins
- Testing frameworks

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Your Private Key (WITHOUT 0x prefix)
PRIVATE_KEY=your_actual_private_key_here

# Your Etherscan API Key
ETHERSCAN_API_KEY=your_actual_etherscan_api_key
```

**Security Warning**:
- Never commit `.env` to git
- Never share your private key
- Use a dedicated wallet for development

---

## Configuration

### Hardhat Configuration

The project uses `hardhat.config.js` with the following networks:

#### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://rpc.sepolia.org
- **Block Explorer**: https://sepolia.etherscan.io

#### Localhost (for testing)
- **Chain ID**: 1337
- **URL**: http://127.0.0.1:8545

#### Hardhat Network (built-in)
- **Chain ID**: 1337
- **Forking support**: Optional

### Compiler Settings

- **Solidity Version**: 0.8.24
- **Optimizer**: Enabled (200 runs)
- **EVM Version**: Cancun

---

## Compilation

### Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript typings
- Create artifacts in `artifacts/` directory

### Clean Build Artifacts

```bash
npm run clean
```

---

## Testing

### Run Tests

```bash
npm run test
```

### Run Tests with Gas Reporting

```bash
npm run test:gas
```

### Run Coverage Analysis

```bash
npm run coverage
```

### Run Simulation (Comprehensive Testing)

```bash
npm run simulate
```

This will:
- Deploy contract to local network
- Register multiple authors
- Create sample works
- Test all contract functions
- Generate simulation report

---

## Deployment

### Step 1: Check Account Balance

Ensure your account has sufficient Sepolia ETH:

```bash
npm run accounts
```

### Step 2: Deploy to Sepolia

```bash
npm run deploy
```

**Expected Output:**

```
==========================================
   Anonymous Copyright Protection System
   Deployment Script
==========================================

Deploying contracts with account: 0x...
Account balance: 0.5 ETH
Network: sepolia
Chain ID: 11155111

Estimated deployment cost: 0.003 ETH

Deploying AnonymousCopyright contract...
Transaction submitted. Waiting for confirmation...

✓ Contract deployed successfully!

Waiting for 5 block confirmations...
✓ Confirmed!

==========================================
   DEPLOYMENT SUMMARY
==========================================
Contract Address: 0x...
Deployer: 0x...
Network: sepolia
Chain ID: 11155111
Block Number: 12345678
Transaction Hash: 0x...
Gas Used: 2,847,392
Gas Price: 1.5 gwei
Deployment Cost: 0.00427 ETH
==========================================
```

### Step 3: Save Deployment Information

The deployment script automatically saves:
- `deployments/sepolia-latest.json` - Latest deployment info
- `deployments/sepolia-[timestamp].json` - Historical deployment

**Deployment Info Structure:**

```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractAddress": "0x...",
  "contractName": "AnonymousCopyright",
  "deployer": "0x...",
  "deploymentTransaction": "0x...",
  "blockNumber": 12345678,
  "gasUsed": "2847392",
  "gasPrice": "1500000000",
  "deploymentCost": "0.00427",
  "timestamp": "2024-10-28T12:00:00.000Z",
  "compiler": {
    "version": "0.8.24",
    "optimizer": true,
    "runs": 200
  }
}
```

### Alternative Deployment Options

#### Deploy to Local Node

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

#### Deploy to Hardhat Network

```bash
npm run deploy:hardhat
```

---

## Verification

### Automatic Verification

After deployment, verify the contract on Etherscan:

```bash
npm run verify
```

**Expected Output:**

```
==========================================
   Contract Verification Script
==========================================

Network: sepolia
Contract Name: AnonymousCopyright
Contract Address: 0x...

Starting verification on Etherscan...
This may take a few moments...

✓ Contract verified successfully!

==========================================
   VERIFICATION SUMMARY
==========================================
Contract: AnonymousCopyright
Address: 0x...
Network: sepolia

View on Etherscan:
https://sepolia.etherscan.io/address/0x...#code
==========================================
```

### Manual Verification

If automatic verification fails:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Verification Troubleshooting

If you encounter "Already Verified" error:
- Contract is already verified ✓
- Check Etherscan link to view

If verification fails:
- Wait 2-3 minutes after deployment
- Check ETHERSCAN_API_KEY in .env
- Ensure contract was compiled with same settings

---

## Interaction

### Interactive Testing

Test all contract functions:

```bash
npm run interact
```

This will:
1. Register authors
2. Create copyright works
3. Verify works
4. Check statistics
5. Test all read functions

### Using Hardhat Console

```bash
npm run console
```

Then interact with contract:

```javascript
const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
const contract = AnonymousCopyright.attach("CONTRACT_ADDRESS");

// Register as author
await contract.registerAuthor(123456);

// Register work
await contract.registerWork(
  987654321,
  "My Original Work",
  "Digital Art"
);

// Get work info
const info = await contract.getWorkInfo(1);
console.log(info);
```

---

## Network Information

### Sepolia Testnet

**Network Details:**
- **Network Name**: Sepolia
- **Chain ID**: 11155111
- **Currency**: SepoliaETH
- **RPC URL**: https://rpc.sepolia.org
- **Block Explorer**: https://sepolia.etherscan.io

**Add to MetaMask:**

1. Open MetaMask
2. Click network dropdown
3. Add Network
4. Enter details above
5. Save

**Faucets (Get Test ETH):**
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia
- https://sepolia-faucet.pk910.de

### Contract Address

After deployment, your contract will be available at:

```
Contract Address: [Will be displayed after deployment]
Etherscan Link: https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]
```

**Save this information** for frontend integration!

---

## Project Structure

```
anonymous-copyright/
├── contracts/
│   └── AnonymousCopyright.sol    # Main smart contract
├── scripts/
│   ├── deploy.js                 # Deployment script
│   ├── verify.js                 # Verification script
│   ├── interact.js               # Interaction script
│   └── simulate.js               # Simulation script
├── deployments/                   # Deployment records (auto-generated)
│   ├── sepolia-latest.json
│   └── sepolia-[timestamp].json
├── artifacts/                     # Compiled contracts (auto-generated)
├── cache/                         # Hardhat cache (auto-generated)
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Project dependencies
├── .env                          # Environment variables (create from .env.example)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── DEPLOYMENT.md                 # This file
```

---

## Available Scripts

### Development

```bash
npm run compile          # Compile contracts
npm run clean           # Clean artifacts
npm run test            # Run tests
npm run test:gas        # Run tests with gas reporting
npm run coverage        # Generate coverage report
```

### Deployment

```bash
npm run deploy          # Deploy to Sepolia
npm run deploy:local    # Deploy to localhost
npm run deploy:hardhat  # Deploy to Hardhat network
```

### Verification

```bash
npm run verify          # Verify on Etherscan
```

### Interaction

```bash
npm run interact        # Interact with deployed contract
npm run interact:local  # Interact with local deployment
npm run simulate        # Run comprehensive simulation
npm run simulate:local  # Run simulation locally
```

### Utilities

```bash
npm run node            # Start local Hardhat node
npm run node:fork       # Start forked Hardhat node
npm run console         # Open Hardhat console
npm run accounts        # List accounts
npm run flatten         # Flatten contract for verification
```

---

## Smart Contract Features

### Core Functions

1. **Author Registration**
   ```solidity
   registerAuthor(uint64 _authorId)
   ```
   - Register as anonymous author with encrypted ID

2. **Work Registration**
   ```solidity
   registerWork(uint32 _contentHash, string _title, string _category)
   ```
   - Register original work with encrypted content hash

3. **Work Verification**
   ```solidity
   requestVerifyWork(uint256 _workId, uint32 _contentHashToVerify)
   ```
   - Verify ownership using encrypted comparison

4. **Dispute Filing**
   ```solidity
   fileDispute(uint256 _workId, uint32 _challengerContentHash)
   ```
   - File copyright dispute

5. **Query Functions**
   ```solidity
   getWorkInfo(uint256 _workId)
   getAuthorStats(address _author)
   getAuthorWorks(address _author)
   getTotalWorks()
   ```

### Privacy Features

- **Encrypted Author IDs**: Using FHEVM euint64
- **Encrypted Content Hashes**: Using FHEVM euint32
- **Private Comparisons**: Homomorphic equality checks
- **Async Decryption**: Secure result retrieval

---

## Gas Costs (Estimates)

| Function | Gas Cost | USD (@ 20 gwei, $2000 ETH) |
|----------|----------|----------------------------|
| Deploy Contract | ~2,850,000 | ~$114.00 |
| Register Author | ~180,000 | ~$7.20 |
| Register Work | ~220,000 | ~$8.80 |
| File Dispute | ~190,000 | ~$7.60 |
| Verify Work | ~150,000 | ~$6.00 |
| Mark Verified | ~45,000 | ~$1.80 |

*Estimates may vary based on network conditions*

---

## Security Considerations

### Private Key Management

- ✅ Use environment variables
- ✅ Never commit `.env` to git
- ✅ Use hardware wallet for mainnet
- ✅ Regularly rotate keys
- ❌ Never share private keys
- ❌ Don't use mainnet keys for testing

### Smart Contract Security

- Contract uses OpenZeppelin patterns
- FHE encryption for sensitive data
- Access control modifiers
- Input validation
- Event logging for transparency

### Recommended Audits

Before mainnet deployment:
1. Internal code review
2. Professional security audit
3. Testnet testing period (2-4 weeks)
4. Bug bounty program

---

## Troubleshooting

### Common Issues

#### 1. Insufficient Funds

**Error**: `sender doesn't have enough funds`

**Solution**:
- Get Sepolia ETH from faucets
- Check balance: `npm run accounts`

#### 2. Network Connection

**Error**: `could not detect network`

**Solution**:
- Check SEPOLIA_RPC_URL in .env
- Try alternative RPC: https://ethereum-sepolia.publicnode.com
- Check internet connection

#### 3. Nonce Too High/Low

**Error**: `nonce has already been used`

**Solution**:
```bash
# Reset account in MetaMask
# Settings > Advanced > Reset Account
```

#### 4. Verification Failed

**Error**: `Etherscan API key required`

**Solution**:
- Add ETHERSCAN_API_KEY to .env
- Get key from https://etherscan.io/myapikey

#### 5. Compilation Error

**Error**: `Solidity compilation failed`

**Solution**:
```bash
npm run clean
npm install
npm run compile
```

#### 6. Module Not Found

**Error**: `Cannot find module`

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Deployment info saved in `deployments/`
- [ ] Contract verified on Etherscan
- [ ] Tested all functions via `npm run interact`
- [ ] Documented contract address
- [ ] Updated frontend configuration
- [ ] Tested with real users
- [ ] Monitored gas costs
- [ ] Set up event monitoring
- [ ] Created backup of deployment info

---

## Maintenance & Updates

### Monitoring

Monitor your contract:
- Events on Etherscan
- Transaction history
- Gas usage patterns
- User interactions

### Upgrades

For contract upgrades:
1. Test thoroughly on testnet
2. Deploy new version
3. Migrate data if needed
4. Update frontend
5. Notify users

---

## Support & Resources

### Documentation

- **Hardhat**: https://hardhat.org/docs
- **Ethers.js**: https://docs.ethers.org
- **FHEVM**: https://docs.zama.ai/fhevm
- **Sepolia**: https://sepolia.dev

### Community

- **GitHub Issues**: [Your repo URL]
- **Discord**: [Your Discord server]
- **Twitter**: [Your Twitter]

### Getting Help

If you encounter issues:
1. Check troubleshooting section
2. Review error messages carefully
3. Search GitHub issues
4. Ask in community Discord
5. Create detailed bug report

---

## License

MIT License - See LICENSE file for details

---

## Changelog

### Version 1.0.0 (2024-10-28)

- Initial deployment framework
- Complete Hardhat setup
- Deployment, verification, and interaction scripts
- Comprehensive documentation
- Sepolia testnet configuration
- Gas optimization

---

**Happy Deploying! 🚀**

For questions or issues, please refer to the troubleshooting section or contact support.
