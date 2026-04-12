'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #FFE8D6',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-crimson-pro), Georgia, serif',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg viewBox="0 0 32 42" width="24" height="32">
          <path d="M16,0 C7.163,0 0,7.163 0,16 C0,28 16,42 16,42 C16,42 32,28 32,16 C32,7.163 24.837,0 16,0 Z" fill="#FF6B6B"/>
          <path d="M16,7 C19,6 22,7.5 22,10 L22,20 Q22,26 16,27 Q10,26 10,20 L10,10 C10,7.5 13,6 16,7 Z" fill="#FFF8F0"/>
        </svg>
        <span style={{ fontWeight: '700', fontSize: '17px', color: '#2B2D42' }}>HerSafeStay</span>
      </Link>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/map" style={navLinkStyle}>
          Explore Map
        </Link>

        {!loading && (
          <>
            {user ? (
              <>
                <Link href="/profile/saved" style={navLinkStyle}>
                  Saved
                </Link>
                <Link href="/profile" style={{
                  ...navLinkStyle,
                  background: '#e5f5ea',
                  color: '#2D6A4F',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontWeight: '600',
                }}>
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={navLinkStyle}>
                  Log In
                </Link>
                <Link href="/auth/signup" style={{
                  ...navLinkStyle,
                  background: 'linear-gradient(135deg, #FF6B6B, #e85555)',
                  color: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontWeight: '600',
                }}>
                  Sign Up
                </Link>
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
}

const navLinkStyle = {
  textDecoration: 'none',
  color: '#2B2D42',
  fontSize: '14px',
  padding: '6px 12px',
  borderRadius: '6px',
  transition: 'background 0.15s',
};
