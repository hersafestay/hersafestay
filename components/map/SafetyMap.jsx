'use client';

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { GoogleMap, Polygon, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { getSafetyZones, getPropertiesForCity } from '@/lib/database';
import {
  geoJsonToGooglePath,
  shrinkPolygon,
  getSafetyColors,
  formatSafetyScore,
  getPropertyMarkerIcon,
  formatPrice,
  formatWomenRating,
} from '@/lib/mapUtils';
import { MAP_STYLES } from '@/lib/mapStyles';
import SearchFilters from '@/components/map/SearchFilters';
import { filterProperties, sortProperties, DEFAULT_FILTERS } from '@/lib/searchUtils';

// ─── City configuration ─────────────────────────────────────────────────────

export const CITY_CONFIGS = {
  barcelona: { center: { lat: 41.3851, lng: 2.1734   }, zoom: 13 },
  paris:     { center: { lat: 48.8566, lng: 2.3522   }, zoom: 13 },
  bangkok:   { center: { lat: 13.7563, lng: 100.5018 }, zoom: 13 },
};

// ─── Constants ───────────────────────────────────────────────────────────────

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

// ─── Zone Polygon (memoized to prevent flicker — SOLUTION-002) ───────────────

const ZonePolygon = memo(function ZonePolygon({ zone, isSelected, onSelect }) {
  const { fillColor, strokeColor } = getSafetyColors(zone.safety_level);

  // Shrink polygon ~20 m toward centroid → visual gap between adjacent zones (SOLUTION-027)
  const paths = useMemo(
    () => shrinkPolygon(geoJsonToGooglePath(zone.geojson_geometry)),
    [zone.geojson_geometry]
  );

  const options = useMemo(
    () => ({
      fillColor,
      fillOpacity: isSelected ? 0.40 : 0.12,  // 0.12 = barely tints; keeps map readable
      strokeColor,
      strokeWeight: isSelected ? 3.5 : 3,      // 3 px solid border = clear zone boundaries
      strokeOpacity: 1,
      clickable: true,
      zIndex: isSelected ? 10 : 1,
    }),
    [fillColor, strokeColor, isSelected]
  );

  const handleClick = useCallback(() => onSelect(zone), [zone, onSelect]);

  if (!paths.length) return null;
  return <Polygon paths={paths} options={options} onClick={handleClick} />;
});

// ─── Property Marker (memoized) ──────────────────────────────────────────────

const PropertyMarker = memo(function PropertyMarker({
  property,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) {
  const icon = useMemo(() => {
    if (typeof window === 'undefined' || !window.google?.maps) return null;
    return getPropertyMarkerIcon(property.property_type, isSelected, isHovered);
  }, [property.property_type, isSelected, isHovered]);

  const handleClick    = useCallback((e) => { if (e?.stop) e.stop(); onSelect(property); }, [property, onSelect]);
  const handleMouseOver = useCallback(() => onHover?.(property.id),  [property.id, onHover]);
  const handleMouseOut  = useCallback(() => onHover?.(null),         [onHover]);

  if (!property.lat || !property.lng) return null;

  return (
    <Marker
      position={{ lat: Number(property.lat), lng: Number(property.lng) }}
      icon={icon}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      zIndex={isSelected ? 100 : isHovered ? 75 : 50}
    />
  );
});

// ─── Zone Count Badge ─────────────────────────────────────────────────────────

const ZoneCountBadge = memo(function ZoneCountBadge({ zone, count }) {
  const { fillColor } = getSafetyColors(zone.safety_level);

  const icon = useMemo(() => {
    if (typeof window === 'undefined' || !window.google?.maps) return null;
    const size = count >= 10 ? 36 : 30;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${fillColor}" stroke="white" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 4.5}" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="${count >= 10 ? 13 : 14}" fill="white">${count}</text>
    </svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size / 2, size / 2),
    };
  }, [fillColor, count]);

  if (!zone.centroid_lat || !zone.centroid_lng || !icon) return null;

  return (
    <Marker
      position={{ lat: zone.centroid_lat, lng: zone.centroid_lng }}
      icon={icon}
      zIndex={5}
      clickable={false}
    />
  );
});

