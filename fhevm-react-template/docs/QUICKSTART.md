# Quick Start Guide

Get started with the Universal FHEVM SDK in under 10 minutes.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))
- **npm** ≥ 9.0.0 (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** or similar Web3 wallet ([Install](https://metamask.io/))
- **Sepolia ETH** for deployment ([Faucet](https://sepoliafaucet.com/))

---

## Installation

### Option 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Install dependencies
npm install
```

### Option 2: Try an Example

```bash
# Navigate to example directory
cd examples/anonymous-copyright

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

---

## Configuration

### 1. Environment Setup

Create `.env` file with your configuration:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas Reporting (optional)
REPORT_GAS=false
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

**Getting Your Keys**:

1. **Private Key**: Export from MetaMask
   - Click three dots → Account Details → Export Private Key
   - ⚠️ **Never share or commit your private key!**

2. **Etherscan API Key**:
   - Go to [Etherscan](https://etherscan.io/)
   - Sign up and generate API key in your profile

3. **Sepolia ETH**:
   - Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
   - Need 0.1-0.5 ETH for deployment

### 2. Verify Setup

```bash
# Check Node.js version
node --version  # Should be ≥ 18.0.0

# Check npm version
npm --version   # Should be ≥ 9.0.0

# Check installation
npm list --depth=0
```

---

## Your First dApp

### Step 1: Compile Contracts

```bash
# Compile Solidity contracts
npm run compile

# Expected output:
# Compiled 1 Solidity file successfully
```

### Step 2: Run Tests

```bash
# Run test suite
npm test

# Expected: All tests should pass
# ✓ 56 passing

# Check coverage
npm run coverage

# Expected: ≥85% coverage
```

### Step 3: Deploy to Sepolia

```bash
# Deploy contract
npm run deploy

# Expected output:
# 🚀 Deploying AnonymousCopyright...
# ✅ Contract deployed at: 0x...
# 📋 Deployment saved to: deployments/sepolia-latest.json
```

**Deployment Output**:
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentTransaction": "0x...",
  "blockNumber": 12345,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Step 4: Verify on Etherscan

```bash
# Verify contract
npm run verify

# Expected:
# ✅ Contract verified on Etherscan
# 📋 https://sepolia.etherscan.io/address/0x...#code
```

### Step 5: Interact with Contract

```bash
# Run interaction script
npm run interact

# This will:
# 1. Register an author
# 2. Register a work
# 3. Verify ownership
# 4. File a dispute
```

---

## Using the SDK

### Basic Encryption

```typescript
import { createFhevmClient, encryptUint32 } from '@fhevm/sdk';

// 1. Initialize client
const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});

// 2. Encrypt value
const encrypted = await encryptUint32(client, 12345);

// 3. Use in transaction
await contract.registerWork(
  encrypted.handles[0],
  encrypted.inputProof,
  "My Work",
  "Art"
);
```

### React Integration

```typescript
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';

function MyComponent() {
  // 1. Get client
  const { client, isReady } = useFhevmClient({
    network: 'sepolia',
    contractAddress: '0x...'
  });

  // 2. Get encrypt function
  const { encrypt, isEncrypting } = useEncrypt(client);

  // 3. Encrypt and submit
  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value);
    await contract.submit(encrypted.handles[0], encrypted.proof);
  };

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={!isReady || isEncrypting}
    >
      Submit Encrypted Value
    </button>
  );
}
```

### User Decryption

```typescript
import { userDecrypt } from '@fhevm/sdk';

// Decrypt with EIP-712 signature
const decryptedValue = await userDecrypt(
  client,
  encryptedResult,      // From contract
  contractAddress,
  userAddress,
  signer               // Ethers signer for EIP-712
);

console.log('Decrypted:', decryptedValue);
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start development
npm run format              # Format code

# 2. Make changes to contracts/scripts

# 3. Test changes
npm run lint                # Check code quality
npm test                    # Run tests

# 4. Commit (hooks run automatically)
git add .
git commit -m "feat: add new feature"
# Pre-commit hooks will run:
# ✓ Prettier check
# ✓ Linting
# ✓ Security check

# 5. Push (hooks run automatically)
git push
# Pre-push hooks will run:
# ✓ Compilation
# ✓ Full test suite
# ✓ Coverage check
```

### Before Deployment

```bash
# 1. Complete validation
npm run ci:full

# This runs:
# ✓ Format & lint
# ✓ Security audit
# ✓ Compilation
# ✓ Tests
# ✓ Coverage
# ✓ Gas analysis

# 2. Security audit
npm run security

# 3. Gas analysis
npm run gas:analysis

# 4. Review reports
ls reports/
# security-audit-[timestamp].json
# gas-analysis-[timestamp].json
```

---

## Common Tasks

### Add a New Function

```solidity
// 1. Add to contract
function myNewFunction(uint32 _value) external {
    // Implementation
    emit MyEvent(_value);
}

// 2. Compile
npm run compile

// 3. Write tests
describe("My New Function", function () {
    it("should work correctly", async function () {
        const tx = await contract.myNewFunction(123);
        await tx.wait();
        // Assertions
    });
});

// 4. Test
npm test
```

### Update Contract

```bash
# 1. Make changes to contract

# 2. Compile
npm run compile

# 3. Update tests
npm test

# 4. Deploy to testnet
npm run deploy

# 5. Verify
npm run verify
```

### Add an Example

```bash
# 1. Create example directory
mkdir examples/my-example

# 2. Copy template structure
cp -r examples/anonymous-copyright/* examples/my-example/

# 3. Customize contract and tests

# 4. Update README
# Document your example in examples/my-example/README.md

# 5. Update main README
# Add your example to the Available Examples section
```

---

## Troubleshooting

### Compilation Errors

**Error**: `Contract too large`
```bash
# Solution: Enable optimizer
# In hardhat.config.js:
settings: {
  optimizer: {
    enabled: true,
    runs: 200
  }
}
```

**Error**: `Compiler version not found`
```bash
# Solution: Clear cache and reinstall
npm run clean
npm install
npm run compile
```

### Deployment Errors

**Error**: `Insufficient funds`
```bash
# Solution: Get more Sepolia ETH
# Visit https://sepoliafaucet.com/
# Need 0.1-0.5 ETH for deployment
```

**Error**: `Network timeout`
```bash
# Solution: Increase timeout in hardhat.config.js
networks: {
  sepolia: {
    timeout: 120000  // 2 minutes
  }
}
```

**Error**: `Invalid private key`
```bash
# Solution: Check .env file
# 1. Ensure PRIVATE_KEY starts with 0x
# 2. Check for extra spaces
# 3. Verify key is from correct account
```

### Test Errors

**Error**: `Tests fail intermittently`
```bash
# Solution: Increase test timeout
# In test file:
describe("Tests", function () {
  this.timeout(120000);  // 2 minutes
});
```

**Error**: `Gas estimation failed`
```bash
# Solution: Ensure enough test ETH
# Hardhat provides test accounts with ETH
# If using forking, ensure mainnet state is accessible
```

### Git Hook Errors

**Error**: `Pre-commit hook failed`
```bash
# Solution: Fix issues or bypass
npm run format        # Fix formatting
npm run lint:fix      # Fix linting

# Or bypass (not recommended)
git commit --no-verify
```

---

## Performance Tips

### Optimize Gas Usage

```solidity
// ✅ Good: Cache storage reads
function optimized() external {
    uint256 cached = storageVar;  // Read once
    return cached * 2;
}

// ❌ Bad: Multiple storage reads
function unoptimized() external {
    return storageVar * 2;  // Reads every time
}
```

### Test Efficiency

```bash
# Run specific test file
npm test -- test/MyContract.test.js

# Skip slow tests during development
npm test -- --grep "^(?!.*integration)"

# Parallel execution (if configured)
npm test -- --parallel
```

---

## Security Best Practices

### Development

1. **Never commit secrets**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   secrets/
   ```

2. **Use environment variables**
   ```bash
   # Good
   const key = process.env.PRIVATE_KEY;

   # Bad
   const key = "0x123...";  // Never hardcode!
   ```

3. **Run security checks**
   ```bash
   npm run security        # Before every deployment
   npm run lint            # During development
   ```

### Deployment

1. **Test on testnet first**
   ```bash
   npm run deploy          # Deploy to Sepolia
   npm run interact        # Test functionality
   ```

2. **Verify contracts**
   ```bash
   npm run verify          # Verify on Etherscan
   ```

3. **Use multi-sig for production**
   ```solidity
   // Transfer ownership to multi-sig
   await contract.transferOwnership(multiSigAddress);
   ```

---

## Next Steps

Now that you're set up:

1. **Explore Examples**
   - Study [Anonymous Copyright](../examples/anonymous-copyright/)
   - Review contract structure
   - Understand FHE patterns

2. **Read Documentation**
   - [API Reference](./API.md)
   - [Examples Guide](./EXAMPLES.md)
   - [Security Guide](../examples/anonymous-copyright/SECURITY.md)

3. **Build Your dApp**
   - Start with a simple contract
   - Add FHE encryption
   - Write comprehensive tests
   - Deploy to Sepolia

4. **Join Community**
   - Ask questions in GitHub Issues
   - Contribute improvements
   - Share your examples

---

## Resources

### Documentation
- [Main README](../README.md)
- [API Reference](./API.md)
- [Contributing Guide](../CONTRIBUTING.md)

### External Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Community
- GitHub Issues
- GitHub Discussions

---

**You're ready to build confidential dApps with FHE! 🚀**

If you need help, check the [troubleshooting section](#troubleshooting) or create an issue on GitHub.
