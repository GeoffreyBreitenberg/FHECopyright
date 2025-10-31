import React from 'react';
import './ConnectWallet.css';

function ConnectWallet({ onConnect, loading }) {
  return (
    <div className="connect-wallet">
      <div className="connect-card">
        <div className="connect-icon">🔐</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect your wallet to start protecting your creative works</p>

        <button
          onClick={onConnect}
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>

        <div className="connect-features">
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span>Encrypted Content</span>
          </div>
          <div className="feature">
            <span className="feature-icon">👤</span>
            <span>Anonymous Identity</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚖️</span>
            <span>Dispute Resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectWallet;
