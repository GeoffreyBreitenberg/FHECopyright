'use client';

import { useState, useCallback } from 'react';

export type ComputationOperation =
  | 'add' | 'sub' | 'mul' | 'div'
  | 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte'
  | 'min' | 'max';

export interface ComputationInfo {
  operation: ComputationOperation;
  description: string;
  category: 'arithmetic' | 'comparison' | 'utility';
}

export interface UseComputationResult {
  fetchOperationInfo: (operation: ComputationOperation) => Promise<ComputationInfo | null>;
  isLoading: boolean;
  error: Error | null;
  operationInfo: ComputationInfo | null;
}

/**
 * Hook for getting information about FHE computation operations
 */
export function useComputation(): UseComputationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [operationInfo, setOperationInfo] = useState<ComputationInfo | null>(null);

  const fetchOperationInfo = useCallback(async (operation: ComputationOperation) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fhe/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch operation information');
      }

      const data = await response.json();
      const info: ComputationInfo = {
        operation,
        description: data.description,
        category: getCategoryForOperation(operation),
      };

      setOperationInfo(info);
      return info;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch operation info');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchOperationInfo,
    isLoading,
    error,
    operationInfo,
  };
}

function getCategoryForOperation(operation: ComputationOperation): 'arithmetic' | 'comparison' | 'utility' {
  const arithmetic: ComputationOperation[] = ['add', 'sub', 'mul', 'div'];
  const comparison: ComputationOperation[] = ['eq', 'ne', 'lt', 'lte', 'gt', 'gte'];
  const utility: ComputationOperation[] = ['min', 'max'];

  if (arithmetic.includes(operation)) return 'arithmetic';
  if (comparison.includes(operation)) return 'comparison';
  if (utility.includes(operation)) return 'utility';

  return 'arithmetic';
}
