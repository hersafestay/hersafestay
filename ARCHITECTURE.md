# HerSafeStay — Technical Architecture

> **Core mission:** The safety map IS the product. Every architectural decision serves one goal — a fast, beautiful, empowering interactive safety map for women travelers worldwide.

---

## Table of Contents

1. [Safety Map Architecture](#1-safety-map-architecture) ← START HERE
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Architecture](#4-api-architecture)
5. [External Integrations](#5-external-integrations)
6. [File Structure](#6-file-structure)
7. [Performance Strategy](#7-performance-strategy)
8. [Mobile-First Design](#8-mobile-first-design)
9. [Scaling: 5 Cities → 500 Cities](#9-scaling-5-cities--500-cities)

---

## 1. Safety Map Architecture

### 1.1 How We Define Safety Zones

Safety zones are **geographic polygons** representing distinct city neighborhoods with a unified safety profile. We use **GeoJSON Polygon** format — the industry standard for geographic data, supported natively by Google Maps, Mapbox, PostGIS, and every mapping library.

**Why polygons (not grid squares)?**
- Neighborhoods follow natural/cultural boundaries, not grids
- Far better UX — users recognize "Le Marais" or "Sukhumvit"
- Much easier to communicate and market ("Marais district is safe")
- Grid squares confuse users and create artificial boundary artifacts

**Zone boundary sources (MVP):**
1. OpenStreetMap neighborhood boundaries (free, excellent quality)
2. Manual refinement by our editorial team (for accuracy)
3. Future: user-submitted boundary corrections

**Zone granularity rules:**
- Minimum zone area: ~0.5 km² (avoids over-fragmentation)
- Maximum zone area: ~5 km² (avoids under-specificity)
- Target: 8–15 zones per city for MVP
- Overlap policy: no overlapping polygons within a city

---

### 1.2 Data Structure for Zones

#### GeoJSON Zone Shape (what Google Maps renders)

```json
{
  "type": "Feature",
  "properties": {
    "zone_id": "bcn-gracia",
    "zone_name": "Gràcia",
    "city": "barcelona",
    "safety_level": "safe",
    "safety_score": 8.2
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [2.1531, 41.4036],
      [2.1607, 41.4051],
      [2.1645, 41.3985],
      [2.1531, 41.4036]
    ]]
  }
}
```

#### Supabase `safety_zones` Table (full schema in Section 3)

The database stores the canonical zone record. The GeoJSON is derived from the `coordinates` PostGIS geography column when serving the map API.

---

### 1.3 How We Overlay Zones on Google Maps

**Architecture: React component wraps Google Maps JavaScript API v3**

```
<SafetyMap>
  ├── GoogleMap (base map, styled with custom JSON)
  ├── ZoneLayer
  │   ├── <Polygon> × N  (one per safety zone)
  │   └── ZoneInfoWindow (shown on click)
  ├── AccommodationLayer
  │   ├── <Marker> × N   (custom SVG pin per property)
  │   └── PropertyInfoWindow
  └── MapControls
      ├── CitySelector
      ├── SafetyFilter (green/yellow/red toggles)
      └── MapLegend
```

**Rendering flow:**
1. User selects city → API call to `/api/zones?city=barcelona`
2. API returns GeoJSON FeatureCollection for that city
3. React renders `<Polygon>` for each feature with computed fill color
4. Click handler opens `ZoneInfoWindow` with zone details
5. Accommodation markers fetched in parallel → `/api/properties?city=barcelona`

**Zone polygon component:**

```javascript
// components/map/ZonePolygon.jsx
import { Polygon, InfoWindow } from '@react-google-maps/api'

export function ZonePolygon({ zone, isSelected, onSelect }) {
  const { safety_level, safety_score, coordinates } = zone
  const { fillColor, strokeColor } = SAFETY_COLORS[safety_level]

  return (
    <>
      <Polygon
        paths={coordinates}
        options={{
          fillColor,
          fillOpacity: isSelected ? 0.55 : 0.35,
          strokeColor,
          strokeWeight: isSelected ? 2.5 : 1.5,
          strokeOpacity: 0.8,
          clickable: true,
          zIndex: isSelected ? 10 : 1,
        }}
        onClick={() => onSelect(zone)}
      />
      {isSelected && (
        <InfoWindow position={zone.centroid} onCloseClick={() => onSelect(null)}>
          <ZoneDetail zone={zone} />
        </InfoWindow>
      )}
    </>
  )
}
```

---

### 1.4 Color Coding System

**Safety Level → Visual Color Mapping**

| Level    | Score | Fill Color | Stroke Color | Opacity | Label           |
|----------|-------|------------|--------------|---------|-----------------|
| Safe     | 7–10  | `#2D6A4F`  | `#1B4332`    | 35%     | Safe            |
| Caution  | 4–6   | `#F4A261`  | `#E76F51`    | 35%     | Use Caution     |
| Avoid    | 1–3   | `#E63946`  | `#C1121F`    | 35%     | Avoid at Night  |

**Design rationale:**
- Green = our brand's forest green (consistent with HerSafeStay identity)
- Amber = internationally recognized caution color
- Red = universally understood danger signal
- 35% opacity = zones are visible but map remains readable underneath
- Hover → opacity increases to 55% for clear selection feedback

**Color constants file** (`lib/safetyColors.js`):

```javascript
export const SAFETY_COLORS = {
  safe:    { fillColor: '#2D6A4F', strokeColor: '#1B4332', label: 'Safe' },
  caution: { fillColor: '#F4A261', strokeColor: '#E76F51', label: 'Use Caution' },
  avoid:   { fillColor: '#E63946', strokeColor: '#C1121F', label: 'Avoid at Night' },
}

export const scoreToLevel = (score) => {
  if (score >= 7) return 'safe'
  if (score >= 4) return 'caution'
  return 'avoid'
}
```

---

### 1.5 Safety Score Calculation

**MVP: Transparent Weighted Formula (v1)**

```
Safety Score (1–10) =
  (Crime Score    × 0.40)    ← Local incident rate, normalized 1–10
+ (Women Reviews  × 0.30)    ← Avg rating from women-only reviews
+ (Walkability    × 0.20)    ← Street lighting, pedestrian density
+ (Time Factor    × 0.10)    ← Day vs. night adjustment modifier
```

**Score sources for MVP (all free):**

| Component | Source | How |
|-----------|--------|-----|
| Crime Score | City open-data portals (data.police.uk, NYPD, etc.) | Download CSV → normalize to 1–10 per zone |
| Women Reviews | Our TypeForm survey + manual scraping Reddit r/solotravel | Avg sentiment score per neighborhood |
| Walkability | Walk Score API (free tier) or OSM pedestrian way density | API lookup per zone centroid |
| Time Factor | Manual editorial (is it a nightlife area? tourist zone?) | Curated enum: +0.5 / 0 / -1.5 |

**Scoring pipeline (runs at content-update time, not per-request):**

```
Raw data CSVs → /scripts/score-zones.js → Supabase upsert → Map refreshes
```

Scores are **pre-computed** and stored. The map never calculates scores at runtime — it just renders stored values. This keeps map loads under 200ms.

**Score transparency (user-facing):**

Each zone detail panel shows the score breakdown:
- "40% based on local crime reports"
- "30% based on 847 women traveler reviews"
- "20% based on street safety infrastructure"

Trust = transparency. Women deserve to know where the data comes from.

---

### 1.6 Data Sources

**MVP Phase (manual curation, weeks 1–2):**

| Source | Cities | Type | Cost |
|--------|--------|------|------|
| data.police.uk | London | Crime incidents by area | Free |
| NYPD Open Data | NYC | Crime statistics by precinct | Free |
| Mossos d'Esquadra | Barcelona | Crime data | Free |
| data.gouv.fr | Paris | Crime & delinquency stats | Free |
| Bangkok Metropolitan Crime Data | Bangkok | Police reports | Free |
| Reddit r/solotravel (manual scrape) | All | Women traveler sentiment | Free |
| Our TypeForm survey | All | Direct user input | Free |
| OSM Overpass API | All | Pedestrian infrastructure | Free |

**Future Phase (automated pipelines):**

- Apify scrapers (Google Maps reviews, TripAdvisor, Hostelworld)
- Numbeo Crime Index API
- Government open-data APIs (automated ingestion)
- User contribution system (in-app safety reports)
- ML sentiment analysis on travel blog content

---

### 1.7 User Safety Contributions

**Data model: `zone_reports` table**

Users can submit safety observations per zone:

```
- What happened? (dropdown: felt unsafe, harassment, theft, etc.)
- When? (day/night, time range)
- Optional text description
- Star rating (1–5, women-only lens)
```

**Contribution → score pipeline:**

1. User submits report → stored in `zone_reports` with `status: 'pending'`
2. Auto-moderation: filter spam/duplicates (basic regex + duplicate detection)
3. Editorial review queue (we review all reports before incorporating)
4. Approved reports → weighted into zone score recalculation
5. Zone updated → map refreshes (Supabase realtime subscription)

**Anti-abuse measures:**
- Rate limiting: max 5 reports per user per day
- IP-based duplicate detection
- Required email verification before submitting
- Flag threshold: 3 flags → auto-suspend report pending review

---

### 1.8 Scalability: 5 Cities → 500 Cities

**Data architecture is already global-ready from day one.**

The `safety_zones` table has no city limit. Adding a new city is:
1. Define zone polygons (manually or import from OSM)
2. Gather safety data for that city
3. Run scoring script → upsert to Supabase
4. City appears on map

**Scaling strategy by phase:**

| Phase | Cities | Strategy |
|-------|--------|----------|
| MVP | 5 | Manual curation, editorial quality |
| Phase 2 | 25 | Semi-automated (OSM + scraping) |
| Phase 3 | 100 | Fully automated pipeline + community contributions |
| Phase 4 | 500+ | ML-driven scoring, real-time updates, user-generated zones |

**Performance scaling:**

- Zones stored as PostGIS geography → spatial queries fast at any scale
- Per-city GeoJSON cached at CDN edge (Vercel Edge Network)
- Only load zones for visible map viewport (spatial bounding box query)
- Map tiles handled by Google (not our infrastructure)

---

## 2. Tech Stack

### Core Application

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router) | We already use it. SSR for SEO on city pages |
| Runtime | React 19 | Concurrent features for smooth map interactions |
| Styling | Inline styles (existing convention) | Consistent with current codebase |
| Fonts | Crimson Pro via next/font | Already configured |
| Deployment | Vercel | Already live, auto-deploy from main |

### Mapping (Critical Stack)

| Library | Purpose | Notes |
|---------|---------|-------|
| `@react-google-maps/api` | Google Maps React bindings | Best-in-class, 6M weekly downloads |
| Google Maps JavaScript API v3 | Base map rendering | $200/month free credit — plenty for MVP |
| Google Maps Polygon API | Safety zone overlays | Built into Maps JS API |
| Google Places API | Accommodation lookup | For future property data |
| Google Geocoding API | Address → coordinates | For search functionality |

**Why Google Maps (not Mapbox, Leaflet, or OSM)?**
- Best mobile performance on iOS Safari (critical for travelers)
- Free tier covers our entire MVP and early growth
- Superior satellite/street view integration (users trust it)
- Best iOS/Android WebView performance
- Existing `@react-google-maps/api` community and docs

### Backend / Data

| Service | Purpose | Cost |
|---------|---------|------|
| Supabase | PostgreSQL + PostGIS + Realtime + Auth | Free tier (500MB) |
| PostGIS extension | Geospatial queries on zone polygons | Included with Supabase |
| Vercel Edge Functions | API routes, zone data serving | Included with Vercel |
| Vercel KV (Redis) | Zone data cache layer | $0 on hobby plan |

### Analytics & Marketing (existing)

- Google Analytics 4 (G-7EH09YFVSE) — already installed
- TypeForm survey — already collecting data
- Vercel Analytics — included

---

## 3. Database Schema

### Critical: Enable PostGIS on Supabase

```sql
-- Run first in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

### Table: `safety_zones` (THE CORE TABLE)

```sql
CREATE TABLE safety_zones (
  -- Identity
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         TEXT NOT NULL,                    -- e.g., 'barcelona'
  zone_slug       TEXT NOT NULL,                    -- e.g., 'bcn-gracia'
  zone_name       TEXT NOT NULL,                    -- e.g., 'Gràcia'
  zone_name_local TEXT,                             -- e.g., 'Gràcia' (local language)

  -- Geography
  coordinates     GEOGRAPHY(POLYGON, 4326) NOT NULL, -- PostGIS polygon (WGS84)
  centroid        GEOGRAPHY(POINT, 4326),             -- Pre-computed center point
  bounding_box    JSONB,                              -- {north, south, east, west}

  -- Safety Data
  safety_score    DECIMAL(3,1) NOT NULL,            -- 1.0–10.0
  safety_level    TEXT NOT NULL CHECK (safety_level IN ('safe','caution','avoid')),
  color_code      TEXT NOT NULL,                    -- hex color, e.g., '#2D6A4F'

  -- Score Breakdown (transparent to users)
  crime_score     DECIMAL(3,1),                     -- 1.0–10.0
  reviews_score   DECIMAL(3,1),                     -- 1.0–10.0
  walkability_score DECIMAL(3,1),                   -- 1.0–10.0
  time_modifier   DECIMAL(3,1) DEFAULT 0,           -- -1.5 to +0.5

  -- Content
  description     TEXT,                             -- "Le Marais is a historic..."
  tips            TEXT[],                           -- Array of safety tips
  highlights      TEXT[],                           -- ['Well-lit streets', 'Tourist police presence']
  cautions        TEXT[],                           -- ['Pickpockets near metro', 'Avoid alley shortcuts at night']
  data_sources    TEXT[],                           -- ['data.police.uk', 'r/solotravel manual review']

  -- Stats
  report_count    INTEGER DEFAULT 0,               -- User submissions incorporated
  review_count    INTEGER DEFAULT 0,               -- Women reviews factored in
  property_count  INTEGER DEFAULT 0,               -- # of accommodations in zone

  -- Meta
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,

  UNIQUE(city_id, zone_slug)
);

-- Spatial index (CRITICAL for performance)
CREATE INDEX idx_zones_geography ON safety_zones USING GIST (coordinates);
CREATE INDEX idx_zones_city ON safety_zones (city_id);
CREATE INDEX idx_zones_level ON safety_zones (safety_level);
```

---

### Table: `cities`

```sql
CREATE TABLE cities (
  id              TEXT PRIMARY KEY,                  -- 'barcelona', 'bangkok'
  name            TEXT NOT NULL,                     -- 'Barcelona'
  country         TEXT NOT NULL,                     -- 'Spain'
  country_code    TEXT NOT NULL,                     -- 'ES'
  continent       TEXT NOT NULL,                     -- 'Europe'
  lat             DECIMAL(9,6) NOT NULL,             -- City center lat
  lng             DECIMAL(9,6) NOT NULL,             -- City center lng
  default_zoom    INTEGER DEFAULT 13,                -- Google Maps zoom level
  zone_count      INTEGER DEFAULT 0,
  property_count  INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT false,
  hero_image_url  TEXT,
  tagline         TEXT,                              -- 'A city of art, tapas, and safe beaches'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: 5 MVP cities
INSERT INTO cities VALUES
  ('barcelona', 'Barcelona', 'Spain',     'ES', 'Europe',    41.3851, 2.1734,  13, 0, 0, false),
  ('bangkok',   'Bangkok',   'Thailand',  'TH', 'Asia',      13.7563, 100.5018, 12, 0, 0, false),
  ('paris',     'Paris',     'France',    'FR', 'Europe',    48.8566, 2.3522,  13, 0, 0, false),
  ('london',    'London',    'UK',        'GB', 'Europe',    51.5074, -0.1278, 12, 0, 0, false),
  ('nyc',       'New York',  'USA',       'US', 'Americas',  40.7128, -74.0060, 12, 0, 0, false);
```

---

### Table: `properties`

```sql
CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         TEXT NOT NULL REFERENCES cities(id),
  zone_id         UUID REFERENCES safety_zones(id),   -- Which safety zone it's in

  -- Basic Info
  name            TEXT NOT NULL,
  property_type   TEXT NOT NULL CHECK (property_type IN ('hotel','hostel','apartment','guesthouse')),
  description     TEXT,

  -- Location
  lat             DECIMAL(9,6) NOT NULL,
  lng             DECIMAL(9,6) NOT NULL,
  address         TEXT,
  neighborhood    TEXT,

  -- Safety
  safety_features TEXT[],    -- ['24/7 Security', 'Women-only Floors', 'CCTV']
  women_rating    DECIMAL(2,1), -- 1.0–5.0, specifically from women reviewers
  overall_rating  DECIMAL(2,1),
  review_count    INTEGER DEFAULT 0,
  women_review_count INTEGER DEFAULT 0,

  -- Booking
  price_per_night DECIMAL(8,2),
  currency        TEXT DEFAULT 'USD',
  booking_url     TEXT,
  image_url       TEXT,

  -- Meta
  is_published    BOOLEAN DEFAULT false,
  is_verified     BOOLEAN DEFAULT false,  -- We personally verified it
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_city ON properties (city_id);
CREATE INDEX idx_properties_zone ON properties (zone_id);
CREATE INDEX idx_properties_location ON properties USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
```

---

### Table: `zone_reports` (User Contributions)

```sql
CREATE TABLE zone_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID NOT NULL REFERENCES safety_zones(id),
  city_id         TEXT NOT NULL,

  -- What happened
  incident_type   TEXT NOT NULL CHECK (incident_type IN (
    'felt_unsafe', 'harassment', 'theft', 'assault',
    'felt_very_safe', 'police_presence', 'well_lit', 'other'
  )),
  time_of_day     TEXT CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  description     TEXT,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),

  -- Submitter (anonymized)
  user_email_hash TEXT,        -- SHA256 of email, not the email itself
  ip_hash         TEXT,        -- For duplicate detection

  -- Moderation
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  flag_count      INTEGER DEFAULT 0,
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_zone ON zone_reports (zone_id);
CREATE INDEX idx_reports_status ON zone_reports (status);
```

---

### PostGIS Helper Functions

```sql
-- Find which zone a lat/lng point falls in
CREATE OR REPLACE FUNCTION get_zone_for_point(p_lat DECIMAL, p_lng DECIMAL)
RETURNS UUID AS $$
  SELECT id FROM safety_zones
  WHERE ST_Contains(
    coordinates::geometry,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  )
  AND is_published = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Get all zones within a bounding box (for map viewport)
CREATE OR REPLACE FUNCTION get_zones_in_bbox(
  p_city TEXT,
  p_north DECIMAL, p_south DECIMAL,
  p_east DECIMAL,  p_west DECIMAL
)
RETURNS TABLE (id UUID, zone_name TEXT, safety_level TEXT, safety_score DECIMAL) AS $$
  SELECT id, zone_name, safety_level, safety_score
  FROM safety_zones
  WHERE city_id = p_city
  AND is_published = true
  AND ST_Intersects(
    coordinates,
    ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::geography
  );
$$ LANGUAGE SQL STABLE;
```

---

## 4. API Architecture

All APIs are Next.js App Router Route Handlers (`app/api/*/route.js`).

### Endpoint Map

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/cities` | List all published cities | 1 hour |
| GET | `/api/zones?city=barcelona` | All zones for a city as GeoJSON | 30 min |
| GET | `/api/zones/[id]` | Single zone detail + tips | 30 min |
| GET | `/api/properties?city=barcelona` | All properties as map pins | 30 min |
| GET | `/api/properties/[id]` | Full property detail | 1 hour |
| POST | `/api/reports` | Submit a zone safety report | No cache |
| GET | `/api/search?q=marais&city=paris` | Search zones + properties | 5 min |

### Zone GeoJSON Response Format

```javascript
// GET /api/zones?city=barcelona
// Returns: GeoJSON FeatureCollection (standard format Google Maps expects)
{
  "type": "FeatureCollection",
  "city": "barcelona",
  "features": [
    {
      "type": "Feature",
      "id": "uuid-here",
      "properties": {
        "zone_name": "Gràcia",
        "safety_level": "safe",
        "safety_score": 8.2,
        "color_code": "#2D6A4F",
        "description": "...",
        "tips": ["...", "..."],
        "highlights": ["..."],
        "property_count": 12,
        "centroid": { "lat": 41.4035, "lng": 2.1583 }
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[ ... lat/lng pairs ... ]]]
      }
    }
  ]
}
```

### Caching Strategy

```javascript
// app/api/zones/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')

  const zones = await fetchZonesFromSupabase(city)
  const geojson = zonesToGeoJSON(zones)

  return Response.json(geojson, {
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      'CDN-Cache-Control': 'public, s-maxage=1800',
    }
  })
}
```

Zone data is cached at Vercel's Edge Network. Map loads hit CDN, not Supabase.

---

## 5. External Integrations

### Google Maps Platform

**APIs required (all under $200/month free credit for MVP):**

| API | Used For | Estimated Monthly Cost |
|-----|---------|----------------------|
| Maps JavaScript API | Interactive map base layer | ~$0 (included in JS API) |
| Maps Styling API | Custom dark/light map theme | Free |
| Geocoding API | City search → coordinates | ~$5 (5,000 requests) |
| Places API | Hotel search autocomplete | ~$17 (1,000 requests) |

**Setup:**
```
1. Google Cloud Console → Enable Maps JavaScript API
2. Enable Geocoding API
3. Create API key, restrict to: hersafestay.com, localhost:3000
4. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
5. Add same key to Vercel environment variables
```

**Custom map style (hide clutter, emphasize neighborhoods):**

```javascript
// lib/mapStyles.js — minimalist style that makes our zones pop
export const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },           // Hide POIs
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] }, // Simplify transit
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'landscape', stylers: [{ color: '#f5f0e8' }] },       // Warm base
  { featureType: 'water', stylers: [{ color: '#b8d4e8' }] },           // Soft blue water
]
```

### Supabase

```
1. supabase.com → New project (use 'hersafestay-prod' as name)
2. Settings → API → copy Project URL + anon key
3. Add to .env.local:
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (server-side only, never expose)
4. SQL editor → run schema migrations (Section 3)
5. Enable PostGIS extension
```

**Supabase client setup:**

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server-side only (for admin operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### TypeForm (existing)

Survey URL: `https://form.typeform.com/to/BQbzmv2z`

**Plan:** Manually review responses weekly. Extract neighborhood names mentioned + safety sentiment. Feed into zone scoring spreadsheet. Automate in Phase 2 with TypeForm Webhooks → Supabase.

---

## 6. File Structure

```
hersafestay/
├── app/
│   ├── layout.js                    # Crimson Pro font, metadata, GA4
│   ├── page.js                      # Landing page (current)
│   ├── globals.css                  # Reset + keyframe animations
│   │
│   ├── map/
│   │   └── page.js                  # Full-screen safety map experience
│   │
│   ├── city/
│   │   └── [slug]/
│   │       └── page.js              # City landing page (Barcelona, Paris, etc.)
│   │
│   └── api/
│       ├── cities/route.js          # GET /api/cities
│       ├── zones/
│       │   ├── route.js             # GET /api/zones?city=xxx
│       │   └── [id]/route.js        # GET /api/zones/[id]
│       ├── properties/
│       │   ├── route.js             # GET /api/properties?city=xxx
│       │   └── [id]/route.js        # GET /api/properties/[id]
│       ├── reports/route.js         # POST /api/reports
│       └── search/route.js          # GET /api/search
│
├── components/
│   ├── map/
│   │   ├── SafetyMap.jsx            # Main map container (Google Maps wrapper)
│   │   ├── ZonePolygon.jsx          # Individual zone polygon + info window
│   │   ├── ZoneDetail.jsx           # Zone detail panel (shown on click)
│   │   ├── AccommodationPin.jsx     # Custom SVG accommodation marker
│   │   ├── PropertyDetail.jsx       # Property detail popup
│   │   ├── MapLegend.jsx            # Safety color legend
│   │   ├── MapControls.jsx          # City selector + safety filters
│   │   └── MapLoadingState.jsx      # Skeleton while map loads
│   │
│   ├── city/
│   │   ├── CityHero.jsx             # Hero section per city page
│   │   ├── CityStats.jsx            # Zone counts, safety overview
│   │   └── ZoneList.jsx             # List view of zones (for SEO)
│   │
│   └── shared/
│       ├── SafetyBadge.jsx          # Reusable safe/caution/avoid badge
│       ├── StarRating.jsx           # Women rating display
│       └── ReportModal.jsx          # User safety report submission
│
├── lib/
│   ├── supabase.js                  # Supabase client (client + admin)
│   ├── safetyColors.js              # SAFETY_COLORS constants
│   ├── mapStyles.js                 # Google Maps custom style JSON
│   ├── geoHelpers.js                # GeoJSON utilities, centroid calc
│   └── scoreCalc.js                 # Safety score calculation logic
│
├── data/
│   ├── zones/
│   │   ├── barcelona.json           # Barcelona zone polygons (GeoJSON)
│   │   ├── bangkok.json             # Bangkok zone polygons
│   │   ├── paris.json               # Paris zone polygons
│   │   ├── london.json              # London zone polygons
│   │   └── nyc.json                 # NYC zone polygons
│   └── seed/
│       └── seed-all-cities.sql      # Full seed script for Supabase
│
├── scripts/
│   ├── import-zones.js              # Import GeoJSON files → Supabase
│   ├── score-zones.js               # Recalculate safety scores
│   └── validate-polygons.js         # Check for overlaps/gaps
│
├── public/
│   └── favicon.svg                  # Pin+shield favicon
│
├── ARCHITECTURE.md                  # This file
├── PROGRESS.md                      # 14-day build plan
├── SOLUTIONS.md                     # Known solutions log
├── OPTIMIZATIONS.md                 # Performance optimizations log
└── TESTING_CHECKLIST.md             # QA checklist
```

---

## 7. Performance Strategy

**Target: Map loads in under 2 seconds on mobile 4G.**

### Map Load Optimization

1. **Pre-load Google Maps API** in `<head>` with `async` + `defer`
2. **GeoJSON cached at CDN edge** — map data never hits Supabase on load
3. **Lazy-load zone details** — only fetch full zone info on click
4. **Polygon coordinate simplification** — reduce polygon vertex count by ~70% using Ramer-Douglas-Peucker algorithm (see OPTIMIZATIONS.md)
5. **Progressive loading** — show map immediately, zones appear within 500ms

### API Response Times

| Request | Target P99 | Strategy |
|---------|-----------|----------|
| City zone data | <100ms | CDN cache, 30-min TTL |
| Zone detail click | <200ms | Supabase edge function |
| Property pins | <150ms | CDN cache, parallel fetch |
| Search | <300ms | Supabase text search index |

### Bundle Size

- `@react-google-maps/api` loads Google Maps JS from CDN (not our bundle)
- Our map components: target <50KB gzipped
- Dynamic import `SafetyMap` component (only load on map page)

```javascript
const SafetyMap = dynamic(() => import('@/components/map/SafetyMap'), {
  ssr: false,  // Google Maps requires browser environment
  loading: () => <MapLoadingState />,
})
```

---

## 8. Mobile-First Design

Travelers use phones. The map must be perfect on iOS Safari and Android Chrome.

### Map Viewport Rules

```javascript
// Map height: full viewport minus nav bar
// On mobile: 100dvh (dynamic viewport height, handles iOS Safari bottom bar)
// On desktop: min 600px, max 800px

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100dvh - 64px)',  // 64px = nav bar height
}
```

### Touch Interaction Requirements

- Two-finger pinch → zoom (standard mobile behavior)
- Single-finger swipe → pan map
- Single tap on zone → open zone detail (NOT double-tap)
- Zone detail slides up from bottom as a sheet (mobile-native pattern)
- Close sheet by swiping down or tapping X

### iOS Safari Specific Fixes

1. Use `100dvh` not `100vh` (iOS Safari notch/home bar)
2. `touch-action: none` on map container prevents scroll conflicts
3. `user-scalable=no` in viewport meta (better map UX on mobile)
4. Test with real iPhone (iOS simulator is NOT the same)

### Responsive Layout

```
Mobile (<768px):
  [MAP — full screen]
  [Zone detail — slides up as bottom sheet]
  [Property list — below map, scrollable]

Tablet (768–1024px):
  [MAP — 65% width] [Zone detail sidebar — 35%]

Desktop (>1024px):
  [MAP — 60% width] [Listings sidebar — 40%]
```

---

## 9. Scaling: 5 Cities → 500 Cities

### Data Quality Pipeline (current: manual → future: automated)

```
Phase 1 (MVP):     Manual → Editorial → Supabase
Phase 2 (25 cities): Scraper → Review → Editorial → Supabase
Phase 3 (100 cities): API ingestion → Auto-score → Spot-check → Supabase
Phase 4 (500+ cities): ML pipeline → Confidence threshold → Publish
```

### Zone Creation Tools (Phase 2)

Build an internal "Zone Editor" tool:
- Draw polygon on map → auto-detect if it's a recognized neighborhood
- Auto-fill name from OSM Nominatim
- Input score components → auto-calculate final score
- Preview how zone will look → publish

### Global Safety Score Normalization

**Problem:** Bangkok's "safe" zones may have higher absolute crime than London's "caution" zones — confusing for users who travel between cities.

**Solution:** Per-city relative scoring (default) + global absolute mode (optional):
- Per-city mode: "How safe is this zone compared to OTHER zones in this city?"
- Global mode: "How safe is this zone compared to ALL zones worldwide?"

Display clearly in UI: "Safety score is relative to other Bangkok neighborhoods"

### Infrastructure Scaling

```
5 cities:     Supabase free tier (fine)
50 cities:    Supabase Pro ($25/mo) — more storage, more connections
500 cities:   Supabase Team or self-hosted — dedicated connection pooling
```

The architecture supports linear scaling. No redesign needed to go from 5 to 500 cities.

---

*Last updated: 2026-04-04*
*Version: 1.0 — Initial architecture for MVP*
