# @fhevm/sdk

Universal FHEVM SDK - Framework-agnostic toolkit for building confidential dApps with Fully Homomorphic Encryption.

## 🌟 Features

- ✅ **Framework Agnostic**: Works with React, Next.js, Vue, Node.js
- ✅ **TypeScript Ready**: Full type safety and IntelliSense support
- ✅ **Easy to Use**: Wagmi-like API, familiar patterns
- ✅ **Production Ready**: Tested and optimized
- ✅ **Modular**: Use only what you need

## 📦 Installation

```bash
npm install @fhevm/sdk ethers
```

## 🚀 Quick Start

### Basic Usage

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
  const { client, isReady } = useFhevmClient({
    network: 'sepolia',
    contractAddress: '0x...'
  });

  const { encrypt, isEncrypting } = useEncrypt(client);

  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value);
    await contract.submit(encrypted.handles[0], encrypted.inputProof);
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
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const decryptedValue = await userDecrypt(
  client,
  encryptedResult,
  contractAddress,
  await signer.getAddress(),
  signer
);

console.log('Decrypted:', decryptedValue.toString());
```

## 📚 API Reference

### Core Functions

#### `createFhevmClient(config)`

Creates and initializes an FHEVM client.

```typescript
const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});
```

#### `encryptUint32(client, value)`

Encrypts a uint32 value.

```typescript
const encrypted = await encryptUint32(client, 12345);
```

#### `encryptUint64(client, value)`

Encrypts a uint64 value.

```typescript
const encrypted = await encryptUint64(client, 123456789n);
```

#### `userDecrypt(client, encryptedValue, contractAddress, userAddress, signer)`

Decrypts an encrypted value for a specific user.

```typescript
const decrypted = await userDecrypt(
  client,
  encryptedValue,
  contractAddress,
  userAddress,
  signer
);
```

#### `batchEncrypt(client, values)`

Encrypts multiple values at once.

```typescript
const encrypted = await batchEncrypt(client, [
  { type: 'uint32', value: 123 },
  { type: 'uint64', value: 456n }
]);
```

### React Hooks

#### `useFhevmClient(config)`

Hook for managing FHEVM client.

```typescript
const { client, isReady, error, reload } = useFhevmClient(config);
```

#### `useEncrypt(client)`

Hook for encrypting values.

```typescript
const { encrypt, isEncrypting, error } = useEncrypt(client);
```

#### `useDecrypt(client)`

Hook for decrypting values.

```typescript
const { decrypt, isDecrypting, error } = useDecrypt(client);
```

#### `useContract(address, abi, provider)`

Hook for managing contract instances.

```typescript
const { contract, isReady, error } = useContract(address, abi, provider);
```

### Utilities

#### Validation

```typescript
import { isValidAddress, isValidUint32, isValidUint64 } from '@fhevm/sdk';

isValidAddress('0x...'); // true/false
isValidUint32(12345); // true/false
isValidUint64(123456789n); // true/false
```

#### Formatting

```typescript
import { formatEncryptedValue, formatAddress, formatEth } from '@fhevm/sdk';

formatEncryptedValue(value); // "0x1234...5678"
formatAddress(address); // "0x1234...5678"
formatEth(wei, 4); // "1.2345"
```

#### Error Handling

```typescript
import { parseEncryptionError, parseContractError } from '@fhevm/sdk';

try {
  await encrypt(value);
} catch (error) {
  const parsed = parseEncryptionError(error);
  console.error(parsed.message);
}
```

## 🔧 Configuration

### Supported Networks

- `sepolia` - Ethereum Sepolia testnet
- `localhost` - Local development network

### Client Configuration

```typescript
interface FhevmClientConfig {
  network: string;           // Network name
  contractAddress: string;   // Contract address
  provider?: Provider;       // Optional custom provider
  chainId?: number;          // Optional chain ID
}
```

## 📖 Examples

### Complete Workflow

```typescript
import { createFhevmClient, encryptUint32, userDecrypt } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Initialize
const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});

// Encrypt and submit
const encrypted = await encryptUint32(client, 12345);
const tx = await contract.registerWork(
  encrypted.handles[0],
  encrypted.inputProof,
  "My Work",
  "Category"
);
await tx.wait();

// Later: decrypt result
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const result = await userDecrypt(
  client,
  encryptedResult,
  contractAddress,
  await signer.getAddress(),
  signer
);

console.log('Result:', result.toString());
```

### With Error Handling

```typescript
import { encryptUint32, parseEncryptionError } from '@fhevm/sdk';

try {
  const encrypted = await encryptUint32(client, value);
  // Use encrypted value
} catch (error) {
  const parsed = parseEncryptionError(error);

  if (parsed.code === 'VALUE_OUT_OF_RANGE') {
    alert('Value must be between 0 and 2^32-1');
  } else if (parsed.code === 'CLIENT_NOT_READY') {
    alert('Please wait for initialization');
  } else {
    alert(`Encryption failed: ${parsed.message}`);
  }
}
```

## 🏗️ TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  FhevmClient,
  FhevmClientConfig,
  EncryptedValue,
  EncryptionRequest
} from '@fhevm/sdk';
```

## 🤝 Contributing

Contributions welcome! Please check our [Contributing Guide](../../CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](../../LICENSE)

## 🔗 Links

- [Documentation](../../docs/)
- [Examples](../../examples/)
- [GitHub](https://github.com/GeoffreyBreitenberg/FHECopyright)

---

**Built with ❤️ for the FHEVM community**
