import type { FhevmClient, EncryptedValue, EncryptionRequest } from '../types';
import { EncryptionError } from '../types';
import { ensureClientReady } from './client';

/**
 * Encrypt a uint32 value
 *
 * @param client - FHEVM client
 * @param value - Value to encrypt (0 to 2^32-1)
 * @returns Promise<EncryptedValue>
 *
 * @example
 * ```typescript
 * const encrypted = await encryptUint32(client, 12345);
 * await contract.registerWork(
 *   encrypted.handles[0],
 *   encrypted.inputProof,
 *   "Work Title",
 *   "Category"
 * );
 * ```
 */
export async function encryptUint32(
  client: FhevmClient,
  value: number
): Promise<EncryptedValue> {
  try {
    ensureClientReady(client);

    if (value < 0 || value > 0xFFFFFFFF) {
      throw new EncryptionError('Value must be between 0 and 2^32-1');
    }

    const encrypted = await client.instance.encrypt32(value);

    return {
      handles: [encrypted.handle],
      inputProof: encrypted.inputProof,
      type: 'uint32'
    };
  } catch (error: any) {
    throw new EncryptionError(error.message || 'Failed to encrypt uint32');
  }
}

/**
 * Encrypt a uint64 value
 *
 * @param client - FHEVM client
 * @param value - Value to encrypt (0 to 2^64-1)
 * @returns Promise<EncryptedValue>
 *
 * @example
 * ```typescript
 * const encrypted = await encryptUint64(client, 123456789n);
 * await contract.registerAuthor(encrypted.handles[0]);
 * ```
 */
export async function encryptUint64(
  client: FhevmClient,
  value: number | bigint
): Promise<EncryptedValue> {
  try {
    ensureClientReady(client);

    const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);

    if (bigIntValue < 0n || bigIntValue > 0xFFFFFFFFFFFFFFFFn) {
      throw new EncryptionError('Value must be between 0 and 2^64-1');
    }

    const encrypted = await client.instance.encrypt64(bigIntValue);

    return {
      handles: [encrypted.handle],
      inputProof: encrypted.inputProof,
      type: 'uint64'
    };
  } catch (error: any) {
    throw new EncryptionError(error.message || 'Failed to encrypt uint64');
  }
}

/**
 * Encrypt multiple values in batch
 *
 * @param client - FHEVM client
 * @param values - Array of encryption requests
 * @returns Promise<EncryptedValue[]>
 *
 * @example
 * ```typescript
 * const encrypted = await batchEncrypt(client, [
 *   { type: 'uint32', value: 123 },
 *   { type: 'uint64', value: 456789n },
 *   { type: 'uint32', value: 999 }
 * ]);
 * ```
 */
export async function batchEncrypt(
  client: FhevmClient,
  values: EncryptionRequest[]
): Promise<EncryptedValue[]> {
  ensureClientReady(client);

  const results: EncryptedValue[] = [];

  for (const request of values) {
    if (request.type === 'uint32') {
      const encrypted = await encryptUint32(client, request.value as number);
      results.push(encrypted);
    } else if (request.type === 'uint64') {
      const encrypted = await encryptUint64(client, request.value);
      results.push(encrypted);
    }
  }

  return results;
}
