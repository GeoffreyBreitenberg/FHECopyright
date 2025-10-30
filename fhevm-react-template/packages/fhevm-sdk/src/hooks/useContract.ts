import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import type { Provider, Signer } from 'ethers';

/**
 * React hook for managing contract instances
 *
 * @param address - Contract address
 * @param abi - Contract ABI
 * @param provider - Ethers provider or signer
 * @returns Object with contract instance, loading state, and error
 *
 * @example
 * ```typescript
 * import { useContract } from '@fhevm/sdk/hooks';
 * import AnonymousCopyrightABI from './abi.json';
 *
 * function ContractInteraction() {
 *   const { contract, isReady } = useContract(
 *     '0x...',
 *     AnonymousCopyrightABI,
 *     provider
 *   );
 *
 *   const registerWork = async (contentHash: number, title: string) => {
 *     if (!contract) return;
 *
 *     const encrypted = await encryptUint32(client, contentHash);
 *     const tx = await contract.registerWork(
 *       encrypted.handles[0],
 *       encrypted.inputProof,
 *       title,
 *       "Category"
 *     );
 *     await tx.wait();
 *   };
 *
 *   return <button onClick={() => registerWork(123, "Title")}>Register</button>;
 * }
 * ```
 */
export function useContract(
  address: string,
  abi: any[],
  provider: Provider | Signer
) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      if (!address || !abi || !provider) {
        setError(new Error('Missing required parameters'));
        return;
      }

      const contractInstance = new Contract(address, abi, provider);
      setContract(contractInstance);
      setIsReady(true);
      setError(null);
    } catch (err: any) {
      setError(err);
      setIsReady(false);
    }
  }, [address, abi, provider]);

  return {
    contract,
    isReady,
    error
  };
}
