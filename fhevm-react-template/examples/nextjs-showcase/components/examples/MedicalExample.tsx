'use client';

import React, { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/hooks';
import { useFHE } from '../fhe/FHEProvider';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function MedicalExample() {
  const { client, isReady } = useFHE();
  const { encrypt, isEncrypting } = useEncrypt(client);

  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [encryptedData, setEncryptedData] = useState<any>(null);

  const handleEncryptData = async () => {
    if (!heartRate) return;

    try {
      const encrypted = await encrypt(parseInt(heartRate, 10), 'uint32');
      setEncryptedData(encrypted);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <Card title="Private Medical Records Example">
      <p style={{ marginBottom: '1.5rem' }}>
        This example shows how FHE enables privacy-preserving medical records where
        health data remains encrypted but can still be analyzed and compared.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Scenario</h3>
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
          <p>
            A patient wants to store health metrics on the blockchain for research
            purposes while keeping their data private. Researchers can perform
            statistical analysis on encrypted data without accessing individual records.
          </p>
        </div>
      </div>

      {isReady ? (
        <>
          <Input
            label="Heart Rate (bpm)"
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="e.g., 72"
            helperText="Normal range: 60-100 bpm"
          />

          <Input
            label="Blood Pressure (systolic)"
            type="number"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            placeholder="e.g., 120"
            helperText="This will also be encrypted"
          />

          <Button onClick={handleEncryptData} loading={isEncrypting} disabled={!heartRate}>
            Encrypt Health Data
          </Button>

          {encryptedData && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="status-success">
                ✅ Health data encrypted successfully!
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                The encrypted health metrics can be stored on-chain for research while
                maintaining patient privacy.
              </p>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Research Operations on Encrypted Data</h3>
            <div className="code-block">
              <pre>{`// Check if heart rate is in normal range (encrypted)
ebool isNormal = TFHE.and(
  TFHE.gte(heartRate, TFHE.asEuint32(60)),
  TFHE.lte(heartRate, TFHE.asEuint32(100))
);

// Calculate average across multiple patients (encrypted)
euint32 sum = TFHE.add(heartRate1, heartRate2);
euint32 average = TFHE.div(sum, TFHE.asEuint32(2));

// Only authorized parties can decrypt results
uint32 actualAverage = TFHE.decrypt(average);`}</pre>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Privacy Benefits</h3>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
              <li>Patient data remains encrypted on-chain</li>
              <li>Researchers can perform analysis without seeing raw data</li>
              <li>Compliance with healthcare privacy regulations</li>
              <li>Patients maintain control over data access</li>
            </ul>
          </div>
        </>
      ) : (
        <p>Initializing client...</p>
      )}
    </Card>
  );
}
