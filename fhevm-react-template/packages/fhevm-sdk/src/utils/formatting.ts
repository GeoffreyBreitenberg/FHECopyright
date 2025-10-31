/**
 * Formatting utilities
 */

/**
 * Format encrypted value for display
 *
 * @param value - Encrypted value handle
 * @returns Formatted string (e.g., "0x1234...5678")
 *
 * @example
 * ```typescript
 * import { formatEncryptedValue } from '@fhevm/sdk/utils';
 *
 * const formatted = formatEncryptedValue(encryptedValue);
 * console.log(formatted); // "0x1234...5678"
 * ```
 */
export function formatEncryptedValue(value: string): string {
  if (!value || value.length < 10) return value;

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

/**
 * Format Ethereum address for display
 *
 * @param address - Ethereum address
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format wei to ETH
 *
 * @param wei - Wei amount
 * @param decimals - Number of decimals (default: 4)
 * @returns Formatted ETH string
 */
export function formatEth(wei: bigint | string, decimals: number = 4): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(weiValue) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Format timestamp to readable date
 *
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleDateString();
}
