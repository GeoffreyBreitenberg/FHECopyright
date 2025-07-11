# 🔐 Anonymous Copyright Protection

A privacy-preserving blockchain platform for creative work authentication using Fully Homomorphic Encryption (FHE) on Ethereum Sepolia testnet.

## 🌟 Overview

Anonymous Copyright Protection leverages **fhEVM** (Fully Homomorphic Encryption for Ethereum Virtual Machine) to enable creators to register and protect their original works without revealing sensitive information on-chain. All content hashes and author identities remain encrypted while still being verifiable and disputable.

## 🎯 Core Concept

### Privacy-Preserving Original Work Authentication

Traditional copyright registration systems expose creator identities and work details publicly. Our solution uses **Fully Homomorphic Encryption** to:

- **Encrypt Author Identity**: Register with a secret author ID that remains private on the blockchain
- **Encrypt Content Hash**: Submit work fingerprints that are encrypted yet verifiable
- **Private Verification**: Verify ownership without revealing the original hash
- **Encrypted Disputes**: Challenge works with encrypted evidence
- **Zero-Knowledge Proofs**: Prove ownership without exposing sensitive data

## 📋 Features

### 1. Anonymous Author Registration
- Register with an encrypted numeric author ID
- Identity remains private on-chain
- One-time registration per address

### 2. Encrypted Work Registration
- Submit creative works with encrypted content hashes
- Public metadata: title, category, timestamp
- Private data: content hash, author ID (both encrypted)
- Permanent on-chain record

### 3. Privacy-Preserving Verification
- Verify work ownership without revealing original hash
- Asynchronous FHE decryption process
- Results emitted via blockchain events

### 4. Dispute Resolution System
- File disputes with encrypted evidence
- Compare encrypted hashes on-chain
- Transparent resolution process

### 5. Work Categories
- Literature
- Music
- Art
- Photography
- Software
- Design
- Video
- Other

## 🔗 Smart Contract

**Network**: Ethereum Sepolia Testnet

**Contract Address**: `0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a`

**Technology Stack**:
- Solidity 0.8.24
- fhEVM by Zama
- Fully Homomorphic Encryption
- Ethereum Sepolia Network

## 🎬 Demonstration

