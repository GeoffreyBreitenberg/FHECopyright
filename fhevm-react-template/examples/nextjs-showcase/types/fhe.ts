/**
 * FHE-related type definitions for the Next.js showcase
 */

export type EncryptionType = 'uint32' | 'uint64';
export type Network = 'sepolia' | 'mainnet' | 'localhost';

export interface FHEConfig {
  network: Network;
  contractAddress?: string;
}

export interface EncryptedValue {
  handle: string;
  inputProof: string;
  type: EncryptionType;
}

export interface EncryptionResult {
  handles: string[];
  inputProof: string;
  type: EncryptionType;
}

export interface FHEClientState {
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
}

export interface EncryptionOperation {
  value: number | bigint;
  type: EncryptionType;
  timestamp: number;
  result?: EncryptedValue;
  error?: string;
}

export interface DecryptionOperation {
  encryptedValue: string;
  userAddress: string;
  contractAddress: string;
  signature: string;
  timestamp: number;
  result?: number | bigint;
  error?: string;
}
