export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 0',
      marginTop: '4rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              FHEVM SDK
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              A universal SDK for building confidential dApps with Fully Homomorphic Encryption
              on Ethereum and EVM-compatible chains.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li>
                <a
                  href="https://docs.zama.ai/fhevm"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  FHEVM Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/GeoffreyBreitenberg/fhevm-react-template"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://fhe-copyright.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Live Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Technology</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li>
                <a
                  href="https://www.zama.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Zama
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Next.js
                </a>
              </li>
              <li>
                <a
                  href="https://docs.ethers.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  ethers.js
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          <p>
            © {currentYear} FHEVM Next.js Showcase. Built with Zama's FHEVM Technology.
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            MIT License - Open Source
          </p>
        </div>
      </div>
    </footer>
  );
}
