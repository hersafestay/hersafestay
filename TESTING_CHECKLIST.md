# HerSafeStay — Testing Checklist

> Safety data must be accurate. Maps must work on every device. Women depend on this being correct.

**Testing philosophy:** Test like a woman traveler using her phone in an unfamiliar city on a spotty connection. That's our user. Test for her.

---

## How to Use This Checklist

- Run before every major merge to `main`
- Mark items with `[x]` when passing, `[-]` when failing (add note)
- Critical items (marked 🔴) must all pass before any production deploy
- Failing items must be logged in SOLUTIONS.md

---

## Pre-Deploy Gate (must pass 100%)

```
[ ] No console errors on map page
[ ] Map loads on mobile Chrome (real device, not simulator)
[ ] All 5 cities display zones correctly
[ ] Zone clicks work and show correct data
[ ] No broken images
[ ] Performance: map loads <2 seconds on 4G throttle
```

---

## 1. Map Core Functionality

### 1.1 Map Loading

- [ ] 🔴 Map loads without console errors
- [ ] 🔴 Map loads in under 2 seconds on simulated 4G (Chrome DevTools throttle: "Fast 4G")
- [ ] 🔴 Map loads in under 4 seconds on simulated 3G (Chrome DevTools throttle: "Slow 3G")
- [ ] 🔴 Loading state (skeleton) shows while map initializes
- [ ] Loading state disappears when map is ready (no flicker)
- [ ] Map uses custom styles (cream base, no cluttered POIs)
- [ ] Map does NOT show "For development purposes only" watermark
- [ ] Map initializes centered on the correct city
- [ ] Map initializes at the correct zoom level (city fills screen)

### 1.2 Safety Zone Polygons

- [ ] 🔴 All zones for selected city are visible on the map
- [ ] 🔴 Zone colors match safety levels (green=safe, amber=caution, red=avoid)
- [ ] 🔴 Every zone is clickable (tap anywhere inside polygon, not just center)
- [ ] Zone boundaries are clean (no gaps between adjacent zones)
- [ ] Zone polygons are closed (no open edges)
- [ ] Zone opacity allows map labels to be readable underneath
- [ ] Selected zone is visually highlighted (brighter opacity, thicker stroke)
- [ ] Previously selected zone returns to normal when new one is selected
- [ ] At maximum zoom, zones still display correctly (no coordinate precision issues)
- [ ] At minimum city zoom, zones are still distinguishable by color

### 1.3 Zone Detail Panel

- [ ] 🔴 Click any zone → zone detail panel opens within 300ms
- [ ] 🔴 Zone name displays correctly (correct capitalization, special characters: è, ã, etc.)
- [ ] 🔴 Safety score displays (number between 1.0 and 10.0)
- [ ] 🔴 Safety level badge displays (Safe / Use Caution / Avoid)
- [ ] Zone description text is present (not empty, not "[object Object]")
- [ ] Safety tips list is present (at least 2 tips per zone)
- [ ] Highlights and cautions sections are populated
- [ ] Property count shown ("X accommodations in this zone")
- [ ] Score breakdown section shows component scores (crime, reviews, walkability)
- [ ] "Data sources" section lists where scores came from
- [ ] Close button (X) dismisses zone detail correctly
- [ ] After closing, no zone appears selected on map
- [ ] Zone detail scrolls if content is taller than panel

### 1.4 City Selection

- [ ] 🔴 City selector shows all 5 MVP cities
- [ ] 🔴 Selecting a city loads that city's zones within 1 second (CDN cached)
- [ ] Map pans and zooms to selected city automatically
- [ ] Previous city's zones are removed before new city's zones appear
- [ ] Loading indicator shows while city data loads
- [ ] City name appears in page title / header

### 1.5 Safety Level Filter

