/**
 * HerSafeStay — Google Maps Custom Style
 * Minimalist cream base — makes safety zone polygons pop without clutter.
 * See ARCHITECTURE.md § 5 (External Integrations → Google Maps Platform)
 */

export const MAP_STYLES = [
  // Hide points of interest (restaurants, shops) — we want neighborhood zones, not pins
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  // Simplify transit layer
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
  // Simplify road labels
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  // Warm cream base — matches HerSafeStay brand (#FFF8F0 family)
  { featureType: 'landscape', stylers: [{ color: '#f5f0e8' }] },
  // Soft blue water
  { featureType: 'water', stylers: [{ color: '#b8d4e8' }] },
  // Muted arterial roads
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ecdfc8' }] },
  // Lighter local roads
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#f5efe0' }] },
  // Parks — soft green tint (distinct from safety polygons)
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#daeedd' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
];
