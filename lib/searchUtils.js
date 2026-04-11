/**
 * searchUtils.js — Search, filter, sort, and debounce utilities.
 *
 * All functions are pure (no side effects, no React imports).
 * Import into SafetyMap.jsx or anywhere that needs filtering logic.
 */

// ─── Default filter state (single source of truth) ───────────────────────────

export const DEFAULT_FILTERS = {
  safetyLevels: ['safe', 'caution', 'avoid'],
  propertyTypes: ['hotel', 'hostel', 'apartment', 'guesthouse'],
  priceRange: [0, 500],   // 500 means "no max" — see filterProperties()
  sortBy: 'safety-desc',
};

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Full-text search across zones and properties.
 * Returns filtered subsets of each.
 *
 * @param {string} query
 * @param {Array} zones  - array of zone objects
 * @param {Array} properties - array of property objects
 * @returns {{ zones: Array, properties: Array }}
 */
export function searchAll(query, zones, properties) {
  const q = query.toLowerCase().trim();
  if (!q) return { zones, properties };

  const matchingZones = zones.filter(z =>
    z.zone_name?.toLowerCase().includes(q) ||
    z.description?.toLowerCase().includes(q)
  );

  const matchingProperties = properties.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.neighborhood?.toLowerCase().includes(q) ||
    p.property_type?.toLowerCase().includes(q) ||
    p.zone?.zone_name?.toLowerCase().includes(q)
  );

  return { zones: matchingZones, properties: matchingProperties };
}

// ─── Filter ──────────────────────────────────────────────────────────────────

/**
 * Filter properties by safety level, type, and price.
 *
 * Safety level comes from the joined zone (property.zone.safety_level).
 * Price: when priceRange[1] === 500, treat as "no maximum" to include
 *   properties priced above $500 (e.g. luxury Paris hotels in EUR).
 *
 * @param {Array}  properties
 * @param {Object} filters     - { safetyLevels, propertyTypes, priceRange }
 * @param {string} searchQuery - optional text search, applied first
 * @returns {Array} filtered properties
 */
export function filterProperties(properties, filters, searchQuery = '') {
  let result = properties;

  // Text search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.neighborhood?.toLowerCase().includes(q) ||
      p.property_type?.toLowerCase().includes(q) ||
      p.zone?.zone_name?.toLowerCase().includes(q)
    );
  }

  // Safety level (via joined zone)
  if (filters.safetyLevels?.length > 0) {
    result = result.filter(p =>
      filters.safetyLevels.includes(p.zone?.safety_level ?? 'safe')
    );
  }

  // Property type
  if (filters.propertyTypes?.length > 0) {
    result = result.filter(p =>
      filters.propertyTypes.includes(p.property_type)
    );
  }

  // Price range — priceRange[1] === 500 means "no max"
  const [minPrice, maxPrice] = filters.priceRange ?? [0, 500];
  result = result.filter(p => {
    if (p.price_per_night == null) return true;  // no price → always include
    if (p.price_per_night < minPrice) return false;
    if (maxPrice < 500 && p.price_per_night > maxPrice) return false;
    return true;
  });

  return result;
}

// ─── Sort ────────────────────────────────────────────────────────────────────

/**
 * Sort properties by the given sort key.
 * Returns a new array (does not mutate input).
 *
 * @param {Array}  properties
 * @param {string} sortBy - one of 'safety-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc'
 * @returns {Array}
 */
export function sortProperties(properties, sortBy) {
  const sorted = [...properties];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price_per_night ?? 0) - (b.price_per_night ?? 0));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price_per_night ?? 0) - (a.price_per_night ?? 0));
    case 'rating-desc':
      return sorted.sort((a, b) => (b.women_rating ?? 0) - (a.women_rating ?? 0));
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'safety-desc':
    default:
      // Sort by zone safety score (proxy: safe > caution > avoid, then by women_rating)
      const levelOrder = { safe: 2, caution: 1, avoid: 0 };
      return sorted.sort((a, b) => {
        const la = levelOrder[a.zone?.safety_level ?? 'safe'] ?? 2;
        const lb = levelOrder[b.zone?.safety_level ?? 'safe'] ?? 2;
        if (lb !== la) return lb - la;
        return (b.women_rating ?? 0) - (a.women_rating ?? 0);
      });
  }
}

// ─── Counts ──────────────────────────────────────────────────────────────────

/**
 * Count properties by safety level and type (from the FULL unfiltered list).
 * Used to show counts next to each filter checkbox.
 *
 * @param {Array} properties - unfiltered
 * @returns {{ safetyCounts: Object, typeCounts: Object }}
 */
export function getFilterCounts(properties) {
  const safetyCounts = { safe: 0, caution: 0, avoid: 0 };
  const typeCounts   = { hotel: 0, hostel: 0, apartment: 0, guesthouse: 0 };

  for (const p of properties) {
    const level = p.zone?.safety_level;
    if (level && level in safetyCounts) safetyCounts[level]++;

    const type = p.property_type;
    if (type && type in typeCounts) typeCounts[type]++;
  }

  return { safetyCounts, typeCounts };
}

// ─── Active filter detection ──────────────────────────────────────────────────

/**
 * Returns true if any filter deviates from defaults or searchQuery is non-empty.
 * Used to show "Clear All" button.
 *
 * @param {Object} filters
 * @param {string} searchQuery
 * @returns {boolean}
 */
export function hasActiveFilters(filters, searchQuery = '') {
  if (searchQuery.trim()) return true;
  if (filters.safetyLevels.length !== DEFAULT_FILTERS.safetyLevels.length) return true;
  if (filters.propertyTypes.length !== DEFAULT_FILTERS.propertyTypes.length) return true;
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500) return true;
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) return true;
  return false;
}

// ─── Debounce ────────────────────────────────────────────────────────────────

/**
 * Classic debounce — delays invoking `func` until after `wait` ms
 * have elapsed since the last call.
 *
 * @param {Function} func
 * @param {number}   wait - milliseconds
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
