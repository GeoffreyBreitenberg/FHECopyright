import type { Signer } from 'ethers';
import type { FhevmClient } from '../types';
import { DecryptionError } from '../types';
import { ensureClientReady } from './client';

/**
 * Decrypt an encrypted value for a specific user using EIP-712 signature
 *
 * @param client - FHEVM client
 * @param encryptedValue - Encrypted value handle from contract
 * @param contractAddress - Contract address where value is stored
 * @param userAddress - User's Ethereum address
 * @param signer - Ethers signer for EIP-712 signature
 * @returns Promise<bigint>
 *
 * @example
 * ```typescript
 * import { userDecrypt } from '@fhevm/sdk';
 * import { ethers } from 'ethers';
 *
 * const provider = new ethers.BrowserProvider(window.ethereum);
 * const signer = await provider.getSigner();
 *
 * const decryptedValue = await userDecrypt(
 *   client,
 *   encryptedResult,
 *   '0xContractAddress...',
 *   await signer.getAddress(),
 *   signer
 * );
 *
 * console.log('Decrypted value:', decryptedValue.toString());
 * ```
 */
export async function userDecrypt(
  client: FhevmClient,
  encryptedValue: string,
  contractAddress: string,
  userAddress: string,
  signer: Signer
): Promise<bigint> {
  try {
    ensureClientReady(client);

    if (!encryptedValue || !contractAddress || !userAddress) {
      throw new DecryptionError('Missing required parameters');
    }

    // Generate EIP-712 signature for decryption permission
    const signature = await client.instance.generateToken({
      verifyingContract: contractAddress,
      signer
    });

    // Request decryption from gateway
    const decrypted = await client.instance.decrypt(
      encryptedValue,
      signature
    );

    return BigInt(decrypted);
  } catch (error: any) {
    throw new DecryptionError(error.message || 'Failed to decrypt value');
  }
}

/**
 * Batch decrypt multiple encrypted values
 *
 * @param client - FHEVM client
 * @param encryptedValues - Array of encrypted value handles
 * @param contractAddress - Contract address
 * @param userAddress - User's address
 * @param signer - Ethers signer
 * @returns Promise<bigint[]>
 */
export async function batchDecrypt(
  client: FhevmClient,
  encryptedValues: string[],
  contractAddress: string,
  userAddress: string,
  signer: Signer
): Promise<bigint[]> {
  ensureClientReady(client);

  const results: bigint[] = [];

  for (const value of encryptedValues) {
    const decrypted = await userDecrypt(
      client,
      value,
      contractAddress,
      userAddress,
      signer
    );
    results.push(decrypted);
  }

  return results;
}
