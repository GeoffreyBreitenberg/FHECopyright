'use client';

import { useState } from 'react';

export default function ExamplesPage() {
  const [activeTab, setActiveTab] = useState('basic');

  const examples = {
    basic: {
      title: 'Basic Encryption',
      description: 'Simple encryption of a uint32 value',
      code: `import { createFhevmClient, encryptUint32 } from '@fhevm/sdk';

// Initialize client
const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});

// Encrypt value
const encrypted = await encryptUint32(client, 12345);

console.log('Handle:', encrypted.handles[0]);
console.log('Proof:', encrypted.inputProof);`,
    },
    hooks: {
      title: 'React Hooks',
      description: 'Using FHEVM SDK with React hooks',
      code: `import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';

function MyComponent() {
  const { client, isReady } = useFhevmClient({
    network: 'sepolia',
    contractAddress: '0x...'
  });

  const { encrypt, isEncrypting } = useEncrypt(client);

  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value);
    console.log('Encrypted:', encrypted);
  };

  if (!isReady) return <div>Loading...</div>;

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={isEncrypting}
    >
      {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
    </button>
  );
}`,
    },
    contract: {
      title: 'Smart Contract Integration',
      description: 'Using encrypted values in contract calls',
      code: `import { createFhevmClient, encryptUint32 } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Setup
const client = await createFhevmClient({
  network: 'sepolia',
  contractAddress: '0x...'
});

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);

// Encrypt value
const encrypted = await encryptUint32(client, 12345);

// Send encrypted value to contract
const tx = await contract.submitEncryptedValue(
  encrypted.handles[0],
  encrypted.inputProof
);

await tx.wait();
console.log('Transaction confirmed!');`,
    },
    decryption: {
      title: 'User Decryption',
      description: 'Decrypting values with EIP-712 signature',
      code: `import { userDecrypt } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Get signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();

// Decrypt with EIP-712 signature
const decrypted = await userDecrypt(
  client,
  encryptedValue,      // From contract
  contractAddress,
  userAddress,
  signer
);

console.log('Decrypted value:', decrypted);`,
    },
    batch: {
      title: 'Batch Operations',
      description: 'Encrypting multiple values efficiently',
      code: `import { batchEncrypt } from '@fhevm/sdk';

// Batch encrypt multiple values
const batch = await batchEncrypt(client, [
  { type: 'uint32', value: 123 },
  { type: 'uint32', value: 456 },
  { type: 'uint64', value: 789n }
]);

// Use in contract
const tx = await contract.submitBatch(
  batch.map(e => e.handles[0]),
  batch.map(e => e.inputProof)
);

await tx.wait();`,
    },
    error: {
      title: 'Error Handling',
      description: 'Proper error handling with FHEVM SDK',
      code: `import { encryptUint32, parseEncryptionError } from '@fhevm/sdk';

try {
  const encrypted = await encryptUint32(client, value);
  // Use encrypted value
} catch (error) {
  const parsed = parseEncryptionError(error);

  switch (parsed.code) {
    case 'VALUE_OUT_OF_RANGE':
      console.error('Value must be between 0 and 2^32-1');
      break;
    case 'CLIENT_NOT_READY':
      console.error('Please wait for client initialization');
      break;
    default:
      console.error('Error:', parsed.message);
  }
}`,
    },
  };

  const currentExample = examples[activeTab as keyof typeof examples];

  return (
    <div className="container">
      <h1 className="section-title">Code Examples</h1>

      <div className="card">
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {Object.keys(examples).map((key) => (
            <button
              key={key}
              className={activeTab === key ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setActiveTab(key)}
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              {examples[key as keyof typeof examples].title}
            </button>
          ))}
        </div>

        <h2 className="card-title">{currentExample.title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {currentExample.description}
        </p>

        <div className="code-block">
          <pre><code>{currentExample.code}</code></pre>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Usage Guidelines</h2>
        <div className="card-content">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Best Practices</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li>Always check if the client is ready before encryption</li>
            <li>Handle errors gracefully with try-catch blocks</li>
            <li>Use TypeScript for type safety</li>
            <li>Validate input values before encryption</li>
            <li>Store encrypted handles and proofs together</li>
            <li>Use batch operations for multiple values</li>
          </ul>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Common Patterns</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li><strong>Client Initialization:</strong> Use useFhevmClient hook in React</li>
            <li><strong>Encryption:</strong> Use useEncrypt hook with loading states</li>
            <li><strong>Contract Calls:</strong> Pass both handle and inputProof</li>
            <li><strong>Decryption:</strong> Require user signature for authorization</li>
            <li><strong>Error Handling:</strong> Parse errors for user-friendly messages</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Resources</h2>
        <div className="card-content">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li><a href="https://docs.zama.ai/fhevm" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>FHEVM Documentation</a></li>
            <li><a href="https://github.com/GeoffreyBreitenberg/fhevm-react-template" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>SDK Repository</a></li>
            <li><a href="https://fhe-copyright.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>Live Demo Application</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
