import React from 'react';
import './Header.css';

function Header({ account, isAuthor, onDisconnect }) {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">🔒 Anonymous Copyright</h1>
          {isAuthor && (
            <span className="author-badge">✓ Registered Author</span>
          )}
        </div>

        {account && (
          <div className="header-right">
            <div className="account-info">
              <span className="account-address">{formatAddress(account)}</span>
            </div>
            <button
              onClick={onDisconnect}
              className="btn btn-secondary btn-sm"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
