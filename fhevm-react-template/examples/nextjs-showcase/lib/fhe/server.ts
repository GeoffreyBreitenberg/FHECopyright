/**
 * Server-side FHE operations
 * These operations can be performed on the server without exposing sensitive data
 */

import { createFhevmClient, encryptUint32, encryptUint64 } from '@fhevm/sdk';
import type { FhevmConfig } from '@fhevm/sdk';

/**
 * Server-side encryption helper
 */
export async function serverEncrypt(
  value: number | bigint,
  type: 'uint32' | 'uint64',
  config: FhevmConfig
) {
  const client = await createFhevmClient(config);

  if (type === 'uint32') {
    return await encryptUint32(client, value as number);
  } else {
    return await encryptUint64(client, value as bigint);
  }
}

/**
 * Validates encryption parameters
 */
export function validateEncryptionParams(
  value: any,
  type: 'uint32' | 'uint64'
): { valid: boolean; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, error: 'Value is required' };
  }

  if (type === 'uint32') {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 4294967295) {
      return { valid: false, error: 'Value must be a valid uint32 (0 to 4,294,967,295)' };
    }
  } else if (type === 'uint64') {
    try {
      const bigIntValue = BigInt(value);
      if (bigIntValue < 0n) {
        return { valid: false, error: 'Value must be a positive number' };
      }
    } catch {
      return { valid: false, error: 'Invalid uint64 value' };
    }
  } else {
    return { valid: false, error: 'Type must be uint32 or uint64' };
  }

  return { valid: true };
}
