import { createFhevmClient, type FhevmClient, type FhevmConfig } from '@fhevm/sdk';

/**
 * Creates and initializes an FHEVM client
 */
export async function initializeFhevmClient(config: FhevmConfig): Promise<FhevmClient> {
  try {
    const client = await createFhevmClient(config);
    return client;
  } catch (error) {
    console.error('Failed to initialize FHEVM client:', error);
    throw new Error('Failed to initialize FHEVM client');
  }
}

/**
 * Gets the default FHEVM configuration
 */
export function getDefaultConfig(): FhevmConfig {
  return {
    network: (process.env.NEXT_PUBLIC_NETWORK as any) || 'sepolia',
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  };
}
