# HerSafeStay — 14-Day MVP Build Plan

> **The safety map IS the product.** Every day of this plan moves us toward a beautiful, fast, accurate interactive safety map for women travelers.

**Start date:** April 4, 2026
**Target launch:** April 18, 2026

**Milestone checkpoints:**
- End of Week 1 (April 10): Map is live with 3 cities, zones visible, clickable
- End of Week 2 (April 17): All 5 cities, accommodations on map, polished, ready to launch
- Launch day (April 18): Public announcement 🚀

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | In progress |
| ⏳ | Pending |
| ❌ | Blocked |
| 🚨 | Critical path — cannot slip |

---

## Week 1: Build the Safety Map Core

---

### Day 1 — Architecture & Foundation
**Date:** April 4, 2026
**Expert role:** Solutions Architect + Database Engineer
**Status:** ✅ Complete

**Goal:** Solid foundation before first line of map code.

#### Deliverables

- [x] ARCHITECTURE.md — complete safety map architecture ✅
- [x] PROGRESS.md — this roadmap ✅
- [x] SOLUTIONS.md — solution log template ✅
- [x] OPTIMIZATIONS.md — optimization log ✅
- [x] TESTING_CHECKLIST.md — testing requirements ✅
- [ ] Supabase project created (name: `hersafestay-prod`) — ⚠️ Run SQL migrations to complete
- [ ] PostGIS extension enabled on Supabase — ⚠️ Run 001_enable_postgis.sql
- [ ] Database schema migrations run (all 4 tables + indexes) — ⚠️ Run 002_create_tables.sql
- [ ] Barcelona seed data inserted — ⚠️ Run supabase/seed/barcelona.sql
- [x] `.env.local` created with Supabase keys ✅
- [ ] Supabase keys added to Vercel environment variables
- [ ] Google Cloud project created with billing enabled
- [ ] Maps JavaScript API + Geocoding API + Places API enabled
- [ ] Google Maps API key created with HTTP referrer restrictions
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` added to `.env.local` and Vercel

**Testing requirements:**
- [ ] Supabase connection works: `supabase.from('cities').select('*')` returns 5 rows
- [ ] No "For development purposes only" watermark on Google Maps basic test

**Success criteria:**
> Can execute `SELECT * FROM cities` and see Barcelona, Bangkok, Paris, London, NYC.
> Google Maps API key works without watermark.

**Notes:**
> Day 1 delivered documentation only. Day 2 picked up the database infrastructure work.

---

### Day 2 — Database Infrastructure + Supabase Setup
**Date:** April 5, 2026
**Expert role:** Backend Engineer + Database Architect
**Status:** ✅ Complete (code) — ⚠️ Run SQL migrations to fully activate

**Goal:** Complete database infrastructure with PostGIS, Barcelona seed data, and verified connection.

#### Deliverables

- [x] `@supabase/supabase-js` installed ✅
- [x] `.env.local` created with Supabase credentials ✅ (already in .gitignore via `.env*`)
- [x] `lib/supabase.js` — Supabase client (public + admin) ✅
- [x] `lib/database.js` — full data access layer (getSafetyZones, getCities, testConnection, etc.) ✅
- [x] `supabase/migrations/001_enable_postgis.sql` — PostGIS + uuid-ossp ✅
- [x] `supabase/migrations/002_create_tables.sql` — all 4 tables + GIST indexes + 3 RPC functions ✅
- [x] `supabase/seed/barcelona.sql` — 1 city + 5 zones + 15 properties with real coordinates ✅
- [x] `app/test-db/page.js` — visual test page at /test-db ✅
- [x] `supabase/README.md` — step-by-step migration instructions ✅
- [x] SOLUTIONS.md updated (SOLUTION-019, SOLUTION-020) ✅
- [x] OPTIMIZATIONS.md updated (OPT-011 GIST indexes) ✅
- [ ] ⚠️ Run SQL in Supabase Dashboard (see supabase/README.md for exact steps)
- [ ] ⚠️ Verify /test-db page shows 5 zones after running migrations

**Barcelona zones (seed data):**
| Zone | Safety Level | Score | Color |
|------|-------------|-------|-------|
| Eixample | Safe | 9.0 | #2D6A4F |
| Gràcia | Safe | 9.0 | #2D6A4F |
| Barceloneta | Safe | 8.0 | #2D6A4F |
| Gothic Quarter | Caution | 6.0 | #F4A261 |
| El Raval | Avoid | 4.0 | #E63946 |

**Key technical decisions:**
- PostGIS GEOGRAPHY(POLYGON, 4326) for zone polygons — all coordinates LONGITUDE FIRST
- `get_zones_for_city()` RPC function converts PostGIS geography → GeoJSON in SQL (avoids binary blob in JS)
- GIST indexes on all geography columns (OPT-011)
- `lib/database.js` uses `.rpc()` for zone fetching, direct `.from()` for scalar queries

**Testing requirements:**
- [ ] Run: `SELECT * FROM get_zones_for_city('barcelona')` → 5 rows with real coordinates
- [ ] Open http://localhost:3000/test-db → green Connected badge, 5 zone cards visible
- [ ] Zone cards show score breakdown bars and PostGIS geometry type

**Success criteria:**
> /test-db shows: Connected + Barcelona city + 5 colored zone cards with safety scores.
> Each zone card has score breakdown, tips, and confirms GeoJSON geometry is present.

**Notes:**
> SQL migrations must be run manually in Supabase Dashboard SQL Editor.
> See supabase/README.md for exact step-by-step instructions.

---

### Day 3 — Google Maps Integration + Barcelona Safety Zones 🚨
**Date:** April 6, 2026
**Expert role:** Frontend Map Engineer + GIS Specialist
**Status:** ✅ Complete

**Goal:** Interactive Google Map with color-coded Barcelona safety zone polygons.

#### Deliverables

- [x] `@react-google-maps/api` installed ✅
- [x] `lib/mapUtils.js` — GeoJSON→Google Maps coordinate conversion, color helpers ✅
- [x] `lib/safetyColors.js` — SAFETY_COLORS constants ✅
- [x] `lib/mapStyles.js` — custom Google Maps style (cream base, no POI clutter) ✅
- [x] `components/map/SafetyMap.jsx` — full interactive map with zones + InfoWindows + legend ✅
  - `useJsApiLoader` for API loading
  - `ZonePolygon` (React.memo + memoized options — zero flicker, SOLUTION-002)
  - `ZoneInfoContent` — all inline styles (iOS Safari safe, SOLUTION-012)
  - `MapLegend` — top-right overlay
  - Loading/error states
- [x] `app/map/page.js` — full-screen map page, dynamic import (`ssr: false`), header, back link ✅
- [x] Home page "View Safety Map" CTA button — coral gradient, prominent, links to /map ✅
- [x] GeoJSON [lng,lat] → {lat,lng} conversion in `geoJsonToGooglePath()` (SOLUTION-021) ✅
- [x] Only one InfoWindow open at a time ✅
- [x] Click map background → InfoWindow closes ✅
- [x] Zones fetch from Supabase via `getSafetyZones('barcelona')` ✅

**Barcelona zones seeded (Day 2 database):**
| Zone | Level | Score | Color |
|------|-------|-------|-------|
| Eixample | safe | 9.0 | #2D6A4F |
| Gràcia | safe | 9.0 | #2D6A4F |
| Barceloneta | safe | 8.0 | #2D6A4F |
| Gothic Quarter | caution | 6.0 | #F4A261 |
| El Raval | avoid | 4.0 | #E63946 |

**Notes:**
> CRITICAL: GeoJSON stores [longitude, latitude] — Google Maps wants { lat, lng }. The `geoJsonToGooglePath()` function handles this conversion correctly.
> InfoWindow content uses 100% inline styles (required for iOS Safari iframe isolation).
> ZonePolygon memoized with React.memo + useMemo options to prevent flicker on state changes.
> Map requires SQL migrations to be run in Supabase first (see supabase/README.md).

**Next:** Day 4 — Zone detail panel, Bangkok + Paris data, city selector

---

### Day 4 — Property Pins + Paris & Bangkok + City Selector
**Date:** April 6, 2026
**Expert role:** Frontend Engineer + Data Engineer
**Status:** ✅ Complete

**Goal:** Property markers on map, 3-city support (Barcelona + Paris + Bangkok), city selector in header.

#### Deliverables

- [x] `supabase/seed/paris.sql` — Paris city + 5 zones + 15 properties (EUR) ✅
  - Le Marais (9.0, safe), Saint-Germain (8.0, safe), Latin Quarter (8.0, safe)
  - Montmartre (6.0, caution), Gare du Nord (4.0, avoid)
- [x] `supabase/seed/bangkok.sql` — Bangkok city + 5 zones + 15 properties (USD) ✅
  - Sukhumvit (9.0, safe), Silom (8.0, safe), Siam (8.0, safe)
  - Khao San Road (6.0, caution), Patpong (4.0, avoid)
- [x] `lib/database.js` — added `getPropertiesForCity()` with zone join ✅
- [x] `lib/mapUtils.js` — added `getPropertyMarkerIcon()`, `formatPrice()`, `formatWomenRating()` ✅
  - SVG data URI pins per property type (hotel/hostel/apartment/guesthouse)
  - Color palette: hotel=coral, hostel=blue, apartment=forest, guesthouse=amber
- [x] `components/map/CitySelector.jsx` — pill tab selector (Barcelona 🇪🇸 / Paris 🇫🇷 / Bangkok 🇹🇭) ✅
- [x] `components/map/SafetyMap.jsx` — full rewrite with multi-city + property markers ✅
  - `CITY_CONFIGS` — center/zoom per city
  - `PropertyMarker` component (memo + useMemo icon — no flicker)
  - `PropertyInfoContent` — fully inline styles (iOS Safari safe)
  - Dual InfoWindow: zone vs property (selecting one clears the other)
  - Parallel fetch: `Promise.all([getSafetyZones, getPropertiesForCity])`
  - `mapRef` → `panTo()` + `setZoom()` on city change
- [x] `app/map/MapPageClient.jsx` — `selectedCity` state + `CitySelector` in header ✅

**Paris zones seeded (pending SQL migration):**
| Zone | Level | Score |
|------|-------|-------|
| Le Marais | safe | 9.0 |
| Saint-Germain-des-Prés | safe | 8.0 |
| Latin Quarter | safe | 8.0 |
| Montmartre | caution | 6.0 |
| Gare du Nord | avoid | 4.0 |

**Bangkok zones seeded (pending SQL migration):**
| Zone | Level | Score |
|------|-------|-------|
| Sukhumvit | safe | 9.0 |
| Silom | safe | 8.0 |
| Siam | safe | 8.0 |
| Khao San Road | caution | 6.0 |
| Patpong | avoid | 4.0 |

**Notes:**
> SVG property pin icons built as base64 data URIs — no external image requests, must be created in browser context after Google Maps API loads (`window.google.maps.Size/Point` required).
> Dual InfoWindow: `selectedZone` + `selectedProperty` state; selecting one clears the other. Click map background clears both.
> Paris + Bangkok SQL files must be run manually in Supabase SQL Editor before zones appear on map.
> Build verified clean: `✓ /`, `✓ /map`, `✓ /test-db` routes all pass.

**Next:** Day 5 — Zone detail panel, filter system, accommodation list sidebar

---

### Day 5 — Accommodation Pins + Filter System
**Date:** April 8, 2026
**Expert role:** Frontend Engineer
**Status:** ⏳

**Goal:** Hotels and hostels appear as pins ON the safety zones. Filtering works.

#### Deliverables

- [ ] Migrate existing `ACCOMMODATIONS` data from `page.js` into Supabase `properties` table
  - Assign each property to correct `zone_id` (which zone is it in?)
  - Set lat/lng coordinates for each property
- [ ] `app/api/properties/route.js` — API endpoint for property pins
- [ ] `components/map/AccommodationPin.jsx` — custom SVG pin (coral pin + cream shield matching brand)
- [ ] `components/map/PropertyDetail.jsx` — property popup/sheet when pin clicked
  - Property name, type, star rating
  - Women's safety rating (not generic)
  - Safety features list
  - Price per night
  - Booking link
  - "Zone: Eixample — Safety score: 8.5/10" (link zone to property)
- [ ] Safety level filter integrated into MapControls:
  - Toggle buttons: Safe / Caution / Avoid
  - Clicking filters hide zones of other levels
  - Zone count label updates: "Showing 8 of 12 zones"
- [ ] Parallel fetch: zones + properties load simultaneously (Promise.all)
- [ ] Accommodation pins load for selected city

**Dependency:** Days 3 & 4 complete

**Testing requirements:**
- [ ] Accommodation pins visible on map for Barcelona
- [ ] Custom pin design (not default Google teardrop)
- [ ] Click any pin → property detail opens within 300ms
- [ ] Property's zone safety score shows in property detail
- [ ] Filter "Safe only" → only green zones + their properties visible
- [ ] Filter "Caution" → only amber zones visible
- [ ] Clearing filters → all zones return
- [ ] Parallel fetch working: check Network tab, both requests fire simultaneously

**Success criteria:**
> The map tells the full story: green/amber/red zones + hotel pins on the zones.
> User filters to "Safe only" → sees only green zones with hotels they can book.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 6 — London + NYC + Mobile Optimization
**Date:** April 9, 2026
**Expert role:** Mobile Engineer + GIS Specialist
**Status:** ⏳

**Goal:** All 5 cities mapped. Map is excellent on mobile.

#### Deliverables

- [ ] `data/zones/london.json` — London zones (10–12: Covent Garden, Soho, Shoreditch, South Bank, Kings Cross, Brixton, Notting Hill, Canary Wharf, Greenwich, Hackney)
- [ ] `data/zones/nyc.json` — NYC zones (10–12: Midtown, Times Square area, Lower Manhattan, Brooklyn Heights, Williamsburg, Harlem, LES, Upper West Side, Queens/Astoria, Flushing)
- [ ] London + NYC data imported to Supabase
- [ ] All 5 cities working in city selector
- [ ] Mobile layout implementation:
  - Map: full viewport height on mobile (`100dvh - nav`)
  - Zone detail: bottom sheet with drag-to-close
  - Touch: `touch-action: none` on map container
  - iOS: `100dvh` fix applied
  - Breakpoints: mobile full-screen, tablet split, desktop side-by-side
- [ ] `next.config.js` updated with Unsplash image hostname
- [ ] `<Image>` component replacing `<img>` tags on accommodation cards

**Dependency:** Days 3–5 complete

**Testing requirements:**
- [ ] All 5 cities display zones correctly
- [ ] Real iPhone (or BrowserStack): map fills viewport without iOS bottom bar overlap
- [ ] Swipe-to-close on zone detail bottom sheet works
- [ ] No scroll conflict: panning map doesn't scroll page underneath
- [ ] Landscape orientation: map layout adjusts correctly
- [ ] London Brixton should be amber, Covent Garden should be green (sense check)
- [ ] NYC Times Square area should be amber (high tourist crime), Brooklyn Heights green

**Success criteria:**
> 5 cities. Perfect on phone. 5-minute session on iPhone — no confusion, no broken layout, no frustration.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 7 — Performance + Polish + Buffer
**Date:** April 10, 2026
**Expert role:** Performance Engineer
**Status:** ⏳

**Goal:** Map loads in <2 seconds. Everything is polished. Buffer day for any slippage.

#### Deliverables

- [ ] Run polygon coordinate simplification on all 5 cities (target: <30KB each)
- [ ] CDN cache headers verified on all API routes
- [ ] `React.memo` on `ZonePolygon` + memoized options (OPT-005, OPT-006)
- [ ] Dynamic import confirmed working (map bundle not in main JS)
- [ ] Run Lighthouse on mobile → score ≥ 85
- [ ] Fix any Lighthouse failures
- [ ] Fix any console errors from previous 6 days
- [ ] Run full TESTING_CHECKLIST.md — all critical items passing
- [ ] Week 1 retrospective: what slipped? what needs more time in Week 2?
- [ ] Buffer: catch up on any Day 3–6 items that weren't completed

**Testing requirements:**
- [ ] Lighthouse mobile score ≥ 85
- [ ] Map loads <2 seconds on 4G throttle
- [ ] `/api/zones` responds <100ms (cache hit)
- [ ] Zero console errors across all 5 cities
- [ ] All critical items in TESTING_CHECKLIST.md marked ✅

**Success criteria:**
> 5 cities. Fast. No errors. Ready for Week 2 enhancements.

**Week 1 Checkpoint:**
> The safety map works. Barcelona, Bangkok, Paris, London, NYC all have colored zones.
> Users can click zones and learn about safety. Hotels are plotted on zones.
> The core product exists and works on mobile.

---

## Week 2: Enhancement, Polish & Launch

---

### Day 8 — City Landing Pages + SEO
**Date:** April 11, 2026
**Expert role:** SEO Engineer + Content Strategist
**Status:** ⏳

**Goal:** Each city gets its own SEO-optimized page that drives organic traffic.

#### Deliverables

- [ ] `app/city/[slug]/page.js` — dynamic city landing pages
  - Server-side rendered (SSR, not client-side) for SEO
  - `metadata` export with city-specific title/description/OG tags
  - Hero: "Barcelona Safety Map for Women Travelers"
  - Safety overview stats (X zones: Y safe, Z caution, W avoid)
  - Embedded interactive map (lazy-loaded)
  - Zone list with safety scores (text-based for SEO)
  - "Best areas to stay" section (top 3 safe zones)
  - CTA: "Find safe hotels in Barcelona →"
- [ ] `app/city/[slug]/page.js` — generate static paths for all 5 cities
- [ ] City pages linked from main navigation
- [ ] `/sitemap.xml` updated to include city pages
- [ ] OG images: generate city-specific social preview images

**Testing requirements:**
- [ ] `/city/barcelona` loads and shows Barcelona map + content
- [ ] Page title is "Barcelona Safety Map for Women Travelers | HerSafeStay"
- [ ] Google Search Console can crawl the page (no noindex tags)
- [ ] `curl https://hersafestay.com/city/barcelona` returns HTML with content (SSR working)

