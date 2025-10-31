export default function AboutPage() {
  return (
    <div className="container">
      <h1 className="section-title">About FHEVM</h1>

      <div className="card">
        <h2 className="card-title">What is Fully Homomorphic Encryption?</h2>
        <div className="card-content">
          <p style={{ marginBottom: '1rem' }}>
            Fully Homomorphic Encryption (FHE) is a revolutionary cryptographic technique that allows
            computations to be performed directly on encrypted data without ever decrypting it. This
            means you can process sensitive information while maintaining complete privacy.
          </p>
          <p>
            Traditional encryption requires data to be decrypted before any computation, exposing it
            to potential security risks. FHE solves this by enabling operations on ciphertext that,
            when decrypted, match the result of operations on plaintext.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">FHEVM by Zama</h2>
        <div className="card-content">
          <p style={{ marginBottom: '1rem' }}>
            FHEVM is Zama's implementation of Fully Homomorphic Encryption for the Ethereum Virtual
            Machine. It brings privacy-preserving smart contracts to Ethereum and EVM-compatible chains.
          </p>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Key Features
          </h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li><strong>On-chain Privacy:</strong> Keep sensitive data encrypted on the blockchain</li>
            <li><strong>Confidential Computation:</strong> Perform operations without revealing data</li>
            <li><strong>EVM Compatible:</strong> Works with existing Ethereum infrastructure</li>
            <li><strong>Developer Friendly:</strong> Simple API for encryption and decryption</li>
            <li><strong>Gas Efficient:</strong> Optimized FHE operations for blockchain</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Encrypted Types</h2>
        <div className="card-content">
          <p style={{ marginBottom: '1rem' }}>
            FHEVM provides encrypted versions of standard Solidity types:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'var(--background)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>euint32</h4>
              <p style={{ fontSize: '0.9rem' }}>Encrypted 32-bit unsigned integer (0 to 2³²-1)</p>
            </div>
            <div style={{
              background: 'var(--background)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>euint64</h4>
              <p style={{ fontSize: '0.9rem' }}>Encrypted 64-bit unsigned integer (0 to 2⁶⁴-1)</p>
            </div>
            <div style={{
              background: 'var(--background)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>ebool</h4>
              <p style={{ fontSize: '0.9rem' }}>Encrypted boolean value (true/false)</p>
            </div>
            <div style={{
              background: 'var(--background)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>eaddress</h4>
              <p style={{ fontSize: '0.9rem' }}>Encrypted Ethereum address</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Use Cases</h2>
        <div className="card-content">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem'
          }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                🔐 Anonymous Voting
              </h4>
              <p>Cast votes privately while ensuring verifiable results</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                💰 Confidential DeFi
              </h4>
              <p>Trade and transact without revealing balances or amounts</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                🎮 Private Gaming
              </h4>
              <p>Keep game state hidden from players until reveal time</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                📊 Confidential Data
              </h4>
              <p>Process sensitive data on-chain with full privacy</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                🏥 Healthcare Records
              </h4>
              <p>Store and compute on medical data privately</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                ⚖️ Sealed-Bid Auctions
              </h4>
              <p>Submit bids without revealing them to competitors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">How FHEVM Works</h2>
        <div className="card-content">
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '2.5' }}>
            <li>
              <strong>Client-Side Encryption:</strong> Data is encrypted on the user's device using
              FHE public key
            </li>
            <li>
              <strong>On-Chain Storage:</strong> Encrypted data (ciphertext) is stored on the blockchain
            </li>
            <li>
              <strong>Encrypted Computation:</strong> Smart contracts perform operations directly on
              ciphertext using FHE operations
            </li>
            <li>
              <strong>Decryption Gateway:</strong> When results need to be revealed, they go through
              a decentralized decryption process
            </li>
            <li>
              <strong>Result Delivery:</strong> Decrypted results are returned to authorized users
              via EIP-712 signatures
            </li>
          </ol>

          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'var(--background)',
            borderRadius: '8px',
            border: '1px solid var(--primary-color)'
          }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Key Advantage</h4>
            <p>
              Unlike zero-knowledge proofs or secure multi-party computation, FHE allows arbitrary
              computation on encrypted data without interaction between parties. This makes it
              uniquely suited for blockchain applications where computation must be public and
              verifiable, but data must remain private.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Learn More</h2>
        <div className="card-content">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li>
              <a
                href="https://docs.zama.ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)' }}
              >
                FHEVM Documentation
              </a>
            </li>
            <li>
              <a
                href="https://www.zama.ai/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)' }}
              >
                Zama Official Website
              </a>
            </li>
            <li>
              <a
                href="https://github.com/GeoffreyBreitenberg/fhevm-react-template"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)' }}
              >
                FHEVM SDK Repository
              </a>
            </li>
            <li>
              <a
                href="https://fhe-copyright.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)' }}
              >
                Live Demo Application
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
