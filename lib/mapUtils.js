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

// ─── Property pin helpers ────────────────────────────────────────────────────

/** Pin colors per property type — matches brand palette */
const PROPERTY_PIN_COLORS = {
  hotel:      '#FF6B6B',  // Coral (brand primary)
  hostel:     '#4A90D9',  // Blue
  apartment:  '#2D6A4F',  // Forest green (brand secondary)
  guesthouse: '#F4A261',  // Amber
};

/**
 * Build a Google Maps icon object for a property pin.
 * Uses an inline SVG data URI so no external image requests are needed.
 *
 * MUST be called inside a browser context where window.google is available
 * (i.e., after the Google Maps JS API has loaded).
 *
 * @param {string} propertyType - 'hotel' | 'hostel' | 'apartment' | 'guesthouse'
 * @param {boolean} isSelected  - larger pin when selected
 * @returns {google.maps.Icon}
 */
export function getPropertyMarkerIcon(propertyType, isSelected = false, isHovered = false) {
  const color = PROPERTY_PIN_COLORS[propertyType] ?? PROPERTY_PIN_COLORS.hotel;
  const w = isSelected ? 34 : isHovered ? 30 : 26;
  const h = isSelected ? 44 : isHovered ? 39 : 34;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36">`,
    `<path d="M14,2 C20.6,2 26,7.4 26,14 C26,22 14,34 14,34 C14,34 2,22 2,14 C2,7.4 7.4,2 14,2 Z"`,
    ` fill="${color}" stroke="white" stroke-width="2"/>`,
    `<circle cx="14" cy="14" r="5.5" fill="white" opacity="0.92"/>`,
    `</svg>`,
  ].join('');

  return {
    url: `data:image/svg+xml;base64,${btoa(svg)}`,
    scaledSize: new window.google.maps.Size(w, h),
    anchor: new window.google.maps.Point(w / 2, h),
  };
}

/**
 * Format price for display.
 * @param {number|null} price
 * @param {string} currency - 'USD' | 'EUR' | 'THB'
 * @returns {string}
 */
export function formatPrice(price, currency = 'USD') {
  if (!price) return 'Price not available';
  const symbols = { USD: '$', EUR: '€', THB: '฿' };
  const sym = symbols[currency] ?? currency;
  return `${sym}${Math.round(price)}/night`;
}

/**
 * Shrink a polygon toward its centroid by `shrinkDeg` degrees.
 * Creates small visual gaps between adjacent zones to reduce overlap confusion.
 * Default ≈ 20 m (0.00018°) — enough for a visible border gap, not enough to distort.
 *
 * @param {{ lat: number, lng: number }[]} paths
 * @param {number} shrinkDeg
 * @returns {{ lat: number, lng: number }[]}
 */
export function shrinkPolygon(paths, shrinkDeg = 0.00018) {
  if (!paths.length) return paths;
  const n = paths.length;
  const centLat = paths.reduce((s, p) => s + p.lat, 0) / n;
  const centLng = paths.reduce((s, p) => s + p.lng, 0) / n;
  return paths.map((p) => {
    const dLat = centLat - p.lat;
    const dLng = centLng - p.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.0001) return p; // Skip if essentially on the centroid
    return {
      lat: p.lat + (dLat / dist) * shrinkDeg,
      lng: p.lng + (dLng / dist) * shrinkDeg,
    };
  });
}

/**
 * Format a 1-10 safety rating as a 5-star display string.
 * @param {number|null} rating - 1.0 to 5.0 (women_rating is stored as 1-5)
 * @returns {string}
 */
export function formatWomenRating(rating) {
  if (!rating) return 'No rating';
  return `${Number(rating).toFixed(1)}/5 ⭐`;
}
