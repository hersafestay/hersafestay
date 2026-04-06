'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CitySelector from '@/components/map/CitySelector';

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

const CITY_NAMES = {
  barcelona: 'Barcelona',
  paris:     'Paris',
  bangkok:   'Bangkok',
};

const HEADER_H = 56;

export default function MapPageClient() {
  const [selectedCity, setSelectedCity] = useState('barcelona');

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
        padding: '0 12px',
        background: 'white',
        borderBottom: '1px solid #FFE8D6',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        zIndex: 100,
        gap: '8px',
      }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#2D6A4F',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1.5px solid rgba(45,106,79,0.2)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          ← Home
        </Link>

        {/* City selector — centre */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <CitySelector
            currentCity={selectedCity}
            onCityChange={setSelectedCity}
          />
        </div>

        {/* Logo / title */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="26" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16,2 C25,2 30,8 30,16 C30,26 16,42 16,42 C16,42 2,26 2,16 C2,8 7,2 16,2 Z" fill="#FF6B6B"/>
            <path d="M16,7 C19,6 22,7.5 22,10 L22,20 Q22,26 16,27 Q10,26 10,20 L10,10 C10,7.5 13,6 16,7 Z" fill="#FFF8F0"/>
          </svg>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#FF6B6B',
              fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
              display: 'none', // hidden on narrow mobile; shown via class below
            }}
            className="header-brand-text"
          >
            HerSafeStay
          </span>
        </Link>
      </header>

      {/* ── Map ── */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <SafetyMap cityId={selectedCity} />
      </main>

      {/* Inline responsive style — show brand text on wider screens */}
      <style>{`
        @media (min-width: 480px) {
          .header-brand-text { display: inline !important; }
        }
      `}</style>
    </div>
  );
}
