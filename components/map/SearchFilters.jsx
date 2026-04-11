'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce, getFilterCounts, DEFAULT_FILTERS, hasActiveFilters } from '@/lib/searchUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAFETY_OPTIONS = [
  { value: 'safe',    label: 'Safe',    sub: '7–10', color: '#2D6A4F', bg: '#e8f5e9' },
  { value: 'caution', label: 'Caution', sub: '4–6',  color: '#E86B3B', bg: '#FFF3E0' },
  { value: 'avoid',   label: 'Avoid',   sub: '1–3',  color: '#E63946', bg: '#FFEBEE' },
];

const TYPE_OPTIONS = [
  { value: 'hotel',      label: 'Hotels',       color: '#FF6B6B' },
  { value: 'hostel',     label: 'Hostels',       color: '#4A90D9' },
  { value: 'apartment',  label: 'Apartments',    color: '#2D6A4F' },
  { value: 'guesthouse', label: 'Guesthouses',   color: '#F4A261' },
];

const SORT_OPTIONS = [
  { value: 'safety-desc', label: 'Safety Score (High → Low)' },
  { value: 'price-asc',   label: 'Price (Low → High)'        },
  { value: 'price-desc',  label: 'Price (High → Low)'        },
  { value: 'rating-desc', label: "Women's Rating (High → Low)" },
  { value: 'name-asc',    label: 'Name (A – Z)'              },
];

// ─── Dual-range price slider ──────────────────────────────────────────────────

