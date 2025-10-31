/**
 * FHE-related type definitions
 */

export type EncryptionType = 'uint32' | 'uint64';

export interface EncryptedValue {
  handle: string;
  inputProof: string;
  type: EncryptionType;
}

export interface EncryptionRequest {
  value: number | bigint;
  type: EncryptionType;
  network?: string;
  contractAddress?: string;
}

export interface EncryptionResponse {
  success: boolean;
  encrypted?: EncryptedValue;
  error?: string;
}

export interface DecryptionRequest {
  encryptedValue: string;
  signature: string;
  userAddress: string;
  contractAddress: string;
}

export interface DecryptionResponse {
  success: boolean;
  decryptedValue?: number | bigint;
  error?: string;
}

export interface ComputationOperation {
  type: 'add' | 'sub' | 'mul' | 'div' | 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'min' | 'max';
  description: string;
}
