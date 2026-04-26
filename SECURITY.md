# HerSafeStay — Security Architecture

> **Non-negotiable:** Security is not optional. Every table, every API, every feature ships with security baked in from day one.

---

## Table of Contents

1. [Critical Non-Negotiable Rules](#1-critical-non-negotiable-rules)
2. [Database Security — RLS Mandatory Patterns](#2-database-security--rls-mandatory-patterns)
3. [Security Checklist for New Tables](#3-security-checklist-for-new-tables)
4. [API Key Security](#4-api-key-security)
5. [Frontend Security](#5-frontend-security)
6. [Production Deployment Security Checklist](#6-production-deployment-security-checklist)
7. [Monitoring and Incident Response](#7-monitoring-and-incident-response)
8. [Claude Code Security Instructions](#8-claude-code-security-instructions)
9. [Security Warnings Interpretation Guide](#9-security-warnings-interpretation-guide)

---

## 1. Critical Non-Negotiable Rules

These rules MUST NEVER be violated. No exceptions.

### Rule 1: RLS on Every Table — Always

```sql
-- EVERY table requires this immediately after CREATE TABLE
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**Why:** Supabase tables are publicly accessible by default if RLS is disabled. A single table without RLS can expose all data to anyone with the anon key. The anon key is visible in your frontend JavaScript — treat it as public.

**Verification:** After any schema change, run:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Every row must show rowsecurity = true
```

### Rule 2: Service Role Key is Server-Side Only

```
SUPABASE_SERVICE_ROLE_KEY → NEVER in NEXT_PUBLIC_* variables
SUPABASE_SERVICE_ROLE_KEY → NEVER in frontend JavaScript
SUPABASE_SERVICE_ROLE_KEY → ONLY in server-side API routes
```

The service role key bypasses ALL Row Level Security. Exposing it in the browser gives anyone full read/write access to your entire database.

### Rule 3: Never Commit Secrets

```
.env.local → never committed (covered by .gitignore)
API keys  → never hardcoded in source files
Passwords → never hardcoded anywhere
```

**Before any commit:** `git diff --staged | grep -i "key\|secret\|password\|token"` — if anything sensitive appears, stop and fix it.

### Rule 4: Input Validation at Every API Boundary

Every POST/PUT/PATCH endpoint MUST:
1. Validate all input fields (type, length, format)
2. Sanitize string inputs before database insertion
3. Rate limit to prevent abuse

### Rule 5: Parameterized Queries Only

```javascript
// CORRECT — parameterized
const { data } = await supabase
  .from('safety_zones')
  .select('*')
  .eq('city_id', city)  // Supabase handles parameterization

// WRONG — string interpolation (SQL injection risk)
// NEVER do: `SELECT * FROM safety_zones WHERE city_id = '${city}'`
```

---

## 2. Database Security — RLS Mandatory Patterns

### Pattern A: Public Read (Published Content)

Use for: `cities`, `safety_zones`, `properties` (published records only)

```sql
-- Enable RLS (MANDATORY)
ALTER TABLE safety_zones ENABLE ROW LEVEL SECURITY;

-- Public can read published zones only
CREATE POLICY "public_read_published"
  ON safety_zones
  FOR SELECT
  USING (is_published = true);

-- No public write access
-- (Admin writes via service role key in server-side scripts only)
```

### Pattern B: User-Owned Records

Use for: `zone_reports`, future `user_profiles`, `saved_places`

```sql
ALTER TABLE zone_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a report (anonymous OK for MVP)
CREATE POLICY "anyone_can_insert_reports"
  ON zone_reports
  FOR INSERT
  WITH CHECK (true);

-- Users can only read their own reports
CREATE POLICY "users_read_own_reports"
  ON zone_reports
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Only admins can read all reports
-- (admin access via service role in API routes, not RLS)
```

### Pattern C: Admin-Only Tables

Use for: `admin_logs`, `moderation_queue`, `score_calculations`

```sql
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- No public access at all
CREATE POLICY "no_public_access"
  ON admin_logs
  FOR ALL
  USING (false);

-- Access only via service role key (bypasses RLS) in server-side code
```

### Pattern D: Mixed Access (Read Public, Write Authenticated)

Use for future user-contributed features

```sql
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_approved"
  ON user_reviews FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert their own
CREATE POLICY "auth_insert_own"
  ON user_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending reviews
CREATE POLICY "auth_update_own_pending"
  ON user_reviews FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "auth_delete_own"
  ON user_reviews FOR DELETE
  USING (auth.uid() = user_id);
```

### Complete RLS Verification Query

Run after every migration:

```sql
-- Check all tables have RLS enabled
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
-- WARNING: Any table with rls_enabled = false is a critical security gap
```

---

## 3. Security Checklist for New Tables

Copy and complete this checklist for EVERY new table:

```
TABLE: ______________________
DATE: ______________________

PRE-CREATION
[ ] Table name follows snake_case convention
[ ] Sensitive columns identified (email, ip, location, payment)
[ ] Data sensitivity level determined (public / user-private / admin-only)
[ ] RLS pattern selected (Pattern A/B/C/D from SECURITY.md Section 2)

DURING CREATION
[ ] CREATE TABLE executed
[ ] ALTER TABLE [name] ENABLE ROW LEVEL SECURITY; executed IMMEDIATELY after
[ ] RLS policies created for all required access patterns
[ ] No SELECT * from sensitive columns in public policies
[ ] Indexes created for columns used in RLS policy conditions

POST-CREATION VERIFICATION
[ ] Run verification query (Section 2) — confirms RLS enabled
[ ] Test with anon key: confirm only authorized data is returned
[ ] Test with service role: confirm admin access works via server-side code
[ ] Sensitive columns confirmed absent from public-facing API responses

ONGOING
[ ] Table documented in ARCHITECTURE.md Section 3
[ ] Backup/retention policy confirmed
```

---

## 4. API Key Security

### Environment Variable Classification

| Variable | Classification | Where Used |
|----------|---------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Semi-public (URL only) | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (RLS is the guard) | Client + Server |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Public (restrict by HTTP referrer) | Client only |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET — Server only** | Server API routes only |
| `GOOGLE_MAPS_SERVER_KEY` | **SECRET — Server only** | Server API routes only |

### Google Maps API Key Restrictions (MANDATORY)

In Google Cloud Console → APIs & Services → Credentials:

1. **HTTP referrer restrictions** (for `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`):
   ```
   hersafestay.com/*
   *.hersafestay.com/*
   *.vercel.app/*
   localhost:3000/*
   127.0.0.1:3000/*
   ```

2. **API restrictions** — only enable:
   - Maps JavaScript API
   - Geocoding API
   - Places API

3. **Monitor usage** in Google Cloud Console — set billing alerts at $10, $50, $100

### Supabase Security Settings

In Supabase Dashboard → Settings → API:

- [ ] JWT expiry: 3600 seconds (1 hour) — not the default 604800 (7 days)
- [ ] Enable email confirmation for new signups
- [ ] Set allowed redirect URLs (no wildcards in production)

In Supabase Dashboard → Settings → Auth:
- [ ] Disable sign-ups if you don't need public auth yet (MVP: consider this)
- [ ] Enable leaked password protection
- [ ] Set OTP expiry to 600 seconds (10 minutes)

### .env.local Template

```bash
# Public (safe to expose to browser, restricted by HTTP referrer or RLS)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# PRIVATE — Server-side only. NEVER prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional: separate server-side Maps key with no HTTP referrer restriction
# GOOGLE_MAPS_SERVER_KEY=AIza...
```

---

## 5. Frontend Security

### XSS Prevention

**Rule:** Never use `dangerouslySetInnerHTML` with user-provided content.

```javascript
// WRONG — XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: zone.description }} />

// CORRECT — React escapes automatically
<div>{zone.description}</div>

// If you MUST render HTML (e.g., CMS content), sanitize first:
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

### Input Sanitization

For user-submitted text (zone reports, reviews):

```javascript
// lib/sanitize.js
export function sanitizeText(input) {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, 1000)               // Max length
    .replace(/[<>]/g, '')         // Strip angle brackets
}

export function sanitizeEmail(input) {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim().toLowerCase().slice(0, 254)
  // Validate basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed) ? trimmed : ''
}
```

### Content Security Policy (CSP)

Add to `next.config.js` for production:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://maps.googleapis.com https://www.google-analytics.com",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; ')
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
]
```

### URL Validation (Booking Links)

```javascript
// lib/urlValidation.js
const ALLOWED_BOOKING_DOMAINS = [
  'booking.com', 'airbnb.com', 'hostelworld.com',
  'expedia.com', 'hotels.com', 'agoda.com'
]

export function isValidBookingUrl(url) {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    return ALLOWED_BOOKING_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}
```

---

## 6. Production Deployment Security Checklist

Complete before every production deployment:

### Pre-Deployment

```
ENVIRONMENT VARIABLES
[ ] All required env vars set in Vercel dashboard (not just .env.local)
[ ] SUPABASE_SERVICE_ROLE_KEY NOT in any NEXT_PUBLIC_* variable
[ ] SUPABASE_SERVICE_ROLE_KEY NOT visible in client-side JavaScript bundle
[ ] Google Maps API key has HTTP referrer restrictions set
[ ] No API keys hardcoded in source files

DATABASE
[ ] All tables have RLS enabled (run verification query in Section 2)
[ ] All RLS policies tested with anon key
[ ] No sensitive columns exposed in public RLS policies
[ ] Database backups enabled in Supabase dashboard

CODE REVIEW
[ ] No console.log statements exposing sensitive data
[ ] No TODO/FIXME comments mentioning security issues left unresolved
[ ] Input validation on all POST endpoints
[ ] Rate limiting configured on user-submission endpoints
```

### Post-Deployment Verification

```
[ ] Check browser DevTools → Network → confirm no secrets in responses
[ ] Verify Google Maps API key is restricted (test from unauthorized domain)
[ ] Run: curl https://[your-supabase-url]/rest/v1/zone_reports -H "apikey: [anon-key]"
    Expected: 401 Unauthorized or empty array (never raw data without auth)
[ ] Check Vercel deployment logs for any exposed secrets warnings
[ ] Confirm HTTPS only (no HTTP redirects leaking data)
```

---

## 7. Monitoring and Incident Response

### Ongoing Security Monitoring

**Weekly checks:**
- [ ] Supabase Dashboard → API logs: look for unusual query patterns
- [ ] Google Cloud Console: verify Maps API usage within expected range
- [ ] Vercel logs: check for 500 errors that might indicate injection attempts

**Automated alerts to set up:**
```
Google Cloud Console → Billing → Budgets & Alerts:
  - Alert at $10 (Maps API unexpected spike)
  - Alert at $50 (investigate immediately)

Supabase Dashboard → Settings → Billing:
  - Alert at 80% of database storage used
```

### Signs of a Security Incident

| Symptom | Likely Cause | Action |
|---------|-------------|--------|
| Google Maps API bill spike | Key exposed/scraped | Rotate key immediately |
| Supabase unexpected data | RLS misconfigured | Audit all policies immediately |
| Strange database entries | SQL injection or spam | Review inputs, add validation |
| Service role key in git history | Accidental commit | Rotate key, force-push or rewrite history |

### Incident Response Steps

1. **Rotate compromised credentials immediately**
   - Google Cloud Console: delete old key, create new key with restrictions
   - Supabase: Settings → API → rotate service role key
   - Update Vercel environment variables

2. **Assess scope**
   - Review Supabase audit logs for unauthorized access
   - Check if any data was exfiltrated

3. **Patch the vulnerability**
   - Fix root cause before re-deploying

4. **Document in SOLUTIONS.md**
   - Record what happened and how it was resolved

---

## 8. Claude Code Security Instructions

When prompting Claude Code for development tasks on HerSafeStay, ALWAYS include:

```
SECURITY REQUIREMENTS (mandatory):
- Enable RLS immediately after any new table creation
- Use SUPABASE_SERVICE_ROLE_KEY server-side only (never NEXT_PUBLIC_)
- All user inputs must be validated and sanitized
- No dangerouslySetInnerHTML with user content
- Use parameterized queries only (Supabase client handles this)
```

**Reference CLAUDE_CODE_TEMPLATE.md** for the complete standard prompt structure.

### What Claude Code Should Never Do

- Use `supabaseAdmin` (service role) in client components
- Set `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` in env examples
- Suggest disabling RLS to "fix" a permissions issue
- Use string interpolation to build SQL queries
- Add `dangerouslySetInnerHTML` with database content

### Security Review Before Accepting Claude Code Output

Before applying any AI-generated database migrations or API code, verify:

1. Does it include `ENABLE ROW LEVEL SECURITY`?
2. Does it create appropriate policies?
3. Does it use service role key server-side only?
4. Does it validate inputs before database operations?

---

## 9. Security Warnings Interpretation Guide

### Supabase Dashboard Warnings

| Warning | Meaning | Fix |
|---------|---------|-----|
| "RLS not enabled on table X" | Critical — table exposed | `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` + add policies |
| "No policies found on table X" | RLS on but no rules = no access for anon | Add appropriate policies |
| "JWT secret not configured" | Auth tokens insecure | Set JWT secret in Supabase Auth settings |

### Next.js Build Warnings

| Warning | Meaning | Fix |
|---------|---------|-----|
| "NEXT_PUBLIC_ env var exposed" | Variable is in browser bundle | Expected for public vars; never use for secrets |
| `dangerouslySetInnerHTML` lint warning | XSS risk | Sanitize with DOMPurify or use text content |

### Git Pre-commit Hooks (Recommended Setup)

```bash
# Install secret detection
npm install --save-dev @secretlint/secretlint secretlint

# .secretlintrc.json
{
  "rules": [{ "id": "@secretlint/secretlint-rule-preset-recommend" }]
}

# package.json scripts
"lint:secrets": "secretlint '**/*' --ignore-pattern '.git/**'"
```

Run before every commit: `npm run lint:secrets`

---

---

## 10. External API Security

### API Key Rotation Policy

| Key Type | Rotation Frequency | Trigger |
|----------|------------------|---------|
| Google Maps API key | Every 6 months | Or immediately on any leak/bill spike |
| Supabase service role key | Every 3 months | Or immediately on any compromise suspicion |
| OpenAI API key | Every 6 months | Or on unexpected usage spike |
| Reddit client secret | Every 6 months | Or on unauthorized access |
| Booking affiliate credentials | Per partner policy | Follow partner instructions |

**After rotation:** Update Vercel environment variables → redeploy → verify functionality.

### Rate Limit Monitoring

Set alerts in each service dashboard when usage hits 80% of limits or expected budget:

| Service | Alert Threshold | Action |
|---------|----------------|--------|
| Google Maps API | $150/month | Investigate usage spike, add caching |
| Google Places API | $150/month | Throttle review sync frequency |
| OpenAI API | $80/month | Switch bulk processing to Claude Haiku |
| Supabase | 80% storage | Upgrade to Pro or archive old data |
| Reddit API | 90 req/min | Increase sync interval |

### Service Account Isolation

Each external service uses a separate, scoped credential:
- **Google Maps** (client): `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — HTTP referrer restricted, Maps JS API only
- **Google Places** (server): `GOOGLE_PLACES_SERVER_KEY` — no referrer restriction, server-side only
- **OpenAI** (server): `OPENAI_API_KEY` — server-side only, set monthly spend cap in OpenAI dashboard
- **Reddit** (server): `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` — server-side only
- **Upstash Redis**: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — server-side only

**Never** use a single multi-purpose API key for multiple services. Isolation limits blast radius of any single compromise.

### Webhook Signature Verification

For any incoming webhooks (Supabase Edge Function callbacks, affiliate postbacks):

```javascript
// lib/webhookValidation.js
import crypto from 'crypto';

export function verifyWebhookSignature(payload, signature, secret) {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
  // Use timingSafeEqual to prevent timing attacks
  const expectedBuf = Buffer.from(`sha256=${expectedSig}`);
  const receivedBuf = Buffer.from(signature);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

// In webhook route handler:
export async function POST(request) {
  const signature = request.headers.get('x-webhook-signature');
  const body = await request.text();
  if (!verifyWebhookSignature(body, signature, process.env.WEBHOOK_SECRET)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  // ... process webhook
}
```

---

## 11. Data Source Validation

### Crime Data Integrity Checks

Before incorporating any crime data into zone scores:

```javascript
// lib/crimeDataSync.js
function validateCrimeRecord(record) {
  const checks = {
    hasRequiredFields: !!(record.zone_id && record.crime_type && record.data_source),
    validCrimeType: VALID_CRIME_TYPES.includes(record.crime_type),
    validSeverity: ['low','medium','high','critical'].includes(record.severity),
    notFutureDated: !record.incident_date || new Date(record.incident_date) <= new Date(),
    notTooOld: !record.incident_date || new Date(record.incident_date) > new Date('2020-01-01'),
    validCoordinates: !record.location_lat || (
      record.location_lat >= -90 && record.location_lat <= 90 &&
      record.location_lng >= -180 && record.location_lng <= 180
    ),
  };
  const passed = Object.values(checks).every(Boolean);
  return { passed, checks };
}
```

**Spike detection:** If a crime data pull returns >50% more incidents than the previous pull for the same zone and period, flag for manual review before incorporating.

### Review Authenticity Verification

Signals that a review may be fake or manipulated:

```javascript
const FAKE_REVIEW_SIGNALS = {
  extremeRating: (r) => r.rating === 5.0 && r.safety_score > 9.5,   // Suspiciously perfect
  tooShort: (r) => r.review_text.length < 30,                         // Bot placeholder
  repeatedText: (r, existing) => existing.some(e => e.review_text === r.review_text),
  suddenSpike: (count, avgCount) => count > avgCount * 3,             // Astroturfing
  suspiciousDate: (r) => /* reviews from the future */ new Date(r.review_date) > new Date(),
};
```

Reviews triggering ≥2 signals are held in `moderation_status = 'pending'` for manual review.

### Source Attribution Requirements

Every data point displayed to users MUST include:
1. **Source name** — "Mossos d'Esquadra", "Google Places", "Reddit r/solotravel"
2. **Last updated date** — "Updated April 2026"
3. **Confidence tier** — Tier 1 (high), Tier 2 (medium), Tier 3 (estimated)
4. **Data point count** — "Based on 847 police reports and 2,341 reviews"

Non-negotiable for trust. Users deserve to know where every score comes from.

### Confidence Scoring Methodology

```javascript
function calculateZoneConfidence(zone) {
  let score = 0;

  // Crime data factors (40% weight)
  if (zone.crime_data_sources?.length > 0) score += 20;
  if (zone.last_crime_update > thirtyDaysAgo) score += 20;

  // Review factors (40% weight)
  if (zone.review_count >= 100) score += 20;
  else if (zone.review_count >= 20) score += 10;
  if (zone.women_review_count >= 20) score += 20;

  // Freshness factors (20% weight)
  if (zone.updated_at > sevenDaysAgo) score += 20;
  else if (zone.updated_at > thirtyDaysAgo) score += 10;

  // Map to tiers
  if (score >= 80) return 'tier1';
  if (score >= 40) return 'tier2';
  return 'tier3';
}
```

---

## 12. User Privacy

### Search History Encryption

Search history is stored in plaintext for analytics but with these privacy controls:

```sql
-- Anonymous sessions: no user_id linkage
INSERT INTO search_history (city_id, session_id, created_at)
VALUES ($1, $2, NOW());

-- Authenticated sessions: linked to user_id for personalization
INSERT INTO search_history (user_id, city_id, filter_state, created_at)
VALUES (auth.uid(), $1, $2, NOW());
```

**Retention policy:**
- Anonymous search history: auto-deleted after 90 days
- Authenticated user history: retained until user deletion request
- Aggregated analytics (no personal data): retained indefinitely

```sql
-- Scheduled cleanup (run weekly via Supabase Edge Function)
DELETE FROM search_history
WHERE user_id IS NULL AND created_at < NOW() - INTERVAL '90 days';
```

### Bookmark Privacy

User bookmarks are private by default. The RLS policy `bookmarks_owner_only` ensures users can ONLY see their own bookmarks, even if they know another user's ID.

**Never expose bookmark data in:**
- API responses without authentication
- Public endpoints
- Analytics exports (use aggregate counts only)

### Affiliate Click Anonymization

After 30 days, affiliate click records are anonymized:

```sql
-- Run monthly via cron
UPDATE affiliate_clicks
SET
  user_id = NULL,         -- Unlink from user
  ip_hash = NULL,         -- Remove IP hash
  session_id = NULL       -- Remove session
WHERE created_at < NOW() - INTERVAL '30 days'
  AND (user_id IS NOT NULL OR ip_hash IS NOT NULL);
```

Revenue analytics only require platform, property, count, and timestamp — no personal data needed.

### GDPR Compliance Requirements

**Right to deletion (Article 17):** When a user deletes their account:
```sql
-- Cascade via ON DELETE CASCADE:
-- user_profiles → auto-deleted
-- user_bookmarks → auto-deleted
-- search_history → auto-deleted

-- Anonymize (not delete) for data integrity:
UPDATE affiliate_clicks SET user_id = NULL WHERE user_id = $deleted_user_id;
UPDATE zone_reports SET user_email_hash = NULL WHERE user_email_hash = $user_hash;
```

**Right to access (Article 15):** `/api/users/export` endpoint returns all user data as JSON.

**Consent:** Cookie consent banner required for non-essential cookies (GA4, LogRocket).

**Data minimization:** Collect only what is needed. Do not collect:
- Full IP addresses (only hashed for dedup)
- Exact location (only city-level for search)
- Payment details (handled entirely by booking platforms)

---

## 13. Content Liability

### Review Display Disclaimers

All review displays must include:

```html
<!-- Required disclaimer on all review sections -->
<p class="disclaimer">
  Reviews are aggregated from multiple platforms and filtered using AI.
  HerSafeStay does not guarantee the accuracy of individual reviews.
  <a href="/about/data-sources">Learn how we process reviews →</a>
</p>
```

### Safety Score Limitations

The safety score display must include a visible limitation statement:

```html
<p class="safety-disclaimer">
  Safety scores are based on available data and may not reflect current conditions.
  Always check local government travel advisories before traveling.
  Last updated: [DATE]. Data sources: [LIST].
</p>
```

Link prominently to official travel advisories:
- UK: gov.uk/foreign-travel-advice
- USA: travel.state.gov
- Australia: smartraveller.gov.au
- Canada: travel.gc.ca

### User-Generated Content Moderation

Zone reports submitted by users go through:

1. **Automated checks:** Rate limiting (5/day per IP), duplicate detection, spam filter
2. **AI pre-screening:** Flag violent/inappropriate content for manual review
3. **Manual review queue:** Admin reviews all reports before `status = 'approved'`
4. **Approved reports only** influence zone scores

No user-generated content is displayed publicly without editorial approval.

### DMCA Response Protocol

**Response time commitment:** Within 24 hours of any valid DMCA notice.

**Process:**
1. Receive notice at legal@hersafestay.com
2. Within 24 hours: remove or disable access to flagged content
3. Within 72 hours: send acknowledgment to complainant
4. Log in SOLUTIONS.md with resolution
5. Implement prevention to avoid recurrence

**Counter-notice:** If content is believed to be fair use or correctly attributed, consult legal counsel before filing counter-notice.

---

*Last updated: 2026-04-26*
*Security contact: Review all issues at project level before shipping any feature*
