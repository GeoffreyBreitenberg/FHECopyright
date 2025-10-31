import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { encryptAuthorId } from '../utils/fhe';
import './AuthorRegistration.css';

function AuthorRegistration({ contract, account, onRegistered }) {
  const [authorId, setAuthorId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!authorId || isNaN(authorId)) {
      toast.error('Please enter a valid author ID');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Encrypting author ID with FHE...', { id: 'register' });

      // Encrypt author ID using FHEVM SDK
      const encrypted = await encryptAuthorId(authorId);

      toast.loading('Registering as author...', { id: 'register' });

      // Register author with encrypted ID
      // The encrypted value contains handles array and inputProof
      const tx = await contract.registerAuthor(
        encrypted.handles[0],
        encrypted.inputProof
      );

      toast.loading('Waiting for confirmation...', { id: 'register' });
      await tx.wait();

      toast.success('Registered as author successfully!', { id: 'register' });
      setAuthorId('');
      onRegistered();
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.reason || error.message || 'Registration failed';
      toast.error(message, { id: 'register' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="author-registration">
      <form onSubmit={handleRegister} className="form">
        <div className="form-group">
          <label htmlFor="authorId">Author ID</label>
          <input
            type="number"
            id="authorId"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            placeholder="Enter your unique author ID"
            disabled={loading}
            className="form-control"
            required
          />
          <small className="form-help">
            This ID will be encrypted with FHE for privacy
          </small>
        </div>

        <button
          type="submit"
          disabled={loading || !authorId}
          className="btn btn-primary"
        >
          {loading ? 'Registering...' : 'Register as Author'}
        </button>
      </form>

      <div className="info-box">
        <h4>Why Register?</h4>
        <ul>
          <li>✓ Protect your works anonymously</li>
          <li>✓ Your author ID is encrypted on-chain</li>
          <li>✓ Only you can prove ownership</li>
        </ul>
      </div>
    </div>
  );
}

export default AuthorRegistration;
