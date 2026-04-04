# Supabase Setup — HerSafeStay

We are NOT using the Supabase CLI for MVP. All migrations are run manually via the Supabase Dashboard SQL Editor.

**Project URL:** `https://nneptdcgotvjdghdkdna.supabase.co`

---

## Run Order (CRITICAL — follow this exactly)

```
001_enable_postgis.sql    ← Run FIRST
002_create_tables.sql     ← Run SECOND
barcelona.sql             ← Run THIRD (after tables exist)
```

---

## Step-by-Step Instructions

### Step 1: Open the SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select the `hersafestay` project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

---

### Step 2: Run Migration 001 — Enable PostGIS

1. Open `supabase/migrations/001_enable_postgis.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** (or press Cmd+Enter)

**Expected output:**
```
extname  | extversion
---------|----------
postgis  | 3.x.x
uuid-ossp| 1.1
```

If you see both rows, PostGIS is enabled. Proceed.

---

### Step 3: Run Migration 002 — Create Tables

1. Open `supabase/migrations/002_create_tables.sql`
2. Copy the entire contents
3. Paste into SQL Editor (replace previous query)
4. Click **Run**

**Expected output:**
```
table_name
-----------
cities
properties
safety_zones
zone_reports

routine_name
---------------------
get_zone_for_point
get_zones_for_city
get_zones_in_bbox
```

If you see 4 tables and 3 functions, the schema is correct.

---

### Step 4: Run Barcelona Seed Data

1. Open `supabase/seed/barcelona.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run**

**Expected output:**
```
-- City verification:
id          | name       | zone_count | property_count
------------|------------|------------|---------------
barcelona   | Barcelona  | 5          | 15

-- Zones verification (5 rows, ordered by score):
zone_name       | safety_level | safety_score | color_code | property_count
----------------|--------------|--------------|------------|---------------
Eixample        | safe         | 9.0          | #2D6A4F    | 3
Gràcia          | safe         | 9.0          | #2D6A4F    | 3
Barceloneta     | safe         | 8.0          | #2D6A4F    | 3
Gothic Quarter  | caution      | 6.0          | #F4A261    | 3
El Raval        | avoid        | 4.0          | #E63946    | 3

-- Properties (15 rows across all zones)
```

---

### Step 5: Verify the RPC Function Works

Run this test query to confirm the `get_zones_for_city` function works:

```sql
SELECT zone_name, safety_level, safety_score, centroid_lat, centroid_lng
FROM get_zones_for_city('barcelona')
ORDER BY safety_score DESC;
```

You should see 5 rows with real lat/lng centroid values. If you see them, the PostGIS geography → GeoJSON conversion is working correctly.

---

### Step 6: Test in the Browser

1. Start local dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-db`
3. You should see:
   - Green "Connected" badge
   - Barcelona listed under Published Cities
   - 5 zone cards (green × 3, amber × 1, red × 1)
   - Each card with score breakdown bars
   - Click "Show full details" to see tips and GeoJSON geometry

---

## Troubleshooting

### "relation 'safety_zones' does not exist"
You skipped migration 002. Run it before the seed data.

### "function get_zones_for_city does not exist"
Migration 002 failed or was partially run. Re-run it from the top.

### "duplicate key value violates unique constraint"
The seed data has already been inserted. Either:
- It's already there (run the SELECT verification queries to check)
- Or truncate and re-run: `TRUNCATE cities, safety_zones, properties, zone_reports CASCADE;`

### "permission denied for table safety_zones"
Row Level Security (RLS) may be blocking reads. For MVP development:
```sql
-- Temporarily allow all reads (lock this down before production)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read" ON safety_zones FOR SELECT USING (is_published = true);
CREATE POLICY "Public read" ON properties FOR SELECT USING (is_published = true);
```

### Coordinates look wrong on the map
Remember: **PostGIS always takes LONGITUDE first, then LATITUDE.**
`ST_GeogFromText('SRID=4326;POINT(2.17 41.38)')` → correct (lng=2.17, lat=41.38)
`ST_GeogFromText('SRID=4326;POINT(41.38 2.17)')` → WRONG (will place Barcelona in Africa)

---

## Table Summary

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `cities` | City catalog | `id`, `lat`, `lng`, `default_zoom` |
| `safety_zones` | Neighborhood polygons + safety data | `coordinates` (GEOGRAPHY POLYGON), `safety_score`, `safety_level` |
| `properties` | Hotels/hostels on the map | `lat`, `lng`, `zone_id`, `women_rating` |
| `zone_reports` | User safety reports (moderated) | `zone_id`, `incident_type`, `status` |

## Functions

| Function | Called From | Returns |
|----------|-------------|---------|
| `get_zones_for_city(city_id)` | `lib/database.js` | All published zones with GeoJSON geometry |
| `get_zone_for_point(lat, lng)` | Admin scripts | Zone ID containing a point |
| `get_zones_in_bbox(city, n, s, e, w)` | Future map API | Zones intersecting viewport |

---

## Environment Variables

Set in `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=https://nneptdcgotvjdghdkdna.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AtcwnYOiLMizOkCrJpLz0w_8zG4VoGP
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Dashboard → Settings → API>
```

Set the same variables in Vercel Dashboard → Project → Settings → Environment Variables.

---

*Last updated: 2026-04-05*
