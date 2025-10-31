/**
 * Universal FHEVM SDK
 *
 * Framework-agnostic toolkit for building confidential dApps with Fully Homomorphic Encryption
 *
 * @packageDocumentation
 */

// Core functions
export {
  createFhevmClient,
  encryptUint32,
  encryptUint64,
  batchEncrypt,
  userDecrypt,
  batchDecrypt
} from './core';

// Types
export type {
  FhevmClient,
  FhevmClientConfig,
  EncryptedValue,
  EncryptionRequest,
  DecryptionRequest
} from './types';

// Errors
export {
  ClientNotInitializedError,
  EncryptionError,
  DecryptionError,
  NetworkError,
  ContractError
} from './types';

// Utilities
export {
  isValidAddress,
  isValidUint32,
  isValidUint64,
  isValidNetwork,
  formatEncryptedValue,
  formatAddress,
  formatEth,
  formatTimestamp,
  parseEncryptionError,
  parseDecryptionError,
  parseContractError,
  isUserRejection
} from './utils';
