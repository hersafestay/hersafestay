-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Create all tables, indexes, and helper functions
-- Requires: 001_enable_postgis.sql must be run first
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: cities
-- One row per city. The "catalog" of all cities on the platform.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cities (
  id              TEXT PRIMARY KEY,          -- 'barcelona', 'bangkok', 'paris'
  name            TEXT NOT NULL,             -- 'Barcelona'
  country         TEXT NOT NULL,             -- 'Spain'
  country_code    TEXT NOT NULL,             -- 'ES' (ISO 3166-1 alpha-2)
  continent       TEXT NOT NULL,             -- 'Europe'

  -- City center coordinates for map initialization
  lat             DECIMAL(9,6) NOT NULL,     -- 41.385100
  lng             DECIMAL(9,6) NOT NULL,     -- 2.173400

  default_zoom    INTEGER DEFAULT 13,        -- Google Maps initial zoom level

  -- Denormalized counters (updated by trigger or application logic)
  zone_count      INTEGER DEFAULT 0,
  property_count  INTEGER DEFAULT 0,

  is_published    BOOLEAN DEFAULT false,
  hero_image_url  TEXT,
  tagline         TEXT,                      -- 'Art, tapas, and safe beaches'

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying published cities
CREATE INDEX IF NOT EXISTS idx_cities_published ON cities (is_published);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: safety_zones  ← THE CORE TABLE
-- Each row is one neighborhood polygon with safety data.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS safety_zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  zone_slug       TEXT NOT NULL,             -- 'bcn-eixample', 'bcn-gracia'
  zone_name       TEXT NOT NULL,             -- 'Eixample', 'Gràcia'
  zone_name_local TEXT,                      -- Local language name if different

  -- ── Geography (PostGIS) ───────────────────────────────────────────────────
  -- CRITICAL: coordinates are stored LONGITUDE FIRST, then LATITUDE (WGS84)
  -- Use ST_GeogFromText('SRID=4326;POLYGON((lng lat, lng lat, ...))')
  coordinates     GEOGRAPHY(POLYGON, 4326) NOT NULL,
  centroid        GEOGRAPHY(POINT, 4326),    -- Pre-computed zone center point
  bounding_box    JSONB,                     -- {north, south, east, west}

  -- ── Safety Scores ─────────────────────────────────────────────────────────
  -- Formula: safety_score = crime*0.40 + reviews*0.30 + walkability*0.20 + time_modifier
  safety_score      DECIMAL(3,1) NOT NULL CHECK (safety_score BETWEEN 1.0 AND 10.0),
  safety_level      TEXT NOT NULL CHECK (safety_level IN ('safe', 'caution', 'avoid')),
  color_code        TEXT NOT NULL,           -- '#2D6A4F', '#F4A261', '#E63946'

  -- Score components (shown to users for transparency)
  crime_score       DECIMAL(3,1) CHECK (crime_score BETWEEN 1.0 AND 10.0),
  reviews_score     DECIMAL(3,1) CHECK (reviews_score BETWEEN 1.0 AND 10.0),
  walkability_score DECIMAL(3,1) CHECK (walkability_score BETWEEN 1.0 AND 10.0),
  time_modifier     DECIMAL(3,1) DEFAULT 0 CHECK (time_modifier BETWEEN -1.5 AND 0.5),

  -- ── Content ───────────────────────────────────────────────────────────────
  description       TEXT,
  tips              TEXT[],        -- Safety tips from women travelers
  highlights        TEXT[],        -- Positive safety features
  cautions          TEXT[],        -- Specific cautions
  data_sources      TEXT[],        -- Where scores came from

  -- ── Stats (updated by application) ────────────────────────────────────────
  report_count    INTEGER DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  property_count  INTEGER DEFAULT 0,

  -- ── Meta ──────────────────────────────────────────────────────────────────
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,

  UNIQUE (city_id, zone_slug)
);

-- ── Indexes for safety_zones ──────────────────────────────────────────────────

