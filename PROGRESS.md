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
**Status:** ✅ In progress

**Goal:** Solid foundation before first line of map code.

#### Deliverables

- [x] ARCHITECTURE.md — complete safety map architecture ✅
- [x] PROGRESS.md — this roadmap ✅
- [x] SOLUTIONS.md — solution log template ✅
- [x] OPTIMIZATIONS.md — optimization log ✅
- [x] TESTING_CHECKLIST.md — testing requirements ✅
- [ ] Supabase project created (name: `hersafestay-prod`)
- [ ] PostGIS extension enabled on Supabase
- [ ] Database schema migrations run (all 4 tables + indexes)
- [ ] 5 MVP cities seeded into `cities` table
- [ ] `.env.local` created with Supabase keys
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

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 2 — Google Maps Integration
**Date:** April 5, 2026
**Expert role:** Frontend Map Engineer
**Status:** ⏳

**Goal:** See a working Google Map on screen. Basic map rendering, no zones yet.

#### Deliverables

- [ ] Install `@react-google-maps/api` and `@supabase/supabase-js`
- [ ] `lib/supabase.js` — Supabase client setup
- [ ] `lib/safetyColors.js` — safety color constants
- [ ] `lib/mapStyles.js` — custom Google Maps style JSON (cream base, no POI clutter)
- [ ] `components/map/MapLoadingState.jsx` — skeleton loading state
- [ ] `components/map/SafetyMap.jsx` — base Google Map component (no zones yet)
- [ ] `app/map/page.js` — map page with dynamic import (`ssr: false`)
- [ ] Map renders at Barcelona coordinates, custom style applied
- [ ] Nav link to `/map` page added
- [ ] Verify: no "For development purposes only" watermark
- [ ] Verify: map loads in < 3 seconds on simulated 4G

**Dependency:** Day 1 must be complete (API keys in env)

**Testing requirements:**
- [ ] Map renders on `/map` page
- [ ] Map uses custom styles (no default POI markers cluttering the map)
- [ ] Map loads correctly on Chrome mobile simulation
- [ ] No console errors
- [ ] `ssr: false` is set — no "window is not defined" build error

**Success criteria:**
> Navigate to `/map` → see a beautiful styled Google Map centered on Barcelona.
> No errors. Custom cream/muted style visible.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 3 — Safety Zone System + Barcelona Fully Mapped 🚨
**Date:** April 6, 2026
**Expert role:** GIS Specialist + Frontend Engineer
**Status:** ⏳

**Goal:** The first real safety zone polygons on a map. This is the core product moment.

#### Deliverables

- [ ] `data/zones/barcelona.json` — Barcelona zone GeoJSON (10–12 zones, manually curated)
  - Zones to include: Gothic Quarter, Eixample, Gràcia, Barceloneta, El Born, Raval, Poble Sec, Montjuïc, Sarrià, Diagonal
  - Safety scores researched and assigned per zone
- [ ] `scripts/import-zones.js` — import GeoJSON files into Supabase `safety_zones` table
- [ ] `scripts/validate-polygons.js` — check for open rings, overlaps, coordinate issues
- [ ] `components/map/ZonePolygon.jsx` — individual zone polygon with memoized options
- [ ] `components/map/MapLegend.jsx` — safety color legend (green/amber/red)
- [ ] Zone layer integrated into `SafetyMap.jsx`
- [ ] Zone polygons render in correct colors (green/amber/red per safety level)
- [ ] Barcelona data imported to Supabase + visible on map
- [ ] `app/api/zones/route.js` — API endpoint returning zone GeoJSON with CDN cache headers
- [ ] Color simplification script applied (target: <30KB for Barcelona zones)
- [ ] Polygon validation passes (no open rings, no obvious overlaps)

**Dependency:** Day 2 complete (map rendering)

**Testing requirements:**
- [ ] All 10–12 Barcelona zones visible on map
- [ ] Zone colors match safety levels (Gothic Quarter amber/red, Eixample green)
- [ ] `/api/zones?city=barcelona` returns in <100ms on second request (CDN cache)
- [ ] GeoJSON file size <30KB after simplification
- [ ] Validate polygons script passes with 0 errors

**Success criteria:**
> Barcelona safety map is visible. Green zones pop. Red zones warn.
> Someone looking at the map immediately understands where to stay vs. avoid.

**Celebrate this moment:** This is when HerSafeStay stops being a landing page and becomes a real safety map product.

**Notes / Blockers:**
> _[Add notes as you go]_

---

### Day 4 — Zone Interactions + Bangkok + Paris
**Date:** April 7, 2026
**Expert role:** Frontend Engineer + UX Designer
**Status:** ⏳

**Goal:** Zones are interactive. Users can click to learn why a zone is rated as it is.

#### Deliverables

- [ ] `components/map/ZoneDetail.jsx` — zone detail panel component
  - Zone name, safety score (X/10), safety level badge
  - Description text
  - Safety tips list (women-specific)
  - Score breakdown (crime 40%, reviews 30%, etc.)
  - Data sources section ("Based on police data + 847 traveler reviews")
  - Property count ("12 accommodations in this zone")
- [ ] Zone click handler → opens ZoneDetail panel
- [ ] Zone InfoWindow or bottom sheet implementation (mobile: bottom sheet)
- [ ] `components/map/MapControls.jsx` — city selector dropdown
- [ ] `data/zones/bangkok.json` — Bangkok zones (10–12 zones: Sukhumvit, Silom, Khaosan, Riverside, Chatuchak, Chinatown, Lat Phrao, Nana, Thong Lo, Asok)
- [ ] `data/zones/paris.json` — Paris zones (10–12 zones: Marais, Montmartre, Latin Quarter, Saint-Germain, Bastille, Opera, Châtelet, Belleville, Pigalle, République)
- [ ] Bangkok + Paris data imported to Supabase
- [ ] City selector allows switching between Barcelona, Bangkok, Paris
- [ ] Map pans to correct city on switch

**Dependency:** Day 3 complete (zones displaying)

**Testing requirements:**
- [ ] Click 10 different zones across Barcelona — all open correct detail panel
- [ ] Zone detail shows accurate name (not "undefined")
- [ ] Score breakdown math checks out (components sum to final score)
- [ ] Bangkok zones display correctly (city-center area should be yellow, tourist areas green)
- [ ] Paris zones display correctly (Pigalle should be caution/red, Marais should be green)
- [ ] City switch: Barcelona → Bangkok loads Bangkok zones within 1 second
- [ ] Mobile: zone detail opens as bottom sheet, not floating popup
- [ ] iOS Safari test: tap a zone → detail opens

**Success criteria:**
> 3 cities fully mapped and interactive. Click any zone in any city → see safety story.
> "Why is Gothic Quarter amber? Because of pickpocketing near La Rambla (data sources: police reports + 1,200 traveler reviews)"

**Notes / Blockers:**
> _[Add notes as you go]_

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
