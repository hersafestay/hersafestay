/**
 * HerSafeStay — Database Access Layer
 *
 * All data fetching goes through these functions.
 * Geography columns (PostGIS) are converted to GeoJSON via
 * the get_zones_for_city() RPC function defined in migrations.
 *
 * IMPORTANT: longitude first, then latitude — always.
 */

import { supabase } from "./supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Cities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all published cities.
 * @returns {{ data: City[], error: Error|null }}
 */
export async function getCities() {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("is_published", true)
    .order("name");

  return { data, error };
}

/**
 * Fetch a single city by slug.
 * @param {string} cityId - e.g. 'barcelona'
 * @returns {{ data: City|null, error: Error|null }}
 */
export async function getCity(cityId) {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("id", cityId)
    .single();

  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Safety Zones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all published safety zones for a city.
 * Uses the get_zones_for_city() RPC which converts PostGIS geography
 * to GeoJSON via ST_AsGeoJSON — safe to use in client components.
 *
 * @param {string} cityId - e.g. 'barcelona'
 * @returns {{ data: Zone[], error: Error|null }}
 *
 * Each zone includes:
 *   - All scalar fields (id, zone_name, safety_score, tips, etc.)
 *   - geojson_geometry: parsed GeoJSON geometry object
 *   - centroid_lat, centroid_lng: numeric centroid coordinates
 */
export async function getSafetyZones(cityId) {
  const { data, error } = await supabase.rpc("get_zones_for_city", {
    p_city_id: cityId,
  });

  if (error) return { data: null, error };

  // Parse geojson_geometry from string to object if returned as string
  const zones = (data || []).map((zone) => ({
    ...zone,
    geojson_geometry:
      typeof zone.geojson_geometry === "string"
        ? JSON.parse(zone.geojson_geometry)
        : zone.geojson_geometry,
  }));

  return { data: zones, error: null };
}

/**
 * Fetch a single zone by ID (full detail including tips, highlights, cautions).
 * @param {string} zoneId - UUID
 * @returns {{ data: Zone|null, error: Error|null }}
 */
export async function getZone(zoneId) {
  const { data, error } = await supabase
    .from("safety_zones")
    .select(
      `
      id, city_id, zone_slug, zone_name, zone_name_local,
      safety_score, safety_level, color_code,
      crime_score, reviews_score, walkability_score, time_modifier,
      description, tips, highlights, cautions, data_sources,
      report_count, review_count, property_count,
      is_published, created_at, updated_at
    `
    )
    .eq("id", zoneId)
    .eq("is_published", true)
    .single();

  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Properties
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all published properties for a city (for map pins + InfoWindows).
 * Joins the zone name so the InfoWindow can show which zone a property is in.
 *
 * @param {string} cityId - e.g. 'barcelona' | 'paris' | 'bangkok'
 * @returns {{ data: Property[], error: Error|null }}
 *
 * Each property includes:
 *   - All scalar fields (id, name, property_type, lat, lng, price, etc.)
 *   - zone: { zone_name, safety_level } from the joined safety_zones row
 */
export async function getPropertiesForCity(cityId) {
  const { data, error } = await supabase
    .from('properties')
    .select(
      `id, name, property_type, description,
       lat, lng, address, neighborhood,
       safety_features, women_rating, overall_rating,
       review_count, women_review_count,
       price_per_night, currency, image_url,
       zone_id,
       zone:safety_zones ( zone_name, safety_level, color_code )`
    )
    .eq('city_id', cityId)
    .eq('is_published', true)
    .order('women_rating', { ascending: false });

  if (error) {
    console.error('[getPropertiesForCity] error:', error);
  }

  return { data: data || [], error };
}

/**
 * Fetch all published properties in a zone.
 * @param {string} zoneId - UUID of the zone
 * @returns {{ data: Property[], error: Error|null }}
 */
export async function getZoneProperties(zoneId) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("zone_id", zoneId)
    .eq("is_published", true)
    .order("women_rating", { ascending: false });

  return { data, error };
}

/**
 * Fetch all published properties for a city (for map pins).
 * Returns only the fields needed for map markers — lightweight.
 * @param {string} cityId - e.g. 'barcelona'
 * @returns {{ data: PropertyPin[], error: Error|null }}
 */
export async function getCityPropertyPins(cityId) {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, name, property_type, lat, lng, women_rating, price_per_night, currency, zone_id"
    )
    .eq("city_id", cityId)
    .eq("is_published", true);

  return { data, error };
}

/**
 * Fetch a single property by ID (full detail).
 * @param {string} propertyId - UUID
 * @returns {{ data: Property|null, error: Error|null }}
 */
export async function getProperty(propertyId) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("is_published", true)
    .single();

  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection test
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Test database connectivity.
 * Returns the count of published cities as a health check.
 * @returns {{ ok: boolean, cityCount: number|null, error: string|null, latencyMs: number }}
 */
export async function testConnection() {
  const start = Date.now();

  try {
    const { data, error } = await supabase
      .from("cities")
      .select("id", { count: "exact", head: false });

    const latencyMs = Date.now() - start;

    if (error) {
      return { ok: false, cityCount: null, error: error.message, latencyMs };
    }

    return {
      ok: true,
      cityCount: data?.length ?? 0,
      error: null,
      latencyMs,
    };
  } catch (err) {
    return {
      ok: false,
      cityCount: null,
      error: err.message,
      latencyMs: Date.now() - start,
    };
  }
}
