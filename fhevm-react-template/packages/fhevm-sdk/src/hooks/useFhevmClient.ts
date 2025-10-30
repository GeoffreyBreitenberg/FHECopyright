import { useState, useEffect } from 'react';
import { createFhevmClient } from '../core/client';
import type { FhevmClient, FhevmClientConfig } from '../types';

/**
 * React hook for creating and managing FHEVM client
 *
 * @param config - Client configuration
 * @returns Object with client, loading state, error, and reload function
 *
 * @example
 * ```typescript
 * import { useFhevmClient } from '@fhevm/sdk/hooks';
 *
 * function MyComponent() {
 *   const { client, isReady, error, reload } = useFhevmClient({
 *     network: 'sepolia',
 *     contractAddress: '0x...'
 *   });
 *
 *   if (error) {
 *     return <div>Error: {error.message}</div>;
 *   }
 *
 *   if (!isReady) {
 *     return <div>Initializing...</div>;
 *   }
 *
 *   return <div>Client ready!</div>;
 * }
 * ```
 */
export function useFhevmClient(config: FhevmClientConfig) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializeClient = async () => {
    try {
      setIsReady(false);
      setError(null);

      const fhevmClient = await createFhevmClient(config);
      setClient(fhevmClient);
      setIsReady(true);
    } catch (err: any) {
      setError(err);
      setIsReady(false);
    }
  };

  useEffect(() => {
    initializeClient();
  }, [config.network, config.contractAddress]);

  const reload = () => {
    initializeClient();
  };

  return {
    client,
    isReady,
    error,
    reload
  };
}
