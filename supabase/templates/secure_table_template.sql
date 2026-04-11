-- =============================================================================
-- SECURE TABLE TEMPLATE — HerSafeStay
-- =============================================================================
-- INSTRUCTIONS:
-- 1. Find+Replace [table_name] with your actual table name
-- 2. Find+Replace [singular_name] with singular form (e.g., zone, property)
-- 3. Choose the RLS pattern that matches your access requirements
-- 4. Delete the patterns you don't need
-- 5. Run the verification query at the bottom to confirm security
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: CREATE THE TABLE
-- Replace column definitions with your actual columns
-- -----------------------------------------------------------------------------

CREATE TABLE [table_name] (
  -- Identity (always include these)
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Add your columns here:
  -- example_text    TEXT NOT NULL,
  -- example_int     INTEGER DEFAULT 0,
  -- example_bool    BOOLEAN DEFAULT false,
  -- user_id         UUID REFERENCES auth.users(id),  -- for user-owned records

  -- For published/draft content, add:
  -- is_published    BOOLEAN DEFAULT false
);

-- -----------------------------------------------------------------------------
-- STEP 2: ENABLE ROW LEVEL SECURITY — MANDATORY, DO THIS IMMEDIATELY
-- This MUST happen before ANY data is inserted
-- -----------------------------------------------------------------------------

ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CHOOSE YOUR RLS PATTERN (delete the patterns you don't need)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PATTERN A: PUBLIC READ (for published content like cities, zones, properties)
-- Use when: data is publicly visible but only admins write
-- -----------------------------------------------------------------------------

CREATE POLICY "[table_name]_public_read"
  ON [table_name]
  FOR SELECT
  USING (is_published = true);

-- No public insert/update/delete — admin writes via service role key only

-- -----------------------------------------------------------------------------
-- PATTERN B: USER-OWNED RECORDS (for reports, saved places, preferences)
-- Use when: users submit data and can only see their own
-- Requires: user_id UUID column referencing auth.users(id)
-- -----------------------------------------------------------------------------

-- Anyone can submit (anonymous submissions for MVP)
CREATE POLICY "[table_name]_anyone_insert"
  ON [table_name]
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users can read their own records only
CREATE POLICY "[table_name]_owner_read"
  ON [table_name]
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Authenticated users can update their own records
CREATE POLICY "[table_name]_owner_update"
  ON [table_name]
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own records
CREATE POLICY "[table_name]_owner_delete"
  ON [table_name]
  FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- PATTERN C: ADMIN-ONLY (for internal tables like moderation, logs, scores)
-- Use when: no public access at all, only service role via server-side code
-- -----------------------------------------------------------------------------

CREATE POLICY "[table_name]_no_public_access"
  ON [table_name]
  FOR ALL
  USING (false);

-- NOTE: Service role key bypasses RLS entirely.
-- Access this table ONLY via supabaseAdmin in server-side API routes.
-- NEVER use supabaseAdmin in client components.

-- -----------------------------------------------------------------------------
-- PATTERN D: MIXED (public read approved, authenticated write own)
-- Use when: community content that's publicly visible after approval
-- Requires: status column, user_id column
-- -----------------------------------------------------------------------------

-- Public can read approved records
CREATE POLICY "[table_name]_public_read_approved"
  ON [table_name]
  FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert their own
CREATE POLICY "[table_name]_auth_insert"
  ON [table_name]
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Authenticated users can update their own pending records only
CREATE POLICY "[table_name]_auth_update_pending"
  ON [table_name]
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- Authenticated users can delete their own records
CREATE POLICY "[table_name]_auth_delete_own"
  ON [table_name]
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 3: CREATE INDEXES
-- Add indexes for columns used in WHERE clauses and RLS policy conditions
-- =============================================================================

-- Always index columns used in RLS USING conditions
-- CREATE INDEX idx_[table_name]_is_published ON [table_name] (is_published);
-- CREATE INDEX idx_[table_name]_user_id ON [table_name] (user_id);
-- CREATE INDEX idx_[table_name]_status ON [table_name] (status);

-- Index foreign keys
-- CREATE INDEX idx_[table_name]_city_id ON [table_name] (city_id);
-- CREATE INDEX idx_[table_name]_zone_id ON [table_name] (zone_id);

-- Geospatial index (if table has coordinates)
-- CREATE INDEX idx_[table_name]_geography ON [table_name] USING GIST (coordinates);

-- =============================================================================
-- STEP 4: AUTO-UPDATE updated_at TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER [table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 5: VERIFICATION — RUN THIS AFTER EVERY MIGRATION
-- Expected: every table shows rls_enabled = true AND policy_count >= 1
-- =============================================================================

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

-- CRITICAL: If any row shows rls_enabled = false, your data is exposed.
-- Fix immediately: ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TEMPLATE COMPLETE
-- Document this table in ARCHITECTURE.md Section 3 before shipping.
-- =============================================================================
