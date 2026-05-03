/**
 * HerSafeStay — Review Aggregator
 *
 * Processes raw reviews from external platforms and enriches each one with:
 *   1. Female-reviewer detection (femaleDetector.js)
 *   2. Safety-keyword extraction + scoring (safetyKeywords.js)
 *
 * Then upserts the processed reviews into Supabase aggregated_reviews table.
 */

import { createAdminClient } from "./supabase";
import { detectFemaleReviewer } from "./femaleDetector";
import { extractSafetyKeywords, calculateSafetyScore } from "./safetyKeywords";

// ─────────────────────────────────────────────────────────────────────────────
// Types (JSDoc only — no TypeScript in this project)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} RawReview
 * @property {string}  source_platform  - 'google' | 'booking' | 'hostelworld' | 'tripadvisor'
 * @property {string}  source_id        - platform's own unique review ID
 * @property {string}  [source_url]     - deeplink to the original review
 * @property {string}  review_text      - full review body
 * @property {number}  [rating]         - raw rating from source (will be normalised to 1–10)
 * @property {string}  [reviewer_name]  - display name (may be anonymous)
 * @property {string}  [review_date]    - ISO 8601 date string
 */

// ─────────────────────────────────────────────────────────────────────────────
// Rating normalisation
// ─────────────────────────────────────────────────────────────────────────────

// Known rating scales per platform
const RATING_SCALES = {
  google:       { max: 5 },
  booking:      { max: 10 },
  hostelworld:  { max: 10 },
  tripadvisor:  { max: 5 },
};

/**
 * Normalise a platform's raw rating to a 1–10 scale.
 * Returns null if rating is missing or invalid.
 *
 * @param {number|undefined} rating
 * @param {string} platform
 * @returns {number|null}
 */
function normaliseRating(rating, platform) {
  if (rating == null || isNaN(rating)) return null;
  const scale = RATING_SCALES[platform] || { max: 10 };
  const normalised = (rating / scale.max) * 10;
  return Math.min(10, Math.max(1, Math.round(normalised * 10) / 10));
}

// ─────────────────────────────────────────────────────────────────────────────
// Core processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enrich a single raw review with female-detection + safety scoring.
 *
 * @param {string}    propertyId - UUID of the property
 * @param {RawReview} raw        - raw review from source
 * @returns {Object} row ready for upsert into aggregated_reviews
 */
export function processReview(propertyId, raw) {
  const { isFemale, confidence } = detectFemaleReviewer(
    raw.reviewer_name || "",
    raw.review_text
  );

  const matchedKeywords = extractSafetyKeywords(raw.review_text);
  const safetyScore     = calculateSafetyScore(matchedKeywords);

  return {
    property_id:        propertyId,
    review_text:        raw.review_text,
    rating:             normaliseRating(raw.rating, raw.source_platform),
    reviewer_name:      raw.reviewer_name || null,
    review_date:        raw.review_date   || null,
    source_platform:    raw.source_platform,
    source_url:         raw.source_url    || null,
    source_id:          raw.source_id,
    is_female_reviewer: isFemale,
    female_confidence:  confidence,
    safety_keywords:    matchedKeywords,
    safety_score:       safetyScore,
    is_featured:        false,
    is_published:       true,
  };
}

/**
 * Process and upsert a batch of raw reviews for a property.
 * Uses the service-role admin client so it can bypass RLS.
 *
 * @param {string}      propertyId - UUID
 * @param {RawReview[]} rawReviews - array of raw reviews from any source
 * @returns {{ inserted: number, errors: Array }}
 */
export async function aggregateReviews(propertyId, rawReviews) {
  if (!propertyId || !rawReviews?.length) {
    return { inserted: 0, errors: [] };
  }

  const rows   = rawReviews.map((r) => processReview(propertyId, r));
  const errors = [];
  let inserted = 0;

  const admin = createAdminClient();

  // Upsert in batches of 50 to stay well within PostgREST limits
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error, count } = await admin
      .from("aggregated_reviews")
      .upsert(batch, {
        onConflict:     "property_id,source_platform,source_id",
        ignoreDuplicates: false,
        count:          "exact",
      });

    if (error) {
      console.error("[aggregateReviews] upsert error:", error);
      errors.push({ batch: i, message: error.message });
    } else {
      inserted += count ?? batch.length;
    }
  }

  return { inserted, errors };
}

/**
 * Fetch processed reviews for a property from the database.
 * Optionally filter to female-only reviews.
 *
 * @param {string}  propertyId   - UUID
 * @param {Object}  [opts]
 * @param {boolean} [opts.femaleOnly]  - only return reviews where is_female_reviewer = true
 * @param {number}  [opts.limit]       - max rows (default 20)
 * @param {number}  [opts.offset]      - pagination offset (default 0)
 * @returns {{ data: Object[], error: Error|null }}
 */
export async function getReviews(propertyId, { femaleOnly = false, limit = 20, offset = 0 } = {}) {
  const admin = createAdminClient();

  let query = admin
    .from("aggregated_reviews")
    .select("*")
    .eq("property_id", propertyId)
    .eq("is_published", true)
    .order("review_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (femaleOnly) {
    query = query.eq("is_female_reviewer", true);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}
