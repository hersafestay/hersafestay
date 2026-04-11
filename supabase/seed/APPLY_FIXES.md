# Apply Property Coordinate Fixes

> **Purpose:** Fix properties that were outside their zone polygons or too close together.
> **Scope:** 45 properties across 3 cities (15 per city, 3 per zone)

---

## What Was Fixed

| City | Property | Issue | Fix |
|------|----------|-------|-----|
| Barcelona | Hotel Arts Barcelona | lat=41.3878 **OUTSIDE** Barceloneta (max 41.3830) | Moved to lat=41.3812 |
| Paris | Pullman Paris Montparnasse | lat=48.8419 **FAR OUTSIDE** Gare du Nord zone (min lat 48.8740, 3.3km off) | Moved inside zone |
| Paris | Hôtel des Arts + Terrass' Hotel | Only **180m apart** (< 200m minimum) | Redistributed across Montmartre |
| Bangkok | Lebua at State Tower | lat=13.7241, lng=100.5142 **OUTSIDE** Silom on both axes | Moved inside zone |
| Bangkok | The Surawongse Hotel | lat=13.7264 **marginally outside** Patpong (max 13.7260) | Moved to lat=13.7252 |
| All | Various | Clustered — needed better visual distribution | Redistributed with 200m+ spacing |

---

## How to Apply

### Step 1: Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) → Sign In
2. Select your `hersafestay-prod` project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Apply Barcelona Fixes

1. Open `supabase/seed/barcelona_fixed.sql` in this repo
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run**
5. Check the verification output at the bottom — every row should show `✓ INSIDE`

### Step 3: Apply Paris Fixes

1. Open `supabase/seed/paris_fixed.sql`
2. Copy → Paste → Run
3. Verify: every row shows `✓ INSIDE`

### Step 4: Apply Bangkok Fixes

1. Open `supabase/seed/bangkok_fixed.sql`
2. Copy → Paste → Run
3. Verify: every row shows `✓ INSIDE`

### Step 5: Verify on the Map

1. Open your map page (e.g., `localhost:3000/map`)
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Select Barcelona → all 15 properties should be inside colored zones
4. Select Paris → same check
5. Select Bangkok → same check

### Step 6: Clear CDN Cache (if deployed)

If you've deployed to Vercel and the map is cached:

```bash
# Redeploy to bust the cache
vercel --prod

# Or trigger a manual redeploy in Vercel Dashboard:
# Deployments → ... → Redeploy
```

---

## Backup (Optional)

If you want to back up current coordinates before applying:

```sql
-- Run in Supabase SQL Editor before applying fixes
SELECT
  p.name,
  p.city_id,
  p.lat AS current_lat,
  p.lng AS current_lng,
  sz.zone_name
FROM properties p
JOIN safety_zones sz ON p.zone_id = sz.id
WHERE p.city_id IN ('barcelona', 'paris', 'bangkok')
ORDER BY p.city_id, sz.zone_name, p.name;
```

Copy the result to a spreadsheet if you want a fallback.

---

## Distribution Verification Query

Run this after applying all fixes to confirm spacing is adequate:

```sql
-- Check property distribution per zone
SELECT
  c.name AS city,
  z.zone_name,
  COUNT(p.id) AS property_count,
  ROUND(MIN(p.lat)::numeric, 6) AS min_lat,
  ROUND(MAX(p.lat)::numeric, 6) AS max_lat,
  ROUND(MIN(p.lng)::numeric, 6) AS min_lng,
  ROUND(MAX(p.lng)::numeric, 6) AS max_lng,
  -- lat spread in degrees (> 0.004 = well distributed)
  ROUND((MAX(p.lat) - MIN(p.lat))::numeric, 4) AS lat_spread,
  ROUND((MAX(p.lng) - MIN(p.lng))::numeric, 4) AS lng_spread
FROM properties p
JOIN safety_zones z ON p.zone_id = z.id
JOIN cities c ON p.city_id = c.id
WHERE p.city_id IN ('barcelona', 'paris', 'bangkok')
  AND p.is_published = true
GROUP BY c.name, z.zone_name
ORDER BY c.name, z.zone_name;
```

**Expected:** every zone shows `lat_spread > 0.003` and `lng_spread > 0.003`, indicating properties are spread across the zone rather than clustered.

---

## Using distribute-properties.js for Future Cities

When adding new cities (London, NYC), use the script to generate coordinates:

```bash
# From project root
node scripts/distribute-properties.js

# The script will:
# 1. Print coordinate suggestions for each zone
# 2. Validate each point is inside the polygon
# 3. Print ✓ INSIDE or ✗ OUTSIDE for each point
```

Then add the zone to `ZONES` in `scripts/distribute-properties.js` and the script will generate coordinates automatically.

---

*Created: 2026-04-11*
