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

/**
 * Fetch a single published property with zone + city data.
 * Uses separate queries instead of nested joins to avoid PostgREST FK
 * relationship issues and RLS policy conflicts on joined tables.
 * Used by the /property/[id] detail page.
 *
 * @param {string} propertyId - UUID
 * @returns {Property|null} - null on error or not found
 */
export async function getPropertyById(propertyId) {
  console.log('[getPropertyById] Starting fetch for ID:', propertyId);

  try {
    // Step 1: fetch the property row
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('is_published', true)
      .single();

    console.log('[getPropertyById] Property query result:', { property, error: propertyError });

    if (propertyError) {
      console.error('[getPropertyById] Property fetch error:', propertyError);
      return null;
    }
    if (!property) {
      console.log('[getPropertyById] No property found for id:', propertyId);
      return null;
    }

    // Step 2: fetch the safety zone (optional — continue on error)
    let zone = null;
    if (property.zone_id) {
      const { data: zoneData, error: zoneError } = await supabase
        .from('safety_zones')
        .select(`
          id, zone_name, zone_slug, safety_score, safety_level, color_code,
          description, tips,
          crime_score, reviews_score, walkability_score, time_modifier
        `)
        .eq('id', property.zone_id)
        .eq('is_published', true)
        .single();

      if (zoneError) {
        console.error('[getPropertyById] Zone fetch error:', zoneError);
      } else {
        zone = zoneData;
      }
    }

    // Step 3: fetch the city (optional — continue on error)
    let city = null;
    if (property.city_id) {
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('id, name, country')
        .eq('id', property.city_id)
        .single();

      if (cityError) {
        console.error('[getPropertyById] City fetch error:', cityError);
      } else {
        city = cityData;
      }
    }

    const result = { ...property, zone, city };
    console.log('[getPropertyById] Complete data assembled:', { id: result.id, hasZone: !!zone, hasCity: !!city });
    return result;

  } catch (err) {
    console.error('[getPropertyById] Unexpected error:', err);
    return null;
  }
}

/**
 * Fetch up to `limit` other published properties in the same city.
 * Used for the "Nearby Properties" section on the detail page.
 *
 * @param {string} propertyId - UUID of the current property (excluded)
 * @param {string} cityId     - e.g. 'barcelona'
 * @param {number} limit      - max results (default 4)
 * @returns {Property[]}
 */
export async function getNearbyProperties(propertyId, cityId, limit = 4) {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      id, name, property_type, price_per_night, currency, image_url,
      women_rating, zone_id,
      zone:safety_zones ( safety_score, safety_level )
    `)
    .eq("city_id", cityId)
    .eq("is_published", true)
    .neq("id", propertyId)
    .order("women_rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getNearbyProperties] error:", error);
    return [];
  }
  return data ?? [];
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
