# HerSafeStay — Legal Compliance

> Legal is not optional. Build it right from the start. This document covers ToS, privacy, GDPR, affiliate disclosures, content moderation, and DMCA. Cheaper to do it right now than pay lawyers to fix it at scale.

---

## Table of Contents

1. [Legal Entity & Structure](#1-legal-entity--structure)
2. [Terms of Service](#2-terms-of-service)
3. [Privacy Policy](#3-privacy-policy)
4. [GDPR Compliance Checklist](#4-gdpr-compliance-checklist)
5. [Cookie Policy](#5-cookie-policy)
6. [Affiliate Disclosures](#6-affiliate-disclosures)
7. [DMCA Process](#7-dmca-process)
8. [User Agreement](#8-user-agreement)
9. [Content Moderation Policy](#9-content-moderation-policy)
10. [Data Source Legal Tiers](#10-data-source-legal-tiers)
11. [Liability Limitations](#11-liability-limitations)

---

## 1. Legal Entity & Structure

### Recommended Setup

**Spain (Barcelona-based founder):**
- Entity: **Sociedad Limitada (SL)** — equivalent of LLC
- Timeline: 4–6 weeks via notary, ~€1,500 in fees
- Alternative: UK Ltd (faster, cheaper) if operating pre-entity
- VAT: Register for VAT once revenue exceeds €85,000/year (UK) or from day one (ES)

**Early-stage (pre-entity):**
- Operate as sole trader (autónomo in Spain)
- Simple, fast, adequate until first funding

**Contact:** Use a Spanish labor/company lawyer for setup. Budget €1,500–3,000.

---

## 2. Terms of Service

### Key Clauses Required

**2.1 Service Description**
```
HerSafeStay is a travel safety information platform. We aggregate publicly
available safety data and present it to help travelers make informed decisions.
We are not a booking platform, travel agent, or guarantor of safety.
```

**2.2 No Safety Guarantee**
```
CRITICAL DISCLAIMER — must be prominent:

"Safety scores and information on HerSafeStay are based on publicly available
data and are provided for informational purposes only. HerSafeStay does not
guarantee the safety of any location, property, or route. Safety conditions
change frequently. Always consult your government's official travel advisory
before traveling. HerSafeStay is not liable for any harm, loss, or injury
resulting from use of this platform."
```

**2.3 Affiliate Disclosure**
```
"HerSafeStay earns affiliate commissions when you book through links on our
platform. This does not affect our safety ratings, which are based solely on
data. We will always show you the most relevant options regardless of affiliate
relationships."
```

**2.4 User-Generated Content**
```
"By submitting safety reports or reviews, you grant HerSafeStay a worldwide,
royalty-free license to use, display, and distribute your content. You confirm
that your content is accurate to the best of your knowledge."
```

**2.5 Intellectual Property**
```
"Safety scores, zone boundaries, and platform design are proprietary to
HerSafeStay. Crime data is sourced from public government datasets. Reviews
are attributed to their original platforms."
```

**2.6 Governing Law**
```
Spain: "These terms are governed by Spanish law. Disputes shall be resolved
in the courts of Barcelona."
```

### Implementation

Add to footer: [Terms of Service] — links to `/legal/terms`

Use a lawyer to draft proper ToS before launch. Budget €500–1,000 for a basic SaaS ToS.

---

## 3. Privacy Policy

### Required Sections (GDPR Compliant)

**3.1 Data Controller**
```
HerSafeStay [Legal Entity Name]
[Address]
Email: privacy@hersafestay.com
```

**3.2 What Data We Collect**

| Category | Data | Purpose | Legal Basis |
|----------|------|---------|------------|
| Account | Email, name | Authentication | Contract |
| Search history | City, dates, filters | Personalization | Legitimate interest |
| Affiliate clicks | Property, platform, timestamp | Revenue tracking | Legitimate interest |
| Analytics | Page views, clicks (anonymized) | Product improvement | Legitimate interest |
| Safety reports | Incident type, location, IP hash | Safety scoring | Legitimate interest |
| Device | Browser, device type | Analytics | Legitimate interest |

**3.3 What We Don't Collect**
- Full IP addresses (only hashed for fraud detection)
- Exact GPS location (city-level only for search)
- Payment information (handled entirely by booking platforms)
- Biometric data

**3.4 Data Retention**
```
Account data:          Until deletion request
Search history (anon): 90 days
Search history (auth): Until deletion request
Affiliate clicks:      30 days (then anonymized)
Analytics data:        26 months (GA4 default)
Safety reports:        Indefinitely (anonymized, aggregate use)
```

**3.5 Your Rights (GDPR)**
```
Right to access:     Request all data at /api/users/export or email privacy@hersafestay.com
Right to deletion:   Delete account in Profile settings or email privacy@hersafestay.com
Right to portability: Data export in JSON format on request
Right to object:     Opt out of non-essential processing via privacy settings
```

**3.6 Third Parties**
```
Google Analytics 4: Analytics (opt-out available)
Supabase: Database hosting (GDPR-compliant, EU data processing)
Vercel: Hosting (GDPR-compliant)
OpenAI: Review analysis (no personal data sent — review text only, anonymized)
```

### Implementation

Link in footer: [Privacy Policy] → `/legal/privacy`

---

## 4. GDPR Compliance Checklist

### Technical Requirements

```
DATA COLLECTION
[ ] Cookie consent banner implemented (non-essential cookies require consent)
[ ] Analytics (GA4) only loads after consent
[ ] Consent stored server-side (not just localStorage — can be cleared)
[ ] Consent timestamp logged with user record

DATA STORAGE
[ ] All user data in Supabase (EU region: Frankfurt)
[ ] Supabase DPA (Data Processing Agreement) signed
[ ] Vercel DPA reviewed and accepted
[ ] OpenAI: only send anonymized review text, no personal identifiers

USER RIGHTS IMPLEMENTATION
[ ] /api/users/export → returns all user data as JSON
[ ] Profile deletion → cascades to all linked records
[ ] Search history: anonymous cleanup cron (90 days)
[ ] Affiliate clicks: anonymization cron (30 days)

DOCUMENTATION
[ ] Privacy Policy live at /legal/privacy
[ ] Data flow diagram maintained
[ ] DPA signed with all sub-processors
[ ] Data breach response plan written
```

### Consent Management

```javascript
// components/common/CookieConsent.jsx
// Must load before GA4, LogRocket, or any non-essential tracking

const CONSENT_KEY = 'hss_cookie_consent';
const CONSENT_VERSION = '1.0';

export function CookieConsent() {
  const [show, setShow] = useState(!localStorage.getItem(CONSENT_KEY));

  const acceptAll = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      analytics: true,
      marketing: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }));
    loadAnalytics();
    setShow(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      analytics: false,
      marketing: false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }));
    setShow(false);
  };
  // ...
}
```

---

## 5. Cookie Policy

### Cookie Inventory

| Cookie | Provider | Purpose | Duration | Required |
|--------|---------|---------|---------|---------|
| `sb-auth-token` | Supabase | User session | Session | Yes |
| `hss_cookie_consent` | HerSafeStay | Consent record | 1 year | Yes |
| `hss_filters` | HerSafeStay | Filter preferences | 30 days | No (functional) |
| `_ga`, `_ga_*` | Google Analytics | Analytics | 2 years | No (analytics) |
| `_gcl_au` | Google Analytics | Ad conversion | 90 days | No (marketing) |

### Required Banner Text

```
"We use cookies to improve your experience. Essential cookies are required
for authentication and security. Analytics cookies help us understand how
travelers use our safety platform.

[Accept All]  [Essential Only]  [Cookie Settings]"
```

---

## 6. Affiliate Disclosures

### FTC / EU Requirements

Affiliate relationships must be disclosed clearly at point of click.

**Near each affiliate link:**
```
"Booking links are affiliate links. If you book via these links,
HerSafeStay earns a small commission at no extra cost to you.
This does not influence our safety ratings."
```

**In site footer:**
```
"HerSafeStay participates in affiliate programs including Booking.com,
Hostelworld, Agoda, Expedia, and others. We earn commissions on qualifying
purchases. Our safety ratings are independent of commercial relationships."
```

**On About page:**
```
Dedicated "How We Make Money" section explaining:
1. Affiliate commissions (primary)
2. Premium subscriptions (future)
3. Safety badge program (future)
And explicitly stating: "Safety scores are never influenced by commercial relationships"
```

### Platform-Specific Requirements

**Booking.com:** Must include "Booking.com" trademark attribution per partner terms.
**Amazon Associates:** Must include "As an Amazon Associate I earn from qualifying purchases."
**Google:** Must follow Google Publisher Policies for any Google-served ads.

---

## 7. DMCA Process

### Contact Information

```
DMCA Agent:
HerSafeStay Legal
Email: legal@hersafestay.com
Subject line: "DMCA Takedown Request"
Response time: 24 hours
```

### Takedown Request Process

**For incoming DMCA notices:**

```
Step 1 (0-4 hours):   Acknowledge receipt by email
Step 2 (0-24 hours):  Remove or disable access to flagged content
Step 3 (24-72 hours): Send formal acknowledgment with action taken
Step 4:               Log in SOLUTIONS.md
Step 5:               Implement prevention to avoid recurrence
Step 6 (optional):    If valid fair use, consult lawyer for counter-notice
```

**What counts as valid DMCA:**
- Review text owned by original platform (disputed — fair use may apply for snippets)
- Photos or images (clear case — remove immediately)
- Proprietary data or reports

**Safe harbors (§512 DMCA):**
- We qualify as OSP (Online Service Provider) with DMCA agent registered
- User-generated content protected if we respond quickly to notices
- Register DMCA agent at: copyright.gov/dmca-agent/

### Platform-Specific Attribution Policy

When aggregating reviews, always include:

```javascript
// components/property/AggregatedReviews.jsx
function ReviewAttribution({ source, sourceUrl }) {
  return (
    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
      Originally posted on{' '}
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
        {source}
      </a>
      {' '}— View original review
    </p>
  );
}
```

---

## 8. User Agreement

### Safety Report Submission Agreement

Displayed as checkbox before submitting a zone report:

```
"By submitting this report, I confirm that:
☐ This report is based on my personal experience or observation
☐ The information is accurate to the best of my knowledge
☐ I am not submitting this on behalf of a business competitor
☐ I understand false reports may result in account suspension

I agree to the Terms of Service and grant HerSafeStay the right to
use this information to improve safety scores for the benefit of
all women travelers."
```

### Account Deletion Notice

Shown before account deletion:

```
"Before you go:
• Your bookmarks and search history will be permanently deleted
• Your safety reports will be anonymized and retained (they help other travelers)
• You can create a new account at any time

Are you sure you want to delete your account? [Delete Account] [Cancel]"
```

---

## 9. Content Moderation Policy

### Zone Report Moderation Standards

**Auto-reject (immediately):**
- Contains profanity or hate speech
- Clearly spam (repetitive, off-topic)
- Submitted more than 5 times from same IP in 24 hours
- Contains personally identifiable information (names, phone numbers)

**Hold for manual review:**
- Contains specific allegations against named businesses
- Safety score would change by >1.0 if incorporated (significant impact)
- Inconsistent with 10+ other reports for same zone (outlier detection)
- Submitted from a flagged IP range

**Auto-approve:**
- Positive safety observation (well-lit, felt safe, police presence)
- Consistent with existing zone data
- From verified user (email confirmed)

### Review Moderation Standards

**Auto-reject AI analysis:**
- `female_confidence < 0.70` — not classified as female reviewer
- `review_text.length < 30` — too short, likely bot
- Exact text match to existing review (duplicate)

**Hold for manual review:**
- Safety score deviation: AI score vs. star rating differ by >3 points
- Fake positive signals (sudden 5-star spike for low-rated property)
- Contains competitor property names (coordinated attack)

**Manual review queue:** Admin reviews pending items daily in Supabase table editor.

---

## 10. Data Source Legal Tiers

### Tier 1 — Fully Legal (Use Immediately)

| Source | Why Legal | Notes |
|--------|----------|-------|
| Police.uk API | Public government data, open license | Requires attribution |
| FBI CDE API | US federal public data | Requires attribution |
| data.gouv.fr | French government open data | Open license CC-BY |
| Google Places API | Official paid API | Per ToS |
| Reddit API | Official API with usage terms | Per Reddit API ToS |
| Booking.com Affiliate API | Official partner program | Per affiliate agreement |
| OSM data | Open Database License (ODbL) | Requires attribution |

### Tier 2 — Gray Area (Attribution Required)

| Source | Risk | Mitigation |
|--------|------|-----------|
| Booking.com review display | Medium — ToS unclear on aggregation | Always link back, show 3-sentence snippets only |
| TripAdvisor review snippets | Medium | Link to original, <100 words per review |
| Forum aggregation | Low — public posts | Attribution + link to original post |
| Social media mentions | Low | Public posts + attribution |

**Our policy for Tier 2:**
1. Display maximum 100 words of any review
2. Always include "View original review" link to source
3. Remove immediately on DMCA notice
4. Respond within 24 hours to any platform complaint

### Tier 3 — Requires Partnership (Do Not Use Without Agreement)

| Source | Approach |
|--------|---------|
| TripAdvisor full API | Contact partnerships@tripadvisor.com |
| Booking.com full inventory data | Requires approved Partner status |
| Hostelworld full inventory | Requires affiliate partnership |

---

## 11. Liability Limitations

### Safety Score Disclaimer

**The most important legal protection we have:**

```
MUST BE VISIBLE on every map view and property detail page:

"Safety scores are based on historical data from official sources and
user reports. They do not guarantee current conditions. Conditions
change. Always consult your government's official travel advisory.
HerSafeStay is not liable for outcomes based on this data."
```

### Affiliate Link Disclaimer

```
"Clicking booking links will take you to third-party booking platforms.
HerSafeStay is not responsible for the booking process, property
conditions, or any disputes with third-party platforms."
```

### Insurance Recommendation

At Series Seed funding:
- **Technology E&O insurance:** Covers claims arising from inaccurate safety information
- **General liability insurance:** Required for any B2B partnerships
- Estimated cost: €3,000–8,000/year
- Provider: Hiscox, AXA, or specialist tech insurers

### Platform Limitation

```
Maximum liability clause (ToS):
"HerSafeStay's total liability for any claim shall not exceed the
greater of (a) the fees paid by you in the past 12 months or (b) €100."
```

---

## Implementation Timeline

| Item | When | Owner |
|------|------|-------|
| Safety disclaimer on all pages | Before launch | Engineering |
| Privacy Policy page | Before launch | Founder (draft) + Lawyer (review) |
| Cookie consent banner | Before launch | Engineering |
| Terms of Service | Before launch | Lawyer |
| Affiliate disclosures | When first affiliate link live | Engineering |
| DMCA agent registration | Before launch | Founder |
| legal@hersafestay.com email | Before launch | Founder |
| GDPR DPA with Supabase | Before launch | Founder |
| Insurance | Before Series Seed | Founder |

---

*Last updated: 2026-04-26*
*Legal contact: legal@hersafestay.com*
*Note: This document provides a framework. Consult a qualified lawyer before launch.*
