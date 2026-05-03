"use client";

/**
 * AggregatedReviews
 *
 * Displays reviews pulled from external platforms for a property.
 * Supports a "Female reviewers only" toggle and shows safety keyword badges.
 *
 * Design system: inline styles, Crimson Pro font, coral/green palette.
 */

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString("en-GB", {
      month: "short",
      year:  "numeric",
    });
  } catch {
    return "";
  }
}

function StarRating({ rating }) {
  if (rating == null) return null;
  const filled = Math.round((rating / 10) * 5); // normalise back to /5 for display
  return (
    <span
      style={{ color: "#FF6B6B", fontSize: "0.9rem", letterSpacing: "1px" }}
      aria-label={`${rating} out of 10`}
    >
      {"★".repeat(filled)}{"☆".repeat(5 - filled)}
      <span
        style={{ color: "#888", fontSize: "0.75rem", marginLeft: 4, fontFamily: "sans-serif" }}
      >
        {rating}/10
      </span>
    </span>
  );
}

function SafetyBadge({ score }) {
  if (score == null) return null;
  const level  = score >= 7 ? "safe" : score >= 4 ? "moderate" : "caution";
  const colors = {
    safe:     { bg: "#e8f6f0", color: "#2D6A4F", border: "#a8d5ba" },
    moderate: { bg: "#fff8e1", color: "#b45309", border: "#fcd34d" },
    caution:  { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
  };
  const c = colors[level];
  return (
    <span
      style={{
        display:         "inline-block",
        padding:         "2px 8px",
        borderRadius:    20,
        fontSize:        "0.72rem",
        fontWeight:      600,
        background:      c.bg,
        color:           c.color,
        border:          `1px solid ${c.border}`,
        fontFamily:      "sans-serif",
        letterSpacing:   "0.02em",
      }}
    >
      Safety {score}/10
    </span>
  );
}

function KeywordChip({ keyword, sentiment }) {
  const isPositive = sentiment === "positive";
  return (
    <span
      style={{
        display:      "inline-block",
        padding:      "2px 8px",
        borderRadius: 20,
        fontSize:     "0.7rem",
        fontFamily:   "sans-serif",
        fontWeight:   500,
        marginRight:  4,
        marginBottom: 4,
        background:   isPositive ? "#e8f6f0" : "#fef2f2",
        color:        isPositive ? "#2D6A4F" : "#b91c1c",
        border:       `1px solid ${isPositive ? "#a8d5ba" : "#fca5a5"}`,
      }}
    >
      {isPositive ? "✓" : "!"} {keyword}
    </span>
  );
}

function PlatformLabel({ platform }) {
  const labels = {
    google:      { label: "Google",       color: "#4285F4" },
    booking:     { label: "Booking.com",  color: "#003580" },
    hostelworld: { label: "Hostelworld",  color: "#F60" },
    tripadvisor: { label: "TripAdvisor",  color: "#34E0A1" },
  };
  const p = labels[platform] || { label: platform, color: "#888" };
  return (
    <span
      style={{
        fontSize:   "0.72rem",
        fontFamily: "sans-serif",
        fontWeight: 600,
        color:      p.color,
      }}
    >
      {p.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AggregatedReviews({ propertyId }) {
  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [femaleOnly,  setFemaleOnly]  = useState(false);
  const [offset,      setOffset]      = useState(0);
  const [hasMore,     setHasMore]     = useState(true);

  const LIMIT = 10;

  const fetchReviews = useCallback(async (reset = false) => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;
    const params = new URLSearchParams({
      femaleOnly: String(femaleOnly),
      limit:      String(LIMIT),
      offset:     String(currentOffset),
    });

    try {
      const res = await fetch(`/api/properties/${propertyId}/reviews?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      setReviews((prev) => reset ? json.reviews : [...prev, ...json.reviews]);
      setHasMore(json.reviews.length === LIMIT);
      if (!reset) setOffset(currentOffset + json.reviews.length);
    } catch (err) {
      setError("Could not load reviews. Please try again.");
      console.error("[AggregatedReviews] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId, femaleOnly, offset]);

  // Initial load and when femaleOnly toggles
  useEffect(() => {
    setOffset(0);
    setReviews([]);
    fetchReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, femaleOnly]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      style={{
        fontFamily: "var(--font-crimson-pro), Georgia, serif",
        color:      "#2B2D42",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   20,
          flexWrap:       "wrap",
          gap:            12,
        }}
      >
        <h2 style={{ fontSize: "1.4rem", fontWeight: 600, margin: 0 }}>
          Guest Reviews
        </h2>

        {/* Female-only toggle */}
        <button
          onClick={() => setFemaleOnly((v) => !v)}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            padding:      "7px 16px",
            borderRadius: 24,
            border:       `2px solid ${femaleOnly ? "#2D6A4F" : "#e5f5ea"}`,
            background:   femaleOnly ? "#2D6A4F" : "#fff",
            color:        femaleOnly ? "#fff" : "#2D6A4F",
            fontSize:     "0.85rem",
            fontWeight:   600,
            cursor:       "pointer",
            transition:   "all 0.2s",
            fontFamily:   "sans-serif",
          }}
          aria-pressed={femaleOnly}
        >
          <span>{femaleOnly ? "♀" : "♀"}</span>
          {femaleOnly ? "Female reviews only" : "Show female reviews only"}
        </button>
      </div>

      {/* Review list */}
      {reviews.length === 0 && !loading && (
        <p style={{ color: "#888", fontStyle: "italic", fontSize: "0.95rem" }}>
          {femaleOnly
            ? "No reviews from female travellers yet."
            : "No reviews yet for this property."}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "#b91c1c", fontSize: "0.9rem", marginTop: 12 }}>
          {error}
        </p>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={() => fetchReviews(false)}
          style={{
            marginTop:    20,
            padding:      "10px 24px",
            borderRadius: 24,
            border:       "2px solid #FF6B6B",
            background:   "transparent",
            color:        "#FF6B6B",
            fontSize:     "0.9rem",
            fontWeight:   600,
            cursor:       "pointer",
            transition:   "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FF6B6B";
            e.currentTarget.style.color      = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color      = "#FF6B6B";
          }}
        >
          Load more reviews
        </button>
      )}

      {loading && (
        <p style={{ color: "#888", fontSize: "0.9rem", marginTop: 12 }}>
          Loading reviews…
        </p>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReviewCard sub-component
// ─────────────────────────────────────────────────────────────────────────────

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LEN = 280;
  const isLong  = review.review_text?.length > MAX_LEN;
  const text    = isLong && !expanded
    ? review.review_text.slice(0, MAX_LEN) + "…"
    : review.review_text;

  const keywords = Array.isArray(review.safety_keywords) ? review.safety_keywords : [];

  return (
    <div
      style={{
        padding:      "16px 20px",
        borderRadius: 12,
        border:       "1px solid #FFE8D6",
        background:   "#fff",
        transition:   "box-shadow 0.2s",
      }}
    >
      {/* Top row: name, platform, female badge */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          flexWrap:       "wrap",
          gap:            8,
          marginBottom:   8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar initial */}
          <div
            style={{
              width:        36,
              height:       36,
              borderRadius: "50%",
              background:   "linear-gradient(135deg, #FF6B6B, #2D6A4F)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              color:        "#fff",
              fontWeight:   700,
              fontSize:     "0.95rem",
              flexShrink:   0,
            }}
          >
            {review.reviewer_name ? review.reviewer_name[0].toUpperCase() : "?"}
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              {review.reviewer_name || "Anonymous"}
              {review.is_female_reviewer && (
                <span
                  title={`Female reviewer (${Math.round((review.female_confidence || 0) * 100)}% confidence)`}
                  style={{ marginLeft: 6, color: "#2D6A4F", fontSize: "0.8rem" }}
                >
                  ♀
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <PlatformLabel platform={review.source_platform} />
              {review.review_date && (
                <span style={{ color: "#aaa", fontSize: "0.75rem", fontFamily: "sans-serif" }}>
                  {formatDate(review.review_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <StarRating rating={review.rating} />
          <SafetyBadge score={review.safety_score} />
        </div>
      </div>

      {/* Review text */}
      <p
        style={{
          fontSize:   "0.95rem",
          lineHeight: 1.6,
          margin:     "0 0 10px 0",
          color:      "#3a3c52",
        }}
      >
        {text}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background:  "none",
              border:      "none",
              color:       "#FF6B6B",
              cursor:      "pointer",
              fontSize:    "0.9rem",
              padding:     "0 4px",
              fontFamily:  "inherit",
            }}
          >
            {expanded ? " Show less" : " Read more"}
          </button>
        )}
      </p>

      {/* Safety keyword chips */}
      {keywords.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {keywords.slice(0, 6).map((kw, i) => (
            <KeywordChip key={i} keyword={kw.keyword} sentiment={kw.sentiment} />
          ))}
        </div>
      )}
    </div>
  );
}