**Success criteria:**
> `site:hersafestay.com/city` shows 5 indexed city pages in Google Search Console.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 9 — User Safety Report System
**Date:** April 12, 2026
**Expert role:** Full-Stack Engineer
**Status:** ⏳

**Goal:** Women travelers can contribute safety observations. Community data flywheel begins.

#### Deliverables

- [ ] `components/shared/ReportModal.jsx` — safety report modal
  - Accessible from zone detail panel ("Report safety experience")
  - Form: incident type, time of day, description (optional), star rating
  - Submit → POST `/api/reports`
  - Success confirmation message
  - Rate limit messaging (if exceeded)
- [ ] `app/api/reports/route.js` — report submission endpoint
  - Validate input
  - Hash email + IP for anonymized duplicate detection
  - Rate limit: 5 per IP per day
  - Save with `status: 'pending'`
  - Return success/error
- [ ] Email notification to admin when new report submitted (Supabase webhook → simple email)
- [ ] Basic admin view in Supabase table editor (no custom admin UI needed for MVP)

**Testing requirements:**
- [ ] Submit a test report → appears in Supabase with `status: 'pending'`
- [ ] Submit 6 reports in a row → 6th is rejected with rate limit message
- [ ] Duplicate submission (same zone, same day) → graceful rejection
- [ ] Report does NOT change any zone scores (pending status only)
- [ ] Form submits on mobile (test on iPhone)

