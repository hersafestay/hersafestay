# HerSafeStay — Data Sources Reference

> Reference document for all external data integrations. Includes police APIs, affiliate programs, review platforms, and integration priority.

---

## Table of Contents

1. [Police & Crime APIs](#1-police--crime-apis)
2. [Review & Rating Sources](#2-review--rating-sources)
3. [Affiliate Programs](#3-affiliate-programs)
4. [Geographic & Infrastructure Data](#4-geographic--infrastructure-data)
5. [Integration Priority Order](#5-integration-priority-order)
6. [Cost Breakdown](#6-cost-breakdown)
7. [API Key Management](#7-api-key-management)

---

## 1. Police & Crime APIs

### Europe

#### United Kingdom — Police.uk API ⭐ TIER 1
```
URL: https://data.police.uk/api/
Authentication: None (public API)
Rate limit: Unlimited (be respectful, ~1 req/sec)
Data: Street-level crime data by location or area
Format: JSON
Update frequency: Monthly

Key endpoints:
  GET /crimes-at-location?lat=51.5&lng=-0.1&date=2026-03  → crimes near point
  GET /crimes-no-location?category=all-crime&force=city-of-london&date=2026-03
  GET /crime-categories → list of crime types

Coverage: England, Wales (not Scotland/NI)
Cities: London ✓
Notes: One of the best free crime APIs in the world. Rich data, great docs.
```

#### Spain — Mossos d'Esquadra (Barcelona)
```
URL: https://mossos.gencat.cat/ca/els_mossos_desquadra/estadistiques_i_enquestes/
Authentication: None (CSV download)
Rate limit: N/A (file download)
Format: CSV/Excel annual
Update frequency: Annual (with quarterly updates)
Coverage: Catalonia region
Cities: Barcelona ✓
Notes: Must download manually. Script available at scripts/crime/mossos.js
```

#### Spain — Ministerio del Interior (National)
```
URL: https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/estadistica/estadisticas-de-seguridad/
Authentication: None (open data)
Format: CSV/PDF annual
Update frequency: Annual
Coverage: All of Spain
Notes: National-level data, less granular than Mossos
```

#### France — data.gouv.fr
```
URL: https://www.data.gouv.fr/fr/datasets/?topic=security
Authentication: None (open data)
Rate limit: None specified
Format: CSV
Key datasets:
  - Crimes et délits enregistrés par les services de police et de gendarmerie
  - Statistiques des crimes et délits (département level)
Update frequency: Annual
Cities: Paris ✓
Notes: Search for "crimes délits" on data.gouv.fr
```

#### France — Préfecture de Police de Paris
```
URL: https://opendata.paris.fr/explore/dataset/crimes-et-delits-constates/
Authentication: None
Format: JSON/CSV API
Update frequency: Monthly
Cities: Paris ✓ (most granular)
Notes: Best source for Paris. Arrondissement-level data.
```

#### Germany — Bundeskriminalamt (BKA)
```
URL: https://www.bka.de/DE/AktuelleInformationen/StatistikenLagebilder/PolizeilicheKriminalstatistik/
Authentication: None (PDF/CSV download)
Format: PDF (with embedded tables) + some CSV
Update frequency: Annual
Coverage: All of Germany
Cities: Berlin, Munich, Hamburg
Notes: Complex German-language PDFs — use tabula-py for extraction
```

#### Italy — Ministero dell'Interno
```
URL: https://www.interno.gov.it/it/stampa-e-comunicazione/dati-e-statistiche
Authentication: None
Format: PDF/Excel annual
Update frequency: Annual
Cities: Rome, Milan, Florence
Notes: Annual crime statistics at provincial level
```

#### EU-wide — Eurostat
```
URL: https://ec.europa.eu/eurostat/web/crime/data/database
Authentication: None (API key optional for higher limits)
API: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/
Format: JSON/CSV
Rate limit: 1,000 req/day without key; register for higher
Dataset codes:
  - crim_gen: General crime statistics
  - crim_off: Offences by type
Update frequency: Annual (2-year lag)
Notes: Best for cross-country comparison and benchmarking
```

---

### Americas

#### USA — FBI Crime Data Explorer ⭐ TIER 1
```
URL: https://cde.ucr.cjis.gov/LATEST/webapp/#/
API URL: https://api.usa.gov/crime/fbi/cde/
Authentication: API key (free registration)
Register: https://api.usa.gov/signup/
Rate limit: 10 req/sec
Format: JSON
Key endpoints:
  GET /agency/byStateAbbr/{state}  → agency list
  GET /offenses/count/national/{offense}?from=2023&to=2023
  GET /estimate/geo/city?ori={ori}&year=2023
Cities: NYC, Chicago, Los Angeles, Miami, New Orleans
Notes: One of the best free crime APIs. Covers all US cities with data submissions.
```

#### USA — NYPD Open Data (NYC specific)
```
URL: https://data.cityofnewyork.us/
API: Socrata API (https://dev.socrata.com/)
Authentication: App token (free)
Dataset: NYPD Complaint Data Historic
  URL: https://data.cityofnewyork.us/resource/qgea-i56i.json
Rate limit: 1,000 req/hour with token
Format: JSON
Notes: Most granular NYC crime data. Complaint-level records.
```

#### Mexico — INEGI / SESNSP
```
URL: https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva
Authentication: None
Format: CSV (monthly updates)
Update frequency: Monthly
Cities: Mexico City, Cancún, Guadalajara
Notes: Important to distinguish "fuero común" (state crimes) from "fuero federal"
```

#### Brazil — Atlas da Violência
```
URL: https://www.ipea.gov.br/atlasviolencia/
Authentication: None
Format: CSV/XLSX
Update frequency: Annual
Cities: São Paulo, Rio de Janeiro
Notes: Research-grade data. Good methodology documentation.
```

#### Canada — Statistics Canada
```
URL: https://www150.statcan.gc.ca/n1/pub/85-002-x/
API: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action
Authentication: None
Format: CSV/JSON
Cities: Toronto, Vancouver, Montreal
Notes: Uniform Crime Reporting (UCR) Survey data
```

---

### Asia Pacific

#### Singapore — Singapore Police Force
```
URL: https://www.police.gov.sg/news-and-publications/statistics
Authentication: None (PDF download)
Format: PDF annual
Update frequency: Annual
Notes: Excellent data quality. Singapore is very safe — baseline calibration city.
```

#### Japan — National Police Agency
```
URL: https://www.npa.go.jp/publications/statistics/crime/index.html
Authentication: None (PDF download)
Format: PDF annual (Japanese language, some English summaries)
Update frequency: Annual
Notes: Very low crime rates. English summaries available.
```

#### Australia — ABS Crime Statistics ⭐ TIER 1
```
URL: https://www.abs.gov.au/statistics/people/crime-and-justice
API: https://api.data.abs.gov.au/
Authentication: None
Format: JSON API
Update frequency: Annual
Cities: Sydney, Melbourne, Brisbane
Notes: One of the best government crime APIs in APAC
```

#### New Zealand — Police Stats
```
URL: https://www.police.govt.nz/about-us/publication/police-annual-report/statistics
Authentication: None
Format: Excel/CSV
Cities: Auckland, Wellington
```

---

## 2. Review & Rating Sources

### Phase 1 — Official APIs (Implement Immediately)

#### Google Places API ⭐ PRIORITY 1
```
API URL: https://maps.googleapis.com/maps/api/place/
Documentation: https://developers.google.com/maps/documentation/places/
Authentication: API key (GOOGLE_PLACES_SERVER_KEY — server-side only)
Cost: $17 per 1,000 Details calls (reviews included in Details)
Rate limit: 3,000 QPD, 100 QPS (can request increase)

Key endpoints:
  Place Details (with reviews):
    GET /details/json?place_id={id}&fields=reviews,rating&key={key}
  Text Search (find a property):
    GET /textsearch/json?query=Hotel+Arts+Barcelona&key={key}
  Find Place:
    GET /findplacefromtext/json?input={name}&inputtype=textquery&key={key}

Review fields returned:
  author_name, author_url, rating, relative_time_description, text, time

Limitation: Maximum 5 reviews per property per API call
Notes: Use GOOGLE_PLACES_SERVER_KEY (not the Maps JS key) for server-side calls
       to avoid HTTP referrer restriction issues
```

#### Reddit API ⭐ PRIORITY 2
```
API URL: https://www.reddit.com/dev/api/
OAuth endpoint: https://www.reddit.com/api/v1/
Documentation: https://www.reddit.com/dev/api/
Authentication: OAuth2 client credentials
  REDDIT_CLIENT_ID: server-side only
  REDDIT_CLIENT_SECRET: server-side only
Rate limit: 60 req/min with OAuth
Cost: Free

Key subreddits to monitor:
  - r/solotravel (900K members)
  - r/TwoXChromosomes (travel posts)
  - r/femaledigitalnomads
  - r/WomenTravel
  - r/travel (filter for female mentions)
  - City-specific: r/Barcelona, r/Paris, r/Bangkok, r/London, r/nyc

Key endpoints:
  GET /r/solotravel/search.json?q=barcelona+safe+woman&restrict_sr=1&sort=top
  GET /r/solotravel/hot.json?limit=100

Notes: Requires app registration at reddit.com/prefs/apps
       Best source for real women's travel safety experiences
```

### Phase 2 — Gray Area With Attribution

#### Booking.com Reviews (via Scraping with Attribution)
```
Approach: When affiliated, use Partner API for review data (preferred)
          Without partnership: scrape with attribution
Attribution required: "Review originally posted on Booking.com" + link to original
Rate limit to respect: 1 req/2 sec
robots.txt: https://www.booking.com/robots.txt (check before scraping)
Notes: Apply for Partner Program first — API access makes this Tier 1
```

#### Hostelworld Reviews
```
Approach: Affiliate API includes review access (preferred)
Attribution required: Link to hostelworld.com property page
Rate limit: 1 req/3 sec
Notes: Apply for Hostelworld Affiliate Program — API access included
```

---

## 3. Affiliate Programs

### Accommodation

| Platform | Program URL | Commission | Min Traffic | Notes |
|----------|------------|-----------|------------|-------|
| Booking.com | affiliate.booking.com | 3–5% | No minimum | Apply now |
| Hostelworld | hostelworld.com/affiliate | €1–3/booking | No minimum | Apply now |
| Agoda | agoda.com/en-us/affiliate | 3–7% | 500+ monthly visitors | Apply at Month 2 |
| Hotels.com | affiliates.hotels.com | 3–5% | Part of Expedia Group | Apply now |
| Expedia | expedia.com/affiliate | 3–6% | No minimum | Apply now |
| Airbnb | airbnb.com/associates | ~3% | Need traffic proof | Apply at Month 3 |

### Tours & Activities

| Platform | Program URL | Commission | Notes |
|----------|------------|-----------|-------|
| GetYourGuide | partner.getyourguide.com | 8–12% | Best for Europe |
| Viator | viator.com/partner | 6–10% | TripAdvisor-owned |
| Klook | affiliate.klook.com | 5–8% | Best for Asia |

### eSIM & Data

| Platform | Program URL | Commission | Notes |
|----------|------------|-----------|-------|
| Airalo | airalo.com/affiliate | 10–15% | Leading eSIM marketplace |
| Holafly | holafly.com/en/affiliate | 10–15% | Popular with travelers |

### Insurance

| Platform | Program URL | Commission | Notes |
|----------|------------|-----------|-------|
| World Nomads | worldnomads.com/partner | 15% | Best brand for travelers |
| SafetyWing | safetywing.com/affiliate | 10% | Popular with digital nomads |
| InsureMyTrip | insuremytrip.com/partner | 6% | US-focused |

---

## 4. Geographic & Infrastructure Data

### OpenStreetMap (Zone Polygon Boundaries)

```
URL: https://www.openstreetmap.org/
Overpass API: https://overpass-api.de/
Authentication: None
Rate limit: Reasonable use (1 req/sec for Overpass)
Format: GeoJSON/XML

Query to get Barcelona neighborhood boundaries:
  [out:json];
  relation["name:en"="Eixample"]["boundary"="administrative"];
  (._;>;);
  out body;

Alternative: Nominatim
  GET https://nominatim.openstreetmap.org/search?q=Eixample+Barcelona&polygon_geojson=1&format=json
Notes: Best free source for neighborhood polygon boundaries globally
```

### Walk Score API (Walkability)

```
URL: https://www.walkscore.com/professional/api.php
Authentication: API key (free for limited use, paid at scale)
Cost: Free tier: 5,000 req/day; Paid: contact for pricing
Format: JSON

Key endpoint:
  GET /score?format=json&address={addr}&lat={lat}&lon={lng}&wsapikey={key}

Returns: walk_score (0–100), bike_score, transit_score, description

Notes: Good proxy for walkability/pedestrian infrastructure safety
       Free tier sufficient for MVP (score all zones once, cache in DB)
```

---

## 5. Integration Priority Order

### Sprint 1 (Weeks 1–2): FREE AND EASY

```
Priority 1: Google Places API
  → Register key → test on 3 Barcelona properties → build review sync
  → Estimated time: 2 days

Priority 2: UK Police API (police.uk)
  → No auth needed → pull London crime data → test zone scoring
  → Estimated time: 1 day

Priority 3: Reddit API
  → Register app → pull r/solotravel posts → extract property mentions
  → Estimated time: 2 days

Priority 4: NYPD Open Data
  → No auth → pull NYC crime data → map to zones
  → Estimated time: 1 day
```

### Sprint 2 (Weeks 3–4): AFFILIATE SETUP

```
Priority 5: Booking.com Affiliate
  → Apply for program → implement price widget → affiliate links in UI
  → Estimated time: 3 days (+ partner approval wait)

Priority 6: Hostelworld Affiliate
  → Apply → implement hostelworld price widget
  → Estimated time: 2 days

Priority 7: France crime data (data.gouv.fr + Paris open data)
  → CSV download → normalize → import for Paris zones
  → Estimated time: 2 days

Priority 8: Spain crime data (Mossos)
  → CSV download → normalize → import for Barcelona zones
  → Estimated time: 2 days
```

### Sprint 3 (Weeks 5–8): AUTOMATION

```
Priority 9: Agoda API (after affiliate approval)
Priority 10: FBI Crime Data Explorer (USA, API key required)
Priority 11: GetYourGuide affiliate (tours)
Priority 12: Australia ABS API (Sydney/Melbourne)
```

---

## 6. Cost Breakdown

### MVP Monthly API Costs

| Service | Usage Estimate | Cost |
|---------|---------------|------|
| Google Maps JS API | 50,000 map loads | ~€0 (in free credit) |
| Google Places API | 10,000 place details | ~€170 |
| Reddit API | 50K requests | Free |
| Police APIs | N/A | Free |
| OpenStreetMap | N/A | Free |
| Walk Score API | 500 zone lookups (once) | Free tier |
| **Total MVP** | | **~€170/month** |

### Scale Monthly API Costs (100K MAU)

| Service | Usage Estimate | Cost |
|---------|---------------|------|
| Google Maps JS API | 2M map loads | ~€0 (in credit) |
| Google Places API | 100,000 details | ~€1,700 |
| OpenAI API (review analysis) | 500K tokens | ~€1,500 |
| Reddit API | 500K requests | Free |
| Police APIs | N/A | Free |
| Upstash Redis | 10M commands | ~€50 |
| **Total at Scale** | | **~€3,250/month** |

---

## 7. API Key Management

### Required Environment Variables

```bash
# .env.local (never commit)

# ─── Public (client-safe) ───────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...      # Restricted to domain + Maps JS API only

# ─── Server-side only (NEVER prefix with NEXT_PUBLIC_) ─────────────
SUPABASE_SERVICE_ROLE_KEY=...                 # Bypasses RLS — guard carefully
GOOGLE_PLACES_SERVER_KEY=AIza...              # No referrer restriction needed server-side
OPENAI_API_KEY=sk-...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
BOOKING_AFFILIATE_ID=...                      # Can be public but keep server-side for tracking
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
WEBHOOK_SECRET=...                            # For verifying incoming webhooks

# ─── Optional (when partnerships secured) ──────────────────────────
AGODA_API_KEY=...
FBI_CDE_API_KEY=...
WALK_SCORE_API_KEY=...
```

### Vercel Environment Variable Setup

For each variable:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add key + value
3. Select environments: Production, Preview (where appropriate)
4. Secret vars (service role, API keys): Production only
5. Click Save → Redeploy

Never use `.env.production` committed to git — use Vercel dashboard only.

---

*Last updated: 2026-04-26*
*Reference: Review before starting any new data integration sprint*
