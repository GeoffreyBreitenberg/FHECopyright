/**
 * Format an Ethereum address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format Wei to ETH
 */
export function formatEth(wei: bigint | string, decimals: number = 4): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | bigint): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate uint32 value
 */
export function isValidUint32(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xFFFFFFFF;
}

/**
 * Validate uint64 value
 */
export function isValidUint64(value: bigint | number): boolean {
  const val = typeof value === 'number' ? BigInt(value) : value;
  return val >= 0n && val <= 0xFFFFFFFFFFFFFFFFn;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Parse error message for user-friendly display
 */
export function parseError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.reason) return error.reason;
  return 'An unknown error occurred';
}

/**
 * Check if error is user rejection
 */
export function isUserRejection(error: any): boolean {
  const message = parseError(error).toLowerCase();
  return message.includes('user rejected') ||
         message.includes('user denied') ||
         message.includes('cancelled');
}
