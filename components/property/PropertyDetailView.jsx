/**
 * PropertyDetailView — server component
 *
 * Renders the full property detail page.
 * No 'use client' — all interactivity is handled via links and native HTML.
 * booking_url is validated with safeHref() to prevent javascript: injection (SECURITY.md §5).
 */

import Link from 'next/link';

// ─── Constants (mirrors PropertyList.jsx) ────────────────────────────────────

const TYPE_COLORS = {
  hotel:      '#FF6B6B',
  hostel:     '#4A90D9',
  apartment:  '#2D6A4F',
  guesthouse: '#F4A261',
};

const TYPE_EMOJI = {
  hotel:      '🏨',
  hostel:     '🛏️',
  apartment:  '🏠',
  guesthouse: '🏡',
};

const SAFETY_STYLE = {
  safe:    { bg: 'rgba(45,106,79,0.08)',  text: '#1B4332', border: 'rgba(45,106,79,0.2)',  fill: '#2D6A4F' },
  caution: { bg: 'rgba(244,162,97,0.10)', text: '#9A3412', border: 'rgba(244,162,97,0.3)', fill: '#F4A261' },
  avoid:   { bg: 'rgba(230,57,70,0.08)',  text: '#9B1C1C', border: 'rgba(230,57,70,0.2)',  fill: '#E63946' },
};

const SAFETY_LABEL = {
  safe:    'Safe',
  caution: 'Use Caution',
  avoid:   'Avoid at Night',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(price, currency = 'USD') {
  if (!price) return null;
  const sym = { USD: '$', EUR: '€', THB: '฿' }[currency] ?? currency;
  return `${sym}${Math.round(price)}/night`;
}

/**
 * Validate booking URL — only allow http/https to prevent javascript: injection.
 * SECURITY.md §5: URL Validation.
 */
function safeHref(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const CARD = {
  background: 'white',
  borderRadius: '12px',
  padding: '22px 24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  border: '1px solid #FFE8D6',
};

const H2 = {
  fontSize: '17px',
  fontWeight: '700',
  color: '#2B2D42',
  margin: '0 0 16px',
  letterSpacing: '-0.01em',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ value, label, valueColor, small = false }) {
  return (
    <div style={{
      flex: '1 1 80px',
      textAlign: 'center',
      padding: '16px 12px',
      borderRight: '1px solid #FFE8D6',
    }}>
      <div style={{
        fontSize: small ? '15px' : '22px',
        fontWeight: '700',
        color: valueColor ?? '#2B2D42',
        lineHeight: 1,
        marginBottom: '4px',
        wordBreak: 'break-word',
      }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</div>
    </div>
  );
}

function ScoreBar({ label, score, weight, color }) {
  if (score == null) return null;
  const pct = Math.min(100, Math.round((Number(score) / 10) * 100));
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: '#57534e', fontWeight: '600' }}>{label}</span>
        <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#c4b5fd' }}>{weight}</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#2B2D42', minWidth: '38px', textAlign: 'right' }}>
            {Number(score).toFixed(1)}/10
          </span>
        </span>
      </div>
      <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px' }} />
      </div>
    </div>
  );
}

