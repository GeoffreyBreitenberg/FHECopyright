import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/fhe/compute
 * Demonstrates homomorphic computation concepts
 *
 * Note: Actual computation happens on-chain in smart contracts
 * This endpoint provides information about available operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;

    const availableOperations = {
      add: 'Add two encrypted values',
      sub: 'Subtract encrypted values',
      mul: 'Multiply encrypted values',
      div: 'Divide encrypted values',
      eq: 'Check equality of encrypted values',
      ne: 'Check inequality of encrypted values',
      lt: 'Less than comparison',
      lte: 'Less than or equal comparison',
      gt: 'Greater than comparison',
      gte: 'Greater than or equal comparison',
      min: 'Minimum of encrypted values',
      max: 'Maximum of encrypted values',
    };

    if (!operation) {
      return NextResponse.json({
        success: true,
        availableOperations,
        message: 'These operations can be performed on encrypted data in smart contracts',
      });
    }

    if (!availableOperations[operation as keyof typeof availableOperations]) {
      return NextResponse.json(
        { error: `Unknown operation: ${operation}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      operation,
      description: availableOperations[operation as keyof typeof availableOperations],
      message: 'This operation should be performed in your smart contract using FHEVM library',
    });
  } catch (error: any) {
    console.error('Compute API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fhe/compute
 * List available homomorphic operations
 */
export async function GET() {
  const operations = {
    arithmetic: ['add', 'sub', 'mul', 'div'],
    comparison: ['eq', 'ne', 'lt', 'lte', 'gt', 'gte'],
    utility: ['min', 'max'],
  };

  return NextResponse.json({
    success: true,
    operations,
    message: 'Available homomorphic operations for smart contracts',
  });
}
