'use client';

import { useEffect, useRef, useCallback, memo, useState } from 'react';
import Link from 'next/link';

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_LABELS = {
  'safety-desc':  'Safety Score',
  'price-asc':    'Price: Low→High',
  'price-desc':   'Price: High→Low',
  'rating-desc':  "Women's Rating",
  'name-asc':     'Name A→Z',
};

const SORT_ARROWS = {
  'safety-desc': '↓',
  'price-asc':   '↑',
  'price-desc':  '↓',
  'rating-desc': '↓',
  'name-asc':    '↑',
};

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
  safe:    { bg: 'rgba(45,106,79,0.08)',  text: '#1B4332', border: 'rgba(45,106,79,0.2)'  },
  caution: { bg: 'rgba(244,162,97,0.10)', text: '#9A3412', border: 'rgba(244,162,97,0.3)' },
  avoid:   { bg: 'rgba(230,57,70,0.08)',  text: '#9B1C1C', border: 'rgba(230,57,70,0.2)'  },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard({ index }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '13px',
      marginBottom: '10px',
      display: 'flex',
      gap: '12px',
    }}>
      <div
        className="hss-shimmer"
        style={{ width: '60px', height: '60px', borderRadius: '6px', flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="hss-shimmer" style={{ height: '14px', width: '85%', borderRadius: '4px' }} />
        <div className="hss-shimmer" style={{ height: '12px', width: '55%', borderRadius: '4px' }} />
        <div className="hss-shimmer" style={{ height: '11px', width: '40%', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────

const PropertyCard = memo(function PropertyCard({
  property,
  isSelected,
  isHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
}) {
  const [localHover, setLocalHover] = useState(false);

  const typeColor = TYPE_COLORS[property.property_type] ?? '#FF6B6B';
  const safetyLevel = property.zone?.safety_level ?? 'safe';
  const ss = SAFETY_STYLE[safetyLevel] ?? SAFETY_STYLE.safe;
  const elevated = localHover || isHovered;

  const renderStars = (r) => {
    if (!r) return null;
    const n = Number(r);
    const full = Math.floor(n);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const renderPrice = (p, cur) => {
    if (!p) return null;
    const sym = cur === 'EUR' ? '€' : cur === 'THB' ? '฿' : '$';
    return `${sym}${Math.round(p)}`;
  };

  return (
    <div
      data-property-id={property.id}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(property)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(property)}
      onMouseEnter={() => { setLocalHover(true); onHoverStart?.(property.id); }}
      onMouseLeave={() => { setLocalHover(false); onHoverEnd?.(); }}
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '13px',
        marginBottom: '10px',
        border: isSelected
          ? '2.5px solid #FF6B6B'
          : `2.5px solid ${isHovered ? 'rgba(255,107,107,0.35)' : 'transparent'}`,
        boxShadow: isSelected
          ? '0 4px 16px rgba(255,107,107,0.18)'
          : elevated
            ? '0 4px 14px rgba(0,0,0,0.11)'
            : '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        display: 'flex',
        gap: '12px',
        transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.12s',
        transform: elevated && !isSelected ? 'translateY(-1px)' : 'none',
        outline: 'none',
        userSelect: 'none',
      }}
    >
      {/* ── Image placeholder / type icon ── */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '6px',
        background: `linear-gradient(135deg, ${typeColor}18, ${typeColor}30)`,
        border: `1.5px solid ${typeColor}28`,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
      }}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>
          {TYPE_EMOJI[property.property_type] ?? '🏨'}
        </span>
        <span style={{ fontSize: '8px', fontWeight: '700', color: typeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {property.property_type}
        </span>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Name + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '5px' }}>
          <div style={{
            fontWeight: '700',
            fontSize: '13px',
            color: '#2B2D42',
            lineHeight: '1.35',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            flex: 1,
          }}>
            {property.name}
          </div>
          {property.price_per_night && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#2D6A4F' }}>
                {renderPrice(property.price_per_night, property.currency)}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>/night</div>
            </div>
          )}
        </div>

        {/* Stars + zone badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
          {property.women_rating && (
            <span style={{ fontSize: '11px', color: '#F4A261', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              {renderStars(property.women_rating)}
              <span style={{ fontSize: '10px', color: '#78716c', marginLeft: '2px' }}>
                {Number(property.women_rating).toFixed(1)}
              </span>
            </span>
          )}
          {property.zone?.zone_name && (
            <span style={{
              fontSize: '10px',
              color: ss.text,
              background: ss.bg,
              border: `1px solid ${ss.border}`,
              padding: '1px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}>
              📍 {property.zone.zone_name}
            </span>
          )}
        </div>

        {/* First 2 safety features */}
        {property.safety_features?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {property.safety_features.slice(0, 2).map((f, i) => (
              <span key={i} style={{
                fontSize: '10px',
                color: '#57534e',
                background: '#F5F5F4',
                padding: '1px 5px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}>
                {f}
              </span>
            ))}
            {property.safety_features.length > 2 && (
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                +{property.safety_features.length - 2}
              </span>
            )}
          </div>
        )}

        {/* View Details link — stopPropagation so card click still selects on map */}
        <Link
          href={`/property/${property.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-block',
            marginTop: '7px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#FF6B6B',
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClearFilters }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
      <div style={{ fontWeight: '700', fontSize: '15px', color: '#2B2D42', marginBottom: '6px' }}>
        No properties found
      </div>
      <p style={{ fontSize: '13px', color: '#78716c', margin: '0 0 16px', lineHeight: '1.5' }}>
        Try adjusting your filters<br />using the panel on the map.
      </p>
      <button
        onClick={onClearFilters}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          background: '#FF6B6B',
          color: 'white',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Clear All Filters
      </button>
    </div>
  );
}

// ─── Main PropertyList ────────────────────────────────────────────────────────

export default function PropertyList({
  properties = [],
  totalCount = 0,
  selectedProperty = null,
  hoveredPropertyId = null,
  onPropertySelect,
  onPropertyHover,
  sortBy = 'safety-desc',
  loading = false,
  onClearFilters,
}) {
  const listRef = useRef(null);

  // Stable hover-end callback (avoids PropertyCard re-renders on every PropertyList render)
  const handleHoverEnd = useCallback(() => onPropertyHover?.(null), [onPropertyHover]);

  // Scroll the selected card into view when selection arrives from map (not list click)
  useEffect(() => {
    if (!selectedProperty || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-property-id="${selectedProperty.id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedProperty?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F7F6F5' }}>

      {/* ── Header: count + sort indicator ── */}
      <div style={{
        padding: '11px 14px',
        background: 'white',
        borderBottom: '1px solid #FFE8D6',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '14px', color: '#2B2D42' }}>
            {loading ? (
              <span style={{ fontWeight: '400', color: '#9ca3af' }}>Loading…</span>
            ) : (
              <>
                {properties.length}
                {totalCount > properties.length && (
                  <span style={{ fontWeight: '400', color: '#9ca3af', fontSize: '12px' }}> of {totalCount}</span>
                )}{' '}
                <span style={{ fontWeight: '400', color: '#78716c', fontSize: '13px' }}>properties</span>
              </>
            )}
          </span>

          {!loading && sortBy && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              background: '#F7F6F5',
              border: '1px solid #FFE8D6',
              borderRadius: '6px',
              padding: '3px 8px',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#9ca3af' }}>by</span>
              <span style={{ fontWeight: '600', color: '#2D6A4F' }}>
                {SORT_LABELS[sortBy] ?? sortBy}
              </span>
              <span style={{ fontWeight: '700', color: '#2D6A4F' }}>
                {SORT_ARROWS[sortBy] ?? ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable card list ── */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} index={i} />)
        ) : properties.length === 0 ? (
          <EmptyState onClearFilters={onClearFilters} />
        ) : (
          properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isSelected={selectedProperty?.id === p.id}
              isHovered={hoveredPropertyId === p.id}
              onSelect={onPropertySelect}
              onHoverStart={onPropertyHover}
              onHoverEnd={handleHoverEnd}
            />
          ))
        )}
      </div>

      {/* ── Shimmer animation ── */}
      <style>{`
        .hss-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: hss-list-shimmer 1.4s infinite;
        }
        @keyframes hss-list-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
