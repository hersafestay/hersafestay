-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Aggregated reviews with AI female detection + safety scoring
-- Requires: 002_create_tables.sql must be run first
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: aggregated_reviews
-- Reviews pulled from external platforms (Google, Booking, Hostelworld, etc.)
-- and enriched with female-traveler signals via AI processing.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS aggregated_reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Review content
  review_text         TEXT NOT NULL,
  rating              DECIMAL(3,1),                    -- 1.0 – 10.0 (normalised)
  reviewer_name       TEXT,                            -- may be anonymised
  review_date         TIMESTAMPTZ,                     -- when review was written

  -- Source tracking
  source_platform     TEXT NOT NULL,                   -- 'google', 'booking', 'hostelworld', 'tripadvisor'
  source_url          TEXT,                            -- deep-link to original review
  source_id           TEXT,                            -- platform's own review ID (for deduplication)

  -- AI female-detection output
  is_female_reviewer  BOOLEAN,                         -- NULL = unknown / not processed yet
  female_confidence   DECIMAL(5,4),                    -- 0.0000 – 1.0000

  -- Safety-keyword NLP output
  safety_keywords     JSONB DEFAULT '[]'::jsonb,       -- array of matched keyword objects
  safety_score        DECIMAL(4,2),                    -- 0.00 – 10.00 derived from keywords

  -- Visibility
  is_featured         BOOLEAN DEFAULT false,
  is_published        BOOLEAN DEFAULT true,

  created_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate ingestion from the same platform
  UNIQUE (property_id, source_platform, source_id)
);

-- Index for the most common query pattern: reviews for a property
CREATE INDEX IF NOT EXISTS idx_aggregated_reviews_property
  ON aggregated_reviews (property_id, is_published, review_date DESC);

-- Index for female-traveler filter
CREATE INDEX IF NOT EXISTS idx_aggregated_reviews_female
  ON aggregated_reviews (property_id, is_female_reviewer, is_published);

-- Index for JSONB safety_keywords queries
CREATE INDEX IF NOT EXISTS idx_aggregated_reviews_safety_keywords
  ON aggregated_reviews USING GIN (safety_keywords);


-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Public can read published reviews. Only service-role (admin) can write.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE aggregated_reviews ENABLE ROW LEVEL SECURITY;

-- Public read: any authenticated or anonymous user can read published reviews
CREATE POLICY "Public can read published reviews"
  ON aggregated_reviews
  FOR SELECT
  USING (is_published = true);

-- Admin write: only the service-role key (used in API routes) can insert/update/delete
CREATE POLICY "Admin full write access"
  ON aggregated_reviews
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: property_review_stats
-- Denormalised stats per property — used in property detail pages and cards.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW property_review_stats AS
SELECT
  property_id,
  ROUND(AVG(rating)::numeric, 1)                                 AS avg_rating,
  COUNT(*)                                                       AS total_reviews,
  ROUND(AVG(safety_score)::numeric, 2)                          AS avg_safety_score,
  COUNT(*) FILTER (WHERE is_female_reviewer = true)             AS female_review_count
FROM aggregated_reviews
WHERE is_published = true
GROUP BY property_id;
