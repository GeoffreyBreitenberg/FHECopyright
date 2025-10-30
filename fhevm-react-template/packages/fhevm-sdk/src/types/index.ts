import type { Provider, Signer } from 'ethers';

/**
 * FHEVM Client configuration
 */
export interface FhevmClientConfig {
  network: string;
  contractAddress: string;
  provider?: Provider;
  chainId?: number;
}

/**
 * FHEVM Client instance
 */
export interface FhevmClient {
  network: string;
  contractAddress: string;
  provider: Provider;
  chainId: number;
  isReady: boolean;
  instance?: any;
}

/**
 * Encrypted value with input proof
 */
export interface EncryptedValue {
  handles: string[];
  inputProof: string;
  type: 'uint32' | 'uint64';
}

/**
 * Encryption request for batch operations
 */
export interface EncryptionRequest {
  type: 'uint32' | 'uint64';
  value: number | bigint;
}

/**
 * Decryption request
 */
export interface DecryptionRequest {
  encryptedValue: string;
  contractAddress: string;
  userAddress: string;
  signer: Signer;
}

/**
 * Error types
 */
export class ClientNotInitializedError extends Error {
  constructor() {
    super('FHEVM client is not initialized');
    this.name = 'ClientNotInitializedError';
  }
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(`Encryption failed: ${message}`);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(`Decryption failed: ${message}`);
    this.name = 'DecryptionError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(`Network error: ${message}`);
    this.name = 'NetworkError';
  }
}

export class ContractError extends Error {
  constructor(message: string) {
    super(`Contract error: ${message}`);
    this.name = 'ContractError';
  }
}