- [ ] Filter toggles are visible (Safe / Caution / Avoid)
- [ ] Clicking "Safe" → only green zones shown, others hidden
- [ ] Clicking "Caution" → only amber zones shown
- [ ] Clicking "Avoid" → only red zones shown
- [ ] Multiple filters can be active simultaneously
- [ ] "All" / selecting all filters → all zones visible
- [ ] Zone count updates when filter changes ("Showing 8 of 12 zones")
- [ ] Filter state persists when switching zones (not reset on click)

### 1.6 Map Legend

- [ ] Legend is visible on map (bottom-left or bottom-right)
- [ ] Legend shows all three safety levels with correct colors
- [ ] Legend is readable on mobile (not too small)
- [ ] Legend doesn't obscure important map areas

---

## 2. Accommodation Pins

### 2.1 Pin Display

- [ ] 🔴 Accommodation pins are visible on map for selected city
- [ ] Pins use custom HerSafeStay design (coral pin + cream shield, NOT default Google teardrop)
- [ ] Pin numbers/IDs match the accommodation list sidebar
- [ ] Pins are positioned on the correct street/block (not in the ocean or wrong city)
- [ ] Pins are sized appropriately (not too large to obscure map)
- [ ] Multiple pins in same area don't perfectly overlap (slight offset or clustering)

### 2.2 Pin Interactions

