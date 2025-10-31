/**
 * Validation utilities
 */

/**
 * Validate Ethereum address
 *
 * @param address - Address to validate
 * @returns boolean
 *
 * @example
 * ```typescript
 * import { isValidAddress } from '@fhevm/sdk/utils';
 *
 * if (isValidAddress('0x...')) {
 *   // Use address
 * }
 * ```
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate uint32 value
 *
 * @param value - Value to validate
 * @returns boolean
 */
export function isValidUint32(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xFFFFFFFF;
}

/**
 * Validate uint64 value
 *
 * @param value - Value to validate
 * @returns boolean
 */
export function isValidUint64(value: number | bigint): boolean {
  const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);
  return bigIntValue >= 0n && bigIntValue <= 0xFFFFFFFFFFFFFFFFn;
}

/**
 * Validate network name
 *
 * @param network - Network name
 * @returns boolean
 */
export function isValidNetwork(network: string): boolean {
  const supportedNetworks = ['sepolia', 'localhost'];
  return supportedNetworks.includes(network);
}