function NearbyCard({ property }) {
  const tc = TYPE_COLORS[property.property_type] ?? '#FF6B6B';
  const te = TYPE_EMOJI[property.property_type]  ?? '🏨';
  const ss = SAFETY_STYLE[property.zone?.safety_level] ?? SAFETY_STYLE.caution;
  const price = fmtPrice(property.price_per_night, property.currency);

  return (
    <Link href={`/property/${property.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #FFE8D6',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}>
        {/* Image / placeholder */}
        <div style={{
          height: '110px',
          background: property.image_url
            ? `url(${encodeURI(property.image_url)}) center/cover no-repeat`
            : `linear-gradient(135deg, ${tc}18 0%, #FFF8F0 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
        }}>
          {!property.image_url && te}
        </div>

        <div style={{ padding: '12px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#2B2D42',
            lineHeight: '1.3',
            marginBottom: '6px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>{property.name}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {property.zone?.safety_score != null && (
              <span style={{ fontSize: '13px', fontWeight: '700', color: ss.fill }}>
                {Number(property.zone.safety_score).toFixed(1)}/10
              </span>
            )}
            {price && (
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#2D6A4F' }}>{price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PropertyDetailView({ property, nearbyProperties = [] }) {
  const tc         = TYPE_COLORS[property.property_type] ?? '#FF6B6B';
  const te         = TYPE_EMOJI[property.property_type]  ?? '🏨';
  const sl         = property.zone?.safety_level;
  const ss         = SAFETY_STYLE[sl] ?? SAFETY_STYLE.caution;
  const safeLabel  = SAFETY_LABEL[sl]  ?? 'Unknown';
  const price      = fmtPrice(property.price_per_night, property.currency);
  const bookingUrl = safeHref(property.booking_url);
  const zone       = property.zone;
  const city       = property.city;
  const cityId     = property.city_id;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 33%, #F0FBF9 66%, #E8F6F4 100%)',
      fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
    }}>

      {/* ── Sticky Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #FFE8D6',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '56px', gap: '8px',
      }}>
        <Link href="/map" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#2D6A4F', textDecoration: 'none',
          fontSize: '13px', fontWeight: '600',
          padding: '6px 12px', borderRadius: '8px',
          border: '1.5px solid rgba(45,106,79,0.2)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>← Back to Map</Link>

        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="20" height="26" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16,2 C25,2 30,8 30,16 C30,26 16,42 16,42 C16,42 2,26 2,16 C2,8 7,2 16,2 Z" fill="#FF6B6B"/>
            <path d="M16,7 C19,6 22,7.5 22,10 L22,20 Q22,26 16,27 Q10,26 10,20 L10,10 C10,7.5 13,6 16,7 Z" fill="#FFF8F0"/>
          </svg>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#FF6B6B' }}>HerSafeStay</span>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        height: '300px',
        background: property.image_url
          ? `linear-gradient(rgba(0,0,0,0.08),rgba(0,0,0,0.38)), url(${encodeURI(property.image_url)}) center/cover no-repeat`
          : `linear-gradient(135deg, ${tc}18 0%, #FFF8F0 50%, ${ss.fill}0D 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {!property.image_url && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '88px', lineHeight: 1 }}>{te}</div>
          </div>
        )}
        {property.image_url && (
          <h1 style={{
            position: 'absolute', bottom: '24px', left: '24px', right: '24px',
            color: 'white', fontSize: '26px', fontWeight: '700', margin: 0,
            lineHeight: '1.25', textShadow: '0 2px 10px rgba(0,0,0,0.45)',
          }}>{property.name}</h1>
        )}
      </div>

      {/* ── Page content ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px 100px' }}>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{
          fontSize: '13px', color: '#9ca3af', marginBottom: '14px',
          display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          {city && (
            <><Link href={`/map?city=${cityId}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>{city.name}</Link><span>/</span></>
          )}
          {zone && (
            <><Link href={`/map?city=${cityId}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>{zone.zone_name}</Link><span>/</span></>
          )}
          <span style={{ color: '#2B2D42', fontWeight: '600' }}>{property.name}</span>
        </nav>

        {/* Title block (hidden when image is shown since title is in the hero overlay) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px', borderRadius: '999px',
              background: tc, color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize',
            }}>{te} {property.property_type}</span>
            {zone && (
              <span style={{
                padding: '4px 12px', borderRadius: '999px',
                background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`,
                fontSize: '12px', fontWeight: '700',
              }}>✓ {safeLabel}</span>
            )}
          </div>

          {/* Show title here only when there's no image (image shows title as overlay) */}
          {!property.image_url && (
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2B2D42', margin: '0 0 8px', lineHeight: '1.2' }}>
              {property.name}
            </h1>
          )}

          {(property.address || zone || city) && (
            <p style={{ color: '#78716c', fontSize: '15px', margin: 0 }}>
              📍 {[property.address, zone?.zone_name, city?.name].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          background: 'white', borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #FFE8D6', marginBottom: '28px',
          overflow: 'hidden',
        }}>
          {zone?.safety_score != null && (
            <Stat value={`${Number(zone.safety_score).toFixed(1)}/10`} label="Safety Score" valueColor={ss.fill} />
          )}
          {property.women_rating && (
            <Stat value={`${Number(property.women_rating).toFixed(1)}★`} label="Women's Rating" valueColor="#F4A261" />
          )}
          {price && <Stat value={price} label="Per Night" valueColor="#2D6A4F" />}
          {zone?.zone_name && <Stat value={zone.zone_name} label="Neighborhood" valueColor="#2B2D42" small />}
        </div>

        {/* ── Two-column grid ── */}
        <div className="hss-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* About */}
            {property.description && (
              <section style={CARD}>
                <h2 style={H2}>About This Property</h2>
                <p style={{ color: '#57534e', lineHeight: '1.75', fontSize: '16px', margin: 0 }}>
                  {property.description}
                </p>
              </section>
            )}

            {/* Safety Features */}
            {property.safety_features?.length > 0 && (
              <section style={CARD}>
                <h2 style={H2}>🔒 Safety Features</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px' }}>
                  {property.safety_features.map((feat, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 12px', borderRadius: '8px',
                      background: 'rgba(45,106,79,0.05)',
                      border: '1px solid rgba(45,106,79,0.12)',
                      fontSize: '14px', color: '#1B4332',
                    }}>
                      <span style={{ color: '#2D6A4F', fontWeight: '700', flexShrink: 0 }}>✓</span>
                      {feat}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Neighborhood Safety */}
            {zone && (
              <section style={CARD}>
                <h2 style={H2}>🗺️ Neighborhood Safety</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '5px 14px', borderRadius: '999px',
                    background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`,
                    fontWeight: '700', fontSize: '13px',
                  }}>{safeLabel}</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: ss.fill }}>
                    {zone.zone_name}
                  </span>
                </div>

                {zone.description && (
                  <p style={{ color: '#57534e', lineHeight: '1.7', fontSize: '15px', marginBottom: '16px' }}>
                    {zone.description}
                  </p>
                )}

                {zone.tips?.length > 0 && (
                  <>
                    <div style={{
                      fontSize: '11px', fontWeight: '700', color: '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
                    }}>
                      Safety Tips for {zone.zone_name}
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {zone.tips.map((tip, i) => (
                        <li key={i} style={{ color: '#57534e', fontSize: '14px', lineHeight: '1.5' }}>{tip}</li>
                      ))}
                    </ul>
                  </>
                )}

                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                  <Link href={`/map?city=${cityId}`} style={{
                    fontSize: '14px', fontWeight: '600', color: '#2D6A4F', textDecoration: 'none',
                  }}>
                    View on Full Map →
                  </Link>
                </div>
              </section>
            )}

            {/* Reviews placeholder */}
            <section style={CARD}>
              <h2 style={H2}>⭐ Reviews from Women Travelers</h2>
              <div style={{
                textAlign: 'center', padding: '32px 16px',
                background: '#f9fafb', borderRadius: '8px',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>💬</div>
                <p style={{ margin: 0, fontSize: '16px', color: '#78716c' }}>Reviews coming soon</p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#c4b5fd', lineHeight: '1.5' }}>
                  Be the first to share your experience at this property
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Booking card */}
            <div style={{ ...CARD, border: '2px solid #FFE8D6', position: 'sticky', top: '72px' }}>
              {price && (
                <div style={{ fontSize: '26px', fontWeight: '700', color: '#2D6A4F', marginBottom: '16px' }}>
                  {price}
                </div>
              )}
              <a
                href={bookingUrl ?? undefined}
                target={bookingUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  display: 'block', width: '100%', padding: '14px',
                  background: bookingUrl ? '#FF6B6B' : '#e5e7eb',
                  color: bookingUrl ? 'white' : '#9ca3af',
                  borderRadius: '10px', textAlign: 'center',
                  fontWeight: '700', fontSize: '16px', textDecoration: 'none',
                  boxSizing: 'border-box',
                  cursor: bookingUrl ? 'pointer' : 'default',
                  pointerEvents: bookingUrl ? 'auto' : 'none',
                  boxShadow: bookingUrl ? '0 4px 14px rgba(255,107,107,0.28)' : 'none',
                }}
              >
                {bookingUrl ? 'Book Now →' : 'Booking Not Available'}
              </a>

              {zone?.safety_score != null && (
                <div style={{
                  marginTop: '12px', padding: '10px 14px',
                  background: ss.bg, borderRadius: '8px',
                  fontSize: '13px', color: ss.text, fontWeight: '600', textAlign: 'center',
                }}>
                  ✓ Safety Score {Number(zone.safety_score).toFixed(1)}/10 · {safeLabel}
                </div>
              )}

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                <Link href={`/map?city=${cityId}`} style={{
                  display: 'block', textAlign: 'center',
                  fontSize: '13px', color: '#9ca3af', textDecoration: 'none',
                }}>
                  View all safe stays in {city?.name ?? 'this city'} →
                </Link>
              </div>
            </div>

            {/* Safety Score Breakdown */}
            {zone && (
              <section style={CARD}>
                <h2 style={H2}>Safety Score Breakdown</h2>

                {zone.safety_score != null && (
                  <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                    <div style={{ fontSize: '52px', fontWeight: '700', color: ss.fill, lineHeight: 1 }}>
                      {Number(zone.safety_score).toFixed(1)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>out of 10</div>
                  </div>
                )}

                <ScoreBar label="Crime Safety"  score={zone.crime_score}       weight="40%" color="#2D6A4F" />
                <ScoreBar label="Reviews"       score={zone.reviews_score}     weight="30%" color="#4A90D9" />
                <ScoreBar label="Walkability"   score={zone.walkability_score} weight="20%" color="#F4A261" />
                <ScoreBar label="Time of Day"   score={zone.time_modifier}     weight="10%" color="#9B59B6" />

                <p style={{
                  fontSize: '11px', color: '#d1d5db', margin: '16px 0 0',
                  textAlign: 'center', lineHeight: '1.5',
                }}>
                  Based on public safety data, traveler reviews &amp; local reports
                </p>
              </section>
            )}
          </div>
        </div>

        {/* ── Nearby Properties ── */}
        {nearbyProperties.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2B2D42', margin: '0 0 16px' }}>
              Other Safe Properties Nearby
            </h2>
            <div className="hss-nearby-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {nearbyProperties.map((p) => <NearbyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 767px) {
          .hss-detail-grid  { grid-template-columns: 1fr !important; }
          .hss-nearby-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .hss-nearby-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
