'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createFhevmClient } from '@fhevm/sdk';
import type { FhevmClient, FhevmConfig } from '@fhevm/sdk';

interface FHEContextValue {
  client: FhevmClient | null;
  isReady: boolean;
  error: Error | null;
  config: FhevmConfig | null;
}

const FHEContext = createContext<FHEContextValue>({
  client: null,
  isReady: false,
  error: null,
  config: null,
});

export function useFHE() {
  const context = useContext(FHEContext);
  if (!context) {
    throw new Error('useFHE must be used within FHEProvider');
  }
  return context;
}

export interface FHEProviderProps {
  children: React.ReactNode;
  config: FhevmConfig;
}

export default function FHEProvider({ children, config }: FHEProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeClient() {
      try {
        setError(null);
        const fhevmClient = await createFhevmClient(config);

        if (mounted) {
          setClient(fhevmClient);
          setIsReady(true);
        }
      } catch (err) {
        console.error('Failed to initialize FHEVM client:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM client'));
          setIsReady(false);
        }
      }
    }

    initializeClient();

    return () => {
      mounted = false;
    };
  }, [config]);

  return (
    <FHEContext.Provider value={{ client, isReady, error, config }}>
      {children}
    </FHEContext.Provider>
  );
}