- [ ] 🔴 Clicking/tapping a pin opens property detail within 300ms
- [ ] Property name displays correctly
- [ ] Property safety rating shows (women's rating, not generic)
- [ ] Safety features list is present (24/7 Security, Women Floors, etc.)
- [ ] Price per night shows with currency
- [ ] Property image loads (no broken images)
- [ ] "View Property" or booking link is clickable
- [ ] Close button dismisses property detail
- [ ] Clicking map background after pin click deselects the pin

### 2.3 Zone Relationship

- [ ] Property detail shows which safety zone it's in
- [ ] Property pin is visually inside the correct zone polygon on the map
- [ ] Safety score shown on property matches the zone's safety score

---

## 3. Mobile Testing (CRITICAL — do these on REAL devices)

### 3.1 iOS Safari (iPhone)

**Test on: iPhone 12 or newer, iOS 15+**

- [ ] 🔴 Map loads and is visible (not blank white screen)
- [ ] 🔴 Map height is correct (fills viewport, not cut off at bottom by home indicator)
- [ ] 🔴 Zones are tappable with finger (not requiring precise small-area taps)
- [ ] 🔴 Zone detail panel opens on zone tap
- [ ] Two-finger pinch → zoom in/out works
- [ ] Single-finger drag → map pans (no scroll conflict with page)
- [ ] Double tap → zoom in works (or is disabled cleanly)
- [ ] InfoWindow / detail panel text is readable (not tiny font)
- [ ] InfoWindow / detail panel does not overflow screen edges
- [ ] Bottom sheet detail panel slides up correctly (no jank)
- [ ] Address bar appearance/disappearance does not cause layout shift
- [ ] Rotating device (portrait → landscape) → map adjusts correctly
- [ ] After rotating back to portrait → map still works

### 3.2 Android Chrome

**Test on: Samsung or Pixel, Android 10+**

- [ ] 🔴 Map loads without errors
- [ ] 🔴 Zone polygons display with correct colors
- [ ] 🔴 Zone tapping works (test on polygon edges, not just center)
- [ ] 🔴 No "multiple zones selected" bug on zone boundary tap
- [ ] Map performance is smooth (no visible lag on polygon render)
- [ ] Back button behavior is correct (goes back to landing, not browser back on map actions)
- [ ] Chrome's "Add to home screen" / PWA prompt doesn't break map layout

### 3.3 Mobile Layout

- [ ] 🔴 Map fills at least 60% of viewport height on mobile
- [ ] 🔴 Zone detail panel is a bottom sheet on mobile (not a popup)
- [ ] City selector is accessible on mobile (not hidden by map)
- [ ] Legend is readable on small screen
- [ ] Filter controls are tappable (min 44px touch targets)
- [ ] Accommodation list below map is scrollable
- [ ] No horizontal scroll on any mobile screen width

---

## 4. Desktop / Cross-Browser

### 4.1 Browsers

- [ ] Chrome (latest) — full functionality
- [ ] Firefox (latest) — map loads, zones work
- [ ] Safari (desktop, macOS) — map loads, no webkit-specific layout bugs
- [ ] Edge (latest) — basic functionality

### 4.2 Desktop Layout

- [ ] Map and sidebar layout side-by-side on screens >1024px
- [ ] Map takes ≥60% of screen width
- [ ] Sidebar is scrollable if content overflows
- [ ] No content overflows outside viewport (no horizontal scrollbar)
- [ ] Hover states on zones work (desktop only) — opacity increases on hover

---

## 5. Data Accuracy Testing

### 5.1 Safety Scores

- [ ] 🔴 Every zone has a safety score between 1.0 and 10.0
- [ ] 🔴 Every zone's `safety_level` matches its `safety_score` (score 7+ = safe, etc.)
- [ ] 🔴 Every zone's `color_code` matches its `safety_level`
- [ ] No zones have NULL or 0 safety scores
- [ ] Score breakdown components (crime, reviews, walkability) add up correctly
- [ ] Zone scores make intuitive sense for the city (tourist areas typically safer)

### 5.2 Geographic Accuracy

- [ ] 🔴 All zone polygons are in the correct country/city (not offset by thousands of km)
- [ ] 🔴 Coordinate system is WGS84 (lat/lng) not some other projection
- [ ] 🔴 lat values are between -90 and 90, lng values between -180 and 180
- [ ] Zone polygons don't overlap with each other within a city
- [ ] Zones don't have large unexplained gaps between them (blank map areas within city)
- [ ] Zone names match the actual neighborhoods they represent
- [ ] Accommodation coordinates place hotels/hostels on their actual streets

### 5.3 City-by-City Data Verification

**Barcelona:**
- [ ] 8–12 zones covering city center and key tourist areas
- [ ] Gothic Quarter, Eixample, Gràcia, Barceloneta at minimum
- [ ] At least 3 accommodations plotted

**Bangkok:**
- [ ] 8–12 zones
- [ ] Sukhumvit, Silom, Khaosan Road, Riverside at minimum
- [ ] At least 3 accommodations plotted

**Paris:**
- [ ] 8–12 zones
- [ ] Le Marais, Montmartre, Latin Quarter, Bastille at minimum
- [ ] At least 3 accommodations plotted

**London:**
- [ ] 8–12 zones
- [ ] Covent Garden, Shoreditch, South Bank, Kings Cross at minimum
- [ ] At least 3 accommodations plotted

**NYC:**
- [ ] 8–12 zones
- [ ] Midtown, Lower East Side, Brooklyn, Upper West Side at minimum
- [ ] At least 3 accommodations plotted

---

## 6. Performance Testing

### 6.1 Load Time Benchmarks

**Method:** Chrome DevTools → Network → Throttle to "Fast 4G" → Hard reload

- [ ] 🔴 Map page: First Contentful Paint < 1.5s
- [ ] 🔴 Map page: Map visible (zones rendered) < 2.0s
- [ ] 🔴 Map page: Fully Interactive < 3.0s
- [ ] `/api/zones?city=barcelona` response: < 100ms (CDN cache hit)
- [ ] `/api/zones?city=barcelona` response: < 600ms (cache miss / first load)
- [ ] `/api/properties?city=barcelona` response: < 150ms (CDN cache hit)
- [ ] Zone click → detail data: < 200ms

### 6.2 Lighthouse Scores

**Method:** Chrome DevTools → Lighthouse → Mobile → Generate report

- [ ] Performance score: ≥ 85
- [ ] Accessibility score: ≥ 90
- [ ] Best Practices score: ≥ 90
- [ ] SEO score: ≥ 90
- [ ] LCP: < 2.5s
- [ ] CLS: < 0.1
- [ ] INP: < 200ms

### 6.3 Bundle Size

```bash
npm run build
# Check the output — look for large chunks
```

- [ ] Main page JS bundle: < 150KB gzipped
- [ ] Map page JS chunk (dynamically loaded): < 200KB gzipped
- [ ] No single chunk > 250KB gzipped (Next.js will warn if exceeded)

### 6.4 API Caching Verification

```bash
# Run twice — second request should be significantly faster
curl -I "https://hersafestay.com/api/zones?city=barcelona"
# Check headers:
# Cache-Control: public, s-maxage=1800, stale-while-revalidate=86400  ← present?
# X-Vercel-Cache: HIT  ← second request should show HIT
```

- [ ] Cache-Control header present on zone API responses
- [ ] Second request for same city shows `X-Vercel-Cache: HIT`

---

## 7. User Contribution System (When Implemented)

### 7.1 Report Submission

- [ ] Report button is visible and accessible from zone detail panel
- [ ] Report form opens in modal (not new page)
- [ ] All incident type options present in dropdown
- [ ] Time of day field present and functional
- [ ] Optional description text field works
- [ ] Star rating (1–5) is selectable
- [ ] Form submits successfully (no console errors)
- [ ] Success confirmation shows after submit
- [ ] Duplicate report detection works (same user, same zone, same day)
- [ ] Rate limiting works (more than 5 reports in a day → rejected)
- [ ] Submitted report appears in Supabase `zone_reports` table with `status: 'pending'`

### 7.2 Moderation

- [ ] Reports with `status: 'pending'` are NOT reflected in public zone scores
- [ ] Admin can view pending reports (Supabase dashboard or admin UI)
- [ ] Approved reports are incorporated into next score calculation
- [ ] Rejected reports are NOT shown to users

---

## 8. Content & Accessibility

### 8.1 Content Completeness

- [ ] 🔴 Every zone has a non-empty description
- [ ] 🔴 Every zone has at least 2 safety tips
- [ ] Every accommodation has a non-placeholder name
- [ ] No "Lorem ipsum" or placeholder text visible to users
- [ ] No [object Object] or undefined visible anywhere
- [ ] Images all load (no broken image icons)

### 8.2 Accessibility

- [ ] Map container has `role="application"` and `aria-label`
- [ ] Zone info windows have readable font size (min 14px)
- [ ] Color is not the ONLY indicator of safety (text label also present)
- [ ] Interactive elements have minimum 44×44px touch target (mobile)
- [ ] Page title updates when city is selected (for screen readers)
- [ ] Alt text on all property images

### 8.3 Internationalization (Basic)

- [ ] Zone names with special characters display correctly: è, ã, ñ, ü, etc.
- [ ] Currency formatting is correct ($ for USD, £ for GBP, etc.)
- [ ] No text is hardcoded in a way that would be untranslatable (future-proofing)

---

## 9. Analytics & Tracking

- [ ] Google Analytics (G-7EH09YFVSE) fires on page load (check GA4 Realtime)
- [ ] `city_selected` event fires when user selects a city
- [ ] `zone_clicked` event fires when user clicks a zone
- [ ] `property_viewed` event fires when property detail opens
- [ ] No PII (personal info) sent to Google Analytics

---

## Regression Tests (After Code Changes)

Run these any time you modify map-related code:

```
[ ] Barcelona zones still display correctly
[ ] Zone click still opens zone detail
[ ] Mobile layout not broken (check on iPhone + Android)
[ ] No new console errors
[ ] API cache headers still present
[ ] Dynamic import still working (map not in main bundle)
```

---

## Sign-off Template

```
## Testing Sign-off — [Date] — [Feature/Release]

Tested by: ___________________
Date: ________________________
Branch: ______________________
Devices tested:
  - [ ] iPhone [model], iOS [version], Safari
  - [ ] Android [model], Chrome
  - [ ] MacBook, Chrome
  - [ ] MacBook, Safari

Critical items: [X] / [X] passed
Known failing items: [list any with - mark]
Blocking deploy: YES / NO

Notes:
```

---

*Last updated: 2026-04-04*
*Version: 1.0*
