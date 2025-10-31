export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    gatewayUrl: 'https://gateway.zama.ai',
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: '',
    gatewayUrl: 'http://localhost:8545',
  },
};

export const DEFAULT_NETWORK = 'sepolia';

export const CONTRACT_ADDRESS = '0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a';

export const FHEVM_CONFIG = {
  network: DEFAULT_NETWORK,
  contractAddress: CONTRACT_ADDRESS,
};

export function getNetworkConfig(network: keyof typeof NETWORK_CONFIG) {
  return NETWORK_CONFIG[network] || NETWORK_CONFIG.sepolia;
}

export function getExplorerUrl(network: string, address: string, type: 'address' | 'tx' = 'address') {
  const config = getNetworkConfig(network as keyof typeof NETWORK_CONFIG);
  if (!config.explorerUrl) return '';
  return `${config.explorerUrl}/${type}/${address}`;
}
