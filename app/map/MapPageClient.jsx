'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CitySelector from '@/components/map/CitySelector';
import PropertyList from '@/components/map/PropertyList';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading: authLoading } = useAuth();

  // ── City ─────────────────────────────────────────────────────────────────────
  const [selectedCity, setSelectedCity] = useState('barcelona');

  // ── Shared selection state (lifted from SafetyMap for list ↔ map sync) ───────
  const [selectedProperty,  setSelectedProperty]  = useState(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  // ── Data received from SafetyMap via callbacks ────────────────────────────────
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [totalCount,         setTotalCount]         = useState(0);
  const [sortBy,             setSortBy]             = useState('safety-desc');
  const [propertiesLoading,  setPropertiesLoading]  = useState(true);

  // ── Signal to SafetyMap to clear all filters ──────────────────────────────────
  const [clearFiltersSignal, setClearFiltersSignal] = useState(0);

  // ── Map instance for programmatic panning ────────────────────────────────────
  const mapRef = useRef(null);

  // ── Stable callbacks ─────────────────────────────────────────────────────────

  /** SafetyMap → MapPageClient: filtered list changed */
  const handleFilteredPropertiesChange = useCallback((filtered, total, sort) => {
    setFilteredProperties(filtered);
    setTotalCount(total);
    setSortBy(sort);
  }, []);

  /** SafetyMap → MapPageClient: loading state changed */
  const handleLoadingChange = useCallback((isLoading) => {
    setPropertiesLoading(isLoading);
  }, []);

  /** SafetyMap → MapPageClient: map instance ready */
  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
  }, []);

  /**
   * Property selected (from either map marker click OR list card click).
   * Toggle: clicking the same property again deselects it.
   * Null: explicit deselect (map background click, InfoWindow close, city change).
   */
  const handlePropertySelect = useCallback((property) => {
    if (property === null) {
      setSelectedProperty(null);
      return;
    }
    setSelectedProperty((prev) => (prev?.id === property?.id ? null : property));
  }, []);

  /** Property hovered (from list card or map marker) */
  const handlePropertyHover = useCallback((id) => {
    setHoveredPropertyId(id ?? null);
  }, []);

  /** PropertyList empty state → tell SafetyMap to reset filters */
  const handleClearFilters = useCallback(() => {
    setClearFiltersSignal((s) => s + 1);
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────────

  // Pan map to selected property (triggered by list card clicks)
  useEffect(() => {
    if (!selectedProperty || !mapRef.current) return;
    mapRef.current.panTo({
      lat: Number(selectedProperty.lat),
      lng: Number(selectedProperty.lng),
    });
  }, [selectedProperty]);

  // Clear selection when city changes
  useEffect(() => {
    setSelectedProperty(null);
    setHoveredPropertyId(null);
  }, [selectedCity]);

  // ── Render ────────────────────────────────────────────────────────────────────

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

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <CitySelector
            currentCity={selectedCity}
            onCityChange={setSelectedCity}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {!authLoading && (user ? (
            <>
              <Link
                href="/profile/saved"
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#2B2D42',
                  textDecoration: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Saved
              </Link>
              <Link
                href="/profile"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2D6A4F, #1a4a36)',
                  whiteSpace: 'nowrap',
                }}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#2B2D42',
                  textDecoration: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FF6B6B, #e85555)',
                  whiteSpace: 'nowrap',
                }}
              >
                Sign Up
              </Link>
            </>
          ))}
        </div>
      </header>

      {/* ── Main content: PropertyList sidebar + Map ── */}
      <main
        className="hss-main-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Property List sidebar (380 px on desktop, full width on mobile) */}
        <div
          className="hss-list-area"
          style={{
            width: '380px',
            flexShrink: 0,
            overflow: 'hidden',
            borderRight: '1px solid #FFE8D6',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PropertyList
            properties={filteredProperties}
            totalCount={totalCount}
            selectedProperty={selectedProperty}
            hoveredPropertyId={hoveredPropertyId}
            onPropertySelect={handlePropertySelect}
            onPropertyHover={handlePropertyHover}
            sortBy={sortBy}
            loading={propertiesLoading}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Map (flex:1 remaining space) */}
        <div
          className="hss-map-area"
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        >
          <SafetyMap
            cityId={selectedCity}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            hoveredPropertyId={hoveredPropertyId}
            onPropertyHover={handlePropertyHover}
            onFilteredPropertiesChange={handleFilteredPropertiesChange}
            onLoadingChange={handleLoadingChange}
            onMapReady={handleMapReady}
            clearFiltersSignal={clearFiltersSignal}
          />
        </div>
      </main>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (min-width: 480px) {
          .header-brand-text { display: inline !important; }
        }
        /* Mobile: map on top (60%), list on bottom (40%) */
        @media (max-width: 767px) {
          .hss-main-content { flex-direction: column !important; }
          .hss-list-area {
            width: 100% !important;
            height: 40% !important;
            border-right: none !important;
            border-top: 1px solid #FFE8D6 !important;
            order: 2;
          }
          .hss-map-area {
            height: 60% !important;
            flex: none !important;
            order: 1;
          }
        }
      `}</style>
    </div>
  );
}
