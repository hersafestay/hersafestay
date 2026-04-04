"use client";

import { useState, useEffect, useCallback } from "react";
// useCallback is used for handleRefresh and ScoreBar/ZoneCard memoization
import { testConnection, getCities, getSafetyZones } from "@/lib/database";

// ─── Safety color map ─────────────────────────────────────────────────────────
const LEVEL_STYLES = {
  safe:    { bg: "#d1fae5", border: "#2D6A4F", badge: "#2D6A4F", label: "Safe" },
  caution: { bg: "#fff3cd", border: "#F4A261", badge: "#E76F51", label: "Use Caution" },
  avoid:   { bg: "#ffe4e6", border: "#E63946", badge: "#C1121F", label: "Avoid at Night" },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ ok, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 12px", borderRadius: "20px", fontSize: "13px",
      fontWeight: 600,
      background: ok ? "#d1fae5" : "#ffe4e6",
      color: ok ? "#065f46" : "#991b1b",
      border: `1px solid ${ok ? "#6ee7b7" : "#fca5a5"}`,
    }}>
      <span style={{ fontSize: "10px" }}>{ok ? "●" : "●"}</span>
      {label}
    </span>
  );
}

function ScoreBar({ label, value, max = 10 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = value >= 7 ? "#2D6A4F" : value >= 4 ? "#F4A261" : "#E63946";
  return (
    <div style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px", color: "#555" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{value?.toFixed(1)}</span>
      </div>
      <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function ZoneCard({ zone }) {
  const [expanded, setExpanded] = useState(false);
  const style = LEVEL_STYLES[zone.safety_level] || LEVEL_STYLES.caution;

  return (
    <div style={{
      border: `2px solid ${style.border}`,
      borderRadius: "12px",
      padding: "16px",
      background: style.bg,
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#1a1a2e" }}>
            {zone.zone_name}
            {zone.zone_name_local && zone.zone_name_local !== zone.zone_name && (
              <span style={{ fontWeight: 400, color: "#666", fontSize: "14px" }}> / {zone.zone_name_local}</span>
            )}
          </h3>
          <span style={{ fontSize: "12px", color: "#666" }}>{zone.zone_slug}</span>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontSize: "22px", fontWeight: 800, color: style.badge, lineHeight: 1,
          }}>
            {zone.safety_score?.toFixed(1)}<span style={{ fontSize: "12px", fontWeight: 500 }}>/10</span>
          </div>
          <div style={{
            marginTop: "4px", padding: "2px 8px", borderRadius: "10px",
            background: style.badge, color: "#fff", fontSize: "11px", fontWeight: 600,
          }}>
            {style.label}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
        <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#888" }}>
          Score Breakdown (40/30/20 formula)
        </p>
        <ScoreBar label="Crime Score (40%)" value={zone.crime_score} />
        <ScoreBar label="Women Reviews (30%)" value={zone.reviews_score} />
        <ScoreBar label="Walkability (20%)" value={zone.walkability_score} />
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          Time modifier: <strong>{zone.time_modifier >= 0 ? "+" : ""}{zone.time_modifier?.toFixed(1)}</strong>
        </div>
      </div>

      {/* Description */}
      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#444", lineHeight: "1.5" }}>
        {expanded ? zone.description : (zone.description?.substring(0, 160) + (zone.description?.length > 160 ? "…" : ""))}
      </p>

      {/* Expand button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: `1px solid ${style.border}`, color: style.badge,
          fontSize: "12px", padding: "4px 10px", borderRadius: "6px", cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        {expanded ? "Show less" : "Show full details ↓"}
      </button>

      {expanded && (
        <div>
          {/* Safety tips */}
          {zone.tips?.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#555" }}>Safety Tips for Women:</p>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {zone.tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "#444", marginBottom: "4px", lineHeight: "1.4" }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlights */}
          {zone.highlights?.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#2D6A4F" }}>Highlights:</p>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {zone.highlights.map((h, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "#444", marginBottom: "3px" }}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cautions */}
          {zone.cautions?.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#E63946" }}>Cautions:</p>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {zone.cautions.map((c, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "#444", marginBottom: "3px" }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data sources */}
          {zone.data_sources?.length > 0 && (
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Data Sources:</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{zone.data_sources.join(" · ")}</p>
            </div>
          )}

          {/* GeoJSON geometry preview */}
          {zone.geojson_geometry && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase" }}>PostGIS Geometry (GeoJSON):</p>
              <div style={{
                background: "#1e1e2e", color: "#a6e3a1", fontSize: "11px",
                padding: "8px", borderRadius: "6px", overflowX: "auto",
                fontFamily: "monospace", lineHeight: "1.4",
              }}>
                <div>Type: {zone.geojson_geometry.type}</div>
                <div>Coordinates: {zone.geojson_geometry.coordinates?.[0]?.length} points</div>
                <div style={{ color: "#89dceb" }}>
                  Centroid: {zone.centroid_lat?.toFixed(5)}, {zone.centroid_lng?.toFixed(5)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div style={{
        display: "flex", gap: "12px", marginTop: "10px",
        padding: "8px", background: "rgba(255,255,255,0.5)", borderRadius: "6px",
        fontSize: "12px", color: "#666",
      }}>
        <span>🏨 {zone.property_count} properties</span>
        <span>📝 {zone.review_count} reviews</span>
        <span>📊 {zone.report_count} reports</span>
      </div>
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function TestDbPage() {
  const [status, setStatus] = useState({ loading: true, connectionOk: null, latencyMs: null, error: null });
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  // Incrementing this triggers a re-fetch (avoids calling setState directly in effect)
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setStatus({ loading: true, connectionOk: null, latencyMs: null, error: null });
      setCities([]);
      setZones([]);
      setLoadingZones(true);

      const conn = await testConnection();
      if (cancelled) return;

      setStatus({ loading: false, connectionOk: conn.ok, latencyMs: conn.latencyMs, error: conn.error });

      if (!conn.ok) { setLoadingZones(false); return; }

      const { data: citiesData, error: citiesError } = await getCities();
      if (!cancelled && !citiesError) setCities(citiesData || []);

      const { data: zonesData, error: zonesError } = await getSafetyZones("barcelona");
      if (!cancelled && !zonesError) setZones(zonesData || []);

      if (!cancelled) {
        setLoadingZones(false);
        setLastRefresh(new Date().toLocaleTimeString());
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 40%, #F0FBF9 70%, #E8F6F4 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            margin: "0 0 8px", fontSize: "28px", fontWeight: 800,
            color: "#2B2D42", display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ color: "#FF6B6B" }}>📍</span>
            Database Test — HerSafeStay
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Verifies Supabase connection, PostGIS zones, and Barcelona seed data.
            {lastRefresh && <span style={{ color: "#999" }}> · Last refresh: {lastRefresh}</span>}
          </p>
        </div>

        {/* Connection status card */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
                Supabase Connection
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").split(".")[0] || "unknown"}
                .supabase.co
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {status.loading ? (
                <StatusBadge ok={null} label="Connecting…" />
              ) : (
                <>
                  <StatusBadge ok={status.connectionOk} label={status.connectionOk ? `Connected` : "Failed"} />
                  {status.latencyMs !== null && (
                    <span style={{
                      fontSize: "12px", color: status.latencyMs < 200 ? "#059669" : status.latencyMs < 500 ? "#d97706" : "#dc2626",
                      fontWeight: 600,
                    }}>
                      {status.latencyMs}ms
                    </span>
                  )}
                </>
              )}
              <button
                onClick={handleRefresh}
                disabled={status.loading}
                style={{
                  padding: "6px 16px", borderRadius: "8px", fontSize: "13px",
                  background: "#FF6B6B", color: "#fff", border: "none", cursor: "pointer",
                  fontWeight: 600, opacity: status.loading ? 0.6 : 1,
                }}
              >
                {status.loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {status.error && (
            <div style={{
              marginTop: "12px", padding: "10px 14px", borderRadius: "8px",
              background: "#fef2f2", border: "1px solid #fca5a5",
              fontSize: "13px", color: "#991b1b", fontFamily: "monospace",
            }}>
              Error: {status.error}
            </div>
          )}
        </div>

        {/* Cities list */}
        {cities.length > 0 && (
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
            padding: "20px", marginBottom: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
              Published Cities ({cities.length})
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {cities.map((city) => (
                <div key={city.id} style={{
                  padding: "10px 16px", borderRadius: "10px",
                  background: "#f0fdf4", border: "1px solid #86efac",
                  fontSize: "14px",
                }}>
                  <div style={{ fontWeight: 700, color: "#2D6A4F" }}>{city.name}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {city.country} · {city.zone_count} zones · {city.property_count} properties
                  </div>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {city.lat?.toFixed(4)}, {city.lng?.toFixed(4)} · zoom {city.default_zoom}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barcelona zones */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
          padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
              Barcelona Safety Zones
              {zones.length > 0 && (
                <span style={{ marginLeft: "8px", fontWeight: 400, color: "#888", fontSize: "14px" }}>
                  ({zones.length} zones loaded)
                </span>
              )}
            </h2>
            {zones.length > 0 && (
              <div style={{ display: "flex", gap: "6px" }}>
                {["safe", "caution", "avoid"].map((level) => {
                  const count = zones.filter((z) => z.safety_level === level).length;
                  const s = LEVEL_STYLES[level];
                  return (
                    <span key={level} style={{
                      padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                      background: s.bg, border: `1px solid ${s.border}`, color: s.badge,
                      fontWeight: 600,
                    }}>
                      {count} {s.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {loadingZones && !zones.length && (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗺️</div>
              <p>Loading safety zones from Supabase…</p>
              <p style={{ fontSize: "12px", color: "#aaa" }}>
                If this takes &gt;5 seconds, run the SQL migrations first.
              </p>
            </div>
          )}

          {!loadingZones && zones.length === 0 && status.connectionOk && (
            <div style={{
              padding: "32px", textAlign: "center",
              background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px",
              color: "#92400e",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
              <p style={{ fontWeight: 700, marginBottom: "8px" }}>No zones found for Barcelona.</p>
              <p style={{ fontSize: "13px", margin: 0 }}>
                Run the SQL migrations and seed data in your Supabase SQL editor:<br />
                <code style={{ background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                  supabase/migrations/001 → 002 → supabase/seed/barcelona.sql
                </code>
              </p>
            </div>
          )}

          {zones.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
              {zones.map((zone) => (
                <ZoneCard key={zone.id} zone={zone} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "#aaa" }}>
          HerSafeStay · Day 2 Database Test · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
