-- =============================================================================
-- Paris Property Coordinate Fixes
-- =============================================================================
-- Generated: 2026-04-11
-- Purpose: Move all properties inside their zone polygons with proper spacing.
--
-- Issues fixed:
--   1. Pullman Paris Montparnasse: lat=48.8419, lng=2.3185 was COMPLETELY
--      OUTSIDE the Gare du Nord zone (zone lat [48.8740 – 48.8855]).
--      The property description even says "Montparnasse alternative" — this
--      was always wrong. Moved into the Gare du Nord zone: lat=48.8840, lng=2.3652.
--
--   2. Hôtel des Arts Montmartre & Terrass' Hotel: only 180m apart (< 200m
--      minimum). Redistributed across the Montmartre zone.
--
--   3. All properties: redistributed for better visual spread.
--
-- Run in: Supabase SQL Editor
-- Run after: paris.sql seed is already applied
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM properties WHERE city_id = 'paris') THEN
    RAISE EXCEPTION 'No Paris properties found. Run paris.sql first.';
  END IF;
END $$;

-- =============================================================================
-- LE MARAIS ZONE
-- Zone boundary: lat [48.8498 – 48.8610], lng [2.3470 – 2.3630]
-- =============================================================================

-- Hôtel Pavillon de la Reine → center-east (near Place des Vosges)
UPDATE properties
SET lat = 48.853800, lng = 2.361200
WHERE name = 'Hôtel Pavillon de la Reine'
  AND city_id = 'paris';

-- BVJ Paris Marais Hostel → center of zone
UPDATE properties
SET lat = 48.855500, lng = 2.353000
WHERE name = 'BVJ Paris Marais Hostel'
  AND city_id = 'paris';

-- Hôtel de Jobo → north-west of zone
UPDATE properties
SET lat = 48.859200, lng = 2.348800
WHERE name = 'Hôtel de Jobo'
  AND city_id = 'paris';

-- =============================================================================
-- SAINT-GERMAIN-DES-PRÉS ZONE
-- Zone boundary: lat [48.8488 – 48.8585], lng [2.3255 – 2.3420]
-- =============================================================================

-- Hôtel Lutetia → south-west of zone (near Bd Raspail)
UPDATE properties
SET lat = 48.850200, lng = 2.327200
WHERE name = 'Hôtel Lutetia'
  AND city_id = 'paris';

-- Hôtel Récamier → center of zone (Place Saint-Sulpice area)
UPDATE properties
SET lat = 48.853800, lng = 2.333800
WHERE name = 'Hôtel Récamier'
  AND city_id = 'paris';

-- Hôtel de l''Odéon → north-east of zone
UPDATE properties
SET lat = 48.856800, lng = 2.339500
WHERE name = 'Hôtel de l''Odéon'
  AND city_id = 'paris';

-- =============================================================================
-- LATIN QUARTER ZONE
-- Zone boundary: lat [48.8432 – 48.8545], lng [2.3420 – 2.3590]
-- =============================================================================

-- Hôtel des Grands Hommes → south-west (Panthéon area)
UPDATE properties
SET lat = 48.846500, lng = 2.345200
WHERE name = 'Hôtel des Grands Hommes'
  AND city_id = 'paris';

-- Young and Happy Hostel → south-east (Rue Mouffetard)
UPDATE properties
SET lat = 48.845500, lng = 2.354800
WHERE name = 'Young and Happy Hostel'
  AND city_id = 'paris';

-- Hotel Seven → north-east of zone
UPDATE properties
SET lat = 48.851000, lng = 2.356000
WHERE name = 'Hotel Seven'
  AND city_id = 'paris';

-- =============================================================================
-- MONTMARTRE ZONE
-- Zone boundary: lat [48.8800 – 48.8930], lng [2.3325 – 2.3555]
-- *** FIX: Hotels des Arts & Terrass' were only 180m apart (< 200m minimum)
-- =============================================================================

-- Hôtel des Arts Montmartre → south-west (Abbesses village area)
UPDATE properties
SET lat = 48.882500, lng = 2.335500
WHERE name = 'Hôtel des Arts Montmartre'
  AND city_id = 'paris';

-- Terrass'' Hotel → center of zone (upper Montmartre)
UPDATE properties
SET lat = 48.887500, lng = 2.344500
WHERE name = 'Terrass'' Hotel'
  AND city_id = 'paris';

-- Le Village Hostel Montmartre → north-east of zone
UPDATE properties
SET lat = 48.891000, lng = 2.352000
WHERE name = 'Le Village Hostel Montmartre'
  AND city_id = 'paris';

-- =============================================================================
-- GARE DU NORD ZONE
-- Zone boundary: lat [48.8740 – 48.8855], lng [2.3470 – 2.3680]
-- *** CRITICAL FIX: Pullman Paris Montparnasse was at lat=48.8419 — ENTIRELY
--     OUTSIDE this zone (zone starts at 48.8740, property was 3.3km south).
--     Moved to north-east corner of zone.
-- =============================================================================

-- Hôtel du Nord — Eurostar → south-west (near station entrance)
UPDATE properties
SET lat = 48.878200, lng = 2.351200
WHERE name = 'Hôtel du Nord — Eurostar'
  AND city_id = 'paris';

-- Ibis Paris Gare du Nord TGV → center-east
UPDATE properties
SET lat = 48.880800, lng = 2.359800
WHERE name = 'Ibis Paris Gare du Nord TGV'
  AND city_id = 'paris';

-- Pullman Paris Montparnasse → FIXED: moved from lat=48.8419 (Montparnasse)
-- to lat=48.8840 (north-east of Gare du Nord zone)
UPDATE properties
SET lat = 48.884000, lng = 2.365200
WHERE name = 'Pullman Paris Montparnasse'
  AND city_id = 'paris';

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
WHERE p.city_id = 'paris' AND p.is_published = true
ORDER BY sz.zone_name, p.name;
