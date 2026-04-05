'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// CRITICAL: ssr:false must live inside a Client Component (SOLUTION-013)
const SafetyMap = dynamic(
  () => import('@/components/map/SafetyMap'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #FFF8F0, #FFF4E8, #F0FBF9)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #FFE8D6',
          borderTopColor: '#FF6B6B',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#78716c', fontSize: '15px', margin: 0 }}>Loading map…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

const HEADER_H = 56;

export default function MapPageClient() {
  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#2B2D42',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <header style={{
        height: `${HEADER_H}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'white',
        borderBottom: '1px solid #FFE8D6',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        zIndex: 100,
      }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2D6A4F',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1.5px solid rgba(45,106,79,0.2)',
          }}
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#2B2D42',
            fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
            lineHeight: '1',
          }}>
            Barcelona Safety Map
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
            5 neighborhoods · Click any zone for details
          </p>
        </div>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="22" height="28" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16,2 C25,2 30,8 30,16 C30,26 16,42 16,42 C16,42 2,26 2,16 C2,8 7,2 16,2 Z" fill="#FF6B6B"/>
            <path d="M16,7 C19,6 22,7.5 22,10 L22,20 Q22,26 16,27 Q10,26 10,20 L10,10 C10,7.5 13,6 16,7 Z" fill="#FFF8F0"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#FF6B6B', fontFamily: 'var(--font-crimson-pro, Georgia, serif)' }}>
            HerSafeStay
          </span>
        </Link>
      </header>

      {/* ── Map (fills remaining height) ── */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <SafetyMap cityId="barcelona" />
      </main>
    </div>
  );
}