function PriceRangeSlider({ minVal, maxVal, onChange }) {
  const MIN = 0;
  const MAX = 500;
  const pctMin = (minVal / MAX) * 100;
  const pctMax = (maxVal / MAX) * 100;

  const handleMinChange = useCallback((e) => {
    const v = Math.min(Number(e.target.value), maxVal - 20);
    onChange([v, maxVal]);
  }, [maxVal, onChange]);

  const handleMaxChange = useCallback((e) => {
    const v = Math.max(Number(e.target.value), minVal + 20);
    onChange([minVal, v]);
  }, [minVal, onChange]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#57534e', marginBottom: '8px' }}>
        <span style={{ fontWeight: '600' }}>${minVal}</span>
        <span style={{ fontWeight: '600' }}>{maxVal >= MAX ? '$500+ / night' : `$${maxVal} / night`}</span>
      </div>
      <div style={{ position: 'relative', height: '20px', margin: '0 2px' }}>
        {/* Base track */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#e5e7eb', borderRadius: 2, transform: 'translateY(-50%)' }} />
        {/* Active track */}
        <div style={{ position: 'absolute', top: '50%', left: `${pctMin}%`, width: `${pctMax - pctMin}%`, height: 3, background: '#FF6B6B', borderRadius: 2, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        {/* Min input */}
        <input
          type="range" min={MIN} max={MAX} step={10} value={minVal}
          onChange={handleMinChange}
          className="hss-price-range"
          style={{ position: 'absolute', width: '100%', pointerEvents: 'none', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: '100%', top: 0, left: 0, margin: 0, padding: 0, cursor: 'pointer' }}
        />
        {/* Max input */}
        <input
          type="range" min={MIN} max={MAX} step={10} value={maxVal}
          onChange={handleMaxChange}
          className="hss-price-range"
          style={{ position: 'absolute', width: '100%', pointerEvents: 'none', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: '100%', top: 0, left: 0, margin: 0, padding: 0, cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
      {children}
    </div>
  );
}

// ─── Main panel content ───────────────────────────────────────────────────────

function FilterPanelContent({
  properties, filteredCount, filters, onFiltersChange,
  searchQuery, onSearchChange, onClose,
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useRef(debounce(onSearchChange, 300)).current;

  // Sync local search if parent resets it
  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

  const handleSearchInput = (e) => {
    setLocalSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  const { safetyCounts, typeCounts } = getFilterCounts(properties);

  const toggleSafety = (level) => {
    const cur = filters.safetyLevels;
    const next = cur.includes(level) ? cur.filter(l => l !== level) : [...cur, level];
    if (next.length === 0) return;
    onFiltersChange({ ...filters, safetyLevels: next });
  };

  const toggleType = (type) => {
    const cur = filters.propertyTypes;
    const next = cur.includes(type) ? cur.filter(t => t !== type) : [...cur, type];
    if (next.length === 0) return;
    onFiltersChange({ ...filters, propertyTypes: next });
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_FILTERS);
    setLocalSearch('');
    onSearchChange('');
  };

  // Active chips
  const chips = [];
  const missingLevels = DEFAULT_FILTERS.safetyLevels.filter(l => !filters.safetyLevels.includes(l));
  missingLevels.forEach(l => {
    chips.push({
      key: `safety-${l}`,
      label: `No ${l.charAt(0).toUpperCase() + l.slice(1)}`,
      onRemove: () => onFiltersChange({ ...filters, safetyLevels: [...filters.safetyLevels, l] }),
    });
  });
  if (filters.propertyTypes.length !== DEFAULT_FILTERS.propertyTypes.length) {
    const typeMap = { hotel: 'Hotels', hostel: 'Hostels', apartment: 'Apts', guesthouse: 'GH' };
    chips.push({
      key: 'types',
      label: filters.propertyTypes.map(t => typeMap[t]).join(', '),
      onRemove: () => onFiltersChange({ ...filters, propertyTypes: DEFAULT_FILTERS.propertyTypes }),
    });
  }
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
    chips.push({
      key: 'price',
      label: `$${filters.priceRange[0]}–${filters.priceRange[1] >= 500 ? '500+' : '$' + filters.priceRange[1]}`,
      onRemove: () => onFiltersChange({ ...filters, priceRange: [0, 500] }),
    });
  }
  if (filters.sortBy !== 'safety-desc') {
    const sl = { 'price-asc': 'Price ↑', 'price-desc': 'Price ↓', 'rating-desc': 'Rating ↓', 'name-asc': 'A–Z' };
    chips.push({
      key: 'sort',
      label: sl[filters.sortBy] ?? filters.sortBy,
      onRemove: () => onFiltersChange({ ...filters, sortBy: 'safety-desc' }),
    });
  }
  const anyActive = hasActiveFilters(filters, searchQuery);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-crimson-pro, Georgia, serif)' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#2B2D42' }}>
          Search & Filters
        </span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af', lineHeight: 1, padding: '2px 4px' }} aria-label="Close filters">
            ×
          </button>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingRight: '2px' }}>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none', color: '#9ca3af' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search properties, zones…"
            value={localSearch}
            onChange={handleSearchInput}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 32px 8px 32px',
              border: '1.5px solid #FFE8D6', borderRadius: '8px',
              fontSize: '13px', color: '#2B2D42', background: '#FFFAF7',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          {localSearch && (
            <button
              onClick={handleSearchClear}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9ca3af', padding: '0 2px', lineHeight: 1 }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Results count */}
        <div style={{ fontSize: '12px', color: filteredCount === 0 ? '#E63946' : '#2D6A4F', fontWeight: '600', marginBottom: '14px', padding: '6px 10px', background: filteredCount === 0 ? '#FFEBEE' : '#e8f5e9', borderRadius: '6px' }}>
          {filteredCount === 0
            ? 'No properties match'
            : `Showing ${filteredCount} propert${filteredCount === 1 ? 'y' : 'ies'}`}
        </div>

        {/* ── Safety Level ── */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Safety Level</SectionLabel>
          {SAFETY_OPTIONS.map(({ value, label, sub, color, bg }) => {
            const checked = filters.safetyLevels.includes(value);
            const count = safetyCounts[value] ?? 0;
            return (
              <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px 0', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSafety(value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${checked ? color : '#d1d5db'}`,
                  background: checked ? color : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {checked && <span style={{ color: 'white', fontSize: '10px', fontWeight: '700', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: '13px', color: checked ? '#2B2D42' : '#9ca3af', flex: 1, transition: 'color 0.15s' }}>
                  {label}
                  <span style={{ fontSize: '11px', color: checked ? color : '#d1d5db', marginLeft: '4px' }}>{sub}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f5f5f4', borderRadius: '999px', padding: '1px 7px', minWidth: '22px', textAlign: 'center' }}>
                  {count}
                </span>
              </label>
            );
          })}
        </div>

        {/* ── Property Type ── */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Property Type</SectionLabel>
          {TYPE_OPTIONS.map(({ value, label, color }) => {
            const checked = filters.propertyTypes.includes(value);
            const count = typeCounts[value] ?? 0;
            return (
              <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px 0', userSelect: 'none' }}>
                <input type="checkbox" checked={checked} onChange={() => toggleType(value)} style={{ display: 'none' }} />
                <div style={{
                  width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${checked ? color : '#d1d5db'}`,
                  background: checked ? color : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {checked && <span style={{ color: 'white', fontSize: '10px', fontWeight: '700', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: '13px', color: checked ? '#2B2D42' : '#9ca3af', flex: 1 }}>{label}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f5f5f4', borderRadius: '999px', padding: '1px 7px', minWidth: '22px', textAlign: 'center' }}>
                  {count}
                </span>
              </label>
            );
          })}
        </div>

        {/* ── Price Range ── */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Price / Night</SectionLabel>
          <PriceRangeSlider
            minVal={filters.priceRange[0]}
            maxVal={filters.priceRange[1]}
            onChange={(range) => onFiltersChange({ ...filters, priceRange: range })}
          />
        </div>

        {/* ── Sort ── */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Sort By</SectionLabel>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            style={{
              width: '100%', padding: '7px 10px',
              border: '1.5px solid #FFE8D6', borderRadius: '8px',
              fontSize: '12px', color: '#2B2D42', background: '#FFFAF7',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ── Active chips ── */}
        {chips.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <SectionLabel>Active Filters</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {chips.map(chip => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', borderRadius: '999px',
                    background: '#FF6B6B', color: 'white',
                    border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: '600', fontFamily: 'inherit',
                    lineHeight: 1.4,
                  }}
                >
                  {chip.label} ×
                </button>
              ))}
            </div>
          </div>
        )}

      </div>{/* end scrollable body */}

      {/* ── Footer ── */}
      {anyActive && (
        <div style={{ flexShrink: 0, paddingTop: '10px', borderTop: '1px solid #FFE8D6', marginTop: '6px' }}>
          <button
            onClick={handleClearAll}
            style={{
              width: '100%', padding: '8px',
              border: '1.5px solid #FFE8D6', borderRadius: '8px',
              background: 'white', color: '#78716c',
              fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function SearchFilters({
  properties,
  filteredCount,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}) {
  const [collapsed, setCollapsed]   = useState(false);  // desktop panel collapsed
  const [mobileOpen, setMobileOpen] = useState(false);  // mobile modal open
  const activeChipCount = [
    ...DEFAULT_FILTERS.safetyLevels.filter(l => !filters.safetyLevels.includes(l)),
    filters.propertyTypes.length !== DEFAULT_FILTERS.propertyTypes.length ? 1 : 0,
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) ? 1 : 0,
    filters.sortBy !== 'safety-desc' ? 1 : 0,
  ].filter(Boolean).length + (searchQuery ? 1 : 0);

  const panelProps = { properties, filteredCount, filters, onFiltersChange, searchQuery, onSearchChange };

  return (
    <>
      {/* ════════════════════════════════
          DESKTOP PANEL (left overlay)
          Hidden on mobile via CSS class
      ════════════════════════════════ */}
      {!collapsed ? (
        <div
          className="hss-filter-panel"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            bottom: '12px',
            width: '252px',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.06)',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 14px 14px 14px',
            overflow: 'hidden',
          }}
        >
          <FilterPanelContent
            {...panelProps}
            onClose={() => setCollapsed(true)}
          />
        </div>
      ) : (
        /* ── Collapsed desktop toggle ── */
        <button
          className="hss-filter-panel"
          onClick={() => setCollapsed(false)}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 15,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #FFE8D6',
            borderRadius: '10px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            color: '#2B2D42',
            fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          🔍 Filters
          {activeChipCount > 0 && (
            <span style={{ background: '#FF6B6B', color: 'white', borderRadius: '999px', fontSize: '10px', fontWeight: '700', padding: '1px 6px', lineHeight: 1.6 }}>
              {activeChipCount}
            </span>
          )}
        </button>
      )}

      {/* ════════════════════════════════
          MOBILE FAB (bottom-right)
          Hidden on desktop via CSS class
      ════════════════════════════════ */}
      <button
        className="hss-filter-fab"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'absolute',
          bottom: '72px',
          right: '16px',
          zIndex: 15,
          background: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '28px',
          padding: '10px 18px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 16px rgba(255,107,107,0.4)',
        }}
      >
        🔍 Filters
        {activeChipCount > 0 && (
          <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', fontSize: '11px', fontWeight: '700', padding: '1px 7px', lineHeight: 1.6 }}>
            {activeChipCount}
          </span>
        )}
      </button>

      {/* ════════════════════════════════
          MOBILE MODAL
      ════════════════════════════════ */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div
            style={{
              width: '100%',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              // No padding here — padding lives in children so flex heights resolve correctly
            }}
          >
            {/* Drag handle — fixed at top */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '14px 20px 6px' }}>
              <div style={{ width: '40px', height: '4px', background: '#e5e7eb', borderRadius: '2px' }} />
            </div>

            {/* Content wrapper: flex:1 + minHeight:0 lets FilterPanelContent scroll */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 20px 28px' }}>
              <FilterPanelContent
                {...panelProps}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── CSS: show/hide based on viewport ── */}
      <style>{`
        /* Desktop: show panel, hide FAB */
        .hss-filter-fab { display: none !important; }

        /* Mobile: hide panel, show FAB */
        @media (max-width: 767px) {
          .hss-filter-panel { display: none !important; }
          .hss-filter-fab   { display: flex !important; }
        }

        /* Dual-range price slider thumb styles */
        .hss-price-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FF6B6B;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
          margin-top: -7px;
        }
        .hss-price-range::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
        }
        .hss-price-range::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FF6B6B;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        .hss-price-range::-moz-range-track { background: transparent; height: 4px; }

        /* Filter panel scrollbar */
        .hss-filter-panel ::-webkit-scrollbar { width: 4px; }
        .hss-filter-panel ::-webkit-scrollbar-track { background: transparent; }
        .hss-filter-panel ::-webkit-scrollbar-thumb { background: #FFE8D6; border-radius: 2px; }
      `}</style>
    </>
  );
}
