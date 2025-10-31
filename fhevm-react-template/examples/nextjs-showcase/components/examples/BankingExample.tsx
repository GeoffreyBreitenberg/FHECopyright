'use client';

import React, { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/hooks';
import { useFHE } from '../fhe/FHEProvider';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function BankingExample() {
  const { client, isReady } = useFHE();
  const { encrypt, isEncrypting } = useEncrypt(client);

  const [balance, setBalance] = useState('');
  const [amount, setAmount] = useState('');
  const [encryptedBalance, setEncryptedBalance] = useState<any>(null);

  const handleEncryptBalance = async () => {
    if (!balance) return;

    try {
      const encrypted = await encrypt(parseInt(balance, 10), 'uint32');
      setEncryptedBalance(encrypted);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <Card title="Private Banking Example">
      <p style={{ marginBottom: '1.5rem' }}>
        This example demonstrates how FHE can be used for private banking operations
        where account balances remain encrypted on-chain.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Scenario</h3>
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
          <p>
            A user wants to store their account balance on the blockchain, but keep
            the exact amount private. Using FHE, the balance is encrypted and can be
            used in computations (transfers, comparisons) without revealing the value.
          </p>
        </div>
      </div>

      {isReady ? (
        <>
          <Input
            label="Account Balance"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Enter balance amount"
            helperText="This will be encrypted before storing on-chain"
          />

          <Input
            label="Transfer Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter transfer amount"
            helperText="Comparisons and transfers happen on encrypted data"
          />

          <Button onClick={handleEncryptBalance} loading={isEncrypting} disabled={!balance}>
            Encrypt Balance
          </Button>

          {encryptedBalance && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="status-success">
                ✅ Balance encrypted successfully!
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                The encrypted balance can now be stored on-chain and used in smart contract operations.
              </p>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Smart Contract Operations</h3>
            <div className="code-block">
              <pre>{`// Check if balance >= amount (encrypted)
ebool canTransfer = TFHE.gte(encryptedBalance, encryptedAmount);

// Subtract amount from balance (encrypted)
euint32 newBalance = TFHE.sub(encryptedBalance, encryptedAmount);

// Only the user can decrypt their balance
uint32 actualBalance = TFHE.decrypt(encryptedBalance);`}</pre>
            </div>
          </div>
        </>
      ) : (
        <p>Initializing client...</p>
      )}
    </Card>
  );
}
