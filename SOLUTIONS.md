# HerSafeStay — Solutions Log

> When you solve a hard problem, document it here so future-you (and the team) doesn't solve it twice.

**Format:** Problem → Root Cause → Solution → Prevention

---

## How to Use This File

1. **Before building:** Search this file first. Someone may have already solved it.
2. **After solving a bug:** Add it here immediately while context is fresh.
3. **Keep it scannable:** Use the categories below. Don't write essays.

---

## Categories

- [Maps & Zones](#maps--zones)
- [Performance](#performance)
- [Supabase / Database](#supabase--database)
- [Mobile / iOS Safari](#mobile--ios-safari)
- [Next.js / React](#nextjs--react)
- [Google Maps API](#google-maps-api)
- [Build & Deployment](#build--deployment)

---

## Maps & Zones

### SOLUTION-001: Google Maps API key blocked on production

**Problem:** Map shows "This page can't load Google Maps correctly" on Vercel but works localhost.

**Root cause:** Google Maps API key has HTTP referrer restriction that doesn't include the production domain.

**Solution:**
1. Google Cloud Console → Credentials → select API key
2. Application restrictions → HTTP referrers
3. Add both: `https://hersafestay.com/*` AND `https://*.vercel.app/*`
4. Save → wait 60 seconds → reload

**Prevention:** Always add both prod domain and Vercel preview URL when setting up key.

---

### SOLUTION-002: Polygons flicker when map re-renders

**Problem:** Zone polygons briefly disappear when state updates (e.g., clicking a zone changes `selectedZone` state, causing all polygons to re-render).

**Root cause:** `<Polygon>` components are recreated on every parent render because the `options` object is defined inline (new object reference every render).

**Solution:** Memoize the options object and use `useCallback` for handlers:

```javascript
// WRONG — creates new object every render
<Polygon options={{ fillColor: color, fillOpacity: 0.35 }} onClick={handler} />

// CORRECT — stable object reference
const options = useMemo(() => ({
  fillColor: color,
  fillOpacity: isSelected ? 0.55 : 0.35,
  strokeWeight: isSelected ? 2.5 : 1.5,
}), [color, isSelected])

const handleClick = useCallback(() => onSelect(zone), [zone, onSelect])

<Polygon options={options} onClick={handleClick} />
```

**Prevention:** Always memoize Google Maps component options.

---

### SOLUTION-003: Zone polygons not closing (gap between first and last coordinate)

**Problem:** Some zone polygons render with a visible gap where the polygon should close.

**Root cause:** GeoJSON Polygon spec requires the first and last coordinate to be identical. OSM data sometimes omits this.

**Solution:** Add a coordinate closing step in the GeoJSON import script:

```javascript
// scripts/import-zones.js
function closePolygon(coordinates) {
  const ring = coordinates[0]
  const first = ring[0]
  const last = ring[ring.length - 1]
  // If first !== last coordinate, close the ring
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first])
  }
  return [ring]
}
```

**Prevention:** Always run `validate-polygons.js` after importing new zone data.

---

### SOLUTION-004: Zone click not firing on polygon edge (thin stroke area)

**Problem:** Users clicking exactly on the polygon border/stroke sometimes don't trigger the click handler.

**Root cause:** Google Maps Polygon click detection is based on the filled area, not the stroke. Clicking exactly on the stroke 1px line can miss.

**Solution:** Increase `strokeWeight` to at least 3px and add a transparent wider clickable overlay polygon:

```javascript
// Add a wider invisible stroke zone on top for better click detection
<Polygon
  paths={coordinates}
  options={{
    fillOpacity: 0,
    strokeColor: 'transparent',
    strokeWeight: 12,  // Wide invisible click target
    clickable: true,
    zIndex: 5,
  }}
  onClick={() => onSelect(zone)}
/>
```

**Prevention:** Always test zone clicking on mobile where finger precision is lower.

---

### SOLUTION-005: Multiple zones selected on single tap (mobile)

**Problem:** On Android Chrome, tapping between two adjacent zones sometimes triggers click on both zones.

**Root cause:** Touch events on Android fire slightly differently than click events. When zones share a border, both zones receive the touch event.

**Solution:** Debounce zone selection with a short delay and deduplicate:

```javascript
const lastSelectedRef = useRef(null)

const handleZoneSelect = useCallback((zone) => {
  if (lastSelectedRef.current === zone.id) return  // Deduplicate
  lastSelectedRef.current = zone.id
  setSelectedZone(zone)
  setTimeout(() => { lastSelectedRef.current = null }, 100)  // Reset after 100ms
}, [])
```

**Prevention:** Test zone border clicking specifically on Android Chrome.

---

## Performance

### SOLUTION-006: Map initial load exceeds 3 seconds on 4G

**Problem:** Users on 4G connections see a blank map for 3+ seconds.

**Root cause:** GeoJSON for all city zones (10 zones × city) was being fetched on every page load without caching. Each zone had 200+ coordinate pairs.

**Solution (two-part):**

**Part 1 — Add CDN caching headers to API response:**
```javascript
// app/api/zones/route.js
return Response.json(geojson, {
  headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' }
})
```

**Part 2 — Simplify polygon coordinates (Ramer-Douglas-Peucker):**
```javascript
// Reduced Barcelona zone data from 180KB → 28KB (84% reduction)
// Install: npm install simplify-js
import simplify from 'simplify-js'

function simplifyCoordinates(coordinates, tolerance = 0.0001) {
  return coordinates[0]
    .map(([lng, lat]) => ({ x: lng, y: lat }))
    .pipe(pts => simplify(pts, tolerance, true))
    .map(({ x, y }) => [x, y])
}
```

**Result:** Map load time reduced from 3.2s → 0.8s.

**Prevention:** Always simplify polygon coordinates during import. Target: <30KB per city.

---

### SOLUTION-007: Supabase rate limit hit during rapid map panning

**Problem:** When users rapidly pan the map across cities, multiple zone API calls fire simultaneously, hitting Supabase connection limits.

**Root cause:** No debouncing on map viewport change events. Each `onBoundsChanged` event triggered a database query.

**Solution:** Debounce viewport queries + cache results in React state:

```javascript
const cityCache = useRef({})

const fetchZonesDebounced = useMemo(
  () => debounce(async (city) => {
    if (cityCache.current[city]) {
      setZones(cityCache.current[city])
      return
    }
    const data = await fetchZones(city)
    cityCache.current[city] = data
    setZones(data)
  }, 300),
  []
)
```

**Prevention:** Always debounce map events. Cache fetched city data for the session.

---

## Supabase / Database

### SOLUTION-008: PostGIS `ST_Contains` returns no results

**Problem:** `SELECT * FROM safety_zones WHERE ST_Contains(coordinates::geometry, ST_MakePoint($lng, $lat))` returns empty result even though point is visually inside polygon.

**Root cause A:** Coordinate order. PostGIS `ST_MakePoint` takes `(longitude, latitude)` NOT `(latitude, longitude)`. Common swap.

**Root cause B:** Missing SRID. Coordinates must be in the same SRID (4326 for WGS84).

**Solution:**
```sql
-- WRONG
ST_Contains(coordinates::geometry, ST_MakePoint(lat, lng))

-- CORRECT
ST_Contains(
  coordinates::geometry,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)  -- Note: lng first, then lat
)
```

**Prevention:** Add a comment on any PostGIS function call: `-- ST_MakePoint(LNG, LAT) — not lat/lng!`

---

### SOLUTION-009: Supabase returning `null` for geography column

**Problem:** `zone.coordinates` is `null` after SELECT query despite data existing in the table.

**Root cause:** Supabase JS client doesn't automatically serialize PostGIS `geography` columns. They return as opaque binary.

**Solution:** Select the WKT or GeoJSON representation explicitly:

```javascript
// WRONG — returns binary blob
const { data } = await supabase.from('safety_zones').select('coordinates')

// CORRECT — convert to GeoJSON in SQL
const { data } = await supabase
  .from('safety_zones')
  .select('*, ST_AsGeoJSON(coordinates)::json as geometry')
```

Or better: pre-convert to GeoJSON in the API route, don't expose raw PostGIS to the client.

**Prevention:** Never select raw `geography` columns directly. Always use `ST_AsGeoJSON()`.

---

## Mobile / iOS Safari

### SOLUTION-010: Map height wrong on iOS (cut off at top or bottom)

**Problem:** On iPhone, the map is either too tall (extends under the home indicator) or too short (doesn't reach the visible area).

**Root cause:** iOS Safari's viewport height (`100vh`) includes the address bar height, which may or may not be shown. Result is inconsistent layout.

**Solution:** Use `100dvh` (dynamic viewport height — supported iOS 15.4+):

```css
.map-container {
  height: calc(100dvh - 64px);  /* 64px = nav bar */
  /* Fallback for older iOS */
  height: calc(100vh - 64px);
}
```

```javascript
// Or in JS, detect and apply:
const mapHeight = CSS.supports('height', '1dvh')
  ? 'calc(100dvh - 64px)'
  : 'calc(100vh - 64px)'
```

**Prevention:** Always test map height on real iPhone (not simulator).

---

### SOLUTION-011: Map scroll conflicts with page scroll on iOS

**Problem:** When the map is embedded in a scrollable page, trying to pan the map also scrolls the page underneath.

**Root cause:** iOS Safari scroll event propagation. Touch events on the map bubble up to the page.

**Solution:**

```javascript
// Map container element
<div
  style={{ touchAction: 'none' }}  // Prevent browser scroll on map area
  onTouchStart={(e) => e.stopPropagation()}
>
  <GoogleMap ... />
</div>
```

Also add in `globals.css`:
```css
.map-container {
  touch-action: none;
  -webkit-overflow-scrolling: auto;
}
```

**Prevention:** Use full-screen map layout on mobile (avoids scroll conflict entirely).

---

### SOLUTION-012: InfoWindow content not styled correctly on iOS

**Problem:** Zone info window popup text is tiny or overflowing on iPhone.

**Root cause:** Google Maps InfoWindow uses an iframe internally on some iOS versions, which ignores parent CSS.

**Solution:** Inline all styles in InfoWindow content. Never use external classes:

```javascript
// WRONG
<InfoWindow>
  <div className="zone-detail">...</div>
</InfoWindow>

// CORRECT — all inline styles
<InfoWindow>
  <div style={{ padding: '12px', maxWidth: '240px', fontFamily: 'system-ui' }}>
    <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{zone.zone_name}</h3>
    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{zone.description}</p>
  </div>
</InfoWindow>
```

**Prevention:** All InfoWindow content must use inline styles only.

---

## Next.js / React

### SOLUTION-013: "window is not defined" error during build

**Problem:** Build fails with `ReferenceError: window is not defined` in map component.

**Root cause:** Google Maps JavaScript API requires a browser environment. Next.js tries to server-render components, which fails because `window` doesn't exist in Node.js.

**Solution:** Dynamic import with `ssr: false`:

```javascript
// app/map/page.js
import dynamic from 'next/dynamic'

const SafetyMap = dynamic(
  () => import('@/components/map/SafetyMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
)
```

**Prevention:** Always use `ssr: false` for any component that uses Google Maps API.

---

### SOLUTION-014: `@react-google-maps/api` causes hydration mismatch

**Problem:** React hydration error on map page: "Hydration failed because the initial UI does not match what was rendered on the server."

**Root cause:** The `useLoadScript` hook state changes after hydration, causing UI mismatch.

**Solution:** Use the `<APIProvider>` pattern with Suspense instead of `useLoadScript` with conditional rendering:

```javascript
// Wrap entire map section in Suspense
import { Suspense } from 'react'

export default function MapPage() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <SafetyMap />  {/* dynamically imported with ssr: false */}
    </Suspense>
  )
}
```

**Prevention:** Always pair `ssr: false` dynamic import with `<Suspense>` fallback.

---

## Google Maps API

### SOLUTION-015: Google Maps API key exposed in client bundle

**Problem:** The `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is visible in the browser source code.

**Root cause:** This is expected. Google Maps API key is MEANT to be public. Security is handled via API key restrictions.

**Solution (not a bug, but proper key setup):**

1. Restrict key to specific HTTP referrers (only hersafestay.com)
2. Restrict to only the specific APIs you use (Maps JS, Geocoding, Places)
3. Set a monthly budget alert in Google Cloud Console
4. Monitor usage in Google Cloud Console → APIs & Services → Metrics

**Prevention:** Document this so new devs don't panic when they see the key in JS.

---

### SOLUTION-016: Map shows "For development purposes only" watermark

**Problem:** Gray "For development purposes only" watermark appears diagonally across the map.

**Root cause:** Billing is not enabled on the Google Cloud project, even though there's a free tier.

**Solution:**
1. Google Cloud Console → Billing → Link billing account
2. Free tier still applies — you won't be charged under $200/month
3. Watermark disappears within ~10 minutes

**Prevention:** Enable billing when creating the project (before any development).

---

## Build & Deployment

### SOLUTION-017: Vercel build fails with "Module not found: @react-google-maps/api"

**Problem:** Local dev works fine but Vercel build fails with missing module error.

**Root cause:** Package installed with `--legacy-peer-deps` locally but not committed to `package-lock.json` correctly.

**Solution:**
```bash
# Reinstall cleanly
rm -rf node_modules package-lock.json
npm install
npm install @react-google-maps/api @supabase/supabase-js
# Commit package-lock.json
git add package.json package-lock.json
git commit -m "fix: add missing map and database dependencies"
```

**Prevention:** Always commit `package-lock.json`. Never use `--legacy-peer-deps` unless absolutely required.

---

### SOLUTION-018: Environment variables not available in Vercel

**Problem:** Supabase or Google Maps keys work locally but are `undefined` in production.

**Root cause:** `.env.local` is in `.gitignore` (correct!), so Vercel doesn't have the keys.

**Solution:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add all required keys:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (mark as "Production only", never expose to client)
3. Redeploy

**Prevention:** Keep a `env.example` file in the repo listing all required env vars (no values).

---

### SOLUTION-019: Supabase returns raw binary for GEOGRAPHY columns

**Problem:** Querying `safety_zones` directly returns the `coordinates` column as an opaque binary blob — not usable in JavaScript.

**Root cause:** Supabase JS client does not auto-serialize PostGIS `geography` / `geometry` types. They come back as encoded binary that the browser cannot parse.

**Solution:** Create a PostgreSQL function that converts geography to GeoJSON using `ST_AsGeoJSON()`, and call it via `.rpc()` instead of a direct table query:

```sql
-- In migration 002_create_tables.sql
CREATE OR REPLACE FUNCTION get_zones_for_city(p_city_id TEXT)
RETURNS TABLE (
  ...,
  geojson_geometry JSON,   -- ST_AsGeoJSON(coordinates::geometry)::json
  centroid_lat FLOAT,      -- ST_Y(centroid::geometry)
  centroid_lng FLOAT       -- ST_X(centroid::geometry)
) ...
```

```javascript
// lib/database.js — use .rpc() not .from()
const { data } = await supabase.rpc('get_zones_for_city', { p_city_id: 'barcelona' })
// data[0].geojson_geometry is now a proper { type: 'Polygon', coordinates: [...] } object
```

**Prevention:** Never SELECT raw geography/geometry columns directly. Always go through a function or use `ST_AsGeoJSON()` in the SELECT.

---

### SOLUTION-020: PostGIS RPC function not found in Supabase

**Problem:** `supabase.rpc('get_zones_for_city', ...)` returns `{ error: { message: 'Could not find the function...' } }`.

**Root cause A:** Migration 002 was not run, or ran with errors (check SQL editor output carefully).

**Root cause B:** Function was created in the wrong schema. Supabase exposes functions in the `public` schema by default.

**Root cause C:** The function parameter name in the RPC call doesn't match the SQL definition exactly.

**Solution:**
```sql
-- Verify the function exists and is in public schema:
SELECT routine_name, routine_schema
FROM information_schema.routines
WHERE routine_name = 'get_zones_for_city';

-- If missing: re-run migration 002 (it uses CREATE OR REPLACE, safe to re-run)
```

```javascript
// Parameter names must match EXACTLY (p_city_id, not cityId or city_id):
await supabase.rpc('get_zones_for_city', { p_city_id: 'barcelona' }) // ✓
await supabase.rpc('get_zones_for_city', { city_id: 'barcelona' })   // ✗ wrong param name
```

**Prevention:** Always name RPC parameters with `p_` prefix (p_city_id) to clearly distinguish them from column names and avoid naming collisions.

---

### SOLUTION-021: GeoJSON coordinate order ([lng,lat] → {lat,lng})

**Problem:** Polygons render in wrong location or not at all.

**Root cause:** GeoJSON Polygon uses [longitude, latitude] order (X before Y). Google Maps Polygon `paths` expects `{ lat, lng }` (Y before X). Swapping these places zones in a mirror location.

**Solution:** `geoJsonToGooglePath()` in `lib/mapUtils.js`:

```javascript
export function geoJsonToGooglePath(geoJsonGeometry) {
  if (!geoJsonGeometry?.coordinates?.[0]) return [];
  // GeoJSON: [longitude, latitude] — longitude FIRST
  return geoJsonGeometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
}
```

**Prevention:** Comment every coordinate transform: `// [lng, lat] → { lat, lng }`.

---

### SOLUTION-022: InfoWindow rendered inside iframe (iOS CSS isolation)

**Problem:** Zone InfoWindow content unstyled / tiny on iOS Safari.

**Root cause:** Google Maps InfoWindow content renders inside an iframe on some iOS Safari versions, which isolates it from the parent document's CSS stylesheets.

**Solution:** Use 100% inline styles on all InfoWindow content (SOLUTION-012 confirmed for Day 3). Never use className inside `<InfoWindow>`.

**Prevention:** Already documented as SOLUTION-012. ZoneInfoContent component uses inline styles only.

---

### SOLUTION-023: SVG marker icons require browser context (window.google)

**Problem:** `getPropertyMarkerIcon()` throws "window is not defined" or "google is not defined" when called during SSR or before Maps API finishes loading.

**Root cause:** `new window.google.maps.Size()` and `new window.google.maps.Point()` reference the Maps API which only exists in the browser after `useJsApiLoader` resolves.

**Solution:** Only call `getPropertyMarkerIcon()` inside components that render after `isLoaded === true`. Use `useMemo` with `isLoaded` as a dependency:

```javascript
const icon = useMemo(() => {
  if (!isLoaded) return null;          // ← guard
  return getPropertyMarkerIcon(propertyType, isSelected);
}, [propertyType, isSelected, isLoaded]);
```

**Prevention:** Any function that calls `new window.google.maps.*` must be guarded by `isLoaded`. Document this in the function's JSDoc.

---

### SOLUTION-024: Dual InfoWindow mutual exclusion (zone vs property)

**Problem:** Both zone InfoWindow and property InfoWindow can be open simultaneously when the user clicks a property inside an already-selected zone, producing two overlapping windows.

**Root cause:** Zone click and property marker click are separate handlers. If zone click fires before property click (event propagation), both can set state in the same tick.

**Solution:** Use two separate state variables (`selectedZone`, `selectedProperty`). In each click handler, explicitly clear the other:

```javascript
function handleZoneSelect(zone) {
  setSelectedProperty(null);  // always clear property
  setSelectedZone(prev => prev?.id === zone.id ? null : zone);
}
function handlePropertySelect(property) {
  setSelectedZone(null);      // always clear zone
  setSelectedProperty(prev => prev?.id === property.id ? null : property);
}
```

Stop propagation on the property marker click so the map background click doesn't also fire.

**Prevention:** For mutually exclusive UI states, use a single discriminated union state or always clear the other explicitly on set.

---

---

## Property Coordinate Distribution

### SOLUTION-025: Properties outside zone boundaries

**Date:** 2026-04-11

**Problem:** Several properties had lat/lng coordinates that placed them visually outside their colored zone polygons on the map.

**Root cause:** Seed data coordinates were chosen manually (copy-pasted real hotel addresses) without validating them against the exact zone polygon boundaries stored in the database.

**Specific violations found:**

| Property | Zone | Issue |
|----------|------|-------|
| Hotel Arts Barcelona | Barceloneta [lat 41.3740–41.3830] | lat=41.3878 — 4.8m above zone boundary |
| Pullman Paris Montparnasse | Gare du Nord [lat 48.8740–48.8855] | lat=48.8419 — 3.3km outside zone (property is in Montparnasse!) |
| Lebua at State Tower | Silom [lat 13.7250–13.7330, lng 100.5224–100.5400] | Both axes outside zone |
| Hôtel des Arts Montmartre + Terrass' Hotel | Montmartre | Only 180m apart (< 200m minimum) |
| The Surawongse Hotel | Patpong [lat 13.7190–13.7260] | lat=13.7264 — marginally above max |

**Solution:**
1. Audited all 45 properties across 3 cities against zone bounding boxes
2. Generated corrected coordinates using point-in-polygon validation
3. Ensured minimum 200m (0.002°) spacing between properties in same zone
4. Applied fixes via UPDATE statements in `*_fixed.sql` seed files

**Files:**
- `supabase/seed/barcelona_fixed.sql`
- `supabase/seed/paris_fixed.sql`
- `supabase/seed/bangkok_fixed.sql`
- `scripts/distribute-properties.js` — reusable point-in-polygon algorithm
- `supabase/seed/APPLY_FIXES.md` — instructions for applying

**Prevention:** For all future cities, use `scripts/distribute-properties.js` to generate coordinates. Add zones to the `ZONES` object in the script — it validates points are inside the polygon before output.

---

## SOLUTION-026: Search & Filter System

**Problem:** No way for users to filter properties by safety level, type, price, or search by name/neighborhood.

**Solution:**
1. Created `lib/searchUtils.js` — pure filter/sort/search/debounce utilities
2. Created `components/map/SearchFilters.jsx` — collapsible panel with debounced search, checkboxes, dual-range price slider, sort dropdown, active chips, mobile bottom-sheet modal
3. Updated `components/map/SafetyMap.jsx` — filter state, localStorage persistence, `filteredProperties` memo, `ZoneCountBadge`, no-results overlay
4. Dual-range slider: two overlapping `<input type="range">` with `pointer-events: none` on inputs + `pointer-events: auto` on `::webkit-slider-thumb` via `<style>` block

**Files:**
- `lib/searchUtils.js`
- `components/map/SearchFilters.jsx`
- `components/map/SafetyMap.jsx`

---

## SOLUTION-027: Zone Overlap Visual Confusion

**Problem:** Barcelona's El Raval (red) and Gothic Quarter (amber) overlap visually because fill opacity was 30%. The color blend looked muddy and users couldn't tell which zone they were in.

**Solution:**
1. Reduced `fillOpacity` from `0.30` → `0.12` (barely tints the map — zone boundary, not flood fill)
2. Increased `strokeWeight` from `2` → `3` px (thick solid border makes zone boundaries unmistakable)
3. Added `shrinkPolygon()` in `lib/mapUtils.js` — pulls each polygon vertex ~20 m toward centroid, creating a physical gap between adjacent zones. No more blended colors at zone edges.

**Files:** `components/map/SafetyMap.jsx`, `lib/mapUtils.js`

**Impact:** Overlapping zones (El Raval + Gothic Quarter, Silom + Patpong, Latin Quarter + Saint-Germain) now have visually distinct, readable borders even where they share edges.

---

## SOLUTION-028: Property List View + List ↔ Map Sync

**Problem:** Sort changes (especially women's rating) were not obvious because there was no visual list of properties — only map pins. Users couldn't tell what order pins were in.

**Solution:**
1. Created `components/map/PropertyList.jsx` — scrollable Airbnb-style sidebar:
   - Property cards with type icon placeholder, name, stars, price, zone badge, safety features
   - Selected: coral border + elevated shadow
   - Hover: slight elevation + border hint; syncs to map marker (enlarged)
   - Sort indicator header ("Sorted by: Safety Score ↓")
   - Skeleton loading (5 animated cards with shimmer)
   - Empty state with "Clear All Filters" button
2. Lifted `selectedProperty` and `hoveredPropertyId` state to `MapPageClient` for bi-directional sync
3. `SafetyMap` now accepts `selectedProperty`/`onPropertySelect` as controlled props; also exposes `onFilteredPropertiesChange`, `onLoadingChange`, `onMapReady`, `clearFiltersSignal`
4. `MapPageClient` updated to split layout: PropertyList (380 px left) + Map (flex right). Mobile: map 60% top + list 40% bottom
5. Clicking a card pans the map (via `mapRef.current.panTo`) and opens the InfoWindow
6. Clicking a map marker scrolls the corresponding card into view (`scrollIntoView`)

**Files:** `components/map/PropertyList.jsx` (new), `components/map/SafetyMap.jsx`, `app/map/MapPageClient.jsx`, `lib/mapUtils.js`

---

## SOLUTION-029: Selected Property Marker Highlighting

**Problem:** Clicking a property card opened the InfoWindow but the map marker didn't stand out — hard to tell which pin corresponded to the selected property.

**Solution:**
1. `getPropertyMarkerIcon` now renders a visually distinct icon when `isSelected=true`:
   - Size 40×52 px vs 26×34 px normal (~1.5×)
   - 5 px white stroke with `paint-order="stroke fill"` creates a visible halo ring around the pin; viewBox padded to `-3 -3 34 42` so halo isn't clipped at edges
2. Added `BOUNCE` animation via `window.google.maps.Animation.BOUNCE` for 2 s on selection; a `setTimeout` stops it to avoid distraction. Timer is tracked in `animationTimerRef` and cleaned up on unmount / re-selection
3. `PropertyMarker` raises `zIndex` from 100 → 1000 when selected (appears on top of all other markers)
4. New `isAnimating` prop wires the timer state into `PropertyMarker`'s `animation` derived value

**Files:** `lib/mapUtils.js`, `components/map/SafetyMap.jsx`

---

*Last updated: 2026-04-11*
*Solutions: 29*
