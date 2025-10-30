/**
 * FHE Utility for Anonymous Copyright
 * Integrates with @fhevm/sdk for encryption operations
 */

import { createFhevmClient, encryptUint32, encryptUint64 } from '@fhevm/sdk';

let fhevmClient = null;

/**
 * Initialize FHEVM client
 */
export const initializeFHE = async (network, contractAddress) => {
  if (fhevmClient) {
    return fhevmClient;
  }

  try {
    console.log('Initializing FHEVM client...', { network, contractAddress });

    fhevmClient = await createFhevmClient({
      network: network || 'sepolia',
      contractAddress: contractAddress
    });

    console.log('FHEVM client initialized successfully');
    return fhevmClient;
  } catch (error) {
    console.error('Failed to initialize FHEVM client:', error);
    throw new Error('Failed to initialize FHE: ' + error.message);
  }
};

/**
 * Get the current FHEVM client
 */
export const getFHEClient = () => {
  if (!fhevmClient) {
    throw new Error('FHEVM client not initialized. Call initializeFHE first.');
  }
  return fhevmClient;
};

/**
 * Encrypt uint32 value (for content hashes)
 */
export const encryptContentHash = async (value) => {
  const client = getFHEClient();

  try {
    console.log('Encrypting content hash:', value);
    const encrypted = await encryptUint32(client, parseInt(value));
    console.log('Content hash encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('Failed to encrypt content hash:', error);
    throw new Error('Encryption failed: ' + error.message);
  }
};

/**
 * Encrypt uint64 value (for author IDs)
 */
export const encryptAuthorId = async (value) => {
  const client = getFHEClient();

  try {
    console.log('Encrypting author ID:', value);
    const encrypted = await encryptUint64(client, BigInt(value));
    console.log('Author ID encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('Failed to encrypt author ID:', error);
    throw new Error('Encryption failed: ' + error.message);
  }
};

/**
 * Check if FHEVM client is initialized
 */
export const isFHEInitialized = () => {
  return fhevmClient !== null;
};

/**
 * Reset FHEVM client (useful for network changes)
 */
export const resetFHE = () => {
  fhevmClient = null;
};
