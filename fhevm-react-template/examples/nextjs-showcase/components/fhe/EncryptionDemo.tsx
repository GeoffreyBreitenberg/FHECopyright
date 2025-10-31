'use client';

import React, { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/hooks';
import { useFHE } from './FHEProvider';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

export default function EncryptionDemo() {
  const { client, isReady } = useFHE();
  const { encrypt, isEncrypting, error } = useEncrypt(client);

  const [value, setValue] = useState('');
  const [type, setType] = useState<'uint32' | 'uint64'>('uint32');
  const [result, setResult] = useState<any>(null);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value) return;

    try {
      const numValue = type === 'uint32' ? parseInt(value, 10) : BigInt(value);
      const encrypted = await encrypt(numValue, type);
      setResult(encrypted);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  if (!isReady) {
    return (
      <Card title="Encryption Demo">
        <p>Initializing FHEVM client...</p>
      </Card>
    );
  }

  return (
    <Card title="Encryption Demo">
      <form onSubmit={handleEncrypt} style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as 'uint32' | 'uint64')}
          >
            <option value="uint32">uint32</option>
            <option value="uint64">uint64</option>
          </select>
        </div>

        <Input
          label="Value"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
          error={error?.message}
        />

        <Button type="submit" loading={isEncrypting} disabled={!value}>
          Encrypt
        </Button>
      </form>

      {result && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Result</h3>
          <div className="code-block">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </Card>
  );
}
