/**
 * FHE Key management utilities
 */

/**
 * Gets key information for a specific network
 */
export function getKeyInfo(network: string = 'sepolia') {
  return {
    network,
    keyManagement: 'Automatic',
    keyRotation: 'Handled by FHEVM protocol',
    note: 'Keys are fetched automatically when initializing the FHEVM client',
  };
}

/**
 * Checks if a network is supported
 */
export function isSupportedNetwork(network: string): boolean {
  const supportedNetworks = ['sepolia', 'mainnet', 'localhost'];
  return supportedNetworks.includes(network.toLowerCase());
}

/**
 * Gets the public key endpoint for a network
 */
export function getPublicKeyEndpoint(network: string): string | null {
  const endpoints: Record<string, string> = {
    sepolia: 'https://api.sepolia.fhevm.io/keys',
    mainnet: 'https://api.fhevm.io/keys',
    localhost: 'http://localhost:8545/keys',
  };

  return endpoints[network.toLowerCase()] || null;
}
