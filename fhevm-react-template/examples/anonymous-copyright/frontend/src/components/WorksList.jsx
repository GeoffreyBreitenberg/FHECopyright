import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './WorksList.css';

function WorksList({ contract, account }) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorks = async () => {
    try {
      setLoading(true);

      // Get user's work IDs
      const workIds = await contract.getUserWorks(account);

      // Load details for each work
      const worksData = await Promise.all(
        workIds.map(async (id) => {
          const info = await contract.getWorkInfo(id);
          return {
            id: id.toString(),
            title: info.title,
            category: info.category,
            registrant: info.registrant,
            verified: info.verified,
            disputed: info.disputed,
            timestamp: new Date(Number(info.timestamp) * 1000).toLocaleDateString()
          };
        })
      );

      setWorks(worksData);
    } catch (error) {
      console.error('Failed to load works:', error);
      toast.error('Failed to load works');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadWorks();
    }
  }, [contract, account]);

  // Reload when new work is registered
  useEffect(() => {
    const handleWorkRegistered = () => {
      loadWorks();
    };

    window.addEventListener('workRegistered', handleWorkRegistered);
    return () => {
      window.removeEventListener('workRegistered', handleWorkRegistered);
    };
  }, [contract, account]);

  if (loading) {
    return (
      <div className="works-list">
        <div className="loading">Loading your works...</div>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="works-list">
        <div className="empty-state">
          <p>📄 No works registered yet</p>
          <p>Register your first work to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="works-list">
      <div className="works-grid">
        {works.map((work) => (
          <div key={work.id} className="work-card">
            <div className="work-header">
              <h3>{work.title}</h3>
              <span className="work-id">#{work.id}</span>
            </div>

            <div className="work-details">
              <div className="work-detail">
                <span className="label">Category:</span>
                <span className="value">{work.category}</span>
              </div>

              <div className="work-detail">
                <span className="label">Registered:</span>
                <span className="value">{work.timestamp}</span>
              </div>
            </div>

            <div className="work-status">
              <div className={`status-badge ${work.verified ? 'verified' : 'pending'}`}>
                {work.verified ? '✓ Verified' : '⏳ Pending'}
              </div>

              {work.disputed && (
                <div className="status-badge disputed">
                  ⚠️ Disputed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorksList;
