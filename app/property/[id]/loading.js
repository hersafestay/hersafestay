export default function Loading() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 33%, #F0FBF9 66%, #E8F6F4 100%)',
      fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
    }}>
      {/* Nav skeleton */}
      <div style={{
        height: '56px',
        background: 'white',
        borderBottom: '1px solid #FFE8D6',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }} />

      {/* Hero skeleton */}
      <div style={{
        height: '300px',
        background: 'linear-gradient(135deg, #FFE8D6 0%, #FFF4E8 100%)',
        animation: 'hss-pulse 1.6s ease-in-out infinite',
      }} />

      {/* Content skeleton */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Breadcrumb */}
        <div className="hss-shimmer" style={{ height: '13px', width: '280px', borderRadius: '4px', marginBottom: '18px' }} />

        {/* Title */}
        <div className="hss-shimmer" style={{ height: '32px', width: '60%', borderRadius: '6px', marginBottom: '12px' }} />
        <div className="hss-shimmer" style={{ height: '16px', width: '40%', borderRadius: '4px', marginBottom: '24px' }} />

        {/* Stats bar */}
        <div style={{
          height: '72px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #FFE8D6',
          marginBottom: '28px',
          animation: 'hss-pulse 1.6s ease-in-out infinite',
        }} />

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[180, 140, 200].map((h, i) => (
              <div key={i} style={{
                height: `${h}px`, background: 'white', borderRadius: '12px',
                border: '1px solid #FFE8D6', animation: 'hss-pulse 1.6s ease-in-out infinite',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[120, 220].map((h, i) => (
              <div key={i} style={{
                height: `${h}px`, background: 'white', borderRadius: '12px',
                border: '1px solid #FFE8D6', animation: 'hss-pulse 1.6s ease-in-out infinite',
              }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hss-pulse {
          0%, 100% { opacity: 0.65; }
          50%       { opacity: 1;    }
        }
        .hss-shimmer {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: hss-shimmer 1.5s infinite;
        }
        @keyframes hss-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 767px) {
          .hss-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
