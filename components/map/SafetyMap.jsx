'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { GoogleMap, Polygon, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { getSafetyZones } from '@/lib/database';
import { geoJsonToGooglePath, getSafetyColors, formatSafetyScore } from '@/lib/mapUtils';
import { MAP_STYLES } from '@/lib/mapStyles';

// ─── Constants ─────────────────────────────────────────────────────────────

const BARCELONA_CENTER = { lat: 41.3851, lng: 2.1734 };
const DEFAULT_ZOOM = 13;

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

// ─── Zone Polygon (memoized) ────────────────────────────────────────────────

const ZonePolygon = memo(function ZonePolygon({ zone, isSelected, onSelect }) {
  const { fillColor, strokeColor } = getSafetyColors(zone.safety_level);

  // Memoize paths — GeoJSON [lng,lat] → { lat, lng }
  const paths = useMemo(
    () => geoJsonToGooglePath(zone.geojson_geometry),
    [zone.geojson_geometry]
  );

  // Memoize options — prevents unnecessary re-renders & polygon flicker
  const options = useMemo(
    () => ({
      fillColor,
      fillOpacity: isSelected ? 0.55 : 0.30,
      strokeColor,
      strokeWeight: isSelected ? 2.5 : 2,
      strokeOpacity: 1,
      clickable: true,
      zIndex: isSelected ? 10 : 1,
    }),
    [fillColor, strokeColor, isSelected]
  );

  const handleClick = useCallback(() => onSelect(zone), [zone, onSelect]);

  if (!paths.length) return null;

  return (
    <Polygon
      paths={paths}
      options={options}
      onClick={handleClick}
    />
  );
});

// ─── InfoWindow Content ─────────────────────────────────────────────────────

function ZoneInfoContent({ zone }) {
  const { fillColor, label } = getSafetyColors(zone.safety_level);

  return (
    // All inline styles — required for Google Maps InfoWindow (SOLUTION-012)
    <div style={{ padding: '4px', maxWidth: '280px', fontFamily: 'Georgia, serif', minWidth: '220px' }}>
      {/* Header: name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#2B2D42', lineHeight: '1.2' }}>
          {zone.zone_name}
        </h3>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '999px',
          background: fillColor,
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
        }}>
          {label}
        </span>
      </div>

      {/* Safety score */}
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <span style={{ fontSize: '28px', fontWeight: '700', color: fillColor, lineHeight: '1' }}>
          {formatSafetyScore(zone.safety_score)}
        </span>
        <span style={{ fontSize: '12px', color: '#78716c', marginLeft: '4px' }}>safety score</span>
      </div>

      {/* Description */}
      {zone.description && (
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#57534e', lineHeight: '1.5' }}>
          {zone.description}
        </p>
      )}

      {/* Score breakdown */}
      {(zone.crime_score || zone.reviews_score || zone.walkability_score) && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Score Breakdown
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {[
                { label: 'Crime', score: zone.crime_score, weight: '40%' },
                { label: 'Reviews', score: zone.reviews_score, weight: '30%' },
                { label: 'Walkability', score: zone.walkability_score, weight: '20%' },
                { label: 'Time Factor', score: zone.time_modifier, weight: '10%' },
              ].map(({ label, score, weight }) => (
                score != null && (
                  <tr key={label}>
                    <td style={{ padding: '2px 0', color: '#78716c' }}>{label}</td>
                    <td style={{ padding: '2px 0', color: '#9ca3af', fontSize: '11px' }}>{weight}</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: '600', color: '#2B2D42' }}>
                      {Number(score).toFixed(1)}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Safety tips */}
      {zone.tips?.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Safety Tips
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: '#57534e', lineHeight: '1.6' }}>
            {zone.tips.map((tip, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Map Legend ─────────────────────────────────────────────────────────────

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
      minWidth: '148px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Safety Level
      </div>
      {[
        { color: '#2D6A4F', label: 'Safe', sub: 'Score 7–10' },
        { color: '#F4A261', label: 'Caution', sub: 'Score 4–6' },
        { color: '#E63946', label: 'Avoid at Night', sub: 'Score 1–3' },
      ].map(({ color, label, sub }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            background: color,
            flexShrink: 0,
            opacity: 0.85,
          }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#2B2D42', lineHeight: '1' }}>{label}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{sub}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: '10px', color: '#c4b5fd', marginTop: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
        Click any zone for details
      </div>
    </div>
  );
}

// ─── Loading / Error States ─────────────────────────────────────────────────

function MapLoadingState({ message }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFF8F0, #FFF4E8, #F0FBF9)',
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
      <p style={{ color: '#78716c', fontSize: '15px', margin: 0 }}>
        {message || 'Loading map…'}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MapErrorState({ message }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFF8F0, #FFF4E8)',
      gap: '12px',
      padding: '24px',
    }}>
      <div style={{ fontSize: '32px' }}>⚠️</div>
      <p style={{ color: '#e63946', fontSize: '15px', textAlign: 'center', margin: 0, maxWidth: '320px' }}>
        {message || 'Failed to load map. Please refresh the page.'}
      </p>
    </div>
  );
}

// ─── Main SafetyMap Component ───────────────────────────────────────────────

export default function SafetyMap({ cityId = 'barcelona' }) {
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // Load Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    // id ensures only one script tag is added
    id: 'google-maps-script',
  });

  // Fetch zones from Supabase once map API is loaded
  const onMapLoad = useCallback(async () => {
    setZonesLoading(true);
    const { data, error } = await getSafetyZones(cityId);
    if (error) {
      console.error('[SafetyMap] Zone fetch error:', error);
      setZonesError(error.message || 'Failed to load safety zones');
    } else {
      setZones(data || []);
    }
    setZonesLoading(false);
  }, [cityId]);

  // Close InfoWindow when clicking the base map
  const handleMapClick = useCallback(() => setSelectedZone(null), []);

  // Only one InfoWindow open at a time
  const handleZoneSelect = useCallback((zone) => {
    setSelectedZone((prev) => (prev?.id === zone?.id ? null : zone));
  }, []);

  // ── Render states ─────────────────────────────────────────────────────────

  if (loadError) {
    return <MapErrorState message="Google Maps failed to load. Check your API key." />;
  }

  if (!isLoaded) {
    return <MapLoadingState message="Loading Google Maps…" />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={BARCELONA_CENTER}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        {/* Zone polygons */}
        {zones.map((zone) => (
          <ZonePolygon
            key={zone.id}
            zone={zone}
            isSelected={selectedZone?.id === zone.id}
            onSelect={handleZoneSelect}
          />
        ))}

        {/* InfoWindow for selected zone */}
        {selectedZone && selectedZone.centroid_lat && selectedZone.centroid_lng && (
          <InfoWindow
            position={{ lat: selectedZone.centroid_lat, lng: selectedZone.centroid_lng }}
            onCloseClick={() => setSelectedZone(null)}
            options={{ maxWidth: 300 }}
          >
            <ZoneInfoContent zone={selectedZone} />
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Overlay legend (top-right) */}
      <MapLegend />

      {/* Zones loading overlay */}
      {zonesLoading && (
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
        }}>
          Loading safety zones…
        </div>
      )}

      {/* Zones error overlay */}
      {zonesError && (
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
          Error loading zones: {zonesError}
        </div>
      )}
    </div>
  );
}
