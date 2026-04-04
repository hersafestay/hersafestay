-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: Enable PostGIS + uuid-ossp
-- Run this FIRST in Supabase SQL Editor before any other migration.
-- ─────────────────────────────────────────────────────────────────────────────

-- PostGIS: enables GEOGRAPHY columns, spatial indexes (GIST), and all
-- ST_* functions used throughout the schema (ST_Contains, ST_AsGeoJSON, etc.)
CREATE EXTENSION IF NOT EXISTS postgis;

-- uuid-ossp: enables uuid_generate_v4() for PRIMARY KEY defaults
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions are installed (these should return rows)
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('postgis', 'uuid-ossp');
