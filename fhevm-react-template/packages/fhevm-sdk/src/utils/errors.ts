/**
 * Error handling utilities
 */

import {
  EncryptionError,
  DecryptionError,
  NetworkError,
  ContractError
} from '../types';

/**
 * Error details
 */
export interface ParsedError {
  message: string;
  code: string;
  details?: any;
}

/**
 * Parse encryption-related errors
 *
 * @param error - Error object
 * @returns Parsed error with user-friendly message
 *
 * @example
 * ```typescript
 * import { parseEncryptionError } from '@fhevm/sdk/utils';
 *
 * try {
 *   await encrypt(value);
 * } catch (error) {
 *   const parsed = parseEncryptionError(error);
 *   console.error(parsed.message);
 * }
 * ```
 */
export function parseEncryptionError(error: any): ParsedError {
  if (error instanceof EncryptionError) {
    return {
      message: error.message,
      code: 'ENCRYPTION_ERROR',
      details: error
    };
  }

  if (error.code === 'VALUE_OUT_OF_RANGE') {
    return {
      message: 'Value is out of valid range',
      code: 'VALUE_OUT_OF_RANGE'
    };
  }

  if (error.code === 'CLIENT_NOT_READY') {
    return {
      message: 'FHEVM client is not initialized',
      code: 'CLIENT_NOT_READY'
    };
  }

  return {
    message: error.message || 'Encryption failed',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Parse decryption errors
 *
 * @param error - Error object
 * @returns Parsed error
 */
export function parseDecryptionError(error: any): ParsedError {
  if (error instanceof DecryptionError) {
    return {
      message: error.message,
      code: 'DECRYPTION_ERROR',
      details: error
    };
  }

  if (error.code === 'UNAUTHORIZED') {
    return {
      message: 'User is not authorized to decrypt this value',
      code: 'UNAUTHORIZED'
    };
  }

  return {
    message: error.message || 'Decryption failed',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Parse contract errors
 *
 * @param error - Error object
 * @returns Parsed error
 */
export function parseContractError(error: any): ParsedError {
  if (error instanceof ContractError) {
    return {
      message: error.message,
      code: 'CONTRACT_ERROR',
      details: error
    };
  }

  // Parse common contract errors
  if (error.reason) {
    return {
      message: error.reason,
      code: 'CONTRACT_REVERT',
      details: error
    };
  }

  if (error.code === 'INSUFFICIENT_FUNDS') {
    return {
      message: 'Insufficient funds for transaction',
      code: 'INSUFFICIENT_FUNDS'
    };
  }

  if (error.code === 'NONCE_EXPIRED') {
    return {
      message: 'Transaction nonce has expired',
      code: 'NONCE_EXPIRED'
    };
  }

  return {
    message: error.message || 'Contract interaction failed',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Check if error is user rejection
 *
 * @param error - Error object
 * @returns boolean
 */
export function isUserRejection(error: any): boolean {
  return (
    error.code === 4001 ||
    error.code === 'ACTION_REJECTED' ||
    error.message?.includes('User denied')
  );
}
