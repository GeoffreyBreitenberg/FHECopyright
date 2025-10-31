/**
 * API-related type definitions
 */

export interface APIResponse<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  message?: string;
}

export interface EncryptionAPIRequest {
  value: number | bigint | string;
  type: 'uint32' | 'uint64';
  network?: string;
  contractAddress?: string;
}

export interface EncryptionAPIResponse extends APIResponse {
  encrypted?: {
    handle: string;
    inputProof: string;
    type: string;
  };
}

export interface DecryptionAPIRequest {
  encryptedValue: string;
  signature: string;
  userAddress: string;
  contractAddress: string;
}

export interface DecryptionAPIResponse extends APIResponse {
  decryptedValue?: number | bigint;
}

export interface ComputationAPIRequest {
  operation?: string;
}

export interface ComputationAPIResponse extends APIResponse {
  operation?: string;
  description?: string;
  availableOperations?: Record<string, string>;
  operations?: {
    arithmetic: string[];
    comparison: string[];
    utility: string[];
  };
}

export interface KeysAPIResponse extends APIResponse {
  network?: string;
  keyManagement?: string;
  keyRotation?: string;
  info?: {
    keyManagement: string;
    keyRotation: string;
    note: string;
  };
}
