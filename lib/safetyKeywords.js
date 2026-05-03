/**
 * HerSafeStay — Safety Keywords for Female Travellers
 *
 * Keyword bank used to scan review text for safety signals relevant to women.
 * Each keyword entry carries a weight and category so the safety_score can be
 * computed as a weighted average of matched signals.
 *
 * Positive keywords raise the score; negative ones lower it.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Keyword definitions
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Array<{keyword: string, category: string, sentiment: 'positive'|'negative', weight: number}>} */
export const SAFETY_KEYWORDS = [
  // — Positive: Solo / Female-specific praise
  { keyword: "solo female",       category: "solo_friendly",  sentiment: "positive", weight: 1.5 },
  { keyword: "woman alone",       category: "solo_friendly",  sentiment: "positive", weight: 1.5 },
  { keyword: "women only",        category: "solo_friendly",  sentiment: "positive", weight: 1.3 },
  { keyword: "female traveler",   category: "solo_friendly",  sentiment: "positive", weight: 1.3 },
  { keyword: "solo travel",       category: "solo_friendly",  sentiment: "positive", weight: 1.0 },
  { keyword: "travelling alone",  category: "solo_friendly",  sentiment: "positive", weight: 1.0 },
  { keyword: "traveling alone",   category: "solo_friendly",  sentiment: "positive", weight: 1.0 },

  // — Positive: Security infrastructure
  { keyword: "safe",              category: "security",       sentiment: "positive", weight: 0.8 },
  { keyword: "secure",            category: "security",       sentiment: "positive", weight: 0.9 },
  { keyword: "cctv",              category: "security",       sentiment: "positive", weight: 0.7 },
  { keyword: "security cameras", category: "security",       sentiment: "positive", weight: 0.7 },
  { keyword: "key card",          category: "security",       sentiment: "positive", weight: 0.6 },
  { keyword: "keycard",           category: "security",       sentiment: "positive", weight: 0.6 },
  { keyword: "safe lock",         category: "security",       sentiment: "positive", weight: 0.8 },
  { keyword: "locker",            category: "security",       sentiment: "positive", weight: 0.5 },
  { keyword: "24 hour reception", category: "security",       sentiment: "positive", weight: 0.8 },
  { keyword: "24/7 reception",    category: "security",       sentiment: "positive", weight: 0.8 },
  { keyword: "night security",    category: "security",       sentiment: "positive", weight: 1.0 },
  { keyword: "doorbell",          category: "security",       sentiment: "positive", weight: 0.5 },

  // — Positive: Staff / environment
  { keyword: "friendly staff",    category: "environment",    sentiment: "positive", weight: 0.6 },
  { keyword: "helpful staff",     category: "environment",    sentiment: "positive", weight: 0.6 },
  { keyword: "welcoming",         category: "environment",    sentiment: "positive", weight: 0.5 },
  { keyword: "respectful",        category: "environment",    sentiment: "positive", weight: 0.8 },
  { keyword: "clean",             category: "environment",    sentiment: "positive", weight: 0.4 },
  { keyword: "well lit",          category: "environment",    sentiment: "positive", weight: 0.7 },
  { keyword: "well-lit",          category: "environment",    sentiment: "positive", weight: 0.7 },
  { keyword: "bright",            category: "environment",    sentiment: "positive", weight: 0.4 },

  // — Positive: Neighbourhood
  { keyword: "safe neighbourhood",  category: "neighbourhood", sentiment: "positive", weight: 1.0 },
  { keyword: "safe neighborhood",   category: "neighbourhood", sentiment: "positive", weight: 1.0 },
  { keyword: "good area",           category: "neighbourhood", sentiment: "positive", weight: 0.7 },
  { keyword: "quiet street",        category: "neighbourhood", sentiment: "positive", weight: 0.6 },
  { keyword: "central location",    category: "neighbourhood", sentiment: "positive", weight: 0.5 },
  { keyword: "walking distance",    category: "neighbourhood", sentiment: "positive", weight: 0.4 },

  // — Negative: Harassment / safety incidents
  { keyword: "harassment",        category: "harassment",     sentiment: "negative", weight: -2.0 },
  { keyword: "catcalling",        category: "harassment",     sentiment: "negative", weight: -1.8 },
  { keyword: "followed",          category: "harassment",     sentiment: "negative", weight: -1.5 },
  { keyword: "unsafe",            category: "safety",         sentiment: "negative", weight: -1.5 },
  { keyword: "not safe",          category: "safety",         sentiment: "negative", weight: -1.5 },
  { keyword: "dangerous",         category: "safety",         sentiment: "negative", weight: -2.0 },
  { keyword: "robbery",           category: "safety",         sentiment: "negative", weight: -2.5 },
  { keyword: "theft",             category: "safety",         sentiment: "negative", weight: -2.0 },
  { keyword: "scam",              category: "safety",         sentiment: "negative", weight: -1.5 },
  { keyword: "sketchy",           category: "safety",         sentiment: "negative", weight: -1.0 },
  { keyword: "creepy",            category: "harassment",     sentiment: "negative", weight: -1.2 },
  { keyword: "uncomfortable",     category: "harassment",     sentiment: "negative", weight: -0.8 },
  { keyword: "stared",            category: "harassment",     sentiment: "negative", weight: -0.7 },
  { keyword: "dark alley",        category: "neighbourhood",  sentiment: "negative", weight: -1.0 },
  { keyword: "poorly lit",        category: "environment",    sentiment: "negative", weight: -0.8 },
  { keyword: "noisy",             category: "environment",    sentiment: "negative", weight: -0.4 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scan review text and return every keyword that appears (case-insensitive).
 *
 * @param {string} text - raw review text
 * @returns {Array<{keyword: string, category: string, sentiment: string, weight: number}>}
 */
export function extractSafetyKeywords(text) {
  if (!text || typeof text !== "string") return [];

  const lower = text.toLowerCase();
  return SAFETY_KEYWORDS.filter(({ keyword }) => lower.includes(keyword));
}

/**
 * Convert a list of matched safety keywords into a 0–10 score.
 * Starts from a neutral baseline of 5.0, adds positive weights, subtracts negatives,
 * then clamps to [0, 10].
 *
 * @param {Array<{weight: number}>} matchedKeywords - output of extractSafetyKeywords
 * @returns {number} score between 0.00 and 10.00
 */
export function calculateSafetyScore(matchedKeywords) {
  if (!matchedKeywords || matchedKeywords.length === 0) return 5.0;

  const delta = matchedKeywords.reduce((sum, { weight }) => sum + weight, 0);
  const raw = 5.0 + delta;
  return Math.min(10, Math.max(0, Math.round(raw * 100) / 100));
}
