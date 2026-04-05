/**
 * HerSafeStay — Map Utility Functions
 *
 * GeoJSON ↔ Google Maps coordinate conversion and helpers.
 * CRITICAL: GeoJSON uses [longitude, latitude]; Google Maps uses { lat, lng }
 */

/**
 * Convert a GeoJSON Polygon geometry to Google Maps Polygon paths format.
 * GeoJSON:      [[[lng, lat], [lng, lat], ...]]   ← longitude FIRST
 * Google Maps:  [{ lat, lng }, { lat, lng }, ...]  ← lat/lng object
 *
 * @param {object} geoJsonGeometry - { type: "Polygon", coordinates: [[[lng, lat], ...]] }
 * @returns {{ lat: number, lng: number }[]}
 */
export function geoJsonToGooglePath(geoJsonGeometry) {
  if (!geoJsonGeometry?.coordinates?.[0]) return [];
  // coordinates[0] = outer ring; each point is [longitude, latitude]
  return geoJsonGeometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
}

/**
 * Get fill + stroke colors based on safety level.
 * Matches ARCHITECTURE.md § 1.4 color coding system.
 *
 * @param {string} safetyLevel - 'safe' | 'caution' | 'avoid'
 * @returns {{ fillColor: string, strokeColor: string, label: string }}
 */
export function getSafetyColors(safetyLevel) {
  const map = {
    safe:    { fillColor: '#2D6A4F', strokeColor: '#1B4332', label: 'Safe' },
    caution: { fillColor: '#F4A261', strokeColor: '#E76F51', label: 'Use Caution' },
    avoid:   { fillColor: '#E63946', strokeColor: '#C1121F', label: 'Avoid at Night' },
  };
  return map[safetyLevel] ?? map.caution;
}

/**
 * Convenience: get fill color only (for backwards compat with direct color_code use).
 * @param {string} safetyLevel
 * @returns {string} hex color
 */
export function getSafetyColor(safetyLevel) {
  return getSafetyColors(safetyLevel).fillColor;
}

/**
 * Format a safety score as "X.X/10".
 * @param {number|string} score
 * @returns {string}
 */
export function formatSafetyScore(score) {
  return `${Number(score).toFixed(1)}/10`;
}