**Success criteria:**
> TypeForm survey supplemented by in-app reports. Community data collection begins.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 10 — Advanced Map Features
**Date:** April 13, 2026
**Expert role:** Frontend Map Engineer
**Status:** ⏳

**Goal:** Map is delightful to use. Advanced features that differentiate from competitors.

#### Deliverables

- [ ] Zone hover states (desktop): opacity increases on mouse-over, zone name tooltip
- [ ] Accommodation marker clustering (when >15 pins: cluster markers with count badge)
- [ ] Zoom-based detail levels:
  - Zoom 10–11: Only zone colors, no labels
  - Zoom 12–13: Zone names appear as labels
  - Zoom 14+: Individual property pins visible
- [ ] City overview mode: zoom out to see all 5 cities on one world map as dots
- [ ] Map search: type a neighborhood name → map pans to that zone
- [ ] "My Location" button → center map on user's GPS location (with permission)
- [ ] Safety summary card: fixed overlay showing "You're viewing: Eixample — Safety score: 8.5"
- [ ] Analytics events: track `zone_clicked`, `city_selected`, `property_viewed`, `report_submitted`

**Testing requirements:**
- [ ] Hover on zone (desktop) → shows zone name tooltip within 100ms
- [ ] Zoom to level 14 → accommodation pins appear
- [ ] Zoom to level 10 → only colors, no pins (performance)
- [ ] Clustering: zoom out with >15 pins → clusters form correctly
- [ ] Location button: permission prompt fires, map centers correctly
- [ ] Analytics events firing in GA4 Realtime dashboard

