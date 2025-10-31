'use client';

import { useState } from 'react';
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';
import toast from 'react-hot-toast';

export default function EncryptionPage() {
  const [value, setValue] = useState('');
  const [encryptionType, setEncryptionType] = useState<'uint32' | 'uint64'>('uint32');
  const [encryptedResult, setEncryptedResult] = useState<any>(null);

  const { client, isReady, error: clientError } = useFhevmClient({
    network: 'sepolia',
    contractAddress: '0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a',
  });

  const { encrypt, isEncrypting, error: encryptError } = useEncrypt(client);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value) {
      toast.error('Please enter a value to encrypt');
      return;
    }

    try {
      const numValue = encryptionType === 'uint32'
        ? parseInt(value, 10)
        : BigInt(value);

      const encrypted = await encrypt(numValue, encryptionType);
      setEncryptedResult(encrypted);
      toast.success('Value encrypted successfully!');
    } catch (err: any) {
      console.error('Encryption error:', err);
      toast.error(err.message || 'Failed to encrypt value');
    }
  };

  const handleClear = () => {
    setValue('');
    setEncryptedResult(null);
  };

  return (
    <div className="container">
      <h1 className="section-title">FHE Encryption Demo</h1>

      {!isReady && !clientError && (
        <div className="card">
          <p>Initializing FHEVM client...</p>
          <div className="spinner"></div>
        </div>
      )}

      {clientError && (
        <div className="status-error">
          <strong>Error:</strong> {clientError.message}
        </div>
      )}

      {isReady && (
        <>
          <div className="card">
            <h2 className="card-title">Encrypt Values</h2>
            <form onSubmit={handleEncrypt}>
              <div className="form-group">
                <label className="form-label">Encryption Type</label>
                <select
                  className="form-select"
                  value={encryptionType}
                  onChange={(e) => setEncryptionType(e.target.value as 'uint32' | 'uint64')}
                >
                  <option value="uint32">uint32 (0 to 4,294,967,295)</option>
                  <option value="uint64">uint64 (0 to 18,446,744,073,709,551,615)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Value to Encrypt</label>
                <input
                  type="text"
                  className="form-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={encryptionType === 'uint32' ? 'e.g., 12345' : 'e.g., 123456789'}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                  {encryptionType === 'uint32'
                    ? 'Enter a number between 0 and 4,294,967,295'
                    : 'Enter a number between 0 and 18,446,744,073,709,551,615'}
                </small>
              </div>

              {encryptError && (
                <div className="status-error">
                  {encryptError.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isEncrypting || !value}
                >
                  {isEncrypting ? 'Encrypting...' : 'Encrypt'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {encryptedResult && (
            <div className="card">
              <h2 className="card-title">Encrypted Result</h2>
              <div className="form-group">
                <label className="form-label">Handle</label>
                <div className="code-block">
                  <pre><code>{encryptedResult.handles[0]}</code></pre>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Input Proof</label>
                <div className="code-block">
                  <pre><code style={{ wordBreak: 'break-all' }}>{encryptedResult.inputProof}</code></pre>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <p style={{ color: 'var(--text-secondary)' }}>{encryptedResult.type}</p>
              </div>

              <div className="status-success">
                ✅ This encrypted value can now be used in smart contract transactions
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="card-title">How It Works</h2>
            <div className="card-content">
              <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
                <li>Enter a numeric value to encrypt</li>
                <li>Choose encryption type (uint32 or uint64)</li>
                <li>Click "Encrypt" to perform FHE encryption</li>
                <li>Receive encrypted handle and input proof</li>
                <li>Use these values in smart contract calls</li>
              </ol>
              <p style={{ marginTop: '1.5rem' }}>
                <strong>Note:</strong> Encrypted values can be computed on-chain without decryption,
                preserving privacy while enabling verifiable computation.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
