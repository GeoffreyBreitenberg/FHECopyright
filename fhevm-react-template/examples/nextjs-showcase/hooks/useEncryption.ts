'use client';

import { useState, useCallback } from 'react';
import { encryptUint32, encryptUint64 } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';

export type EncryptionType = 'uint32' | 'uint64';

export interface UseEncryptionResult {
  encrypt: (value: number | bigint, type: EncryptionType) => Promise<any>;
  isEncrypting: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for encrypting values with FHE
 */
export function useEncryption(client: FhevmClient | null): UseEncryptionResult {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (value: number | bigint, type: EncryptionType) => {
      if (!client) {
        throw new Error('FHEVM client is not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        let result;
        if (type === 'uint32') {
          result = await encryptUint32(client, value as number);
        } else {
          result = await encryptUint64(client, value as bigint);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsEncrypting(false);
  }, []);

  return {
    encrypt,
    isEncrypting,
    error,
    reset,
  };
}
