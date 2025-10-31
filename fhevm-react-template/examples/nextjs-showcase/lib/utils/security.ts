/**
 * Security utilities for FHE operations
 */

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

/**
 * Validates Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates contract address
 */
export function validateContractAddress(address: string | undefined): boolean {
  if (!address) return false;
  return isValidAddress(address);
}

/**
 * Checks if a value is within safe integer range
 */
export function isSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value);
}

/**
 * Validates encryption type
 */
export function isValidEncryptionType(type: string): boolean {
  return ['uint32', 'uint64'].includes(type);
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.limit) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}
