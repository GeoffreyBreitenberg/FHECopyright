import { createInstance } from 'fhevmjs';
import type { Provider } from 'ethers';
import type { FhevmClient, FhevmClientConfig } from '../types';
import { ClientNotInitializedError, NetworkError } from '../types';

/**
 * Network configurations
 */
const NETWORK_CONFIGS = {
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org'
  },
  localhost: {
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545'
  }
};

/**
 * Create and initialize FHEVM client
 *
 * @param config - Client configuration
 * @returns Promise<FhevmClient>
 *
 * @example
 * ```typescript
 * const client = await createFhevmClient({
 *   network: 'sepolia',
 *   contractAddress: '0x...'
 * });
 * ```
 */
export async function createFhevmClient(
  config: FhevmClientConfig
): Promise<FhevmClient> {
  try {
    const networkConfig = NETWORK_CONFIGS[config.network as keyof typeof NETWORK_CONFIGS];

    if (!networkConfig) {
      throw new NetworkError(`Unsupported network: ${config.network}`);
    }

    const chainId = config.chainId || networkConfig.chainId;

    // Create fhevmjs instance
    const instance = await createInstance({
      chainId,
      networkUrl: networkConfig.rpcUrl,
      gatewayUrl: 'https://gateway.zama.ai'
    });

    const client: FhevmClient = {
      network: config.network,
      contractAddress: config.contractAddress,
      provider: config.provider as Provider,
      chainId,
      isReady: true,
      instance
    };

    return client;
  } catch (error: any) {
    throw new NetworkError(error.message || 'Failed to create FHEVM client');
  }
}

/**
 * Check if client is ready
 *
 * @param client - FHEVM client
 * @throws {ClientNotInitializedError} If client is not ready
 */
export function ensureClientReady(client: FhevmClient | null): asserts client is FhevmClient {
  if (!client || !client.isReady) {
    throw new ClientNotInitializedError();
  }
}
