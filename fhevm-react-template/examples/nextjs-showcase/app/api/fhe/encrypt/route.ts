import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient, encryptUint32, encryptUint64 } from '@fhevm/sdk';

/**
 * POST /api/fhe/encrypt
 * Encrypts a value using FHE
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, type = 'uint32', network = 'sepolia', contractAddress } = body;

    // Validation
    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    if (!['uint32', 'uint64'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be uint32 or uint64' },
        { status: 400 }
      );
    }

    // Initialize FHEVM client
    const client = await createFhevmClient({
      network,
      contractAddress: contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    });

    // Perform encryption
    let encrypted;
    if (type === 'uint32') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0 || numValue > 4294967295) {
        return NextResponse.json(
          { error: 'Value must be a valid uint32 (0 to 4,294,967,295)' },
          { status: 400 }
        );
      }
      encrypted = await encryptUint32(client, numValue);
    } else {
      try {
        const bigIntValue = BigInt(value);
        if (bigIntValue < 0n) {
          return NextResponse.json(
            { error: 'Value must be a positive number' },
            { status: 400 }
          );
        }
        encrypted = await encryptUint64(client, bigIntValue);
      } catch {
        return NextResponse.json(
          { error: 'Invalid uint64 value' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      encrypted: {
        handle: encrypted.handles[0],
        inputProof: encrypted.inputProof,
        type: encrypted.type,
      },
    });
  } catch (error: any) {
    console.error('Encryption error:', error);
    return NextResponse.json(
      { error: error.message || 'Encryption failed' },
      { status: 500 }
    );
  }
}