-- CRITICAL: spatial index enables fast PostGIS queries (ST_Contains, ST_Intersects)
CREATE INDEX IF NOT EXISTS idx_zones_geography
  ON safety_zones USING GIST (coordinates);

-- Centroid spatial index (for point-in-zone lookups)
CREATE INDEX IF NOT EXISTS idx_zones_centroid
  ON safety_zones USING GIST (centroid);

-- Scalar indexes for common filter patterns
CREATE INDEX IF NOT EXISTS idx_zones_city
  ON safety_zones (city_id);

CREATE INDEX IF NOT EXISTS idx_zones_level
  ON safety_zones (safety_level);

CREATE INDEX IF NOT EXISTS idx_zones_published
  ON safety_zones (city_id, is_published);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: properties
-- Hotels, hostels, apartments plotted on the safety map.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  zone_id         UUID REFERENCES safety_zones(id) ON DELETE SET NULL,

  -- ── Basic Info ────────────────────────────────────────────────────────────
  name            TEXT NOT NULL,
  property_type   TEXT NOT NULL CHECK (property_type IN ('hotel','hostel','apartment','guesthouse')),
  description     TEXT,

  -- ── Location ──────────────────────────────────────────────────────────────
  lat             DECIMAL(9,6) NOT NULL,
  lng             DECIMAL(9,6) NOT NULL,
  address         TEXT,
  neighborhood    TEXT,

  -- ── Safety (women-specific) ────────────────────────────────────────────────
  safety_features    TEXT[],             -- ['24/7 Security', 'Women-only Floors']
  women_rating       DECIMAL(2,1) CHECK (women_rating BETWEEN 1.0 AND 5.0),
  overall_rating     DECIMAL(2,1) CHECK (overall_rating BETWEEN 1.0 AND 5.0),
  review_count       INTEGER DEFAULT 0,
  women_review_count INTEGER DEFAULT 0,

  -- ── Booking ───────────────────────────────────────────────────────────────
  price_per_night DECIMAL(8,2),
  currency        TEXT DEFAULT 'USD',
  booking_url     TEXT,
  image_url       TEXT,

  -- ── Meta ──────────────────────────────────────────────────────────────────
  is_published    BOOLEAN DEFAULT false,
  is_verified     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for properties ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_properties_city
  ON properties (city_id);

CREATE INDEX IF NOT EXISTS idx_properties_zone
  ON properties (zone_id);

-- Spatial index on lat/lng for proximity queries
CREATE INDEX IF NOT EXISTS idx_properties_location
  ON properties USING GIST (
    ST_SetSRID(ST_MakePoint(lng::double precision, lat::double precision), 4326)
  );

CREATE INDEX IF NOT EXISTS idx_properties_published
  ON properties (city_id, is_published);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: zone_reports
-- User-submitted safety observations (moderated before affecting scores).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS zone_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID NOT NULL REFERENCES safety_zones(id) ON DELETE CASCADE,
  city_id         TEXT NOT NULL,

  -- ── Incident ──────────────────────────────────────────────────────────────
  incident_type   TEXT NOT NULL CHECK (incident_type IN (
    'felt_unsafe', 'harassment', 'theft', 'assault',
    'felt_very_safe', 'police_presence', 'well_lit', 'other'
  )),
  time_of_day     TEXT CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  description     TEXT,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),

  -- ── Submitter (anonymized, never store PII) ────────────────────────────────
  user_email_hash TEXT,   -- SHA-256 of email address — NOT the email itself
  ip_hash         TEXT,   -- SHA-256 of IP — for duplicate detection only

  -- ── Moderation ────────────────────────────────────────────────────────────
  status          TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending','approved','rejected')),
  flag_count      INTEGER DEFAULT 0,
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_zone
  ON zone_reports (zone_id);

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON zone_reports (status);