**Success criteria:**
> Map feels polished and professional. A screenshot of any city looks beautiful enough to share on social.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 11 — Property Detail Pages + Booking Integration
**Date:** April 14, 2026
**Expert role:** Full-Stack Engineer
**Status:** ⏳

**Goal:** Users can go from map → property → book. Full conversion funnel exists.

#### Deliverables

- [ ] `app/property/[id]/page.js` — individual property pages
  - Full safety profile (all safety features listed)
  - Women's rating prominently displayed
  - Zone safety context ("Located in Eixample: 8.5/10 — Safe")
  - Photo gallery
  - Nearby zones map (mini map showing which zone it's in)
  - Booking button → external link or affiliate link
- [ ] Property pages linked from map pin clicks + accommodation list
- [ ] Breadcrumb: Home → Barcelona → Eixample → Rosewood Bangkok
- [ ] `/api/properties/[id]/route.js` — full property data endpoint
- [ ] Canonical URLs for SEO

**Testing requirements:**
- [ ] Click property pin → property detail page opens correctly
- [ ] Property safety features list is accurate (not empty)
- [ ] Booking link opens correctly (not 404)
- [ ] Women's rating displays (not same as generic star rating)
- [ ] Mini zone map shows property's zone correctly

**Success criteria:**
> Full funnel: map → zone → hotel → book. Measurable with GA4 conversion tracking.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 12 — Content, Polish & Pre-Launch Prep
**Date:** April 15, 2026
**Expert role:** Content Strategist + UI Designer
**Status:** ⏳

**Goal:** Content is excellent. UI is polished. Everything is ready for launch announcement.

#### Deliverables

- [ ] Review all zone descriptions — minimum 2 paragraphs each, women-specific lens
- [ ] Review all safety tips — minimum 3 tips per zone, practical and specific
- [ ] Review all zone scores — sense-check against local knowledge
- [ ] Landing page (`app/page.js`) updated to feature map prominently:
  - Add "View Safety Map" as primary CTA button
  - Add city thumbnails/previews (screenshots of Barcelona, Paris maps)
  - Update copy to emphasize "the world's first global women's safety map"
- [ ] Update README.md to reflect current state of project
- [ ] Generate social media screenshots of best-looking city maps (for launch post)
- [ ] Write launch announcement copy (for social media, TypeForm follow-up email)
- [ ] Test TypeForm → email: ensure survey participants are notified about launch

**Testing requirements:**
- [ ] All zone descriptions >2 sentences
- [ ] All zones have ≥3 safety tips
- [ ] Zero "TODO" or placeholder text visible to users
- [ ] Landing page links to map correctly
- [ ] Map screenshots look good (take on iPhone + MacBook)

**Success criteria:**
> Any first-time visitor can understand the product in 10 seconds.
> Map screenshots are worth sharing on Instagram/LinkedIn.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 13 — Final Testing + Bug Fixes
**Date:** April 16, 2026
**Expert role:** QA Engineer
**Status:** ⏳

**Goal:** Everything works. Zero critical bugs. Pre-deploy confidence is high.

#### Deliverables

- [ ] Run FULL TESTING_CHECKLIST.md from top to bottom
- [ ] Test on real iPhone (not simulator) — iOS Safari
- [ ] Test on real Android Chrome
- [ ] Test every city (Barcelona, Bangkok, Paris, London, NYC) — all zones load
- [ ] Test every zone in Barcelona (click all 12 zones — all correct data)
- [ ] Performance re-test: Lighthouse ≥ 85, map load <2s
- [ ] Fix all critical (🔴) testing failures
- [ ] Fix all high-priority bugs logged during Week 2
- [ ] Update SOLUTIONS.md with any new solutions discovered
- [ ] Final Vercel preview deploy — test on preview URL before prod
- [ ] Share preview URL with 2–3 trusted friends/users for feedback
- [ ] Act on any critical feedback received

**Testing requirements:**
- [ ] TESTING_CHECKLIST.md: all critical items passing
- [ ] Zero console errors on any city/zone interaction
- [ ] Map loads <2 seconds on 4G throttle (real device test)
- [ ] iOS Safari: all zones clickable, layout correct

**Success criteria:**
> Testing sign-off complete. "Blocking deploy: NO" on sign-off form.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 14 — Launch 🚀
**Date:** April 17–18, 2026
**Expert role:** Product Manager + Growth Hacker
**Status:** ⏳

**Goal:** HerSafeStay goes live as the world's first global women's safety map.

#### Pre-Launch Checklist

- [ ] Final production deploy to `main` → Vercel auto-deploys to hersafestay.com
- [ ] Verify production site loads correctly
- [ ] Verify all 5 cities work on production URL
- [ ] Verify Google Analytics is firing on production
- [ ] Verify Google Search Console has no critical errors
- [ ] Verify favicon shows correctly in browser tabs
- [ ] Verify OG image shows correctly when sharing URL on WhatsApp/Twitter

#### Launch Announcement

- [ ] TypeForm survey participants → email notification ("The map is live!")
- [ ] Twitter/X post with map screenshot + launch copy
- [ ] Instagram post (best-looking city map screenshot)
- [ ] LinkedIn post (product story + map screenshot)
- [ ] Post in relevant communities: r/solotravel, women traveler Facebook groups
- [ ] Post on Product Hunt (prep listing in advance)

#### Post-Launch Monitoring (Day 14 afternoon)

- [ ] Monitor GA4 Realtime for traffic
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Supabase for unexpected load
- [ ] Respond to any social media comments/questions
- [ ] Note most-viewed cities and zones (informs Phase 2 priorities)

**Success criteria:**
> Map is live at hersafestay.com/map. First real users viewing safety zones.
> First user safety reports submitted (community data begins).
> HerSafeStay is no longer just a landing page — it's the world's first women's safety map platform.

---

## Post-Launch: Phase 2 Priorities

Based on launch learnings, prioritize from this list:

**Data expansion:**
- [ ] 5 more cities (Rome, Tokyo, Buenos Aires, Cape Town, Mumbai?)
- [ ] Automate zone scoring pipeline (Apify scrapers)
- [ ] Process TypeForm survey data into zone scores

**Feature expansion:**
- [ ] Day vs. night safety scores per zone
- [ ] Walking safety route suggestions ("Safe route from hotel to metro")
- [ ] Heat map visualization mode (toggle from polygon zones)
- [ ] User-verified reviews per zone (not just editorial)

**Growth:**
- [ ] SEO: "Is [city] safe for solo female travelers?" landing pages
- [ ] Partnership with solo female travel bloggers
- [ ] Affiliate booking revenue integration

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Google Maps API key issues | Medium | High | Set up and test on Day 1, not Day 2 |
| iOS Safari map rendering bugs | High | High | Test on real iPhone every single day |
| Zone polygon data quality | Medium | High | Validate all polygons in script before import |
| Supabase free tier limits | Low | Medium | Monitor usage daily; upgrade if needed |
| Day slippage (tasks take longer) | High | Medium | Day 7 is explicit buffer day; Day 13 is also buffer |
| Safety data accuracy controversy | Low | Very High | Be transparent about sources; clearly label "based on..." |

---

## Daily Standup Template

```
## Day [N] Standup — [Date]

✅ Yesterday completed:
-

🔄 Today's focus:
-

❌ Blockers:
-

📊 Key metrics:
- Cities with zones: X/5
- Zones in database: X
- Accommodations mapped: X
- Lighthouse score: X
- Map load time: Xs
```

---

*Last updated: 2026-04-04*
*Version: 1.0*
