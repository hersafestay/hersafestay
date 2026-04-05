/**
 * HerSafeStay — Safety Color Constants
 * Single source of truth for safety level → color mapping.
 * See ARCHITECTURE.md § 1.4
 */

export const SAFETY_COLORS = {
  safe:    { fillColor: '#2D6A4F', strokeColor: '#1B4332', label: 'Safe' },
  caution: { fillColor: '#F4A261', strokeColor: '#E76F51', label: 'Use Caution' },
  avoid:   { fillColor: '#E63946', strokeColor: '#C1121F', label: 'Avoid at Night' },
};

/**
 * Map a numeric safety score (1–10) to a safety level string.
 * @param {number} score
 * @returns {'safe'|'caution'|'avoid'}
 */
export function scoreToLevel(score) {
  if (score >= 7) return 'safe';
  if (score >= 4) return 'caution';
  return 'avoid';
}