### Live Demo
🌐 **Website**: [https://anonymous-copyright.vercel.app/](https://anonymous-copyright.vercel.app/)

### Video Demonstration
📹 Watch our platform in action - see how creators can register their works with complete privacy while maintaining verifiable ownership on the blockchain.

### On-Chain Transactions
All transactions are recorded on Ethereum Sepolia testnet. You can verify any transaction using:
- **Sepolia Etherscan**: [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
- Search for contract: `0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a`

## 🏗️ Architecture

### Smart Contract Structure

```solidity
contract AnonymousCopyright {
    // Encrypted data structures
    struct OriginalWork {
        euint32 encryptedContentHash;  // FHE encrypted hash
        euint64 encryptedAuthorId;     // FHE encrypted ID
        address registrant;
        uint256 timestamp;
        bool verified;
        bool disputed;
        string workTitle;
        string category;
    }

    struct AuthorProfile {
        euint64 encryptedAuthorId;     // Private identity
        bool registered;
        uint256 workCount;
        uint256 totalDisputes;
        uint256 wonDisputes;
    }
}
```

### Key Functions

1. **registerAuthor(uint64 _authorId)**
   - Encrypts and stores author identity
   - Enables work registration

2. **registerWork(uint32 _contentHash, string _title, string _category)**
   - Encrypts content hash
   - Links to encrypted author ID
   - Returns unique work ID

3. **requestVerifyWork(uint256 _workId, uint32 _contentHashToVerify)**
   - Initiates encrypted comparison
   - Async decryption via fhEVM gateway
   - Results via VerificationResult event

4. **fileDispute(uint256 _workId, uint32 _challengerContentHash)**
   - Submit encrypted challenge
   - Transparent dispute record

5. **resolveDispute(uint256 _workId, uint256 _disputeId)**
   - Compare encrypted hashes
   - Determine rightful owner

## 🎨 User Interface

### Modern Web3 Design
- **Theme**: Purple/Pink gradient with dark mode aesthetics
- **Responsive**: Mobile-first design
- **Web3 Integration**: MetaMask connectivity
- **Real-time Updates**: Live blockchain interaction
- **Zero Dependencies**: Pure HTML/CSS/JS with CDN libraries

### Interface Sections
1. **Register Author** - One-time identity setup
2. **Submit Work** - Register copyrighted content
3. **Verify Work** - Check ownership claims
4. **File Dispute** - Challenge registrations
5. **Browse Works** - Explore all registered works
6. **My Profile** - Personal statistics and portfolio

## 🔒 Privacy Features

### What's Encrypted (On-Chain)
- ✅ Author ID (euint64)
- ✅ Content Hash (euint32)
- ✅ Verification comparisons
- ✅ Dispute evidence

### What's Public (On-Chain)
- ✅ Work title
- ✅ Category
- ✅ Timestamp
- ✅ Registrant address
- ✅ Dispute count
- ✅ Verification status

### FHE Technology
Powered by **Zama's fhEVM**, enabling:
- Computation on encrypted data
- No decryption required for verification
- Privacy-preserving smart contracts
- Secure multi-party computation

## 📊 Use Cases

### 1. Anonymous Authors
Writers can register their manuscripts without revealing their identity, protecting against plagiarism while maintaining anonymity.

### 2. Whistleblower Protection
Journalists can timestamp sensitive documents with verifiable proof of possession without exposing themselves.

### 3. Trade Secrets
Companies can register proprietary algorithms or designs with encrypted fingerprints, proving prior art without disclosure.

### 4. Creative Commons
Artists can register works under pseudonyms while maintaining verifiable ownership for licensing.

### 5. Academic Research
Researchers can timestamp discoveries before publication, protecting priority without premature disclosure.

## 🌐 Links

- **GitHub Repository**: [https://github.com/GeoffreyBreitenberg/AnonymousCopyright](https://github.com/GeoffreyBreitenberg/AnonymousCopyright)
- **Live Application**: [https://anonymous-copyright.vercel.app/](https://anonymous-copyright.vercel.app/)
- **Contract on Sepolia**: [View on Etherscan](https://sepolia.etherscan.io/address/0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a)

## 🛠️ Technology Stack

### Blockchain
- **Network**: Ethereum Sepolia Testnet
- **Smart Contract**: Solidity 0.8.24
- **FHE Library**: @fhevm/solidity by Zama
- **Development**: Hardhat

### Frontend
- **Framework**: Vanilla JavaScript (Zero dependencies)
- **Web3 Library**: ethers.js v5.7.2 (CDN)
- **Styling**: Custom CSS with gradient themes
- **Hosting**: Vercel

### Encryption
- **FHE Provider**: Zama fhEVM
- **Encrypted Types**: euint32, euint64, ebool
- **Decryption**: Asynchronous gateway-based

## 📈 Platform Statistics

Track real-time metrics:
- Total works registered
- Active authors
- Disputes filed
- Verification requests
- Category distribution

## 🔐 Security Considerations

### Smart Contract Security
- Owner-only functions for verification
- Reentrancy protection
- Input validation
- Event logging for transparency

### Privacy Guarantees
- Content hashes never decrypted publicly
- Author IDs remain encrypted
- Verification via zero-knowledge proofs
- Dispute resolution without data exposure

### Best Practices
1. Use unique, high-entropy author IDs
2. Generate cryptographic content hashes
3. Store original works offline securely
4. Verify transactions on Etherscan
5. Keep private keys secure

## 🎯 Roadmap

- ✅ Core FHE copyright registration
- ✅ Encrypted verification system
- ✅ Dispute mechanism
- ✅ Web3 frontend interface
- 🔄 IPFS integration for work storage
- 🔄 Multi-chain deployment
- 🔄 NFT minting for verified works
- 🔄 DAO governance for disputes
- 🔄 Mobile application

## 📄 License

MIT License - Open source and free to use

## 🤝 Contributing

We welcome contributions! This project demonstrates the power of FHE in protecting intellectual property rights while maintaining blockchain transparency.

## 📞 Support

For questions, issues, or collaboration:
- **GitHub Issues**: [Report bugs or request features](https://github.com/GeoffreyBreitenberg/AnonymousCopyright/issues)
- **Discussions**: Share ideas and use cases

---

**Powered by fhEVM** - Bringing privacy to smart contracts through Fully Homomorphic Encryption

*Protecting creativity, preserving privacy, proving ownership.*
