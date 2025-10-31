'use client';

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function ComputationDemo() {
  const [selectedOp, setSelectedOp] = useState('add');
  const [description, setDescription] = useState('');

  const operations = [
    { value: 'add', label: 'Addition', desc: 'Add two encrypted values' },
    { value: 'sub', label: 'Subtraction', desc: 'Subtract encrypted values' },
    { value: 'mul', label: 'Multiplication', desc: 'Multiply encrypted values' },
    { value: 'eq', label: 'Equality', desc: 'Check if encrypted values are equal' },
    { value: 'lt', label: 'Less Than', desc: 'Compare encrypted values' },
    { value: 'gt', label: 'Greater Than', desc: 'Compare encrypted values' },
  ];

  const handleFetchInfo = async () => {
    try {
      const response = await fetch('/api/fhe/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: selectedOp }),
      });
      const data = await response.json();
      setDescription(data.description || '');
    } catch (err) {
      console.error('Failed to fetch operation info:', err);
    }
  };

  return (
    <Card title="Homomorphic Computation">
      <p style={{ marginBottom: '1.5rem' }}>
        These operations can be performed directly on encrypted data in smart contracts:
      </p>

      <div className="form-group">
        <label className="form-label">Select Operation</label>
        <select
          className="form-select"
          value={selectedOp}
          onChange={(e) => {
            setSelectedOp(e.target.value);
            setDescription('');
          }}
        >
          {operations.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={handleFetchInfo}>Get Operation Info</Button>

      {description && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="status-success">
            <strong>Description:</strong> {description}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            This operation is performed in your smart contract using the FHEVM library.
          </p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Example Usage in Solidity</h3>
        <div className="code-block">
          <pre>{`// In your smart contract
euint32 encrypted1 = TFHE.asEuint32(input1);
euint32 encrypted2 = TFHE.asEuint32(input2);

// Perform computation on encrypted data
euint32 result = TFHE.${selectedOp}(encrypted1, encrypted2);`}</pre>
        </div>
      </div>
    </Card>
  );
}
