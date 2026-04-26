# HerSafeStay — Business Model

> HerSafeStay is NOT a booking platform. We are the safety intelligence layer between women travelers and booking platforms. We earn affiliate commissions when users redirect from our safety-optimized interface to external platforms.

---

## Table of Contents

1. [Core Revenue Model](#1-core-revenue-model)
2. [Affiliate Programs — Accommodation](#2-affiliate-programs--accommodation)
3. [Multi-Source Price Display Strategy](#3-multi-source-price-display-strategy)
4. [Affiliate Programs — Tours & Activities](#4-affiliate-programs--tours--activities)
5. [Affiliate Programs — Safety Products](#5-affiliate-programs--safety-products)
6. [Premium Subscriptions](#6-premium-subscriptions)
7. [Additional Revenue Streams](#7-additional-revenue-streams)
8. [Revenue Projections](#8-revenue-projections)
9. [Unit Economics](#9-unit-economics)
10. [Affiliate Program Application Status](#10-affiliate-program-application-status)
11. [Funding Strategy](#11-funding-strategy)
12. [Exit Scenarios](#12-exit-scenarios)

---

## 1. Core Revenue Model

### The Flywheel

```
More safety data → Better recommendations → More user trust
       ↑                                           ↓
More revenue ← Higher conversion ← More bookings
```

### Why Affiliate (Not Inventory) Model

| Model | Capital Required | Risk | Margin | Our Choice |
|-------|----------------|------|--------|-----------|
| Booking platform (own inventory) | Very High | Very High | 10–15% | ✗ No |
| Affiliate (redirect to platforms) | None | None | 3–7% | ✓ Yes |
| SaaS subscription | Medium | Medium | 80%+ | ✓ Phase 2 |
| Data licensing | Low | Low | 70%+ | ✓ Phase 3 |

We start as pure affiliate → layer subscriptions → license data to B2B.

### Revenue Per Booking

```
Average booking: €180/night × 3 nights = €540 total
Affiliate commission: 4% average = €21.60 per booking

To hit €10,000/month: 463 bookings → achievable at ~15,000 MAU
To hit €100,000/month: 4,630 bookings → achievable at ~100,000 MAU
```

---

## 2. Affiliate Programs — Accommodation

### Priority Partners (Apply in Order)

**Tier 1 — Apply Immediately**

| Platform | Program Name | Commission | Apply At | Notes |
|----------|-------------|-----------|---------|-------|
| Booking.com | Booking.com Affiliate Partner Program | 3–5% of booking value | affiliate.booking.com | Easiest approval, widest inventory |
| Hostelworld | Hostelworld Affiliate | €1–3 per booking OR 6–8% | developers.hostelworld.com | Perfect for budget + hostel segment |
| Hotels.com | Hotels.com Affiliate Program | 3–5% | affiliates.hotels.com | Part of Expedia Group |
| Expedia | Expedia Affiliate Network | 3–6% | expedia.com/affiliate | Group includes Hotels.com, Vrbo |

**Tier 2 — Apply at Month 3 (when we have traffic data)**

| Platform | Commission | Notes |
|----------|-----------|-------|
| Agoda | 3–7% | Asia-focused — critical for Bangkok, Tokyo, Singapore |
| TripAdvisor | Varies | Hotel price comparison clicks |
| GetYourGuide | 8–12% | Tours start in Month 3 |
| Airbnb | ~3% | Harder approval, requires traffic proof |

**Tier 3 — Partnership Negotiation (when 10K+ MAU)**

| Platform | Approach |
|----------|---------|
| Booking.com | Negotiate preferred partner status for higher commission |
| Hostelworld | Revenue share on women's safety badge program |
| Regional platforms | Direct partnership with Despegar (LATAM), Ctrip (China) |

### Booking.com Integration Detail

```javascript
// lib/affiliateManager.js
const BOOKING_AFFILIATE_ID = process.env.BOOKING_AFFILIATE_ID; // Public OK

export function buildBookingAffiliateUrl(hotelId, checkIn, checkOut, adults) {
  const baseUrl = 'https://www.booking.com/hotel/es/property-name.html';
  const params = new URLSearchParams({
    aid: BOOKING_AFFILIATE_ID,       // Affiliate ID
    hotel_id: hotelId,
    checkin: checkIn,                // YYYY-MM-DD
    checkout: checkOut,
    no_rooms: 1,
    group_adults: adults,
    label: 'hersafestay-map',        // Track conversion source
  });
  return `${baseUrl}?${params}`;
}
```

### Hostelworld Integration Detail

```javascript
export function buildHostelworldAffiliateUrl(propertyId, checkIn, checkOut) {
  return `https://www.hostelworld.com/hosteldetails.php/${propertyId}` +
    `?from=${checkIn}&to=${checkOut}&affiliate=HERSAFE`;
}
```

---

## 3. Multi-Source Price Display Strategy

### The Skyscanner Model Applied to Accommodations

We show all available prices for a property simultaneously. Users pick their preferred platform — we earn commission regardless of which they choose.

### UI Component: Price Comparison Table

```
┌──────────────────────────────────────────────────────────┐
│  Compare prices for Rosewood Barcelona                   │
│  📅 Jun 1–5 (4 nights)    👤 2 guests                   │
├──────────────────────────────────────────────────────────┤
│  ⭐ Best Price                                            │
│  Hotel Direct   €175/night   €700 total   [Book →]       │
├──────────────────────────────────────────────────────────┤
│  Agoda          €179/night   €716 total   [Book →]       │
│  Booking.com    €185/night   €740 total   [Book →]       │
│  Expedia        €188/night   €752 total   [Book →]       │
│  Hotels.com     €190/night   €760 total   [Book →]       │
├──────────────────────────────────────────────────────────┤
│  💡 Book direct and save €52 vs Hotels.com               │
│  🔒 All links verified safe. Updated 45 min ago.         │
└──────────────────────────────────────────────────────────┘
```

### Direct Hotel Booking (Zero Commission, But High Value)

We include the hotel's own website even though we earn no commission, because:
1. Users trust us more when we show the best deal (even if it's not ours)
2. Users often return to us later, booking other properties via affiliate
3. We save the "Save €52 vs Expedia" messaging for our trust-building narrative
4. In Phase 4, direct hotel bookings generate Safety Verified Badge revenue instead

### Price Sync Architecture

```javascript
// Prices updated via daily cron job
// lib/availabilitySync.js

async function syncPropertyPrices(property, checkIn, checkOut) {
  const results = await Promise.allSettled([
    fetchBookingPrice(property.booking_com_id, checkIn, checkOut),
    fetchAgodaPrice(property.agoda_id, checkIn, checkOut),
    fetchHostelworldPrice(property.hostelworld_id, checkIn, checkOut),
    fetchExpediaPrice(property.expedia_id, checkIn, checkOut),
  ]);

  const prices = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  await supabase
    .from('property_prices')
    .upsert(prices, { onConflict: 'property_id,platform,check_in_date' });
}
```

---

## 4. Affiliate Programs — Tours & Activities

**Target: Month 6–12**

| Platform | Commission | Category | Apply At |
|----------|-----------|---------|---------|
| GetYourGuide | 8–12% | General tours + activities | partner.getyourguide.com |
| Viator (TripAdvisor) | 6–10% | General tours | viator.com/partner |
| Klook | 5–8% | Asia experiences | affiliate.klook.com |
| Airalo | 10–15% | eSIM cards (critical for travelers) | airalo.com/affiliate |

### Women-Specific Tour Curation (Premium Commission)

We curate and feature women-only or women-recommended tours with higher affiliate commission:
- Women-only group tours: direct partnership, 15–20% commission
- Solo-female-friendly walking tours: curated list, standard affiliate
- Safety-focused tours: "Walk Barcelona Safely" — promoted with safety branding

---

## 5. Affiliate Programs — Safety Products

**Target: Year 2**

Amazon Associates (4–8%) on curated safety product list:

| Category | Products | Avg Commission |
|---------|---------|----------------|
| Location safety | AirTags, Tile trackers | 4% |
| Communication | Satellite communicators (Garmin inReach) | 5% |
| Data connectivity | eSIM cards, portable WiFi routers | 8% |
| Personal safety | Personal alarms, safety whistles | 6% |
| Power | Portable chargers, solar chargers | 5% |
| Health | Travel health kits | 6% |

**"HerSafeKit" curated collection** — our recommended kit for solo female travelers, displayed on property detail pages as "What to bring to [city]."

**Travel insurance affiliate:**
- World Nomads: ~15% commission
- SafetyWing: ~10% commission
- InsureMyTrip: ~6% commission

---

## 6. Premium Subscriptions

**Target: Year 2**

### HerSafeStay Premium (€9.99/month or €79.99/year)

| Feature | Free | Premium |
|---------|------|---------|
| Safety map | 3 cities | 200+ cities |
| Filters | Basic | All filters incl. women-specific |
| Property details | Limited | Full incl. women's reviews |
| Real-time safety alerts | No | Yes |
| Trip planner with safety scoring | No | Yes |
| Save unlimited properties | 5 | Unlimited |
| Exclusive women-only deals | No | Yes |
| Emergency SOS button | No | Yes |
| Offline mode | No | Yes |
| Ad-free | No | Yes |

### HerSafeStay Pro — Business (€29.99/month per seat)

For companies managing employee travel:

| Feature | Description |
|---------|-------------|
| Corporate dashboard | Track all employee trips |
| Safety compliance reporting | Export for HR/legal |
| Bulk booking with safety filters | Book multiple rooms |
| 24/7 safety hotline | Direct line to safety team |
| Custom safety policy | Set company-specific safety thresholds |
| Duty of care reporting | Regulatory compliance for international travel |

**Target buyers:** Law firms, consulting firms, NGOs, universities (study abroad programs)

---

## 7. Additional Revenue Streams

### Safety Verified Badge Program

Properties pay €500/year for a verified badge:
- We conduct a safety audit (digital review of policies, amenities, certifications)
- Badge displayed prominently in search results and on property page
- Higher placement in results (tied with organic safety score)
- Annual renewal required

**Revenue calculation at scale:**
- 1,000 verified properties × €500/year = €500,000/year
- Scales with property database growth
- Creates strong B2B sales channel with properties directly

### Sponsored City Safety Guides

Local businesses sponsor city safety guide sections:
- "Safe Coffee Shops for Solo Travelers in Barcelona" — cafes pay €200/month for inclusion
- "Women-Friendly Restaurants in Paris" — restaurants pay for curated feature
- Strict editorial standards: businesses must meet safety criteria first

### Transport Affiliate

Pre-launch HerSafeWay ecosystem, earn transport affiliate revenue:
- Booking.com transfers: included in existing affiliate program
- Welcome Pickups: 8–12% commission
- GetTransfer: 5–8% commission
- Skyscanner (flights): 1% of flight value — high volume, small margin

### Emergency Response Subscriptions

Partner with Global Rescue or ISOS:
- Travel insurance with emergency evacuation coverage
- Commission: 10–15% of subscription value
- Average subscription: €250/year → €25–37 per subscriber

### B2B Data Licensing (Year 3+)

Once safety dataset reaches critical mass:
- License crime + review + walkability data to:
  - Travel insurance companies (underwriting risk models)
  - Corporate travel platforms
  - Government tourism boards
  - Academic researchers
- Pricing: €5,000–50,000/year per enterprise license
- Target: 10 enterprise clients = €200,000–500,000/year

---

## 8. Revenue Projections

### Year 1 — Affiliate Only

```
Monthly Users:    10,000 (ramp: 1K → 10K over 12 months)
Conversion Rate:  2% of users → affiliate click
Average Booking:  €540 (3 nights × €180/night)
Commission Rate:  4%
Commission/Booking: €21.60
Monthly Bookings: 200 (at 10K MAU steady state)
Monthly Revenue:  €4,320
Annual Revenue:   ~€14,400 (full year ramp-up)
```

### Year 2 — Accommodation + Tours + Products

```
Monthly Users:    100,000
Accommodation:    3,000 bookings × €21.60 avg = €64,800/month
Tours:            500 bookings × €50 avg × 8% = €2,000/month
Products:         €2,000/month
Premium:          €1,000 subscribers × €9.99 = €9,990/month
Total Monthly:    ~€78,790
Annual:           ~€945,000 → rounded to €1M (conservative)
```

### Year 3 — Full Portfolio

```
Monthly Users:    500,000
Accommodation:    15,000 × €21.60 = €324,000/month
Tours + Transport: €25,000/month
Products + Insurance: €15,000/month
Premium (5K subscribers): €49,950/month
Badge Program: €41,667/month (€500K/year ÷ 12)
Total Monthly:   ~€456,000
Annual:          ~€5,500,000
```

### Year 5 — Ecosystem

```
Monthly Users:    5,000,000 (HerSafeStay + HerSafeWay + HerSafeNight)
Accommodation:    75,000 × €21.60 = €1,620,000/month
Tours + Transport: €250,000/month
Premium (50K subscribers): €499,500/month
Badge Program: €200,000/month (2,400 properties)
B2B Data Licensing: €100,000/month
Emergency Insurance: €50,000/month
Total Monthly:   ~€2,700,000+
Annual:          ~€32,000,000
```

---

## 9. Unit Economics

### Customer Acquisition Cost (CAC) Targets

| Channel | CAC Target | LTV | LTV:CAC |
|---------|-----------|-----|---------|
| Organic SEO | €0 | €150 | ∞ |
| Reddit/community | €0 | €150 | ∞ |
| Influencer | €5 | €150 | 30:1 |
| Paid Google | €15 | €150 | 10:1 |
| Paid Meta | €20 | €150 | 7.5:1 |

**Target blended CAC: <€10** (heavily organic-weighted)

### Lifetime Value (LTV) Calculation

```
Free user who books once:
  1 booking × €21.60 = €21.60 LTV

Free user who books 3× per year for 3 years:
  9 bookings × €21.60 = €194.40 LTV

Premium subscriber (2-year retention):
  24 months × €9.99 = €239.76 LTV + affiliate commission on bookings

Target blended LTV: €150 (mix of one-time + repeat users)
LTV:CAC ratio target: >10:1
```

---

## 10. Affiliate Program Application Status

| Program | Status | Priority | Action Needed |
|---------|--------|----------|--------------|
| Booking.com Affiliate | ⏳ Not applied | P0 | Apply at affiliate.booking.com |
| Hostelworld Affiliate | ⏳ Not applied | P0 | Apply at developers.hostelworld.com |
| Hotels.com / Expedia | ⏳ Not applied | P1 | Apply at expedia.com/affiliate |
| Agoda Partners | ⏳ Not applied | P1 | Apply at agoda.com/affiliate |
| GetYourGuide Partner | ⏳ Not applied | P2 (Month 6) | Need 5K+ MAU first |
| Amazon Associates | ⏳ Not applied | P2 (Year 2) | Need content site first |
| Airalo (eSIM) | ⏳ Not applied | P2 | Apply at airalo.com/affiliate |
| World Nomads Insurance | ⏳ Not applied | P2 | worldnomads.com/partner |

**Next action:** Apply to Booking.com and Hostelworld affiliate programs first (easiest approval, biggest impact).

---

## 11. Funding Strategy

### Bootstrap Phase (Now → €10K MRR)

- Keep burn extremely low: Vercel ($20) + Supabase ($25) + domains = ~€100/month
- Build to 10,000 MAU organically before any paid spend
- Demonstrate affiliate revenue traction
- Use revenue to fund content + SEO

### Pre-Seed (€10K → €50K MRR)

- Raise €200K–500K from angels (women-focused investors, travel tech angels)
- Use for: hire 1 engineer, Google Places API costs, paid acquisition experiments
- Target investors: female-focused VCs (Female Founders Fund, Backstage Capital)

### Seed Round (€50K MRR target)

- Raise €1M–3M
- Use for: team (4–6 people), API costs at scale, HerSafeWay development, 20 cities
- Valuation target: 20–30× ARR (€1M ARR → €20–30M valuation)

### Series A (€500K MRR target)

- Raise €10M–20M
- Use for: international expansion, enterprise B2B sales, marketing at scale

---

## 12. Exit Scenarios

### Acquisition Targets (Year 4–5)

| Acquirer Type | Examples | Strategic Rationale | Estimated Value |
|--------------|---------|--------------------|----|
| Travel OTA | Booking.com, Expedia, Airbnb | Buy rather than build women's safety layer | €50M–200M |
| Travel tech platform | TripAdvisor, Hostelworld | Acquire user base + safety data | €30M–100M |
| Insurance company | AXA, Allianz Travel | Safety data for underwriting + captive distribution | €50M–150M |
| Safety tech | GlobalRescue, iJET | Expand B2C with women's platform | €30M–100M |
| Strategic PE | Women-focused PE | Roll-up with adjacent female travel brands | €50M–300M |

### IPO Path (Year 6–8)

At €25M+ ARR with strong growth and ecosystem:
- List on tech exchange (NASDAQ, Euronext Growth)
- Public market valuation: 8–15× revenue = €200M–375M
- Enables liquidity + continued growth capital

---

*Last updated: 2026-04-26*
*Owner: Founder*
*Review: Before any fundraising conversation*
