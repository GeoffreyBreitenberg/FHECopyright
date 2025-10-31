import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient, encryptUint32, encryptUint64 } from '@fhevm/sdk';

/**
 * POST /api/fhe
 * General FHE operations endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, value, type, network, contractAddress } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation type is required' },
        { status: 400 }
      );
    }

    // Initialize FHEVM client
    const client = await createFhevmClient({
      network: network || 'sepolia',
      contractAddress: contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    });

    let result;

    switch (operation) {
      case 'encrypt':
        if (value === undefined || value === null) {
          return NextResponse.json(
            { error: 'Value is required for encryption' },
            { status: 400 }
          );
        }

        if (type === 'uint32') {
          result = await encryptUint32(client, parseInt(value, 10));
        } else if (type === 'uint64') {
          result = await encryptUint64(client, BigInt(value));
        } else {
          return NextResponse.json(
            { error: 'Invalid encryption type. Use uint32 or uint64' },
            { status: 400 }
          );
        }
        break;

      case 'info':
        result = {
          network: network || 'sepolia',
          ready: true,
          contractAddress: contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('FHE API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fhe
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'FHE API is running',
    version: '1.0.0',
  });
}
