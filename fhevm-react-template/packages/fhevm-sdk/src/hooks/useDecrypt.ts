import { useState, useCallback } from 'react';
import type { Signer } from 'ethers';
import { userDecrypt } from '../core/decryption';
import type { FhevmClient } from '../types';

/**
 * React hook for decrypting values
 *
 * @param client - FHEVM client instance
 * @returns Object with decrypt function, loading state, and error
 *
 * @example
 * ```typescript
 * import { useDecrypt } from '@fhevm/sdk/hooks';
 *
 * function ViewResult() {
 *   const { client } = useFhevmClient(config);
 *   const { decrypt, isDecrypting } = useDecrypt(client);
 *   const [result, setResult] = useState<bigint | null>(null);
 *
 *   const handleDecrypt = async (encryptedValue: string) => {
 *     const decrypted = await decrypt(
 *       encryptedValue,
 *       contractAddress,
 *       userAddress,
 *       signer
 *     );
 *     setResult(decrypted);
 *   };
 *
 *   return (
 *     <div>
 *       {isDecrypting ? (
 *         'Decrypting...'
 *       ) : (
 *         result && <div>Result: {result.toString()}</div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDecrypt(client: FhevmClient | null) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (
      encryptedValue: string,
      contractAddress: string,
      userAddress: string,
      signer: Signer
    ): Promise<bigint | null> => {
      if (!client) {
        setError(new Error('Client not initialized'));
        return null;
      }

      try {
        setIsDecrypting(true);
        setError(null);

        const decrypted = await userDecrypt(
          client,
          encryptedValue,
          contractAddress,
          userAddress,
          signer
        );

        return decrypted;
      } catch (err: any) {
        setError(err);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client]
  );

  return {
    decrypt,
    isDecrypting,
    error
  };
}
