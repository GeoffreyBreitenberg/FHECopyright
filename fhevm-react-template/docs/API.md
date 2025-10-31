# API Reference

Complete API documentation for the Universal FHEVM SDK.

---

## Table of Contents

1. [Core Functions](#core-functions)
2. [React Hooks](#react-hooks)
3. [Utilities](#utilities)
4. [Types](#types)
5. [Error Handling](#error-handling)

---

## Core Functions

### `createFhevmClient(config)`

Creates and initializes an FHEVM client instance.

**Parameters:**
- `config` (Object): Configuration object
  - `network` (string): Network name ('sepolia', 'mainnet', etc.)
  - `contractAddress` (string): Contract address to interact with
  - `provider` (Provider, optional): Custom ethers provider
  - `chainId` (number, optional): Network chain ID

**Returns:**
- `Promise<FhevmClient>`: Initialized FHEVM client

**Example:**
```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});
```

**Throws:**
- `Error`: If network is not supported
- `Error`: If contract address is invalid

---

### `encryptUint32(client, value)`

Encrypts a uint32 value using FHE.

**Parameters:**
- `client` (FhevmClient): Initialized FHEVM client
- `value` (number): Value to encrypt (0 to 2^32-1)

**Returns:**
- `Promise<EncryptedValue>`: Encrypted value with input proof
  - `handles` (string[]): Encrypted value handles
  - `inputProof` (string): ZK input proof for verification

**Example:**
```typescript
import { encryptUint32 } from '@fhevm/sdk';

const encrypted = await encryptUint32(client, 12345);

// Use in contract call
await contract.registerWork(
  encrypted.handles[0],
  encrypted.inputProof,
  "Work Title",
  "Category"
);
```

**Throws:**
- `Error`: If value is out of range
- `Error`: If client is not initialized

---

### `encryptUint64(client, value)`

Encrypts a uint64 value using FHE.

**Parameters:**
- `client` (FhevmClient): Initialized FHEVM client
- `value` (bigint | number): Value to encrypt (0 to 2^64-1)

**Returns:**
- `Promise<EncryptedValue>`: Encrypted value with input proof

**Example:**
```typescript
import { encryptUint64 } from '@fhevm/sdk';

const encrypted = await encryptUint64(client, 123456789n);

await contract.registerAuthor(encrypted.handles[0]);
```

---

### `userDecrypt(client, encryptedValue, contractAddress, userAddress, signer)`

Decrypts an encrypted value for a specific user using EIP-712 signature.

**Parameters:**
- `client` (FhevmClient): Initialized FHEVM client
- `encryptedValue` (string): Encrypted value handle from contract
- `contractAddress` (string): Contract address where value is stored
- `userAddress` (string): User's Ethereum address
- `signer` (Signer): Ethers signer for EIP-712 signature

**Returns:**
- `Promise<bigint>`: Decrypted value

**Example:**
```typescript
import { userDecrypt } from '@fhevm/sdk';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const decryptedValue = await userDecrypt(
  client,
  encryptedResult,
  '0xContractAddress...',
  await signer.getAddress(),
  signer
);

console.log('Decrypted value:', decryptedValue.toString());
```

**Throws:**
- `Error`: If user is not authorized to decrypt
- `Error`: If signature verification fails

---

### `batchEncrypt(client, values)`

Encrypts multiple values in a single operation.

**Parameters:**
- `client` (FhevmClient): Initialized FHEVM client
- `values` (EncryptionRequest[]): Array of values to encrypt
  - `type` ('uint32' | 'uint64'): Value type
  - `value` (number | bigint): Value to encrypt

**Returns:**
- `Promise<EncryptedValue[]>`: Array of encrypted values

**Example:**
```typescript
import { batchEncrypt } from '@fhevm/sdk';

const encrypted = await batchEncrypt(client, [
  { type: 'uint32', value: 123 },
  { type: 'uint64', value: 456789n },
  { type: 'uint32', value: 999 }
]);

// Use in batch operation
await contract.batchRegister(
  encrypted.map(e => e.handles[0]),
  encrypted[0].inputProof
);
```

---

## React Hooks

### `useFhevmClient(config)`

React hook for creating and managing FHEVM client.

**Parameters:**
- `config` (Object): Client configuration (same as `createFhevmClient`)

**Returns:**
- Object with:
  - `client` (FhevmClient | null): FHEVM client instance
  - `isReady` (boolean): Whether client is initialized
  - `error` (Error | null): Initialization error if any
  - `reload` (Function): Reinitialize client

**Example:**
```typescript
import { useFhevmClient } from '@fhevm/sdk/hooks';

function MyComponent() {
  const { client, isReady, error, reload } = useFhevmClient({
    network: 'sepolia',
    contractAddress: '0x...'
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isReady) {
    return <div>Initializing...</div>;
  }

  return <div>Client ready!</div>;
}
```

---

### `useEncrypt(client)`

React hook for encrypting values.

**Parameters:**
- `client` (FhevmClient | null): FHEVM client instance

**Returns:**
- Object with:
  - `encrypt` (Function): Async function to encrypt values
  - `isEncrypting` (boolean): Whether encryption is in progress
  - `error` (Error | null): Encryption error if any

**Example:**
```typescript
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';

function SubmitForm() {
  const { client, isReady } = useFhevmClient(config);
  const { encrypt, isEncrypting, error } = useEncrypt(client);

  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value);
    await contract.submit(encrypted.handles[0], encrypted.inputProof);
  };

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={!isReady || isEncrypting}
    >
      {isEncrypting ? 'Encrypting...' : 'Submit'}
    </button>
  );
}
```

---

### `useDecrypt(client)`

React hook for decrypting values.

**Parameters:**
- `client` (FhevmClient | null): FHEVM client instance

**Returns:**
- Object with:
  - `decrypt` (Function): Async function to decrypt values
  - `isDecrypting` (boolean): Whether decryption is in progress
  - `error` (Error | null): Decryption error if any

**Example:**
```typescript
import { useDecrypt } from '@fhevm/sdk/hooks';

function ViewResult() {
  const { client } = useFhevmClient(config);
  const { decrypt, isDecrypting } = useDecrypt(client);
  const [result, setResult] = useState<bigint | null>(null);

  const handleDecrypt = async (encryptedValue: string) => {
    const decrypted = await decrypt(
      encryptedValue,
      contractAddress,
      userAddress,
      signer
    );
    setResult(decrypted);
  };

  return (
    <div>
      {isDecrypting ? (
        'Decrypting...'
      ) : (
        result && <div>Result: {result.toString()}</div>
      )}
    </div>
  );
}
```

---

### `useContract(address, abi, provider)`

React hook for managing contract instances.

**Parameters:**
- `address` (string): Contract address
- `abi` (any[]): Contract ABI
- `provider` (Provider | Signer): Ethers provider or signer

**Returns:**
- Object with:
  - `contract` (Contract | null): Contract instance
  - `isReady` (boolean): Whether contract is initialized
  - `error` (Error | null): Initialization error

**Example:**
```typescript
import { useContract } from '@fhevm/sdk/hooks';
import AnonymousCopyrightABI from './abi.json';

function ContractInteraction() {
  const { contract, isReady } = useContract(
    '0x...',
    AnonymousCopyrightABI,
    provider
  );

  const registerWork = async (contentHash: number, title: string) => {
    if (!contract) return;

    const encrypted = await encryptUint32(client, contentHash);
    const tx = await contract.registerWork(
      encrypted.handles[0],
      encrypted.inputProof,
      title,
      "Category"
    );
    await tx.wait();
  };

  return <button onClick={() => registerWork(123, "Title")}>Register</button>;
}
```

---

## Utilities

### `isValidAddress(address)`

Validates an Ethereum address.

**Parameters:**
- `address` (string): Address to validate

**Returns:**
- `boolean`: True if valid address

**Example:**
```typescript
import { isValidAddress } from '@fhevm/sdk/utils';

if (isValidAddress('0x...')) {
  // Use address
}
```

---

### `formatEncryptedValue(value)`

Formats encrypted value for display.

**Parameters:**
- `value` (string): Encrypted value handle

**Returns:**
- `string`: Formatted value (e.g., "0x1234...5678")

**Example:**
```typescript
import { formatEncryptedValue } from '@fhevm/sdk/utils';

const formatted = formatEncryptedValue(encryptedValue);
console.log(formatted); // "0x1234...5678"
```

---

### `parseEncryptionError(error)`

Parses encryption-related errors.

**Parameters:**
- `error` (Error): Error object

**Returns:**
- Object with:
  - `message` (string): User-friendly error message
  - `code` (string): Error code
  - `details` (any): Additional error details

**Example:**
```typescript
import { parseEncryptionError } from '@fhevm/sdk/utils';

try {
  await encrypt(value);
} catch (error) {
  const parsed = parseEncryptionError(error);
  console.error(parsed.message);
}
```

---

## Types

### `FhevmClient`

```typescript
interface FhevmClient {
  network: string;
  contractAddress: string;
  provider: Provider;
  chainId: number;
  isReady: boolean;
}
```

---

### `EncryptedValue`

```typescript
interface EncryptedValue {
  handles: string[];
  inputProof: string;
  type: 'uint32' | 'uint64';
}
```

---

### `EncryptionRequest`

```typescript
interface EncryptionRequest {
  type: 'uint32' | 'uint64';
  value: number | bigint;
}
```

---

### `ClientConfig`

```typescript
interface ClientConfig {
  network: string;
  contractAddress: string;
  provider?: Provider;
  chainId?: number;
}
```

---

### `DecryptionRequest`

```typescript
interface DecryptionRequest {
  encryptedValue: string;
  contractAddress: string;
  userAddress: string;
  signer: Signer;
}
```

---

## Error Handling

### Error Types

**`ClientNotInitializedError`**
- Thrown when trying to use client before initialization
- Solution: Wait for `isReady` to be true

**`EncryptionError`**
- Thrown when encryption fails
- Possible causes: Invalid value, client not ready

**`DecryptionError`**
- Thrown when decryption fails
- Possible causes: Unauthorized user, invalid signature

**`NetworkError`**
- Thrown when network operations fail
- Possible causes: RPC issues, network mismatch

**`ContractError`**
- Thrown when contract interactions fail
- Possible causes: Invalid ABI, contract not deployed

---

### Error Handling Patterns

**Try-Catch**:
```typescript
try {
  const encrypted = await encryptUint32(client, value);
  await contract.submit(encrypted.handles[0], encrypted.inputProof);
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('Encryption failed:', error.message);
  } else if (error instanceof ContractError) {
    console.error('Contract call failed:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

**Hook Error State**:
```typescript
const { encrypt, error } = useEncrypt(client);

if (error) {
  return <div>Error: {error.message}</div>;
}
```

**Error Boundaries**:
```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={logError}
>
  <MyComponent />
</ErrorBoundary>
```

---

## Advanced Usage

### Custom Provider

```typescript
import { ethers } from 'ethers';
import { createFhevmClient } from '@fhevm/sdk';

const provider = new ethers.JsonRpcProvider('https://custom-rpc.com');

const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...',
  provider: provider
});
```

### Batch Operations

```typescript
// Encrypt multiple values
const values = [123, 456, 789];
const encrypted = await Promise.all(
  values.map(v => encryptUint32(client, v))
);

// Submit in batch
await contract.batchSubmit(
  encrypted.map(e => e.handles[0]),
  encrypted[0].inputProof
);
```

### Event Listening

```typescript
// Listen for encrypted events
contract.on("WorkRegistered", async (workId, registrant, title) => {
  console.log(`Work ${workId} registered by ${registrant}`);

  // Decrypt if authorized
  try {
    const decrypted = await userDecrypt(
      client,
      await contract.getEncryptedContentHash(workId),
      contractAddress,
      userAddress,
      signer
    );
    console.log('Content hash:', decrypted.toString());
  } catch (error) {
    console.log('Not authorized to decrypt');
  }
});
```

---

## Migration Guide

### From v0.x to v1.x

**Breaking Changes**:
1. `createClient` renamed to `createFhevmClient`
2. `encrypt` split into `encryptUint32` and `encryptUint64`
3. Hook return values now include error state

**Migration Steps**:

```typescript
// v0.x
const client = await createClient(config);
const encrypted = await encrypt(client, value);

// v1.x
const client = await createFhevmClient(config);
const encrypted = await encryptUint32(client, value);
```

---

## Support

### Getting Help

- Check [Quick Start Guide](./QUICKSTART.md) for common tasks
- Review [Examples](./EXAMPLES.md) for usage patterns
- Search [GitHub Issues](https://github.com/your-repo/issues)
- Create new issue if problem persists

### Reporting Bugs

Include:
- SDK version
- Code snippet demonstrating issue
- Expected vs actual behavior
- Error messages
- Environment details

---

**API documentation updated: January 2025**
