-- =============================================================================
-- Bangkok Property Coordinate Fixes
-- =============================================================================
-- Generated: 2026-04-11
-- Purpose: Move all properties inside their zone polygons with proper spacing.
--
-- Issues fixed:
--   1. Lebua at State Tower (Silom zone): lat=13.7241 < zone min 13.7250,
--      lng=100.5142 < zone min 100.5224. Both lat and lng were OUTSIDE.
--      Moved to: lat=13.7322, lng=100.5378 (north-east of Silom zone).
--
--   2. The Surawongse Hotel (Patpong zone): lat=13.7264 > zone max 13.7260.
--      Marginally outside. Moved to: lat=13.7252 (safely inside).
--
--   3. All properties: redistributed for minimum 200m spacing.
--
-- Run in: Supabase SQL Editor
-- Run after: bangkok.sql seed is already applied
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM properties WHERE city_id = 'bangkok') THEN
    RAISE EXCEPTION 'No Bangkok properties found. Run bangkok.sql first.';
  END IF;
END $$;

-- =============================================================================
-- SUKHUMVIT ZONE
-- Zone boundary: lat [13.7280 – 13.7540], lng [100.5560 – 100.5820]
-- =============================================================================

-- The Sukhumvit Hotel Bangkok → center-west (Asok area)
UPDATE properties
SET lat = 13.742500, lng = 100.564800
WHERE name = 'The Sukhumvit Hotel Bangkok'
  AND city_id = 'bangkok';

-- Lub d Bangkok Sukhumvit 38 → south-east (Thong Lo area)
UPDATE properties
SET lat = 13.731800, lng = 100.579000
WHERE name = 'Lub d Bangkok Sukhumvit 38'
  AND city_id = 'bangkok';

-- NOVOTEL Bangkok Sukhumvit 20 → north-center (Phrom Phong area)
UPDATE properties
SET lat = 13.748800, lng = 100.572000
WHERE name = 'NOVOTEL Bangkok Sukhumvit 20'
  AND city_id = 'bangkok';

-- =============================================================================
-- SILOM ZONE
-- Zone boundary: lat [13.7250 – 13.7330], lng [100.5224 – 100.5400]
-- *** FIX: Lebua at State Tower was OUTSIDE zone on both axes.
-- =============================================================================

-- The Dusit Thani Bangkok → south-west of zone
UPDATE properties
SET lat = 13.725800, lng = 100.525800
WHERE name = 'The Dusit Thani Bangkok'
  AND city_id = 'bangkok';

-- Silom Village Inn → center of zone
UPDATE properties
SET lat = 13.729000, lng = 100.531800
WHERE name = 'Silom Village Inn'
  AND city_id = 'bangkok';

-- Lebua at State Tower → FIXED: moved from lat=13.7241,lng=100.5142 (OUTSIDE)
-- to lat=13.7322, lng=100.5378 (north-east inside Silom zone)
UPDATE properties
SET lat = 13.732200, lng = 100.537800
WHERE name = 'Lebua at State Tower'
  AND city_id = 'bangkok';

-- =============================================================================
-- SIAM ZONE
-- Zone boundary: lat [13.7420 – 13.7530], lng [100.5268 – 100.5420]
-- =============================================================================

-- Novotel Bangkok on Siam Square → south-west (Siam BTS area)
UPDATE properties
SET lat = 13.744000, lng = 100.529500
WHERE name = 'Novotel Bangkok on Siam Square'
  AND city_id = 'bangkok';

-- Wendy House Guesthouse → center-east (Kasemsan area)
UPDATE properties
SET lat = 13.747800, lng = 100.538800
WHERE name = 'Wendy House Guesthouse'
  AND city_id = 'bangkok';

-- Centara Grand at CentralWorld → north-center (CentralWorld)
UPDATE properties
SET lat = 13.751000, lng = 100.534800
WHERE name = 'Centara Grand at CentralWorld'
  AND city_id = 'bangkok';

-- =============================================================================
-- KHAO SAN ROAD ZONE
-- Zone boundary: lat [13.7560 – 13.7640], lng [100.4910 – 100.5040]
-- =============================================================================

-- Buddy Lodge Khao San → south-west (east end of Khao San)
UPDATE properties
SET lat = 13.757200, lng = 100.493000
WHERE name = 'Buddy Lodge Khao San'
  AND city_id = 'bangkok';

-- Vibe Hotel Bangkok → center (Soi Rambutri)
UPDATE properties
SET lat = 13.760000, lng = 100.498500
WHERE name = 'Vibe Hotel Bangkok'
  AND city_id = 'bangkok';

-- NapPark Hostel @ Khao San → north-east (Tani Rd area)
UPDATE properties
SET lat = 13.762800, lng = 100.501500
WHERE name = 'NapPark Hostel @ Khao San'
  AND city_id = 'bangkok';

-- =============================================================================
-- PATPONG ZONE
-- Zone boundary: lat [13.7190 – 13.7260], lng [100.5240 – 100.5330]
-- *** FIX: The Surawongse Hotel lat=13.7264 was marginally OUTSIDE (max 13.7260)
-- =============================================================================

-- Centre Point Silom Hotel → south-west of zone
UPDATE properties
SET lat = 13.720500, lng = 100.525500
WHERE name = 'Centre Point Silom Hotel'
  AND city_id = 'bangkok';

-- Holiday Inn Bangkok Silom → center of zone
UPDATE properties
SET lat = 13.723500, lng = 100.529500
WHERE name = 'Holiday Inn Bangkok Silom'
  AND city_id = 'bangkok';

-- The Surawongse Hotel → FIXED: moved from lat=13.7264 (marginally OUTSIDE)
-- to lat=13.7252 (safely inside Patpong zone)
UPDATE properties
SET lat = 13.725200, lng = 100.531500
WHERE name = 'The Surawongse Hotel'
  AND city_id = 'bangkok';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT
  p.name,
  sz.zone_name,
  p.lat,
  p.lng,
  sz.bounding_box->>'south' AS zone_lat_min,
  sz.bounding_box->>'north' AS zone_lat_max,
  sz.bounding_box->>'west'  AS zone_lng_min,
  sz.bounding_box->>'east'  AS zone_lng_max,
  CASE
    WHEN p.lat::numeric BETWEEN (sz.bounding_box->>'south')::numeric AND (sz.bounding_box->>'north')::numeric
     AND p.lng::numeric BETWEEN (sz.bounding_box->>'west')::numeric  AND (sz.bounding_box->>'east')::numeric
    THEN '✓ INSIDE'
    ELSE '✗ OUTSIDE — CHECK IMMEDIATELY'
  END AS position_check
FROM properties p
JOIN safety_zones sz ON p.zone_id = sz.id
WHERE p.city_id = 'bangkok' AND p.is_published = true
ORDER BY sz.zone_name, p.name;
