# HerSafeStay — Safety Intelligence Platform Architecture

> **Security-first rule:** Read [SECURITY.md](./SECURITY.md) before any database or API work. RLS is mandatory on every table. No exceptions.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Experience Architecture](#2-user-experience-architecture)
3. [Data Intelligence Layer](#3-data-intelligence-layer)
4. [Review Aggregation System](#4-review-aggregation-system)
5. [Business Model](#5-business-model) ← See also [BUSINESS_MODEL.md](./BUSINESS_MODEL.md)
6. [Technical Architecture](#6-technical-architecture)
7. [Database Schema](#7-database-schema)
8. [API Architecture](#8-api-architecture)
9. [AI & Automation](#9-ai--automation)
10. [Legal Compliance](#10-legal-compliance) ← See also [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md)
11. [Security Architecture](#11-security-architecture) ← See also [SECURITY.md](./SECURITY.md)
12. [Scalability Plan](#12-scalability-plan)
13. [Competitive Analysis](#13-competitive-analysis)
14. [Go-To-Market Strategy](#14-go-to-market-strategy)
15. [Risk Analysis & Mitigation](#15-risk-analysis--mitigation)

---

## 1. Executive Summary

### Platform Vision

HerSafeStay is the world's first **Safety Intelligence Platform** built specifically for women travelers. We aggregate real crime data from official government sources, filter women-focused reviews from multiple platforms, and present everything through a beautiful map-first interface with multi-source price comparison.

**Mission:** Every woman deserves to travel without fear. We provide the safety intelligence that transforms anxious planning into confident adventure.

### Target Market

- **70% of all travelers are women** — yet zero major platforms have safety-first UX for them
- **$1.4 trillion** global travel market
- **32 million** solo female travelers annually (growing 8% YoY)
- Underserved by every existing platform: Booking.com, Airbnb, Hostelworld all treat safety as an afterthought

### Competitive Advantage

We are the ONLY platform combining:
1. **Real police crime data** (official government sources, not user opinions)
2. **AI-filtered women's reviews** (only reviews from verified female travelers)
3. **Multi-source price comparison** (Skyscanner-style: show all platforms, redirect for commission)
4. **Map-first UX** (safety zones are the first thing users see, not an afterthought)
5. **Transparent data sources** (users see exactly where every score comes from)

### Revenue Model

We are NOT a booking platform. We are a **safety intelligence + affiliate layer**:
- User finds safe property → clicks affiliate link → books on Booking/Hostelworld/Agoda → we earn 3–5% commission
- No inventory risk. No booking liability. Pure margin.

See [Section 5](#5-business-model) and [BUSINESS_MODEL.md](./BUSINESS_MODEL.md) for full detail.

### 5-Year Ecosystem Vision

```
2026:  HerSafeStay (accommodation safety + booking)
2027:  HerSafeWay (transport safety — taxis, rideshare, public transit)
2028:  HerSafeNight (nightlife safety — bars, clubs, late-night routes)
2029:  HerSafe API (safety data as a service — B2B licensing)
2030:  HerSafe OS (full travel OS for women — planning, booking, SOS, community)
```

---

## 2. User Experience Architecture

### Core UX Principle

The map IS the product. Every UX decision serves one goal: get women to safety information faster than any other platform.

### Primary User Flow

```
1. LANDING PAGE
   ├── Hero search: city / dates / guests / trip type
   ├── "How It Works" explainer
   └── Trust signals (data sources, user count, review count)

2. MAP-FIRST RESULTS
   ├── 60% screen: interactive Google Maps
   │   ├── Color-coded safety zones (green/amber/red)
   │   ├── Property pins (only safe + available + well-reviewed)
   │   └── Zone click → safety breakdown panel
   └── 40% screen: filtered property list
       ├── Sorted by: women's safety score (default)
       ├── Price display: best of multiple platforms
       └── Card click ↔ map marker sync (bidirectional)

3. PROPERTY DETAIL PAGE
   ├── Hero image
   ├── Safety highlights (top 3 from women's reviews)
   ├── Aggregated reviews (filtered to female reviewers, AI-analysed)
   ├── Multi-source price comparison table
   │   ├── Booking.com: €120/night [Book →]
   │   ├── Agoda: €118/night [Book →]
   │   ├── Hotel direct: €115/night [Book →]
   │   └── "Lowest: Hotel Direct — Save €5 vs Booking"
   ├── Safety score breakdown (crime 40%, reviews 30%, walkability 20%, time 10%)
   ├── Zone context ("In Eixample — 8.5/10 safety score")
   └── Nearby safe properties

4. AFFILIATE REDIRECT
   └── User clicks platform → affiliate link → earn commission
```

### Trip Types Supported

| Trip Type | Safety Weight | Filter Defaults |
|-----------|--------------|-----------------|
| Solo travel | Highest | Safe only, women-only floors preferred |
| Friends getaway | High | Safe + Caution zones |
| Business trip | Medium | Safety + central location |
| Family vacation | High | Safe, family amenities |
| Romantic getaway | Medium | Safety + atmosphere |

### Filter System

```
SAFETY FILTERS
├── Safety level: [ Safe ✓ ] [ Caution ] [ Avoid ]
├── Women's score: minimum slider (0–10)
└── Incidents (last 6 months): [ None ] [ Low ] [ Any ]

PROPERTY FILTERS
├── Type: [ Hotel ] [ Hostel ] [ Apartment ] [ Guesthouse ]
├── Price range: dual-range slider (€0–€500+/night)
├── Star rating: 1–5 stars
└── Amenities: [ WiFi ] [ Gym ] [ Pool ] [ Restaurant ]

WOMEN-SPECIFIC FILTERS
├── Women-only floors: [ Yes ] [ Any ]
├── Female front desk staff: [ Yes ] [ Any ]
├── 24/7 security: [ Required ] [ Preferred ] [ Any ]
└── Safety features: [ CCTV ] [ Key-card access ] [ Safe in room ]

TRIP TYPE FILTER
└── Optimizes sort order and filter defaults per trip type
```

### Layout Architecture

```
Mobile (<768px):
  [MAP — 100% width, 60vh]
  [FILTERS — collapsible FAB button]
  [PROPERTY LIST — 40vh scrollable]

Tablet (768–1024px):
  [MAP — 65% width]  [PROPERTY SIDEBAR — 35%]

Desktop (>1024px):
  [MAP — 60% width]  [PROPERTY SIDEBAR — 40%]
  [FILTER PANEL — left overlay, toggleable]
```

---

## 3. Data Intelligence Layer

### Safety Score Formula (v1)

```
Safety Score (1–10) =
  (Crime Score    × 0.40)  ← Official police data, normalized 1–10
+ (Women Reviews  × 0.30)  ← AI-filtered female reviewer ratings
+ (Walkability    × 0.20)  ← Street lighting, pedestrian density, OSM
+ (Time Factor    × 0.10)  ← Day vs. night modifier
```

**Transparency mandate:** Every zone shows its full score breakdown:
- "40% from 847 official police incidents (Mossos d'Esquadra, last 12 months)"
- "30% from 2,341 women traveler reviews (Google Places + verified Booking)"
- "20% from street infrastructure analysis (OpenStreetMap, updated March 2026)"
- "10% from night-time activity factor (curated)"

### Crime Data Sources by Region

**EUROPE — Tier 1 (High Reliability)**

| Country | Source | API/Download | Cost | Notes |
|---------|--------|-------------|------|-------|
| UK | Police.uk API | REST API | Free | Street-level crime data |
| Spain | Mossos d'Esquadra | CSV download | Free | Barcelona-specific |
| Spain | Policía Nacional | Web scraping | Free | National data |
| France | Gendarmerie Nationale | data.gouv.fr | Free | Departmental data |
| France | Prefecture de Police | Open data | Free | Paris-specific |
| Germany | Polizei Kriminalstatistik | PDF/CSV | Free | Annual stats |
| Italy | Ministero dell'Interno | Web | Free | Annual report |
| EU-wide | Eurostat Crime Database | API | Free | Standardized cross-country |

**AMERICAS — Tier 1-2 (Mixed)**

| Country | Source | Type | Cost |
|---------|--------|------|------|
| USA | FBI Crime Data Explorer | REST API | Free |
| USA | NYPD Open Data | REST API | Free |
| Mexico | INEGI | CSV | Free |
| Mexico | Semáforo Delictivo | Web | Free |
| Brazil | Atlas da Violência | PDF/CSV | Free |
| Canada | Statistics Canada | API | Free |
| Argentina | Ministerio de Seguridad | CSV | Free |

**ASIA — Tier 2-3 (Limited)**

| Country | Source | Type | Cost |
|---------|--------|------|------|
| Japan | National Police Agency | Annual PDF | Free |
| Singapore | Singapore Police Force | Annual report | Free |
| Thailand | Royal Thai Police | Limited | Free |
| India | NCRB | Annual CSV | Free |
| China | N/A | Expat forums only | Free |

**OCEANIA — Tier 1**

| Country | Source | Type | Cost |
|---------|--------|------|------|
| Australia | ABS Crime Statistics | API | Free |
| New Zealand | Police Stats | CSV | Free |

**AFRICA — Tier 3 (Limited Official Data)**

| Country | Source | Type | Cost |
|---------|--------|------|------|
| South Africa | SAPS Crime Stats | CSV | Free |
| Most countries | Forum aggregation | Scraping | Free |

See [DATA_SOURCES.md](./DATA_SOURCES.md) for full URLs, API keys, rate limits, and integration priority.

### Data Reliability Tiers

| Tier | Criteria | Display Badge |
|------|---------|---------------|
| TIER 1 — HIGH | Official police data + 100+ reviews + updated ≤6 months | Green shield ✓ |
| TIER 2 — MEDIUM | Limited official data + 20–100 reviews + updated ≤12 months | Amber shield ~ |
| TIER 3 — LOW | No official data, forum-based only | Grey shield ? |

**Always show:** Data sources used, last updated date, confidence level, and count of data points.

### City-Specific Crime Adaptation

Each city has a `city_context` JSON object controlling how crime types are weighted:

```json
{
  "barcelona": {
    "major_concerns": ["pickpocketing", "bag_snatching", "scams"],
    "severity_scale": "medium",
    "baseline_safety": 7.0,
    "threshold": 7.0,
    "crime_weights": {
      "pickpocketing": 0.6,
      "assault": 1.0,
      "sexual_harassment": 1.5
    }
  },
  "mexico_city": {
    "major_concerns": ["armed_robbery", "kidnapping", "taxi_crime"],
    "severity_scale": "high",
    "baseline_safety": 5.0,
    "threshold": 8.0,
    "crime_weights": {
      "robbery": 1.0,
      "kidnapping": 3.0,
      "sexual_assault": 2.0
    }
  },
  "tokyo": {
    "major_concerns": ["harassment", "groping_on_transit"],
    "severity_scale": "low",
    "baseline_safety": 9.0,
    "threshold": 6.0,
    "crime_weights": {
      "harassment": 1.2,
      "theft": 0.8,
      "assault": 1.0
    }
  }
}
```

---

## 4. Review Aggregation System

### Data Sources by Phase

**PHASE 1 — Legal, Official (Launch)**

| Source | Type | Cost | Priority |
|--------|------|------|----------|
| Google Places API | Official REST API | ~$200/month | P0 |
| Booking.com Affiliate API | Official, requires partnership | Free (affiliate) | P0 |
| Hostelworld Affiliate API | Official, requires partnership | Free (affiliate) | P0 |
| Agoda Partners API | Official, Asia focus | Free (affiliate) | P1 |

**PHASE 2 — Gray Area, With Attribution (Month 3–6)**

| Source | Approach | Risk Level |
|--------|---------|-----------|
| Booking.com reviews | Attribution scraping | Medium |
| Reddit (r/solotravel, r/TwoXChromosomes, city subs) | Official Reddit API | Low |
| TripAdvisor | Attribution scraping | Medium |
| Hostelworld | Attribution scraping | Medium |

**PHASE 3 — Asia/LATAM Expansion (Month 6–12)**

| Source | Region | Approach |
|--------|--------|---------|
| Agoda | Asia | Affiliate API |
| Ctrip | China | Scraping (no official API) |
| Despegar | LATAM | Affiliate API |
| Local platforms | Per region | Partnership |

### AI Review Analysis Pipeline

**Stage 1: WOMEN REVIEWER DETECTOR**

```
Input: { reviewer_name, review_text, reviewer_bio, profile_url }

Signals (in order of reliability):
1. Self-identification: "as a solo woman", "female traveler" → confidence: 0.99
2. Pronoun usage: "I (she/her)", "my husband and I" → confidence: 0.90
3. Name classification: ML model on 50K female names database → confidence: 0.70-0.85
4. Bio analysis: "mother of 2", "female expat" → confidence: 0.75
5. Platform profile: explicit gender field → confidence: 0.95

Output: { is_female_reviewer: bool, confidence: 0.0-1.0, detection_method: string }

Threshold: confidence ≥ 0.70 → classified as female
```

**Stage 2: SAFETY KEYWORD EXTRACTOR**

```
POSITIVE SAFETY SIGNALS:
Infrastructure: "well-lit", "cameras", "24/7 security", "key card access"
Staff: "helpful staff", "female staff", "checked on me"
Experience: "felt safe", "comfortable alone", "no issues", "walked alone at night"
Location: "safe neighborhood", "close to transport", "well-connected"

NEGATIVE SAFETY SIGNALS:
Infrastructure: "dark corridors", "no security", "broken locks"
Staff: "ignored my concerns", "inappropriate staff"
Experience: "felt unsafe", "sketchy", "harassed", "followed", "cat-called"
Location: "dodgy area", "avoid at night", "far from everything"

Output: {
  positive_keywords: string[],
  negative_keywords: string[],
  safety_score: 0.0-10.0,
  categories: { infrastructure: float, staff: float, experience: float, location: float }
}
```

**Stage 3: SENTIMENT ANALYZER**

```
Model: OpenAI GPT-4 (or Claude claude-haiku-4-5 for cost efficiency)
Input: Full review text
Output: {
  overall_sentiment: 'positive' | 'neutral' | 'negative',
  safety_sentiment: 'positive' | 'neutral' | 'negative' | 'not_mentioned',
  topics: { cleanliness: float, staff: float, location: float, safety: float, value: float },
  is_recent_trend: bool  // published <3 months ago
}
```

**Stage 4: CRIME SEVERITY ADAPTER**

```
Adjusts safety scores by city context:
- Barcelona pickpocketing mention: -0.5 points (medium concern in context)
- Mexico City taxi mention: -2.0 points (high concern in context)
- Tokyo transit groping mention: -1.5 points (serious in low-crime baseline)

Formula:
adjusted_score = base_score - (crime_weight[city][type] × incident_count × recency_factor)
```

### Property Inclusion Criteria

For a property to appear in search results it MUST pass ALL gates:

```
Gate 1: AVAILABILITY — available for user's dates (from affiliate API)
Gate 2: SAFETY SCORE — women_safety_score ≥ 7.0/10
Gate 3: REVIEW MINIMUM — ≥ 5 verified women's reviews
Gate 4: ZONE SAFETY — located in zone with safety_score ≥ 6.0/10
Gate 5: INCIDENT CHECK — no critical incidents in last 6 months
Gate 6: DATA FRESHNESS — last_review_sync ≤ 30 days ago
```

Properties failing any gate are hidden (not shown with a warning — users should only see bookable, safe options).

---

## 5. Business Model

> Full detail in [BUSINESS_MODEL.md](./BUSINESS_MODEL.md)

### Revenue Streams Overview

**We are not a booking platform. We are the safety intelligence layer between travelers and booking platforms.**

```
User → HerSafeStay → [Affiliate Link] → Booking.com / Hostelworld / Agoda
                                           ↓
                                   Commission: 3–7%
```

### Phase-by-Phase Revenue

**PHASE 1 — Accommodation Affiliates (Months 1–6)**

| Platform | Commission | Our Focus |
|----------|-----------|----------|
| Booking.com Partner Program | 3–5% | Primary — widest inventory |
| Hostelworld Affiliate | €1–3/booking | Budget + hostel segment |
| Agoda Partners | 3–7% | Asia markets |
| Expedia Affiliate | 3–6% | USA market |
| Hotels.com | 3–5% | Premium segment |

**Multi-Source Price Display (Skyscanner Model):**
For each property, show prices from all platforms simultaneously. User selects best price → clicks affiliate link → we earn commission regardless of platform chosen.

```
┌─────────────────────────────────────────┐
│  Rosewood Barcelona                     │
│  ⭐⭐⭐⭐⭐  Women's score: 9.2/10        │
├─────────────────────────────────────────┤
│  Booking.com    €185/night  [Book →]    │
│  Agoda          €179/night  [Book →]    │
│  Hotel Direct   €175/night  [Book →]  ← Best │
│  Expedia        €188/night  [Book →]    │
└─────────────────────────────────────────┘
```

**PHASE 2 — Tours & Activities (Months 6–12)**

| Platform | Commission |
|----------|-----------|
| GetYourGuide Affiliate | 8–12% |
| Viator Affiliate | 6–10% |
| Klook (Asia) | 5–8% |
| Women-only group tours | 15–20% (curated, premium) |

**PHASE 3 — Safety Products (Year 2)**

Amazon Affiliate (4–8%) on curated safety kit:
- AirTags (location sharing)
- Personal alarms
- eSIM cards (data abroad)
- Portable chargers
- Travel insurance links
- Safety app subscriptions

**PHASE 4 — Premium Subscriptions (Year 2–3)**

| Tier | Price | Features |
|------|-------|---------|
| HerSafeStay Free | €0 | Basic map, limited filters |
| HerSafeStay Premium | €9.99/month | Real-time alerts, SOS, trip planner, exclusive deals |
| HerSafeStay Pro (Business) | €29.99/month | Corporate accounts, compliance reports, team management |

**PHASE 5 — Data & Partnerships (Year 3+)**
- Safety data API licensing to travel companies
- Insurance partnership commissions
- Government tourism board contracts
- University/NGO safety briefings

### Revenue Projections

| Year | Monthly Users | Bookings/Month | Monthly Revenue | Annual Revenue |
|------|--------------|----------------|-----------------|----------------|
| Year 1 | 10,000 | 200 | €1,200 | €14,400 |
| Year 2 | 100,000 | 3,000 | €34,000 | €408,000 |
| Year 3 | 500,000 | 15,000 | €225,000 | €2,700,000 |
| Year 5 | 5,000,000 | 75,000 | €2,100,000+ | €25,000,000+ |

---

## 6. Technical Architecture

### Tech Stack

**Frontend**

| Layer | Technology | Rationale |
|-------|-----------|----------|
| Framework | Next.js 16 (App Router) | SSR for SEO on city pages, App Router for layouts |
| Runtime | React 19 | Concurrent features for smooth map interactions |
| Maps | Google Maps JavaScript API + @react-google-maps/api | Best mobile performance, iOS Safari |
| Styling | Inline styles (project convention) | Consistent, no Tailwind |
| Fonts | Crimson Pro via next/font/google | Already configured |
| Icons | lucide-react | Already installed |
| Deployment | Vercel | Already live, auto-deploy from main |

**Backend**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API | Next.js App Router Route Handlers | All API endpoints |
| Database | Supabase PostgreSQL + PostGIS | Geospatial data, auth, realtime |
| Cache | Upstash Redis (Vercel KV) | Hot property/zone data |
| Edge Functions | Supabase Edge Functions | Background jobs, webhooks |
| Cron Jobs | Vercel Cron | Scheduled sync tasks |
| Queue | BullMQ (when needed) | Review analysis pipeline |

**AI/ML**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Review analysis | OpenAI GPT-4 | Safety keyword extraction, sentiment |
| Cost-efficient analysis | Claude claude-haiku-4-5 | Bulk review processing |
| Female name classification | Custom ML model | Women reviewer detection |
| Embedding search | OpenAI Ada / Supabase pgvector | Semantic review search |

**External APIs**

| Service | Purpose | Cost |
|---------|---------|------|
| Google Places API | Property reviews, details | ~$200/month |
| Booking.com API | Inventory, prices (when partnered) | Free (affiliate) |
| Hostelworld API | Hostel inventory | Free (affiliate) |
| Reddit API | Community reviews | Free (rate limited) |
| Police APIs (per country) | Crime data | Free (public) |

**Monitoring**

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Traffic, Core Web Vitals |
| Google Analytics 4 | User behaviour, conversion |
| Sentry | Error tracking + alerting |
| LogRocket | Session replay (debugging UX issues) |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  Landing Page  →  Map Page  →  Property Detail  →  Auth Pages  │
│  (Next.js App Router, React 19, Google Maps JS API)            │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP/REST
┌────────────────────────────────▼────────────────────────────────┐
│                          API LAYER                              │
│  /api/search    /api/zones/[city]    /api/properties/[id]      │
│  /api/properties/[id]/reviews        /api/properties/[id]/prices│
│  /api/affiliate/redirect             /api/cities               │
│  /api/reports   /api/users/profile   /api/sync/*               │
└──────────┬─────────────────┬───────────────────────────────────┘
           │                 │
┌──────────▼──────┐ ┌────────▼────────────────────────────────────┐
│  CACHE LAYER    │ │              DATABASE LAYER                  │
│  Upstash Redis  │ │  Supabase PostgreSQL + PostGIS              │
│  - Hot zones    │ │  cities, safety_zones, properties           │
│  - Hot props    │ │  aggregated_reviews, property_prices        │
│  - Sessions     │ │  crime_data, user_profiles, user_bookmarks  │
│  Vercel CDN     │ │  search_history, affiliate_clicks           │
│  - Static assets│ │  + RLS on ALL tables (SECURITY.md)         │
└─────────────────┘ └──────────────┬──────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────┐
│                       AI WORKER LAYER                           │
│  Review Analysis Queue    Safety Scoring Queue                  │
│  Crime Data Sync Queue    Availability Sync Queue               │
│  (Supabase Edge Functions + Vercel Cron)                        │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  Google Maps API   Google Places API   Booking.com Partner API  │
│  Hostelworld API   Reddit API          Police APIs (per country) │
│  OpenAI API        Agoda API           Expedia Affiliate API     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Schema

> **Security mandate:** Every table MUST have RLS enabled immediately after creation. See [SECURITY.md](./SECURITY.md) Section 2 for RLS patterns.

### Prerequisites

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;  -- For semantic review search (Phase 2)
```

---

### Table: `cities`

```sql
CREATE TABLE cities (
  id              TEXT PRIMARY KEY,                  -- 'barcelona', 'bangkok'
  name            TEXT NOT NULL,                     -- 'Barcelona'
  country         TEXT NOT NULL,                     -- 'Spain'
  country_code    TEXT NOT NULL,                     -- 'ES'
  continent       TEXT NOT NULL,                     -- 'Europe'
  currency        TEXT NOT NULL DEFAULT 'EUR',       -- 'EUR', 'THB', 'USD'
  primary_language TEXT NOT NULL DEFAULT 'en',       -- 'es', 'fr', 'th'
  lat             DECIMAL(9,6) NOT NULL,
  lng             DECIMAL(9,6) NOT NULL,
  default_zoom    INTEGER DEFAULT 13,
  zone_count      INTEGER DEFAULT 0,
  property_count  INTEGER DEFAULT 0,
  data_quality_tier TEXT DEFAULT 'tier2' CHECK (data_quality_tier IN ('tier1','tier2','tier3')),
  featured        BOOLEAN DEFAULT false,             -- Show on homepage
  is_published    BOOLEAN DEFAULT false,
  hero_image_url  TEXT,
  tagline         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Public read (published only), admin write via service role
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cities_public_read" ON cities FOR SELECT USING (is_published = true);
```

---

### Table: `safety_zones`

```sql
CREATE TABLE safety_zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         TEXT NOT NULL REFERENCES cities(id),
  zone_slug       TEXT NOT NULL,
  zone_name       TEXT NOT NULL,
  zone_name_local TEXT,

  -- Geography (PostGIS)
  coordinates     GEOGRAPHY(POLYGON, 4326) NOT NULL,
  centroid        GEOGRAPHY(POINT, 4326),
  bounding_box    JSONB,

  -- Safety Score
  safety_score    DECIMAL(3,1) NOT NULL,
  safety_level    TEXT NOT NULL CHECK (safety_level IN ('safe','caution','avoid')),
  color_code      TEXT NOT NULL,
  crime_score     DECIMAL(3,1),
  reviews_score   DECIMAL(3,1),
  walkability_score DECIMAL(3,1),
  time_modifier   DECIMAL(3,1) DEFAULT 0,

  -- Crime data integration
  crime_data_sources  JSONB,        -- Array of source names + last pull dates
  data_confidence     TEXT CHECK (data_confidence IN ('tier1','tier2','tier3')),
  last_crime_update   TIMESTAMPTZ,
  city_context        JSONB,        -- City-specific crime weights + thresholds
  severity_threshold  DECIMAL(3,1) DEFAULT 7.0,

  -- Content
  description         TEXT,
  tips                TEXT[],
  highlights          TEXT[],
  cautions            TEXT[],
  data_sources        TEXT[],

  -- Stats
  report_count    INTEGER DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  property_count  INTEGER DEFAULT 0,

  -- Meta
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,

  UNIQUE(city_id, zone_slug)
);

CREATE INDEX idx_zones_geography ON safety_zones USING GIST (coordinates);
CREATE INDEX idx_zones_city ON safety_zones (city_id);
CREATE INDEX idx_zones_level ON safety_zones (safety_level);
CREATE INDEX idx_zones_published ON safety_zones (is_published) WHERE is_published = true;

ALTER TABLE safety_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zones_public_read" ON safety_zones FOR SELECT USING (is_published = true);
```

---

### Table: `properties`

```sql
CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         TEXT NOT NULL REFERENCES cities(id),
  zone_id         UUID REFERENCES safety_zones(id),

  -- Basic Info
  name            TEXT NOT NULL,
  property_type   TEXT NOT NULL CHECK (property_type IN ('hotel','hostel','apartment','guesthouse')),
  description     TEXT,
  star_rating     INTEGER CHECK (star_rating BETWEEN 1 AND 5),

  -- Location
  lat             DECIMAL(9,6) NOT NULL,
  lng             DECIMAL(9,6) NOT NULL,
  address         TEXT,
  neighborhood    TEXT,

  -- External Platform IDs (for affiliate links + price sync)
  google_place_id     TEXT,
  booking_com_id      TEXT,
  hostelworld_id      TEXT,
  agoda_id            TEXT,
  expedia_id          TEXT,

  -- Safety
  safety_features     TEXT[],
  women_safety_score  DECIMAL(3,1),    -- Computed from AI review analysis
  total_women_reviews INTEGER DEFAULT 0,
  women_rating        DECIMAL(2,1),
  overall_rating      DECIMAL(2,1),
  review_count        INTEGER DEFAULT 0,
  women_review_count  INTEGER DEFAULT 0,

  -- Trip type suitability (JSON scores 0-10)
  trip_types          JSONB,            -- { solo: 8.5, family: 7.0, business: 9.0 }

  -- Pricing (snapshot — real-time prices in property_prices table)
  price_per_night     DECIMAL(8,2),
  currency            TEXT DEFAULT 'USD',
  booking_url         TEXT,
  image_url           TEXT,

  -- Sync tracking
  last_review_sync    TIMESTAMPTZ,
  is_available        BOOLEAN DEFAULT true,    -- Updated daily

  -- Meta
  is_published        BOOLEAN DEFAULT false,
  is_verified         BOOLEAN DEFAULT false,   -- Manually verified by team
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_city ON properties (city_id);
CREATE INDEX idx_properties_zone ON properties (zone_id);
CREATE INDEX idx_properties_location ON properties USING GIST (
  ST_SetSRID(ST_MakePoint(lng::double precision, lat::double precision), 4326)
);
CREATE INDEX idx_properties_safety ON properties (women_safety_score DESC) WHERE is_published = true;

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_public_read" ON properties FOR SELECT USING (is_published = true);
```

---

### Table: `aggregated_reviews` (NEW)

```sql
CREATE TABLE aggregated_reviews (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Review content
  review_text         TEXT NOT NULL,
  rating              DECIMAL(2,1),
  reviewer_name       TEXT,
  review_date         DATE,

  -- Source tracking
  source_platform     TEXT NOT NULL,     -- 'google', 'booking', 'hostelworld', 'reddit'
  source_url          TEXT,              -- Original review URL (for attribution)
  source_review_id    TEXT,             -- Platform's review ID

  -- AI analysis output
  is_female_reviewer  BOOLEAN,
  female_confidence   DECIMAL(3,2),     -- 0.00–1.00
  safety_keywords     JSONB,            -- { positive: [], negative: [] }
  safety_score        DECIMAL(3,1),     -- Extracted safety sentiment 1–10
  sentiment_analysis  JSONB,            -- Full sentiment breakdown from AI

  -- Moderation
  is_featured         BOOLEAN DEFAULT false,
  is_published        BOOLEAN DEFAULT false,
  moderation_status   TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending','approved','rejected')),
  moderation_notes    TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_property ON aggregated_reviews (property_id);
CREATE INDEX idx_reviews_female ON aggregated_reviews (property_id, is_female_reviewer) WHERE is_female_reviewer = true;
CREATE INDEX idx_reviews_published ON aggregated_reviews (is_published) WHERE is_published = true;

-- RLS: Published reviews are public. Admin manages via service role.
ALTER TABLE aggregated_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON aggregated_reviews
  FOR SELECT USING (is_published = true AND moderation_status = 'approved');
```

---

### Table: `property_prices` (NEW)

```sql
CREATE TABLE property_prices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,           -- 'booking', 'agoda', 'hostelworld', 'direct', 'expedia'
  price_per_night DECIMAL(8,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'EUR',
  affiliate_url   TEXT NOT NULL,
  check_in_date   DATE NOT NULL,
  check_out_date  DATE NOT NULL,
  is_available    BOOLEAN DEFAULT true,
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prices_property ON property_prices (property_id);
CREATE INDEX idx_prices_dates ON property_prices (check_in_date, check_out_date);
CREATE INDEX idx_prices_updated ON property_prices (last_updated);

-- RLS: Anyone can read prices (needed for comparison display)
ALTER TABLE property_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices_public_read" ON property_prices FOR SELECT USING (is_available = true);
```

---

### Table: `crime_data` (NEW)

```sql
CREATE TABLE crime_data (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID NOT NULL REFERENCES safety_zones(id) ON DELETE CASCADE,
  city_id         TEXT NOT NULL,
  crime_type      TEXT NOT NULL,       -- 'theft', 'assault', 'harassment', 'robbery'
  severity        TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  incident_date   DATE,
  location_lat    DECIMAL(9,6),
  location_lng    DECIMAL(9,6),
  data_source     TEXT NOT NULL,       -- 'police.uk', 'mossos', 'fbi_cde'
  source_url      TEXT,
  source_ref_id   TEXT,               -- Source's own ID for deduplication
  confidence      DECIMAL(3,2) DEFAULT 1.0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crime_zone ON crime_data (zone_id);
CREATE INDEX idx_crime_date ON crime_data (incident_date DESC);
CREATE INDEX idx_crime_type ON crime_data (crime_type);

-- RLS: Aggregated crime data is public. Individual records are admin-only.
-- Users see aggregated scores (via safety_zones.crime_score), not raw incidents.
ALTER TABLE crime_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crime_data_no_public_access" ON crime_data FOR ALL USING (false);
-- Access only via admin client in server-side scoring scripts.
```

---

### Table: `user_profiles` (existing, documented here)

```sql
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  bio         TEXT,
  home_city   TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_public_read" ON user_profiles FOR SELECT USING (is_published = true);
CREATE POLICY "user_profiles_owner_all" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

---

### Table: `user_bookmarks` (NEW)

```sql
CREATE TABLE user_bookmarks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  saved_date      TIMESTAMPTZ DEFAULT NOW(),
  trip_check_in   DATE,
  trip_check_out  DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_bookmarks_user ON user_bookmarks (user_id);

-- RLS: Users see only their own bookmarks
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_owner_only" ON user_bookmarks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Table: `search_history` (NEW)

```sql
CREATE TABLE search_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL for anon
  city_id         TEXT,
  check_in_date   DATE,
  check_out_date  DATE,
  trip_type       TEXT,
  filter_state    JSONB,
  result_count    INTEGER,
  properties_clicked INTEGER DEFAULT 0,
  session_id      TEXT,           -- For anon tracking
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_user ON search_history (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_search_city ON search_history (city_id, created_at DESC);

-- RLS: Users see only their own history. Anon rows not accessible.
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_history_owner_read" ON search_history
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "search_history_insert_all" ON search_history
  FOR INSERT WITH CHECK (true);  -- Anyone can log searches (anonymized)
```

---

### Table: `affiliate_clicks` (NEW)

```sql
CREATE TABLE affiliate_clicks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  platform            TEXT NOT NULL,
  affiliate_url       TEXT NOT NULL,
  price_shown         DECIMAL(8,2),
  currency            TEXT,
  conversion_status   TEXT DEFAULT 'clicked' CHECK (conversion_status IN ('clicked','booked','cancelled')),
  session_id          TEXT,
  ip_hash             TEXT,        -- Anonymized for fraud detection
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_property ON affiliate_clicks (property_id);
CREATE INDEX idx_affiliate_platform ON affiliate_clicks (platform, created_at DESC);

-- RLS: Users see their own click history. No public access to full log.
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_clicks_owner_read" ON affiliate_clicks
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "affiliate_clicks_insert_all" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);  -- Log all clicks
```

---

### Table: `zone_reports` (existing, documented here)

```sql
CREATE TABLE zone_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID NOT NULL REFERENCES safety_zones(id),
  city_id         TEXT NOT NULL,
  incident_type   TEXT NOT NULL CHECK (incident_type IN (
    'felt_unsafe', 'harassment', 'theft', 'assault',
    'felt_very_safe', 'police_presence', 'well_lit', 'other'
  )),
  time_of_day     TEXT CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  description     TEXT,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  user_email_hash TEXT,
  ip_hash         TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  flag_count      INTEGER DEFAULT 0,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE zone_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_anyone_can_insert" ON zone_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_no_public_read" ON zone_reports FOR SELECT USING (false);
-- Admin reads via service role only
```

---

### RLS Verification Query (run after every migration)

```sql
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count,
  ARRAY_AGG(p.policyname ORDER BY p.policyname) AS policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
-- EXPECTED: Every table has rls_enabled = true AND policy_count >= 1
```

---

## 8. API Architecture

All APIs are Next.js App Router Route Handlers (`app/api/*/route.js`).

### Endpoint Map

| Method | Endpoint | Description | Auth | Cache |
|--------|---------|-------------|------|-------|
| GET | `/api/cities` | All published cities | None | 1hr |
| GET | `/api/zones?city=barcelona` | City zones as GeoJSON | None | 30min |
| GET | `/api/zones/[id]` | Single zone detail | None | 30min |
| GET | `/api/properties?city=barcelona&checkin=...` | Properties with availability | None | 5min |
| GET | `/api/properties/[id]` | Full property detail | None | 1hr |
| GET | `/api/properties/[id]/reviews` | Women's reviews for property | None | 15min |
| GET | `/api/properties/[id]/prices` | Multi-platform prices | None | 5min |
| POST | `/api/affiliate/redirect` | Log click + redirect to platform | None | No cache |
| POST | `/api/reports` | Submit zone safety report | None | No cache |
| GET | `/api/search?q=...&city=...` | Search zones + properties | None | 5min |
| POST | `/api/users/profile` | Create user profile | Auth | No cache |
| POST | `/api/sync/reviews` | Trigger review sync (admin) | Admin | No cache |
| POST | `/api/sync/crime` | Trigger crime data sync (admin) | Admin | No cache |
| POST | `/api/sync/prices` | Trigger price sync (admin) | Admin | No cache |

### Multi-Source Price Response Format

```javascript
// GET /api/properties/[id]/prices?checkin=2026-06-01&checkout=2026-06-05
{
  "property_id": "uuid",
  "check_in": "2026-06-01",
  "check_out": "2026-06-05",
  "nights": 4,
  "prices": [
    {
      "platform": "booking",
      "platform_display": "Booking.com",
      "price_per_night": 185.00,
      "total_price": 740.00,
      "currency": "EUR",
      "affiliate_url": "/api/affiliate/redirect?platform=booking&property=uuid&...",
      "is_best_price": false,
      "last_updated": "2026-04-26T10:30:00Z"
    },
    {
      "platform": "agoda",
      "platform_display": "Agoda",
      "price_per_night": 179.00,
      "total_price": 716.00,
      "currency": "EUR",
      "affiliate_url": "/api/affiliate/redirect?platform=agoda&property=uuid&...",
      "is_best_price": true,
      "last_updated": "2026-04-26T10:30:00Z"
    }
  ],
  "best_price": { "platform": "agoda", "price_per_night": 179.00 },
  "data_freshness_minutes": 45
}
```

---

## 9. AI & Automation

### Review Intelligence Engine

Full pipeline from raw review to safety score:

```
1. RAW REVIEW INGESTION
   Source APIs → raw review objects → queue

2. DEDUPLICATION
   Check source_review_id against aggregated_reviews table
   Skip if already processed

3. FEMALE REVIEWER DETECTION
   Run Women Reviewer Detector (see Section 4)
   Store: is_female_reviewer, female_confidence

4. SAFETY ANALYSIS (female reviews only, confidence ≥ 0.70)
   Run Safety Keyword Extractor
   Run Sentiment Analyzer
   Run Crime Severity Adapter
   Store: safety_keywords, safety_score, sentiment_analysis

5. PROPERTY SCORE UPDATE
   Recalculate women_safety_score for property
   = weighted average of all approved female review safety scores
   Update properties.women_safety_score

6. ZONE SCORE UPDATE (if enough new data)
   Recalculate safety_zones.reviews_score for affected zones
   Recompute composite safety_score
   Update zone → invalidate CDN cache

7. MODERATION QUEUE
   Flag reviews with:
   - Profanity / spam
   - Fake positive signals (sudden rating spike)
   - Contradictory signals
   → manual review queue
```

### Automated Background Jobs

**DAILY (3:00 AM UTC — low traffic)**

```
1. Review Sync
   ├── Google Places: fetch new reviews for all published properties
   ├── Booking.com: fetch new reviews (when partnered)
   └── Reddit: scan r/solotravel, city subs for property mentions

2. Price Sync
   ├── Query all affiliate APIs for next 30 days prices
   ├── Update property_prices table
   └── Flag properties where no price available (set is_available = false)

3. Stale Data Flag
   ├── Flag properties with last_review_sync > 30 days
   └── Flag zones with last_crime_update > 90 days
```

**WEEKLY (Sunday 4:00 AM UTC)**

```
1. Crime Data Pull
   ├── Pull updated crime data from all police APIs
   ├── Dedup against existing crime_data records
   ├── Run Crime Severity Adapter per city
   └── Recalculate zone crime scores

2. Safety Score Recalculation
   ├── Recompute all zone safety scores (crime + reviews + walkability)
   └── Republish updated zones → purge CDN cache

3. User Digest Email
   └── Email users: updates to their bookmarked properties
```

**MONTHLY (1st of month, 2:00 AM UTC)**

```
1. Data Quality Audit
   ├── Check all published properties still exist on source platforms
   ├── Remove delisted properties (is_published = false)
   └── Flag low-confidence zones for editorial review

2. Analytics Report
   ├── Top searched cities
   ├── Affiliate click-through rates per platform
   ├── Conversion rates by property type
   └── Safety score distribution changes
```

---

## 10. Legal Compliance

> Full detail in [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md)

### Data Source Legal Tiers

**TIER 1 — Fully Legal (implement immediately)**
- Official police APIs (public government data)
- Google Places API (official, paid)
- Affiliate APIs (Booking.com, Hostelworld, Agoda — require partnership application)
- Reddit API with official rate limits

**TIER 2 — Gray Area (implement with attribution)**
- Booking.com review display (with "Originally on Booking.com — View original" link)
- TripAdvisor snippets (with full attribution)
- Public social media mentions
- Forum aggregation (with source linking)

**TIER 3 — Requires Partnership (negotiate from position of traffic)**
- Direct TripAdvisor API
- Booking.com inventory (not just affiliate)
- Property management system data

### Core Legal Mitigation Strategies

1. **Always attribute sources** — every data point links back to its origin
2. **Respect robots.txt** — honour crawl delays, use proper user-agents
3. **Rate limiting** — never hammer sources (Booking: 1 req/2s, TripAdvisor: 1 req/3s)
4. **DMCA compliance** — 24-hour takedown response, legal@hersafestay.com
5. **GDPR** — user consent, right to deletion, data minimization, cookie policy

---

## 11. Security Architecture

> **Full documentation:** [SECURITY.md](./SECURITY.md) — read before any database work.

### Non-Negotiable Rules

1. **RLS on every table** — no table ships without Row Level Security enabled
2. **Service role key server-side only** — never in NEXT_PUBLIC_ variables
3. **Never commit secrets** — .env.local is gitignored
4. **Input validation at every API boundary** — treat all input as untrusted
5. **Parameterized queries only** — never string-interpolate SQL

### RLS Policy Architecture Per Table

| Table | Pattern | Public Read | Public Write |
|-------|---------|------------|-------------|
| `cities` | A — Public Read | Published only | No (admin only) |
| `safety_zones` | A — Public Read | Published only | No |
| `properties` | A — Public Read | Published only | No |
| `aggregated_reviews` | A — Public Read | Approved only | No |
| `property_prices` | A — Public Read | Available only | No |
| `crime_data` | C — Admin Only | No | No |
| `user_profiles` | B — User Owned | Published profiles | Own record only |
| `user_bookmarks` | B — User Owned | Own only | Own only |
| `zone_reports` | B — Write Open | No | Anyone |
| `search_history` | B — User Owned | Own only | Anyone |
| `affiliate_clicks` | B — User Owned | Own only | Anyone |

### New API Key Security

| Key | Classification | Where Used | Restriction |
|-----|---------------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client + Server | RLS is the guard |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Public | Client | HTTP referrer restricted |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET** | Server API routes only | Never NEXT_PUBLIC_ |
| `OPENAI_API_KEY` | **SECRET** | Server/Edge functions only | Never NEXT_PUBLIC_ |
| `REDDIT_CLIENT_SECRET` | **SECRET** | Server sync jobs only | Never NEXT_PUBLIC_ |
| `BOOKING_AFFILIATE_ID` | Semi-public | Client affiliate links | OK in client |
| `UPSTASH_REDIS_REST_TOKEN` | **SECRET** | Server only | Never NEXT_PUBLIC_ |

---

## 12. Scalability Plan

### Capacity Targets

| Phase | Monthly Users | Cities | Properties | Strategy |
|-------|--------------|--------|-----------|---------|
| MVP (now) | 1,000–10,000 | 3 | 45 | Manual curation |
| 6 months | 50,000 | 20 | 5,000 | Semi-automated |
| 12 months | 200,000 | 50 | 25,000 | Automated pipeline |
| 24 months | 1,000,000 | 200 | 200,000 | ML-driven |
| 5 years | 5,000,000+ | 500+ | 1,000,000+ | Scaled infrastructure |

### Infrastructure Scaling Path

```
MVP:        Supabase Free → Vercel Hobby
10K users:  Supabase Pro ($25/mo) → Vercel Pro ($20/mo)
100K users: Supabase Pro + connection pooling → Vercel Team + Redis
1M users:   Supabase Enterprise or self-hosted PostgreSQL → CDN + edge caching
5M users:   Distributed PostgreSQL + read replicas + Redis cluster
```

### Language Support Roadmap

| Phase | Languages | Cities |
|-------|----------|--------|
| Launch | EN | Barcelona, Paris, Bangkok |
| Month 6 | EN, ES, FR | 20 cities |
| Month 12 | EN, ES, FR, DE, IT | 50 cities |
| Year 2 | +JA, TH, PT | 100+ cities |

---

## 13. Competitive Analysis

### Direct Competitors

| Competitor | Safety Focus | Women-Specific | Map-First | Multi-Platform Price |
|-----------|-------------|----------------|-----------|---------------------|
| Booking.com | None | None | No | No (own inventory) |
| Airbnb | Basic | None | No | No |
| Hostelworld | Reviews only | Limited | No | No |
| Numbeo | Crime stats | None | Basic | No |
| **HerSafeStay** | **Core product** | **100%** | **Yes** | **Yes** |

### Our Moat

1. **Proprietary AI safety scoring** — trained specifically on women's travel context
2. **Government data partnerships** — direct API access, not scraped
3. **Women-first community** — trust built through focus (not added as feature)
4. **Network effects** — more users → more data → better scores → more users
5. **First-mover advantage** — no serious competitor building for this exact niche

---

## 14. Go-To-Market Strategy

### Launch Phases

**Phase 1 — SOFT LAUNCH (Months 1–3):** 3 perfect cities
- Beta users from women's travel communities (Reddit, Facebook groups)
- Content SEO: "Is [city] safe for solo female travelers?"
- Instagram influencer outreach (solo female travel niche)
- TypeForm survey → email list → launch notification

**Phase 2 — PUBLIC LAUNCH (Months 4–6):** 10 cities
- Press: TechCrunch, Travel + Leisure, Condé Nast Traveler
- Affiliate program applications submitted
- Paid acquisition: Google (safety travel queries), Meta (women 25–45)

**Phase 3 — SCALE (Months 7–12):** 50 cities
- Series Seed funding ($500K–$2M)
- International markets: LATAM, Asia Pacific
- Premium tier launch

**Phase 4 — ECOSYSTEM (Year 2):** 200+ cities
- HerSafeWay transport safety pilot
- Series A
- Acquisition discussions ($50M–$500M range)

### Marketing Channels Priority

1. **SEO** — "safe travel for women [city]" queries (high intent, free)
2. **Reddit** — r/solotravel, r/TwoXChromosomes, city subreddits (community)
3. **Instagram/TikTok** — solo female travel influencers (awareness)
4. **Email newsletter** — weekly city safety digest (retention)
5. **Podcast sponsorships** — travel + women's lifestyle podcasts
6. **PR** — tech + travel media (credibility)
7. **Paid acquisition** — after organic proven ($50K seed → paid experiments)

---

## 15. Risk Analysis & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Google Maps API cost spike | Medium | High | Budget alerts at $50, $100, $200; key restrictions |
| Supabase free tier limits | Low | Medium | Monitor daily; $25/mo Pro is trivial |
| Review scraping blocked | High | Medium | Official APIs first; attribution model as fallback |
| AI analysis cost overrun | Medium | Medium | Use Claude claude-haiku-4-5 for bulk; GPT-4 only for featured |
| Data quality controversy | Low | Very High | Transparency mandate: show all sources + confidence |

### Legal Risks

| Risk | Mitigation |
|------|-----------|
| DMCA notice for review aggregation | Attribution model + 24hr takedown response |
| GDPR violation | Data minimization + deletion API + consent flows |
| Affiliate ToS violation | Legal review of each program before launch |
| Inaccurate safety recommendation | Clear disclaimers; liability insurance |

### Business Risks

| Risk | Mitigation |
|------|-----------|
| Low affiliate conversion | A/B test CTA placement; improve price comparison UX |
| Booking.com affiliate rejected | Start with Hostelworld (easier approval); use as leverage |
| Competitor copies the model | Speed to market; community moat; first-mover brand trust |
| Funding gap | Bootstrap to €10K MRR before raising; keep burn low |

---

## Appendix: File Structure

```
hersafestay/
├── app/
│   ├── layout.js                     # AuthProvider, fonts, GA4
│   ├── page.js                       # Landing page
│   ├── globals.css                   # Reset, animations, accessibility
│   ├── map/
│   │   ├── page.js                   # Map page (server component)
│   │   └── MapPageClient.jsx         # Map client wrapper (ssr:false)
│   ├── property/[id]/
│   │   ├── page.js                   # Property detail (ISR, 1hr revalidate)
│   │   ├── loading.js                # Loading skeleton
│   │   └── not-found.js              # 404 page
│   ├── city/[slug]/
│   │   └── page.js                   # City SEO landing pages
│   ├── auth/
│   │   ├── login/page.js
│   │   ├── signup/page.js
│   │   └── reset-password/page.js
│   ├── profile/
│   │   ├── page.js                   # Protected profile page
│   │   └── saved/page.js             # Saved properties
│   └── api/
│       ├── cities/route.js
│       ├── zones/route.js + [id]/route.js
│       ├── properties/route.js + [id]/route.js
│       ├── properties/[id]/reviews/route.js
│       ├── properties/[id]/prices/route.js
│       ├── affiliate/redirect/route.js
│       ├── reports/route.js
│       ├── search/route.js
│       ├── users/profile/route.js
│       └── sync/
│           ├── reviews/route.js      # Admin: trigger review sync
│           ├── crime/route.js        # Admin: trigger crime data sync
│           └── prices/route.js       # Admin: trigger price sync
│
├── components/
│   ├── map/
│   │   ├── SafetyMap.jsx             # Main map (Google Maps wrapper)
│   │   ├── PropertyList.jsx          # Sidebar property list
│   │   ├── CitySelector.jsx          # City tab selector
│   │   ├── SearchFilters.jsx         # Filter panel
│   │   └── CitySelector.jsx
│   ├── property/
│   │   ├── PropertyDetailView.jsx    # Full property detail
│   │   ├── AggregatedReviews.jsx     # Women's reviews display
│   │   └── PriceComparison.jsx       # Multi-platform prices (Skyscanner style)
│   └── common/
│       └── Header.jsx                # Auth-aware navigation
│
├── contexts/
│   └── AuthContext.jsx               # Auth state management
│
├── lib/
│   ├── supabase.js                   # createBrowserClient (@supabase/ssr)
│   ├── database.js                   # Data access layer
│   ├── mapUtils.js                   # GeoJSON → Google Maps converters
│   ├── safetyColors.js               # SAFETY_COLORS constants
│   ├── mapStyles.js                  # Google Maps custom style
│   ├── reviewAggregator.js           # Review fetch + AI pipeline orchestrator
│   ├── affiliateManager.js           # Affiliate URL builder + click tracker
│   ├── crimeDataSync.js              # Police API clients
│   ├── availabilitySync.js           # Booking platform availability sync
│   ├── searchUtils.js                # Filter/sort utilities
│   └── urlValidation.js             # Booking URL allowlist validation
│
├── scripts/
│   ├── import-zones.js               # Import GeoJSON → Supabase
│   ├── score-zones.js                # Recalculate safety scores
│   ├── distribute-properties.js      # Point-in-polygon validator
│   └── validate-polygons.js          # Check for overlaps/gaps
│
├── proxy.js                          # Next.js 16 middleware (session refresh)
├── ARCHITECTURE.md                   # This file
├── BUSINESS_MODEL.md                 # Revenue model detail
├── DATA_SOURCES.md                   # Police APIs + affiliate programs
├── LEGAL_COMPLIANCE.md               # Legal strategy + ToS templates
├── PROGRESS.md                       # Build roadmap
├── SECURITY.md                       # Security rules (READ FIRST)
├── SOLUTIONS.md                      # Known solutions log
├── OPTIMIZATIONS.md                  # Performance log
└── TESTING_CHECKLIST.md              # QA checklist
```

---

*Last updated: 2026-04-26*
*Version: 2.0 — Safety Intelligence Platform pivot*
*Security contact: Review SECURITY.md before any database/API work*