CREATE INDEX IF NOT EXISTS idx_reports_city
  ON zone_reports (city_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_zones_for_city(p_city_id)
--
-- Returns all published zones for a city with PostGIS geography columns
-- converted to GeoJSON via ST_AsGeoJSON — safe to query from the JS client.
--
-- Called via supabase.rpc('get_zones_for_city', { p_city_id: 'barcelona' })
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_zones_for_city(p_city_id TEXT)
RETURNS TABLE (
  id                  UUID,
  city_id             TEXT,
  zone_slug           TEXT,
  zone_name           TEXT,
  zone_name_local     TEXT,
  safety_score        DECIMAL,
  safety_level        TEXT,
  color_code          TEXT,
  crime_score         DECIMAL,
  reviews_score       DECIMAL,
  walkability_score   DECIMAL,
  time_modifier       DECIMAL,
  description         TEXT,
  tips                TEXT[],
  highlights          TEXT[],
  cautions            TEXT[],
  data_sources        TEXT[],
  report_count        INTEGER,
  review_count        INTEGER,
  property_count      INTEGER,
  bounding_box        JSONB,
  geojson_geometry    JSON,      -- PostGIS polygon → GeoJSON
  centroid_lat        FLOAT,     -- Centroid latitude (for InfoWindow positioning)
  centroid_lng        FLOAT      -- Centroid longitude
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    sz.id,
    sz.city_id,
    sz.zone_slug,
    sz.zone_name,
    sz.zone_name_local,
    sz.safety_score,
    sz.safety_level,
    sz.color_code,
    sz.crime_score,
    sz.reviews_score,
    sz.walkability_score,
    sz.time_modifier,
    sz.description,
    sz.tips,
    sz.highlights,
    sz.cautions,
    sz.data_sources,
    sz.report_count,
    sz.review_count,
    sz.property_count,
    sz.bounding_box,
    -- Convert PostGIS geography to GeoJSON
    ST_AsGeoJSON(sz.coordinates::geometry)::json AS geojson_geometry,
    -- Extract centroid coordinates as floats for JavaScript use
    ST_Y(sz.centroid::geometry) AS centroid_lat,
    ST_X(sz.centroid::geometry) AS centroid_lng
  FROM safety_zones sz
  WHERE sz.city_id = p_city_id
    AND sz.is_published = true
  ORDER BY sz.zone_name;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_zone_for_point(p_lat, p_lng)
--
-- Given a latitude and longitude, returns the ID of the safety zone
-- that contains that point. Useful for auto-assigning properties to zones.
--
-- NOTE: ST_MakePoint takes (LONGITUDE, LATITUDE) — not lat/lng!
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_zone_for_point(p_lat DECIMAL, p_lng DECIMAL)
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT id
  FROM safety_zones
  WHERE ST_Contains(
    coordinates::geometry,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)  -- longitude first!
  )
    AND is_published = true
  LIMIT 1;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_zones_in_bbox(p_city, p_north, p_south, p_east, p_west)
--
-- Returns zones intersecting a map viewport bounding box.
-- Used for future viewport-based loading optimization.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_zones_in_bbox(
  p_city  TEXT,
  p_north DECIMAL,
  p_south DECIMAL,
  p_east  DECIMAL,
  p_west  DECIMAL
)
RETURNS TABLE (
  id           UUID,
  zone_name    TEXT,
  safety_level TEXT,
  safety_score DECIMAL
)
LANGUAGE SQL
STABLE
AS $$
  SELECT id, zone_name, safety_level, safety_score
  FROM safety_zones
  WHERE city_id = p_city
    AND is_published = true
    AND ST_Intersects(
      coordinates,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::geography
    );
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification queries — run these after migration to confirm success
-- ─────────────────────────────────────────────────────────────────────────────

-- Should return 4 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cities','safety_zones','properties','zone_reports')
ORDER BY table_name;

-- Should return 3 functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_zones_for_city','get_zone_for_point','get_zones_in_bbox')
ORDER BY routine_name;
