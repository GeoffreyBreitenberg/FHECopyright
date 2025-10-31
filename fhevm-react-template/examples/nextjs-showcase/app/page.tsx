'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          FHEVM Next.js Showcase
        </h1>
        <p className="hero-subtitle">
          Build confidential dApps with Fully Homomorphic Encryption using Next.js 14 and the FHEVM SDK
        </p>
        <div className="hero-buttons">
          <Link href="/encryption" className="btn btn-primary">
            Try Encryption
          </Link>
          <Link href="/examples" className="btn btn-secondary">
            View Examples
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>FHE Encryption</h3>
            <p>Encrypt data using Fully Homomorphic Encryption that allows computation on encrypted data</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Next.js 14</h3>
            <p>Built with the latest Next.js App Router, Server Components, and modern React patterns</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>TypeScript</h3>
            <p>Full TypeScript support with type-safe FHEVM operations and error handling</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Web3 Ready</h3>
            <p>Seamless integration with MetaMask and Ethereum Sepolia testnet</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Universal SDK</h3>
            <p>Framework-agnostic FHEVM SDK with React hooks and utilities included</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Production Ready</h3>
            <p>Optimized build, error handling, loading states, and best practices</p>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="quickstart-section">
        <h2 className="section-title">Quick Start</h2>
        <div className="code-block">
          <pre>
            <code>{`# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build`}</code>
          </pre>
        </div>
        <p className="quickstart-text">
          Navigate through the examples to see FHEVM SDK in action with Next.js 14
        </p>
      </section>

      {/* Navigation Cards */}
      <section className="nav-cards">
        <Link href="/encryption" className="nav-card">
          <h3>🔒 Encryption Demo</h3>
          <p>Interactive encryption and decryption with FHE</p>
          <span className="nav-arrow">→</span>
        </Link>

        <Link href="/examples" className="nav-card">
          <h3>📚 Code Examples</h3>
          <p>Real-world usage patterns and best practices</p>
          <span className="nav-arrow">→</span>
        </Link>

        <Link href="/about" className="nav-card">
          <h3>ℹ️ About FHEVM</h3>
          <p>Learn about Fully Homomorphic Encryption</p>
          <span className="nav-arrow">→</span>
        </Link>
      </section>
    </div>
  );
}
