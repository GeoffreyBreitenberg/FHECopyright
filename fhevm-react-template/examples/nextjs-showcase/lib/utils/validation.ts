/**
 * Validation utilities
 */

/**
 * Validates a uint32 value
 */
export function validateUint32(value: any): { valid: boolean; error?: string } {
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: 'Value must be a number' };
  }

  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Value must be an integer' };
  }

  if (num < 0) {
    return { valid: false, error: 'Value must be non-negative' };
  }

  if (num > 4294967295) {
    return { valid: false, error: 'Value exceeds uint32 maximum (4,294,967,295)' };
  }

  return { valid: true };
}

/**
 * Validates a uint64 value
 */
export function validateUint64(value: any): { valid: boolean; error?: string } {
  try {
    const bigIntValue = BigInt(value);

    if (bigIntValue < 0n) {
      return { valid: false, error: 'Value must be non-negative' };
    }

    const maxUint64 = BigInt('18446744073709551615');
    if (bigIntValue > maxUint64) {
      return { valid: false, error: 'Value exceeds uint64 maximum' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid uint64 value' };
  }
}

/**
 * Validates network name
 */
export function validateNetwork(network: string): { valid: boolean; error?: string } {
  const validNetworks = ['sepolia', 'mainnet', 'localhost'];

  if (!validNetworks.includes(network.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid network. Supported networks: ${validNetworks.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validates encryption type
 */
export function validateEncryptionType(type: string): { valid: boolean; error?: string } {
  if (!['uint32', 'uint64'].includes(type)) {
    return { valid: false, error: 'Type must be uint32 or uint64' };
  }

  return { valid: true };
}

/**
 * Validates that a value matches the specified encryption type
 */
export function validateValueForType(
  value: any,
  type: 'uint32' | 'uint64'
): { valid: boolean; error?: string } {
  if (type === 'uint32') {
    return validateUint32(value);
  } else {
    return validateUint64(value);
  }
}
