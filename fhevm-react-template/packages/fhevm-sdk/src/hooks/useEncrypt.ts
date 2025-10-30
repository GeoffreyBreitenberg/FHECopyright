import { useState, useCallback } from 'react';
import { encryptUint32, encryptUint64 } from '../core/encryption';
import type { FhevmClient, EncryptedValue } from '../types';

/**
 * React hook for encrypting values
 *
 * @param client - FHEVM client instance
 * @returns Object with encrypt function, loading state, and error
 *
 * @example
 * ```typescript
 * import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';
 *
 * function SubmitForm() {
 *   const { client, isReady } = useFhevmClient(config);
 *   const { encrypt, isEncrypting, error } = useEncrypt(client);
 *
 *   const handleSubmit = async (value: number) => {
 *     const encrypted = await encrypt(value);
 *     await contract.submit(encrypted.handles[0], encrypted.inputProof);
 *   };
 *
 *   return (
 *     <button
 *       onClick={() => handleSubmit(42)}
 *       disabled={!isReady || isEncrypting}
 *     >
 *       {isEncrypting ? 'Encrypting...' : 'Submit'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useEncrypt(client: FhevmClient | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (value: number | bigint, type: 'uint32' | 'uint64' = 'uint32'): Promise<EncryptedValue | null> => {
      if (!client) {
        setError(new Error('Client not initialized'));
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);

        let encrypted: EncryptedValue;

        if (type === 'uint32') {
          encrypted = await encryptUint32(client, value as number);
        } else {
          encrypted = await encryptUint64(client, value);
        }

        return encrypted;
      } catch (err: any) {
        setError(err);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  return {
    encrypt,
    isEncrypting,
    error
  };
}
