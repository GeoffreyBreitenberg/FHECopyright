'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/encryption', label: 'Encryption' },
    { href: '/examples', label: 'Examples' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <Link
            href="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
            }}
          >
            FHEVM Next.js
          </Link>

          <nav>
            <ul style={{
              display: 'flex',
              gap: '2rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      color: pathname === link.href ? 'var(--primary-color)' : 'var(--text-secondary)',
                      fontWeight: pathname === link.href ? 600 : 400,
                      transition: 'color 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== link.href) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <span style={{
                        position: 'absolute',
                        bottom: '-0.5rem',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--primary-color)',
                      }} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
