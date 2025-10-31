import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { encryptContentHash } from '../utils/fhe';
import './WorkVerification.css';

function WorkVerification({ contract, account }) {
  const [workId, setWorkId] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!workId || !contentHash) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isNaN(workId) || isNaN(contentHash)) {
      toast.error('Work ID and content hash must be numbers');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Encrypting content hash with FHE...', { id: 'verify' });

      // Encrypt content hash using FHEVM SDK
      const encrypted = await encryptContentHash(contentHash);

      toast.loading('Verifying work...', { id: 'verify' });

      // Request verification with encrypted content hash
      const tx = await contract.requestVerifyWork(
        parseInt(workId),
        encrypted.handles[0],
        encrypted.inputProof
      );

      toast.loading('Waiting for confirmation...', { id: 'verify' });
      await tx.wait();

      // Check if work is now verified
      const workInfo = await contract.getWorkInfo(parseInt(workId));

      if (workInfo.verified) {
        toast.success('Work verified successfully!', { id: 'verify' });
      } else {
        toast.info('Verification request submitted. Check back later.', { id: 'verify' });
      }

      // Reset form
      setWorkId('');
      setContentHash('');

      // Trigger refresh
      window.dispatchEvent(new Event('workRegistered'));
    } catch (error) {
      console.error('Verification failed:', error);
      const message = error.reason || error.message || 'Verification failed';
      toast.error(message, { id: 'verify' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="work-verification">
      <form onSubmit={handleVerify} className="form">
        <div className="form-group">
          <label htmlFor="workId">Work ID *</label>
          <input
            type="number"
            id="workId"
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            placeholder="Enter work ID to verify"
            disabled={loading}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contentHash">Content Hash *</label>
          <input
            type="number"
            id="contentHash"
            value={contentHash}
            onChange={(e) => setContentHash(e.target.value)}
            placeholder="Enter original content hash"
            disabled={loading}
            className="form-control"
            required
          />
          <small className="form-help">
            This must match the hash used during registration
          </small>
        </div>

        <button
          type="submit"
          disabled={loading || !workId || !contentHash}
          className="btn btn-primary"
        >
          {loading ? 'Verifying...' : 'Verify Work'}
        </button>
      </form>

      <div className="info-box">
        <h4>How Verification Works</h4>
        <p>
          The content hash is encrypted and compared with the stored hash
          using FHE operations. No plaintext is revealed during comparison.
        </p>
      </div>
    </div>
  );
}

export default WorkVerification;
