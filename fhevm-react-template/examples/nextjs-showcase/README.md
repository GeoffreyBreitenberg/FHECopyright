# FHEVM Next.js Showcase

Next.js 14 showcase application demonstrating the Universal FHEVM SDK with App Router, Server Components, and modern React patterns.

This example showcases a **production-ready** implementation with:
- **Complete SDK Integration** - All FHEVM operations demonstrated
- **API Routes** - Server-side and client-side FHE operations
- **Reusable Components** - Production-ready UI components library
- **Custom Hooks** - Convenient React hooks for FHE operations
- **Full Type Safety** - Complete TypeScript support
- **Use Case Examples** - Banking and medical record scenarios

---

## 🎯 Overview

This showcase demonstrates how to integrate the FHEVM SDK into a Next.js 14 application with:

- **Next.js App Router**: Modern routing with layouts and nested routes
- **Server & Client Components**: Optimal performance with React Server Components
- **TypeScript**: Full type safety throughout the application
- **FHEVM SDK Integration**: Seamless encryption/decryption with React hooks
- **Responsive Design**: Mobile-first UI with modern CSS
- **Web3 Integration**: MetaMask wallet connection and Ethereum interaction

**Live Demo**: [https://fhe-copyright.vercel.app/](https://fhe-copyright.vercel.app/)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension

### Installation

```bash
# Clone repository
git clone https://github.com/GeoffreyBreitenberg/fhevm-react-template.git
cd fhevm-react-template/examples/nextjs-showcase

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
nextjs-showcase/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with header/footer
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── encryption/              # Encryption demo page
│   │   └── page.tsx
│   ├── examples/                # Code examples page
│   │   └── page.tsx
│   ├── about/                   # About FHEVM page
│   │   └── page.tsx
│   └── api/                     # API Routes
│       ├── fhe/                 # FHE operations
│       │   ├── route.ts         # Main FHE endpoint
│       │   ├── encrypt/route.ts # Encryption endpoint
│       │   ├── decrypt/route.ts # Decryption endpoint
│       │   └── compute/route.ts # Computation info
│       └── keys/route.ts        # Key management
│
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx           # Reusable button
│   │   ├── Input.tsx            # Form input
│   │   └── Card.tsx             # Card container
│   ├── fhe/                     # FHE-specific components
│   │   ├── FHEProvider.tsx      # Context provider
│   │   ├── EncryptionDemo.tsx   # Encryption demo
│   │   ├── ComputationDemo.tsx  # Computation demo
│   │   └── KeyManager.tsx       # Key management UI
│   ├── examples/                # Use case examples
│   │   ├── BankingExample.tsx   # Private banking
│   │   └── MedicalExample.tsx   # Medical records
│   ├── Header.tsx               # Navigation header
│   └── Footer.tsx               # Footer with links
│
├── lib/                         # Utilities and configuration
│   ├── fhe/                     # FHE utilities
│   │   ├── client.ts            # Client initialization
│   │   ├── server.ts            # Server-side operations
│   │   ├── keys.ts              # Key management
│   │   └── types.ts             # FHE type definitions
│   ├── utils/                   # General utilities
│   │   ├── security.ts          # Security helpers
│   │   └── validation.ts        # Input validation
│   ├── config.ts                # Network configuration
│   └── utils.ts                 # Helper functions
│
├── hooks/                       # Custom React hooks
│   ├── useFHE.ts                # Main FHE hook
│   ├── useEncryption.ts         # Encryption hook
│   └── useComputation.ts        # Computation hook
│
├── types/                       # TypeScript definitions
│   ├── fhe.ts                   # FHE types
│   └── api.ts                   # API types
│
├── public/                      # Static assets
│   └── favicon.ico
│
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🎨 Features

### 1. Interactive Encryption Demo

**Location**: `/encryption`

Try FHE encryption with a user-friendly interface:
- Choose encryption type (uint32 or uint64)
- Encrypt values on the client side
- View encrypted handles and input proofs
- Copy results for use in smart contracts

### 2. Code Examples

**Location**: `/examples`

Browse comprehensive examples:
- Basic encryption
- React hooks usage
- Smart contract integration
- User decryption with EIP-712
- Batch operations
- Error handling patterns

### 3. FHEVM Education

**Location**: `/about`

Learn about FHE technology:
- What is Fully Homomorphic Encryption
- How FHEVM works on Ethereum
- Encrypted types (euint32, euint64, ebool)
- Real-world use cases
- Technical architecture

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```bash
# Network (sepolia or localhost)
NEXT_PUBLIC_NETWORK=sepolia

# Contract address for FHEVM operations
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a
```

### Network Configuration

Edit `lib/config.ts` to add or modify network settings:

```typescript
export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    gatewayUrl: 'https://gateway.zama.ai',
  },
  // Add more networks...
};
```

---

## 💻 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Project Guidelines

- **Client Components**: Use `'use client'` for components with hooks or browser APIs
- **Server Components**: Default for data fetching and static content
- **Type Safety**: Always use TypeScript types from FHEVM SDK
- **Error Handling**: Use try-catch with user-friendly error messages
- **Loading States**: Show feedback during async operations

---

## 🔐 FHEVM SDK Integration

### Client Initialization

```typescript
import { useFhevmClient } from '@fhevm/sdk/hooks';

const { client, isReady, error } = useFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});
```

### Encryption

```typescript
import { useEncrypt } from '@fhevm/sdk/hooks';

const { encrypt, isEncrypting } = useEncrypt(client);

const handleEncrypt = async (value: number) => {
  const encrypted = await encrypt(value, 'uint32');
  console.log('Encrypted:', encrypted);
};
```

### Contract Integration

```typescript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);

// Use encrypted values
await contract.submit(
  encrypted.handles[0],
  encrypted.inputProof
);
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables on Vercel

Add the following to your Vercel project:
- `NEXT_PUBLIC_NETWORK`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Build command: `npm run build`
Start command: `npm start`
Node version: 18+

---

## 📚 Resources

### Documentation
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)
- [FHEVM SDK Repository](https://github.com/GeoffreyBreitenberg/fhevm-react-template)

### Examples
- [Live Demo Application](https://fhe-copyright.vercel.app/)
- [Anonymous Copyright Protection](../anonymous-copyright/)

### Community
- [Zama Website](https://www.zama.ai/)
- [GitHub Issues](https://github.com/GeoffreyBreitenberg/fhevm-react-template/issues)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules / Global CSS
- **Web3**: ethers.js v6
- **Encryption**: FHEVM SDK (@fhevm/sdk)
- **Notifications**: react-hot-toast
- **Deployment**: Vercel

---

## 📝 Best Practices

### Performance
- Use Server Components for static content
- Lazy load Client Components when possible
- Optimize images with next/image
- Minimize client-side JavaScript

### Security
- Never expose private keys
- Validate all user input
- Use environment variables for sensitive data
- Implement proper error boundaries

### User Experience
- Show loading states during operations
- Provide clear error messages
- Support mobile devices
- Ensure accessibility (WCAG)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE)

---

## 🙏 Acknowledgments

- **Zama** - FHEVM technology and support
- **Next.js Team** - Excellent framework and documentation
- **Community** - Feedback and contributions

---

**Built with Next.js 14 and FHEVM SDK**

🔐 *Privacy-preserving computation on Ethereum*
