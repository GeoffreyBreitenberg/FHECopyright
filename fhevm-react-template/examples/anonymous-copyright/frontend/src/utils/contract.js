import { ethers } from 'ethers';
import AnonymousCopyrightABI from '../contracts/AnonymousCopyright.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const NETWORK = import.meta.env.VITE_NETWORK || 'sepolia';

if (!CONTRACT_ADDRESS) {
  console.warn('VITE_CONTRACT_ADDRESS not set in environment variables');
}

export const getContract = (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    AnonymousCopyrightABI.abi,
    signerOrProvider
  );
};

export const getNetworkConfig = () => {
  const networks = {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia',
      rpcUrl: 'https://rpc.sepolia.org',
      explorer: 'https://sepolia.etherscan.io'
    },
    localhost: {
      chainId: 31337,
      name: 'Localhost',
      rpcUrl: 'http://127.0.0.1:8545',
      explorer: ''
    }
  };

  return networks[NETWORK] || networks.sepolia;
};

export const switchToNetwork = async () => {
  const config = getNetworkConfig();

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${config.chainId.toString(16)}` }]
    });
  } catch (error) {
    // Chain not added, try to add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${config.chainId.toString(16)}`,
            chainName: config.name,
            rpcUrls: [config.rpcUrl],
            blockExplorerUrls: config.explorer ? [config.explorer] : []
          }
        ]
      });
    } else {
      throw error;
    }
  }
};

export { CONTRACT_ADDRESS, NETWORK };
