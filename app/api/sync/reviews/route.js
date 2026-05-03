/**
 * POST /api/sync/reviews
 *
 * Ingests a batch of raw reviews for a property, runs them through
 * female-detection + safety-keyword enrichment, then upserts into
 * aggregated_reviews.
 *
 * Protected by SYNC_SECRET header so only authorised scripts/crons can call it.
 * Uses the admin (service-role) Supabase client to bypass RLS.
 */

import { NextResponse } from "next/server";
import { aggregateReviews } from "@/lib/reviewAggregator";

export async function POST(request) {
  // ── Auth: simple shared-secret check ──────────────────────────────────────
  const authHeader = request.headers.get("x-sync-secret");
  const expected   = process.env.SYNC_SECRET;

  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { propertyId, reviews } = body;

  if (!propertyId || typeof propertyId !== "string") {
    return NextResponse.json(
      { error: "propertyId (string) is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return NextResponse.json(
      { error: "reviews must be a non-empty array" },
      { status: 400 }
    );
  }

  // Validate each review has the minimum required fields
  const invalid = reviews.filter(
    (r) => !r.source_platform || !r.source_id || !r.review_text
  );
  if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: "Each review must have source_platform, source_id, and review_text",
        invalid_count: invalid.length,
      },
      { status: 400 }
    );
  }

  // ── Process + upsert ────────────────────────────────────────────────────────
  try {
    const { inserted, errors } = await aggregateReviews(propertyId, reviews);

    if (errors.length > 0) {
      console.error("[POST /api/sync/reviews] partial errors:", errors);
    }

    return NextResponse.json({
      ok:       errors.length === 0,
      inserted,
      errors:   errors.length,
    });
  } catch (err) {
    console.error("[POST /api/sync/reviews] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