// ─── Zone InfoWindow content ──────────────────────────────────────────────────

function ZoneInfoContent({ zone }) {
  const { fillColor, label } = getSafetyColors(zone.safety_level);

  return (
    <div style={{ padding: '4px', maxWidth: '280px', fontFamily: 'Georgia, serif', minWidth: '220px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#2B2D42', lineHeight: '1.2' }}>
          {zone.zone_name}
        </h3>
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', background: fillColor, color: 'white', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <span style={{ fontSize: '28px', fontWeight: '700', color: fillColor, lineHeight: '1' }}>
          {formatSafetyScore(zone.safety_score)}
        </span>
        <span style={{ fontSize: '12px', color: '#78716c', marginLeft: '4px' }}>safety score</span>
      </div>

      {zone.description && (
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#57534e', lineHeight: '1.5' }}>
          {zone.description}
        </p>
      )}

      {(zone.crime_score || zone.reviews_score || zone.walkability_score) && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Score Breakdown
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {[
                { label: 'Crime',       score: zone.crime_score,       weight: '40%' },
                { label: 'Reviews',     score: zone.reviews_score,     weight: '30%' },
                { label: 'Walkability', score: zone.walkability_score, weight: '20%' },
                { label: 'Time Factor', score: zone.time_modifier,     weight: '10%' },
              ].map(({ label, score, weight }) =>
                score != null ? (
                  <tr key={label}>
                    <td style={{ padding: '2px 0', color: '#78716c' }}>{label}</td>
                    <td style={{ padding: '2px 0', color: '#9ca3af', fontSize: '11px' }}>{weight}</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: '600', color: '#2B2D42' }}>
                      {Number(score).toFixed(1)}
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      )}

      {zone.tips?.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Safety Tips
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: '#57534e', lineHeight: '1.6' }}>
            {zone.tips.map((tip, i) => <li key={i} style={{ marginBottom: '2px' }}>{tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Property InfoWindow content ──────────────────────────────────────────────

function PropertyInfoContent({ property }) {
  const TYPE_COLORS = { hotel: '#FF6B6B', hostel: '#4A90D9', apartment: '#2D6A4F', guesthouse: '#F4A261' };
  const typeColor = TYPE_COLORS[property.property_type] ?? '#FF6B6B';

  return (
    <div style={{ padding: '4px', maxWidth: '280px', fontFamily: 'Georgia, serif', minWidth: '220px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2B2D42', lineHeight: '1.3', flex: 1 }}>
          {property.name}
        </h3>
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', background: typeColor, color: 'white', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
          {property.property_type}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '13px', flexWrap: 'wrap' }}>
        {property.women_rating && (
          <div>
            <span style={{ fontWeight: '700', color: '#2B2D42' }}>{Number(property.women_rating).toFixed(1)}★</span>
            <span style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '3px' }}>women's</span>
          </div>
        )}
        {property.price_per_night && (
          <div>
            <span style={{ fontWeight: '700', color: '#2D6A4F' }}>
              {formatPrice(property.price_per_night, property.currency)}
            </span>
          </div>
        )}
      </div>

      {property.zone?.zone_name && (
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#78716c', background: '#f5f5f4', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
            📍 {property.zone.zone_name}
          </span>
        </div>
      )}

      {property.description && (
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#57534e', lineHeight: '1.5' }}>
          {property.description.split('.')[0]}.
        </p>
      )}

      {property.safety_features?.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
            Safety Features
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '12px', color: '#57534e', lineHeight: '1.6' }}>
            {property.safety_features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Map Legend ──────────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(8px)',
      borderRadius: '10px',
      padding: '14px 16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
      zIndex: 10,
      minWidth: '150px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Safety Level
      </div>
      {[
        { color: '#2D6A4F', label: 'Safe',          sub: 'Score 7–10' },
        { color: '#F4A261', label: 'Caution',        sub: 'Score 4–6'  },
        { color: '#E63946', label: 'Avoid at Night', sub: 'Score 1–3'  },
      ].map(({ color, label, sub }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: color, flexShrink: 0, opacity: 0.85 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#2B2D42', lineHeight: '1' }}>{label}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{sub}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: '10px', color: '#c4b5fd', marginTop: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
        Click zones or pins for details
      </div>
    </div>
  );
}

// ─── Loading / Error States ──────────────────────────────────────────────────

function MapLoadingState({ message }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FFF8F0, #FFF4E8, #F0FBF9)', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #FFE8D6', borderTopColor: '#FF6B6B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#78716c', fontSize: '15px', margin: 0 }}>{message || 'Loading map…'}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MapErrorState({ message }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FFF8F0, #FFF4E8)', gap: '12px', padding: '24px' }}>
      <div style={{ fontSize: '32px' }}>⚠️</div>
      <p style={{ color: '#e63946', fontSize: '15px', textAlign: 'center', margin: 0, maxWidth: '320px' }}>
        {message || 'Failed to load map. Please refresh the page.'}
      </p>
    </div>
  );
}

// ─── Main SafetyMap Component ────────────────────────────────────────────────

export default function SafetyMap({
  cityId = 'barcelona',

  // Controlled selection — lifted to MapPageClient for list ↔ map sync
  selectedProperty = null,
  onPropertySelect = null,

  // Hover state — driven by PropertyList card hover
  hoveredPropertyId = null,
  onPropertyHover = null,

  // Callbacks so MapPageClient can update PropertyList
  onFilteredPropertiesChange = null,
  onMapReady = null,
  onLoadingChange = null,

  // Increment to trigger filter reset from PropertyList empty state button
  clearFiltersSignal = 0,
}) {
  const mapRef = useRef(null);
  const [zones,      setZones]      = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Zone InfoWindow stays local — PropertyList doesn't need zone selection
  const [selectedZone, setSelectedZone] = useState(null);

  // Search + filter state (persisted to localStorage)
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_FILTERS;
    try {
      const saved = localStorage.getItem('hersafestay_filters');
      return saved ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) } : DEFAULT_FILTERS;
    } catch { return DEFAULT_FILTERS; }
  });

  // Persist filters to localStorage
  useEffect(() => {
    try { localStorage.setItem('hersafestay_filters', JSON.stringify(filters)); } catch {}
  }, [filters]);

  // Reset filters when parent signals (from PropertyList "Clear All Filters" button)
  useEffect(() => {
    if (clearFiltersSignal === 0) return;
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, [clearFiltersSignal]);

  // Filtered + sorted properties (memoized — OPT-017)
  const filteredProperties = useMemo(
    () => sortProperties(filterProperties(properties, filters, searchQuery), filters.sortBy),
    [properties, filters, searchQuery]
  );

  // Count of filtered properties per zone (drives ZoneCountBadge)
  const zonePropertyCounts = useMemo(() => {
    const counts = {};
    filteredProperties.forEach((p) => {
      if (p.zone_id) counts[p.zone_id] = (counts[p.zone_id] || 0) + 1;
    });
    return counts;
  }, [filteredProperties]);

  // Notify parent when filtered list changes → PropertyList updates
  useEffect(() => {
    onFilteredPropertiesChange?.(filteredProperties, properties.length, filters.sortBy);
  }, [filteredProperties, onFilteredPropertiesChange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent when loading state changes → PropertyList shows skeletons
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Load Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    id: 'google-maps-script',
  });

  // Store map instance + notify parent (for list-triggered panning)
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    onMapReady?.(map);
  }, [onMapReady]);

  // Fetch zones + properties whenever city changes
  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedZone(null);
    onPropertySelect?.(null); // clear parent's selection on city change

    Promise.all([
      getSafetyZones(cityId),
      getPropertiesForCity(cityId),
    ]).then(([zonesRes, propsRes]) => {
      if (cancelled) return;
      if (zonesRes.error) {
        setError(zonesRes.error.message || 'Failed to load safety zones');
      } else {
        setZones(zonesRes.data || []);
      }
      setProperties(propsRes.data || []);
      setLoading(false);
    }).catch((err) => {
      if (!cancelled) { setError(err.message); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, [cityId, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-center + re-zoom when city changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    const config = CITY_CONFIGS[cityId];
    if (!config) return;
    mapRef.current.panTo(config.center);
    mapRef.current.setZoom(config.zoom);
  }, [cityId, isLoaded]);

  // ── Event handlers ──────────────────────────────────────────────────────────

  const handleMapClick = useCallback(() => {
    setSelectedZone(null);
    onPropertySelect?.(null);
  }, [onPropertySelect]);

  const handleZoneSelect = useCallback((zone) => {
    onPropertySelect?.(null); // close property InfoWindow when zone clicked
    setSelectedZone((prev) => (prev?.id === zone?.id ? null : zone));
  }, [onPropertySelect]);

  // Marker click — toggle logic lives in MapPageClient
  const handlePropertySelect = useCallback((property) => {
    setSelectedZone(null);
    onPropertySelect?.(property);
  }, [onPropertySelect]);

  // Pass hover through to parent (which forwards to PropertyList)
  const handlePropertyHover = useCallback((id) => {
    onPropertyHover?.(id);
  }, [onPropertyHover]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadError)  return <MapErrorState  message="Google Maps failed to load. Check your API key." />;
  if (!isLoaded)  return <MapLoadingState message="Loading Google Maps…" />;

  const cityConfig = CITY_CONFIGS[cityId] ?? CITY_CONFIGS.barcelona;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={cityConfig.center}
        zoom={cityConfig.zoom}
        options={MAP_OPTIONS}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        {/* ── Zone polygons (shrunk + low opacity — SOLUTION-027) ── */}
        {zones.map((zone) => (
          <ZonePolygon
            key={zone.id}
            zone={zone}
            isSelected={selectedZone?.id === zone.id}
            onSelect={handleZoneSelect}
          />
        ))}

        {/* ── Zone count badges ── */}
        {!loading && zones.map((zone) => {
          const count = zonePropertyCounts[zone.id] ?? 0;
          if (count === 0) return null;
          return <ZoneCountBadge key={`badge-${zone.id}`} zone={zone} count={count} />;
        })}

        {/* ── Property pins (filtered, hover-aware) ── */}
        {filteredProperties.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            isSelected={selectedProperty?.id === property.id}
            isHovered={hoveredPropertyId === property.id}
            onSelect={handlePropertySelect}
            onHover={handlePropertyHover}
          />
        ))}

        {/* ── Zone InfoWindow ── */}
        {selectedZone && selectedZone.centroid_lat && selectedZone.centroid_lng && (
          <InfoWindow
            position={{ lat: selectedZone.centroid_lat, lng: selectedZone.centroid_lng }}
            onCloseClick={() => setSelectedZone(null)}
            options={{ maxWidth: 300 }}
          >
            <ZoneInfoContent zone={selectedZone} />
          </InfoWindow>
        )}

        {/* ── Property InfoWindow ── */}
        {selectedProperty && selectedProperty.lat && selectedProperty.lng && (
          <InfoWindow
            position={{ lat: Number(selectedProperty.lat), lng: Number(selectedProperty.lng) }}
            onCloseClick={() => onPropertySelect?.(null)}
            options={{ maxWidth: 300 }}
          >
            <PropertyInfoContent property={selectedProperty} />
          </InfoWindow>
        )}
      </GoogleMap>

      {/* ── Legend overlay ── */}
      <MapLegend />

      {/* ── Search + filter panel ── */}
      <SearchFilters
        properties={properties}
        filteredCount={filteredProperties.length}
        filters={filters}
        onFiltersChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── No results overlay ── */}
      {!loading && properties.length > 0 && filteredProperties.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '12px 20px',
          fontSize: '14px',
          color: '#2B2D42',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 20,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>🔍</span>
          <span>No properties match your filters.</span>
          <button
            onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(''); }}
            style={{ marginLeft: '8px', padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#FF6B6B', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── Data loading indicator ── */}
      {loading && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '999px',
          padding: '8px 20px',
          fontSize: '13px',
          color: '#78716c',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}>
          Loading {cityId} safety data…
        </div>
      )}

      {/* ── Error indicator ── */}
      {error && !loading && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#FEF2F2',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          color: '#E63946',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 20,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
