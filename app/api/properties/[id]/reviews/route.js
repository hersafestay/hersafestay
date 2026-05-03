/**
 * GET /api/properties/[id]/reviews
 *
 * Returns published reviews for a property.
 *
 * Query params:
 *   femaleOnly=true   — return only reviews from detected female reviewers
 *   limit=20          — max results (default 20, max 50)
 *   offset=0          — pagination offset
 */

import { NextResponse } from "next/server";
import { getReviews } from "@/lib/reviewAggregator";

export async function GET(request, { params }) {
  const { id: propertyId } = await params;

  if (!propertyId) {
    return NextResponse.json({ error: "Missing property id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const femaleOnly = searchParams.get("femaleOnly") === "true";
  const limit      = Math.min(parseInt(searchParams.get("limit")  || "20", 10), 50);
  const offset     = Math.max(parseInt(searchParams.get("offset") || "0",  10), 0);

  try {
    const { data, error } = await getReviews(propertyId, { femaleOnly, limit, offset });

    if (error) {
      console.error("[GET /api/properties/[id]/reviews] DB error:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json({
      reviews:     data,
      count:       data.length,
      femaleOnly,
      limit,
      offset,
    });
  } catch (err) {
    console.error("[GET /api/properties/[id]/reviews] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
