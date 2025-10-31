'use client';

import React, { useState } from 'react';
import { useFHE } from './FHEProvider';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function KeyManager() {
  const { config, isReady } = useFHE();
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchKeyInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/keys?network=${config?.network || 'sepolia'}`);
      const data = await response.json();
      setKeyInfo(data);
    } catch (err) {
      console.error('Failed to fetch key info:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Key Management">
      <div style={{ marginBottom: '1.5rem' }}>
        <p>
          FHE public keys are managed automatically by the FHEVM SDK.
          Keys are fetched from the network when you initialize the client.
        </p>
      </div>

      {isReady && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="status-success">
            ✅ FHEVM client is ready with network: <strong>{config?.network}</strong>
          </div>
        </div>
      )}

      <Button onClick={fetchKeyInfo} loading={loading}>
        Fetch Key Information
      </Button>

      {keyInfo && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Key Information</h3>
          <div className="code-block">
            <pre>{JSON.stringify(keyInfo, null, 2)}</pre>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>How It Works</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
          <li>Public keys are fetched automatically on client initialization</li>
          <li>Keys are used to encrypt data before sending to blockchain</li>
          <li>Private keys remain with FHEVM protocol validators</li>
          <li>Users can decrypt their data using EIP-712 signatures</li>
        </ul>
      </div>
    </Card>
  );
}
