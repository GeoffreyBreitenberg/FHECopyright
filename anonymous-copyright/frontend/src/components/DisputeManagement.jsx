import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { encryptContentHash } from '../utils/fhe';
import './DisputeManagement.css';

function DisputeManagement({ contract, account }) {
  const [workId, setWorkId] = useState('');
  const [challengerHash, setChallengerHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileDispute = async (e) => {
    e.preventDefault();

    if (!workId || !challengerHash) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isNaN(workId) || isNaN(challengerHash)) {
      toast.error('Work ID and content hash must be numbers');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Encrypting proof with FHE...', { id: 'dispute' });

      // Encrypt challenger's content hash using FHEVM SDK
      const encrypted = await encryptContentHash(challengerHash);

      toast.loading('Filing dispute...', { id: 'dispute' });

      // File dispute with encrypted proof
      const tx = await contract.fileDispute(
        parseInt(workId),
        encrypted.handles[0],
        encrypted.inputProof
      );

      toast.loading('Waiting for confirmation...', { id: 'dispute' });
      const receipt = await tx.wait();

      // Extract dispute ID from event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'DisputeFiled'
      );

      const disputeId = event ? event.args.disputeId.toString() : 'N/A';

      toast.success(`Dispute filed! ID: ${disputeId}`, { id: 'dispute' });

      // Reset form
      setWorkId('');
      setChallengerHash('');

      // Trigger refresh
      window.dispatchEvent(new Event('workRegistered'));
    } catch (error) {
      console.error('Failed to file dispute:', error);
      const message = error.reason || error.message || 'Failed to file dispute';
      toast.error(message, { id: 'dispute' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dispute-management">
      <form onSubmit={handleFileDispute} className="form">
        <div className="form-group">
          <label htmlFor="workId">Work ID *</label>
          <input
            type="number"
            id="workId"
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            placeholder="Enter work ID to dispute"
            disabled={loading}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="challengerHash">Your Content Hash *</label>
          <input
            type="number"
            id="challengerHash"
            value={challengerHash}
            onChange={(e) => setChallengerHash(e.target.value)}
            placeholder="Enter your content hash as proof"
            disabled={loading}
            className="form-control"
            required
          />
          <small className="form-help">
            This hash will be encrypted and used as proof
          </small>
        </div>

        <button
          type="submit"
          disabled={loading || !workId || !challengerHash}
          className="btn btn-warning"
        >
          {loading ? 'Filing...' : 'File Dispute'}
        </button>
      </form>

      <div className="warning-box">
        <h4>⚠️ Before Filing a Dispute</h4>
        <ul>
          <li>Ensure you have valid proof of ownership</li>
          <li>Disputes are permanent and visible on-chain</li>
          <li>False disputes may have consequences</li>
        </ul>
      </div>
    </div>
  );
}

export default DisputeManagement;
