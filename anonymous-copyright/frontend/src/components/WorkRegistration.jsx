import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { encryptContentHash } from '../utils/fhe';
import './WorkRegistration.css';

function WorkRegistration({ contract, account }) {
  const [formData, setFormData] = useState({
    contentHash: '',
    title: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contentHash || !formData.title || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isNaN(formData.contentHash)) {
      toast.error('Content hash must be a number');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Encrypting content hash with FHE...', { id: 'register-work' });

      // Encrypt content hash using FHEVM SDK
      const encrypted = await encryptContentHash(formData.contentHash);

      toast.loading('Registering work...', { id: 'register-work' });

      // Register work with encrypted content hash
      const tx = await contract.registerWork(
        encrypted.handles[0],
        encrypted.inputProof,
        formData.title,
        formData.category
      );

      toast.loading('Waiting for confirmation...', { id: 'register-work' });
      const receipt = await tx.wait();

      // Extract work ID from event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'WorkRegistered'
      );

      const workId = event ? event.args.workId.toString() : 'N/A';

      toast.success(`Work registered! ID: ${workId}`, { id: 'register-work' });

      // Reset form
      setFormData({
        contentHash: '',
        title: '',
        category: ''
      });

      // Trigger refresh of works list
      window.dispatchEvent(new Event('workRegistered'));
    } catch (error) {
      console.error('Failed to register work:', error);
      const message = error.reason || error.message || 'Registration failed';
      toast.error(message, { id: 'register-work' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="work-registration">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="contentHash">Content Hash *</label>
          <input
            type="number"
            id="contentHash"
            name="contentHash"
            value={formData.contentHash}
            onChange={handleChange}
            placeholder="Enter content hash (e.g., 987654321)"
            disabled={loading}
            className="form-control"
            required
          />
          <small className="form-help">
            Unique hash of your work (will be encrypted)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter work title"
            disabled={loading}
            className="form-control"
            maxLength="100"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
            className="form-control"
            required
          >
            <option value="">Select category</option>
            <option value="Digital Art">Digital Art</option>
            <option value="Music">Music</option>
            <option value="Literature">Literature</option>
            <option value="Photography">Photography</option>
            <option value="Video">Video</option>
            <option value="Software">Software</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Registering...' : 'Register Work'}
        </button>
      </form>
    </div>
  );
}

export default WorkRegistration;
