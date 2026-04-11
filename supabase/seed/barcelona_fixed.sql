-- =============================================================================
-- Barcelona Property Coordinate Fixes
-- =============================================================================
-- Generated: 2026-04-11
-- Purpose: Move all properties inside their zone polygons with proper spacing.
--
-- Issues fixed:
--   - Hotel Arts Barcelona: lat=41.3878 was OUTSIDE Barceloneta zone
--     (zone max lat = 41.3830). Moved to lat=41.3812.
--   - All properties: redistributed for minimum 200m spacing.
--
-- Run in: Supabase SQL Editor
-- Run after: barcelona.sql seed is already applied
-- =============================================================================

-- SAFETY CHECK: verify properties exist before updating
-- (comment out if you prefer to run blind)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM properties WHERE city_id = 'barcelona') THEN
    RAISE EXCEPTION 'No Barcelona properties found. Run barcelona.sql first.';
  END IF;
END $$;

-- =============================================================================
-- EIXAMPLE ZONE
-- Zone boundary: lat [41.3825 – 41.4010], lng [2.1485 – 2.1785]
-- All 3 properties were inside but redistributed for better visual spacing.
-- =============================================================================

-- Hotel Majestic Barcelona → center-east of zone
UPDATE properties
SET lat = 41.392800, lng = 2.168000
WHERE name = 'Hotel Majestic Barcelona'
  AND city_id = 'barcelona';

-- Cosmo Hotel Barcelona → south-west of zone
UPDATE properties
SET lat = 41.387200, lng = 2.155500
WHERE name = 'Cosmo Hotel Barcelona'
  AND city_id = 'barcelona';

-- Praktik Bakery Hotel → north-center of zone
UPDATE properties
SET lat = 41.396800, lng = 2.162000
WHERE name = 'Praktik Bakery Hotel'
  AND city_id = 'barcelona';

-- =============================================================================
-- GRÀCIA ZONE
-- Zone boundary: lat [41.3990 – 41.4120], lng [2.1475 – 2.1680]
-- Properties redistributed for better spacing.
-- =============================================================================

-- Casa Gracia Barcelona Hostel → south-west of zone
UPDATE properties
SET lat = 41.401200, lng = 2.151000
WHERE name = 'Casa Gracia Barcelona Hostel'
  AND city_id = 'barcelona';

-- Hotel Catalonia Gracia → center-east of zone
UPDATE properties
SET lat = 41.406000, lng = 2.162500
WHERE name = 'Hotel Catalonia Gracia'
  AND city_id = 'barcelona';

-- Generator Barcelona → north-center of zone
UPDATE properties
SET lat = 41.410000, lng = 2.154500
WHERE name = 'Generator Barcelona'
  AND city_id = 'barcelona';

-- =============================================================================
-- GOTHIC QUARTER ZONE
-- Zone boundary: lat [41.3780 – 41.3875], lng [2.1700 – 2.1835]
-- Properties redistributed for even spread across the zone.
-- =============================================================================

-- Hotel Neri → south-west of zone
UPDATE properties
SET lat = 41.380000, lng = 2.172000
WHERE name = 'Hotel Neri'
  AND city_id = 'barcelona';

-- Barceló Gothic → center of zone
UPDATE properties
SET lat = 41.383800, lng = 2.178000
WHERE name = 'Barceló Gothic'
  AND city_id = 'barcelona';

-- Hostal Llorens → north-east of zone
UPDATE properties
SET lat = 41.386200, lng = 2.181000
WHERE name = 'Hostal Llorens'
  AND city_id = 'barcelona';

-- =============================================================================
-- EL RAVAL ZONE
-- Zone boundary: lat [41.3760 – 41.3880], lng [2.1600 – 2.1730]
-- Properties redistributed across zone.
-- =============================================================================

-- Hotel España → south-west of zone
UPDATE properties
SET lat = 41.377800, lng = 2.161500
WHERE name = 'Hotel España'
  AND city_id = 'barcelona';

-- Barceló Raval → center of zone
UPDATE properties
SET lat = 41.382000, lng = 2.166500
WHERE name = 'Barceló Raval'
  AND city_id = 'barcelona';

-- Casa Camper Barcelona → north-east of zone
UPDATE properties
SET lat = 41.385800, lng = 2.170800
WHERE name = 'Casa Camper Barcelona'
  AND city_id = 'barcelona';

-- =============================================================================
-- BARCELONETA ZONE
-- Zone boundary: lat [41.3740 – 41.3830], lng [2.1845 – 2.1975]
-- *** CRITICAL FIX: Hotel Arts Barcelona was lat=41.3878, OUTSIDE zone (max 41.3830)
-- =============================================================================

-- Hotel Arts Barcelona → FIXED: moved from lat=41.3878 to lat=41.3812 (north-east inside zone)
UPDATE properties
SET lat = 41.381200, lng = 2.195800
WHERE name = 'Hotel Arts Barcelona'
  AND city_id = 'barcelona';

-- H10 Port Vell → south-center of zone
UPDATE properties
SET lat = 41.375800, lng = 2.189000
WHERE name = 'H10 Port Vell'
  AND city_id = 'barcelona';

-- Sea Point Hostel → center-west of zone
UPDATE properties
SET lat = 41.378000, lng = 2.185800
WHERE name = 'Sea Point Hostel'
  AND city_id = 'barcelona';

-- =============================================================================
-- VERIFICATION
-- Expected: all properties show coordinates inside their zone bounding boxes
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
WHERE p.city_id = 'barcelona' AND p.is_published = true
ORDER BY sz.zone_name, p.name;
