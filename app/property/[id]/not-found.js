import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 33%, #F0FBF9 66%, #E8F6F4 100%)',
      fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
      gap: '20px',
      padding: '32px 16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px', lineHeight: 1 }}>🔍</div>

      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2B2D42', margin: '0 0 8px' }}>
          Property Not Found
        </h1>
        <p style={{ color: '#78716c', fontSize: '16px', maxWidth: '380px', margin: 0, lineHeight: '1.6' }}>
          This property doesn&apos;t exist or is no longer available. Browse safe stays on the map.
        </p>
      </div>

      <Link
        href="/map"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 28px',
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '15px',
          fontWeight: '700',
          boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
        }}
      >
        ← Back to Map
      </Link>
    </div>
  );
}
