"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  MapPin,
  Star,
  Users,
  ChevronRight,
  Search,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Train,
  Moon,
  Activity,
  X,
  Heart,
} from "lucide-react";

const SURVEY_URL = "https://form.typeform.com/to/BQbzmv2z";

// ── Mock Data ──────────────────────────────────────────────────────────────

// Direct Unsplash photo URLs — specific verified photo IDs, no random API
const U = (id, w = 800, h = 500) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

const ACCOMMODATIONS = [
  {
    id: 1,
    name: "The Rosewood Bangkok",
    type: "Hotel",
    area: "Ploenchit",
    safetyRating: "Very Safe",
    stars: 4.9,
    reviews: 1240,
    womenReviews: 312,
    safetyFeatures: ["24/7 Security", "Women-only Floors", "Secure Key Access", "Well-lit Entrance"],
    amenities: ["Spa", "Pool", "Restaurant", "Gym"],
    price: 185,
    accentColor: "#e11d48",
    imageBg: "linear-gradient(135deg, #fce7f3 0%, #fda4af 100%)",
    // Grand hotel lobby flooded with sunlight — Zoshua Colah
    imageUrl: U("1566073771259-6a8506099945"),
  },
  {
    id: 2,
    name: "Sukhumvit Boutique Suites",
    type: "Apartment",
    area: "Sukhumvit",
    safetyRating: "Very Safe",
    stars: 4.7,
    reviews: 876,
    womenReviews: 241,
    safetyFeatures: ["Keycard Access", "24/7 Front Desk", "In-room Safe", "CCTV"],
    amenities: ["Rooftop Bar", "Coworking Space", "Kitchenette"],
    price: 112,
    accentColor: "#7c3aed",
    imageBg: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
    // Modern hotel lobby with curved wooden walls — Neon Wang
    imageUrl: U("1631049307264-da0ec9d70304"),
  },
  {
    id: 3,
    name: "Silom Heritage Hotel",
    type: "Hotel",
    area: "Silom",
    safetyRating: "Safe",
    stars: 4.5,
    reviews: 2103,
    womenReviews: 589,
    safetyFeatures: ["24/7 Security", "Secure Parking", "Female Staff Available"],
    amenities: ["Restaurant", "Business Center", "Laundry"],
    price: 89,
    accentColor: "#b45309",
    imageBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    // Hotel hallway with warm golden lighting — Alex Naino
    imageUrl: U("1445019980597-93fa8acb246c"),
  },
  {
    id: 4,
    name: "Lanna Sisters Hostel",
    type: "Hostel",
    area: "Siam",
    safetyRating: "Very Safe",
    stars: 4.8,
    reviews: 543,
    womenReviews: 398,
    safetyFeatures: ["Women-only Dorms", "Locker Storage", "24/7 Reception", "Community Events"],
    amenities: ["Common Kitchen", "Garden", "Tour Desk"],
    price: 28,
    accentColor: "#0f766e",
    imageBg: "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)",
    // Cozy hostel common room / bunk bed setup — Marcus Loke
    imageUrl: U("1555854877-bab0e564b8d5"),
  },
  {
    id: 5,
    name: "Riva Arun Bangkok",
    type: "Hotel",
    area: "Riverside",
    safetyRating: "Safe",
    stars: 4.6,
    reviews: 932,
    womenReviews: 215,
    safetyFeatures: ["Concierge 24/7", "Safe Neighborhood", "Well-lit Corridors"],
    amenities: ["River View", "Spa", "Yoga Classes", "Restaurant"],
    price: 145,
    accentColor: "#1d4ed8",
    imageBg: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
    // Bangkok cityscape beside Chao Phraya river — Ali Kazal
    imageUrl: U("1508009603885-50cf7c579365"),
  },
];


const SAFETY_TIPS = [
  { icon: "🚆", text: "Use BTS Skytrain & MRT for safe, reliable transport" },
  { icon: "💡", text: "Stick to well-lit streets in Sukhumvit and Silom at night" },
  { icon: "📍", text: "Keep your hotel address saved in Thai script" },
  { icon: "🚔", text: "Tourist Police hotline: 1155 (24/7, English-speaking)" },
  { icon: "🚗", text: "Use the Grab app instead of unmetered street taxis" },
  { icon: "🙏", text: "Dress modestly when visiting temples" },
];

const SAFETY_CONFIG = {
  "Very Safe": { bg: "#d4eddd", color: "#2D6A4F", border: "#a8d5ba", dot: "#2D6A4F", Icon: ShieldCheck },
  Safe: { bg: "#e5f5ea", color: "#2D6A4F", border: "#b8dfc5", dot: "#2D6A4F", Icon: Shield },
  Moderate: { bg: "#fef3c7", color: "#92400e", border: "#fde68a", dot: "#f59e0b", Icon: AlertTriangle },
};

const COMING_SOON = [
  {
    name: "HerSafeWay",
    Icon: Train,
    tagline: "Navigate cities with confidence",
    description: "Find the safest transportation options—vetted train routes, reliable bus networks, trusted ride services, and women-friendly transport times.",
    badge: "Coming Q3 2026",
    accent: "#2D6A4F",
    iconBg: "linear-gradient(135deg, #d4eddd 0%, #a8d5ba 100%)",
  },
  {
    name: "HerSafeNight",
    Icon: Moon,
    tagline: "Own the night, safely",
    description: "Discover nightlife venues reviewed by women travelers—from cocktail bars with attentive staff to clubs with zero-tolerance policies and well-lit locations.",
    badge: "Coming Q4 2026",
    accent: "#7c3aed",
    iconBg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
  },
  {
    name: "HerSafeSweat",
    Icon: Activity,
    tagline: "Stay active, stay safe",
    description: "Access vetted running routes, women-friendly gyms, group fitness classes, and outdoor workout spots—rated by safety, lighting, and community presence.",
    badge: "Coming Q1 2027",
    accent: "#0f766e",
    iconBg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function HotelImage({ src, fallbackBg, alt }) {
  const [status, setStatus] = useState("loading");

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {status === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #f8e4ed 0px, #fff0f5 200px, #f8e4ed 400px)",
            backgroundSize: "600px 100%",
            animation: "shimmer 1.4s infinite linear",
          }}
        />
      )}
      {status === "error" && (
        <div style={{ position: "absolute", inset: 0, background: fallbackBg }} />
      )}
      {status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: status === "loaded" ? 1 : 0,
            transition: "opacity 0.45s ease",
          }}
        />
      )}
      {status === "loaded" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%, rgba(0,0,0,0.18) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}


function SurveyPopup({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "24px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px 28px 24px",
          maxWidth: "340px",
          width: "100%",
          boxShadow: "0 24px 60px rgba(225,29,72,0.18), 0 8px 24px rgba(0,0,0,0.1)",
          border: "1px solid #fce7f3",
          animation: "fadeInUp 0.4s ease",
          pointerEvents: "auto",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid #fce7f3",
            background: "#fff1f5",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <X size={14} color="#e11d48" />
        </button>

        {/* Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #fce7f3, #fda4af)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          <Heart size={24} color="#e11d48" fill="#e11d48" style={{ fillOpacity: 0.8 }} />
        </div>

        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#2B2D42",
            marginBottom: "8px",
            fontFamily: "inherit",
          }}
        >
          Help Us Build for You 💕
        </h3>
        <p style={{ fontSize: "14px", color: "#78716c", lineHeight: "1.55", marginBottom: "20px" }}>
          Quick 3-min survey to shape HerSafeStay&apos;s features. Your voice matters!
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #e11d48, #9d174d)",
              color: "white",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "inherit",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(225,29,72,0.28)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Take Survey
          </a>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: "10px",
              background: "transparent",
              color: "#78716c",
              border: "1.5px solid #e5e7eb",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              fontFamily: "inherit",
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { name, Icon, tagline, description, badge, accent, iconBg } = product;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "20px",
        borderTop: "3px solid #2D6A4F",
        borderRight: hovered ? "1px solid #a8d5ba" : "1px solid #e5f5ea",
        borderBottom: hovered ? "1px solid #a8d5ba" : "1px solid #e5f5ea",
        borderLeft: hovered ? "1px solid #a8d5ba" : "1px solid #e5f5ea",
        padding: "36px 30px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        boxShadow: hovered
          ? "0 24px 48px rgba(45,106,79,0.12), 0 4px 12px rgba(0,0,0,0.05)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={30} color={accent} strokeWidth={1.8} />
      </div>

      {/* Badge */}
      <span
        style={{
          alignSelf: "flex-start",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          background: `${accent}18`,
          color: accent,
          border: `1px solid ${accent}30`,
        }}
      >
        {badge}
      </span>

      {/* Name + tagline */}
      <div>
        <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#2B2D42", marginBottom: "6px", fontFamily: "inherit" }}>
          {name}
        </h3>
        <p style={{ fontSize: "16px", color: accent, fontWeight: "600" }}>{tagline}</p>
      </div>

      {/* Description */}
      <p style={{ fontSize: "16px", color: "#57534e", lineHeight: "1.65", margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

function SafetyBadge({ rating }) {
  const cfg = SAFETY_CONFIG[rating] ?? SAFETY_CONFIG["Safe"];
  const { Icon } = cfg;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "14px",
        fontWeight: "600",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        letterSpacing: "0.01em",
      }}
    >
      <Icon size={14} />
      {rating}
    </span>
  );
}

function AccommodationCard({ acc, idx }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid #fce7f3",
        boxShadow: hovered
          ? "0 24px 48px rgba(225,29,72,0.12), 0 4px 12px rgba(0,0,0,0.06)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: `fadeInUp 0.5s ease ${idx * 0.08}s both`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo area */}
      <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
        <HotelImage
          src={acc.imageUrl}
          fallbackBg={acc.imageBg}
          alt={`${acc.name} — ${acc.area}, Bangkok`}
        />
        {/* Safety badge — top-left */}
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
          <SafetyBadge rating={acc.safetyRating} />
        </div>
        {/* Price pill — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            zIndex: 2,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: "10px",
            padding: "5px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <span style={{ fontSize: "23px", fontWeight: "700", color: "#2B2D42", fontFamily: "inherit" }}>
            ${acc.price}
          </span>
          <span style={{ fontSize: "14px", color: "#78716c" }}>/night</span>
        </div>
        {/* Numbered pin — top-right */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 2,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#e11d48",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "700",
            boxShadow: "0 2px 8px rgba(225,29,72,0.5)",
          }}
        >
          {acc.id}
        </div>
      </div>

      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#e11d48",
                background: "#fff1f5",
                padding: "3px 9px",
                borderRadius: "4px",
              }}
            >
              {acc.type}
            </span>
            <MapPin size={14} color="#9ca3af" />
            <span style={{ fontSize: "16px", color: "#6b7280" }}>{acc.area}, Bangkok</span>
          </div>
          <h3 style={{ fontSize: "21px", fontWeight: "600", color: "#2B2D42", lineHeight: "1.3", fontFamily: "inherit" }}>
            {acc.name}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
            <span style={{ fontWeight: "600", fontSize: "17px", color: "#2B2D42" }}>{acc.stars}</span>
            <span style={{ fontSize: "14px", color: "#78716c" }}>({acc.reviews.toLocaleString()})</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "14px", color: "#e11d48" }}>
            <UserCheck size={16} />
            <strong>{acc.womenReviews}</strong>&nbsp;women reviewed
          </span>
        </div>

        <div>
          <p style={{ fontSize: "13px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
            Safety Features
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {acc.safetyFeatures.map((f) => (
              <span key={f} style={{ fontSize: "13px", padding: "3px 9px", background: "#d4eddd", color: "#2D6A4F", borderRadius: "4px", border: "1px solid #a8d5ba" }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {acc.amenities.map((a) => (
            <span key={a} style={{ fontSize: "13px", padding: "3px 9px", background: "#fdf4ff", color: "#7c3aed", borderRadius: "4px", border: "1px solid #e9d5ff" }}>
              {a}
            </span>
          ))}
        </div>

        <button
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "13px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #e11d48, #9d174d)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "17px",
            fontWeight: "600",
            fontFamily: "inherit",
            transition: "opacity 0.2s",
            opacity: hovered ? 0.92 : 1,
            minHeight: "44px",
          }}
        >
          View Details <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function BangkokSafetyMap() {
  const [hoveredZone, setHoveredZone] = useState(null);

  const zones = [
    { id: "sukhumvit", label: "Sukhumvit", safety: "Very Safe", x: 268, y: 88, w: 110, h: 120 },
    { id: "ploenchit", label: "Ploenchit", safety: "Very Safe", x: 178, y: 100, w: 86, h: 65 },
    { id: "siam", label: "Siam", safety: "Very Safe", x: 178, y: 170, w: 86, h: 58 },
    { id: "silom", label: "Silom", safety: "Safe", x: 178, y: 234, w: 86, h: 58 },
    { id: "riverside", label: "Riverside", safety: "Safe", x: 82, y: 178, w: 90, h: 58 },
    { id: "khaosan", label: "Khaosan Rd", safety: "Moderate", x: 82, y: 108, w: 90, h: 65 },
    { id: "chinatown", label: "Chinatown", safety: "Moderate", x: 82, y: 250, w: 90, h: 52 },
    { id: "onnut", label: "On Nut", safety: "Safe", x: 383, y: 168, w: 50, h: 60 },
  ];

  const zoneColors = {
    "Very Safe": { fill: "#d4eddd", fillHover: "#a8d5ba", stroke: "#6dbf88", text: "#1a4731", sub: "#2D6A4F" },
    Safe: { fill: "#e5f5ea", fillHover: "#c2e0ca", stroke: "#8cc7a0", text: "#2D6A4F", sub: "#3d8a65" },
    Moderate: { fill: "#fef3c7", fillHover: "#fde68a", stroke: "#fcd34d", text: "#92400e", sub: "#b45309" },
  };

  const hotels = [
    { id: 1, cx: 220, cy: 130 },
    { id: 2, cx: 318, cy: 140 },
    { id: 3, cx: 220, cy: 258 },
    { id: 4, cx: 220, cy: 196 },
    { id: 5, cx: 126, cy: 205 },
  ];

  const hoveredData = zones.find((z) => z.id === hoveredZone);

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox="0 0 440 320"
        style={{ width: "100%", height: "auto", maxHeight: "320px", borderRadius: "10px", display: "block" }}
      >
        <rect width="440" height="320" fill="#fdf2f8" rx="12" />
        <path d="M 72 0 C 68 50 62 100 66 160 C 70 220 72 270 76 320" stroke="#bfdbfe" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M 72 0 C 68 50 62 100 66 160 C 70 220 72 270 76 320" stroke="#93c5fd" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6" />
        <text x="38" y="165" fontSize="8" fill="#60a5fa" fontWeight="600" transform="rotate(-90, 38, 165)" textAnchor="middle">CHAO PHRAYA</text>

        {zones.map((zone) => {
          const colors = zoneColors[zone.safety];
          const isHovered = hoveredZone === zone.id;
          return (
            <g key={zone.id} onMouseEnter={() => setHoveredZone(zone.id)} onMouseLeave={() => setHoveredZone(null)} style={{ cursor: "pointer" }}>
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="10"
                fill={isHovered ? colors.fillHover : colors.fill}
                stroke={colors.stroke} strokeWidth={isHovered ? "2" : "1.5"}
                style={{ transition: "all 0.2s" }}
              />
              <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={colors.text}>
                {zone.label}
              </text>
              <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 8} textAnchor="middle" fontSize="8.5" fill={colors.sub}>
                {zone.safety}
              </text>
            </g>
          );
        })}

        {hotels.map((h) => (
          <g key={h.id} transform={`translate(${h.cx}, ${h.cy})`}>
            {/* Drop shadow */}
            <ellipse cx="0" cy="2" rx="7" ry="4" fill="rgba(0,0,0,0.18)" />
            {/* Pin body */}
            <path d="M0,0 C-2,-5 -9,-7 -9,-14 A9,9,0,1,1,9,-14 C9,-7 2,-5 0,0 Z" fill="#e11d48" />
            {/* Shield */}
            <path d="M0,-19 C1.5,-19.5 3.5,-18.5 3.5,-17 L3.5,-11 Q3.5,-7 0,-6.5 Q-3.5,-7 -3.5,-11 L-3.5,-17 C-3.5,-18.5 -1.5,-19.5 0,-19 Z" fill="#FFF8F0" />
            {/* Number label below pin */}
            <text x="0" y="11" textAnchor="middle" fontSize="7" fontWeight="800" fill="#2D6A4F"
              paintOrder="stroke" stroke="white" strokeWidth="2.5" strokeLinejoin="round">{h.id}</text>
          </g>
        ))}

        <g transform="translate(420, 28)">
          <circle cx="0" cy="0" r="12" fill="white" opacity="0.8" />
          <text x="0" y="-4" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2D6A4F">N</text>
          <line x1="0" y1="-1" x2="0" y2="7" stroke="#2D6A4F" strokeWidth="1" />
          <polygon points="0,-10 -2.5,-1 0,0 2.5,-1" fill="#2D6A4F" />
        </g>
      </svg>

      {hoveredData && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(8px)",
            borderRadius: "6px",
            padding: "4px 12px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#2B2D42",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #fce7f3",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {hoveredData.label}{" "}
          <span style={{ color: SAFETY_CONFIG[hoveredData.safety]?.color }}>— {hoveredData.safety}</span>
        </div>
      )}
    </div>
  );
}

// ── Responsive breakpoint hook ───────────────────────────────────────────────

function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    function onResize() { setWidth(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Page() {
  const [searched, setSearched] = useState(false);
  const [destination, setDestination] = useState("Bangkok, Thailand");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 Guests");
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem("surveyPopupSeen")) return;
    const timer = setTimeout(() => {
      setShowSurveyPopup(true);
      sessionStorage.setItem("surveyPopupSeen", "1");
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const headerH = isMobile ? 64 : isTablet ? 80 : 108;
  const sidePad = isMobile ? "16px" : isTablet ? "24px" : "60px";

  function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
    setMenuOpen(false);
  }

  function fieldBg(name) {
    if (focusedField === name) return "#FFF8F2";
    if (hoveredField === name) return "#FFFCF8";
    return "transparent";
  }

  // Shared field label style
  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: "3px",
  };

  // Shared input style
  const inputStyle = {
    border: "none",
    outline: "none",
    fontSize: "16px",
    color: "#2B2D42",
    fontFamily: "inherit",
    background: "transparent",
    width: "100%",
    minHeight: "24px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #fff1f5 0%, #fdf2f8 35%, #f5f0ff 65%, #eff6ff 100%)",
        fontFamily: "var(--font-crimson-pro), Georgia, serif",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          padding: `0 ${sidePad}`,
          height: `${headerH}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,200,150,0.4)",
          position: "sticky",
          top: 0,
          zIndex: 200,
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "16px", textDecoration: "none" }}>
          <svg
            viewBox="0 0 48 60"
            width={isMobile ? 32 : isTablet ? 40 : 50}
            height={isMobile ? 40 : isTablet ? 50 : 62}
            style={{ display: "block", flexShrink: 0, filter: "drop-shadow(0 4px 10px rgba(225,29,72,0.4))" }}
          >
            <path d="M24,4 C14,4 6,12 6,22 C6,35 24,56 24,56 C24,56 42,35 42,22 C42,12 34,4 24,4 Z" fill="#e11d48" stroke="#e11d48" strokeWidth="1.5" />
            <path d="M24,16 L16,19 L16,27 Q16,33 24,37 Q32,33 32,27 L32,19 Z" fill="#FFF8F0" />
          </svg>
          <div>
            <div
              style={{
                fontSize: isMobile ? "22px" : isTablet ? "26px" : "32px",
                fontWeight: "700",
                color: "#2B2D42",
                lineHeight: "1",
                letterSpacing: "-0.02em",
              }}
            >
              HerSafeStay
            </div>
            {!isMobile && (
              <div
                style={{
                  fontSize: isTablet ? "12px" : "15px",
                  color: "#2D6A4F",
                  fontWeight: "500",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                Travel Safely · Travel Confidently
              </div>
            )}
          </div>
        </a>

        {/* Desktop / Tablet nav */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: isTablet ? "20px" : "28px" }}>
            {["Destinations", "Safety Guides", "Community", "About"]
              .filter((item) => !(isTablet && item === "Community"))
              .map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{ fontSize: isTablet ? "15px" : "18px", color: "#57534e", fontWeight: "500", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.target.style.color = "#2D6A4F")}
                  onMouseLeave={(e) => (e.target.style.color = "#57534e")}
                >
                  {item}
                </a>
              ))}
            <button
              style={{
                padding: isTablet ? "8px 18px" : "10px 24px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #e11d48, #9d174d)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: isTablet ? "14px" : "17px",
                fontWeight: "600",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(225,29,72,0.28)",
                whiteSpace: "nowrap",
                minHeight: "44px",
              }}
            >
              Sign In
            </button>
          </nav>
        )}

        {/* Mobile: Sign In + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #e11d48, #9d174d)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "inherit",
                minHeight: "44px",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                border: "1.5px solid #fce7f3",
                background: "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                padding: 0,
                flexShrink: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: "18px",
                    height: "2px",
                    background: "#2B2D42",
                    borderRadius: "2px",
                    transition: "all 0.2s",
                    transform:
                      menuOpen && i === 0 ? "translateY(7px) rotate(45deg)"
                      : menuOpen && i === 2 ? "translateY(-7px) rotate(-45deg)"
                      : menuOpen && i === 1 ? "scaleX(0)"
                      : "none",
                  }}
                />
              ))}
            </button>
          </div>
        )}

        {/* Mobile dropdown */}
        {isMobile && menuOpen && (
          <div
            style={{
              position: "absolute",
              top: `${headerH}px`,
              left: 0,
              right: 0,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(14px)",
              borderBottom: "1px solid #fce7f3",
              zIndex: 199,
              animation: "fadeIn 0.15s ease",
            }}
          >
            {["Destinations", "Safety Guides", "Community", "About"].map((item) => (
              <a
                key={item}
                href="#"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  fontSize: "17px",
                  color: "#2B2D42",
                  fontWeight: "500",
                  borderBottom: "1px solid #FFF4E8",
                  minHeight: "52px",
                }}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      {!searched && (
        <section style={{ animation: "fadeIn 0.6s ease" }}>
          <div
            style={{
              padding: isMobile ? "32px 16px 28px" : isTablet ? "40px 24px 32px" : "52px 60px 44px",
              maxWidth: "860px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 22px",
                    borderRadius: "999px",
                    background: "rgba(45,106,79,0.07)",
                    border: "1px solid rgba(45,106,79,0.18)",
                    marginBottom: "16px",
                    alignSelf: "center",
                  }}
                >
                  <ShieldCheck size={18} color="#2D6A4F" />
                  <span style={{ fontSize: "16px", color: "#2D6A4F", fontWeight: "600" }}>
                    200,000+ safety-verified accommodations
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: "clamp(38px, 4vw, 60px)",
                    fontWeight: "700",
                    color: "#2B2D42",
                    lineHeight: "1.12",
                    marginBottom: "14px",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Travel where you feel
                  <br />
                  <span style={{ color: "#e11d48" }}>safe & welcome</span>
                </h1>

                <p
                  style={{
                    fontSize: "19px",
                    color: "#57534e",
                    marginBottom: "24px",
                    lineHeight: "1.6",
                  }}
                >
                  Every listing vetted for women&apos;s safety. Real reviews from women travelers. Your peace of mind, our priority.
                </p>

                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    marginBottom: "28px",
                  }}
                >
                  {[
                    { val: "200K+", label: "Safe Listings", color: "#e11d48" },
                    { val: "1.2M+", label: "Women Reviewers", color: "#2D6A4F" },
                    { val: "98%", label: "Feel Safe", color: "#e11d48" },
                    { val: "140+", label: "Countries", color: "#2D6A4F" },
                  ].map(({ val, label, color }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "30px", fontWeight: "700", color, lineHeight: "1" }}>{val}</div>
                      <div style={{ fontSize: "14px", color: "#78716c", marginTop: "4px" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Search form — desktop hero */}
                <form onSubmit={handleSearch}>
                  <div
                    style={{
                      display: "flex",
                      background: "white",
                      borderRadius: "16px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                      border: "1.5px solid #e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{ flex: 2, padding: "14px 18px", borderRight: "1.5px solid #e5e7eb", background: fieldBg("destination"), transition: "background 0.15s", minHeight: "56px" }}
                      onMouseEnter={() => setHoveredField("destination")}
                      onMouseLeave={() => setHoveredField(null)}
                    >
                      <label style={labelStyle}>Destination</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPin size={15} color="#e11d48" strokeWidth={2.5} />
                        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where are you going?" onFocus={() => setFocusedField("destination")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, fontWeight: "500", fontSize: "15px" }} />
                      </div>
                    </div>
                    <div
                      style={{ flex: 1, padding: "14px 14px", borderRight: "1.5px solid #e5e7eb", background: fieldBg("checkin"), transition: "background 0.15s", minHeight: "56px" }}
                      onMouseEnter={() => setHoveredField("checkin")}
                      onMouseLeave={() => setHoveredField(null)}
                    >
                      <label style={labelStyle}>Check-in</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} onFocus={() => setFocusedField("checkin")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, color: checkIn ? "#2B2D42" : "#9ca3af", fontSize: "14px" }} />
                    </div>
                    <div
                      style={{ flex: 1, padding: "14px 14px", borderRight: "1.5px solid #e5e7eb", background: fieldBg("checkout"), transition: "background 0.15s", minHeight: "56px" }}
                      onMouseEnter={() => setHoveredField("checkout")}
                      onMouseLeave={() => setHoveredField(null)}
                    >
                      <label style={labelStyle}>Check-out</label>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} onFocus={() => setFocusedField("checkout")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, color: checkOut ? "#2B2D42" : "#9ca3af", fontSize: "14px" }} />
                    </div>
                    <div style={{ display: "flex", flex: 1.5 }}>
                      <div
                        style={{ flex: 1, padding: "14px 14px", borderRight: "1.5px solid #e5e7eb", background: fieldBg("guests"), transition: "background 0.15s", minHeight: "56px" }}
                        onMouseEnter={() => setHoveredField("guests")}
                        onMouseLeave={() => setHoveredField(null)}
                      >
                        <label style={labelStyle}>Guests</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Users size={14} color="#e11d48" strokeWidth={2.5} />
                          <select value={guests} onChange={(e) => setGuests(e.target.value)} onFocus={() => setFocusedField("guests")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, cursor: "pointer", fontSize: "14px" }}>
                            {["1 Guest", "2 Guests", "3 Guests", "4+ Guests"].map((g) => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        style={{ padding: "0 22px", background: "linear-gradient(135deg, #e11d48, #9d174d)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "15px", fontWeight: "600", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0, minHeight: "56px", transition: "opacity 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <Search size={16} /> Search
                      </button>
                    </div>
                  </div>
                </form>

                {/* View Safety Map — primary CTA */}
                <div style={{ marginTop: "20px", marginBottom: "4px" }}>
                  <a
                    href="/map"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: isMobile ? "14px 28px" : "16px 36px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #FF6B6B, #e85555)",
                      color: "white",
                      fontSize: isMobile ? "16px" : "18px",
                      fontWeight: "700",
                      fontFamily: "inherit",
                      textDecoration: "none",
                      boxShadow: "0 4px 20px rgba(255,107,107,0.35), 0 1px 4px rgba(0,0,0,0.08)",
                      transition: "all 0.2s",
                      letterSpacing: "-0.01em",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,107,107,0.45), 0 2px 8px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,107,107,0.35), 0 1px 4px rgba(0,0,0,0.08)"; }}
                  >
                    <span style={{ fontSize: "20px" }}>🗺️</span>
                    Explore the Safety Map
                    <span style={{ fontSize: "18px" }}>→</span>
                  </a>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                    Barcelona · Paris · Bangkok · Color-coded safety zones · Click any area for details
                  </p>
                </div>

                {/* Survey CTA */}
                <div style={{ marginTop: "16px" }}>
                  <a
                    href={SURVEY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 24px",
                      borderRadius: "10px",
                      border: "1.5px solid rgba(225,29,72,0.35)",
                      color: "#e11d48",
                      fontSize: isMobile ? "14px" : "15px",
                      fontWeight: "600",
                      fontFamily: "inherit",
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(4px)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e5f5ea"; e.currentTarget.style.borderColor = "#2A9D8F"; e.currentTarget.style.color = "#2A9D8F"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(225,29,72,0.35)"; e.currentTarget.style.color = "#e11d48"; }}
                  >
                    <Heart size={15} color="#e11d48" />
                    Help Shape HerSafeStay — 3 Min Survey
                  </a>
                </div>
          </div>
        </section>
      )}

      {/* ── Sticky search bar — results view only ── */}
      {searched && (
        <div
          style={{
            padding: `16px ${sidePad}`,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(252,231,243,0.9)",
            position: "sticky",
            top: `${headerH}px`,
            zIndex: 190,
          }}
        >
          <form onSubmit={handleSearch}>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                border: "1.5px solid #e5e7eb",
                overflow: "hidden",
                maxWidth: isMobile ? "100%" : "960px",
                margin: "0 auto",
              }}
            >
              <div
                style={{ padding: "14px 20px", borderRight: isMobile ? "none" : "1.5px solid #e5e7eb", borderBottom: isMobile ? "1.5px solid #e5e7eb" : "none", background: fieldBg("destination"), transition: "background 0.15s", minHeight: "56px", flex: isMobile ? "none" : "2" }}
                onMouseEnter={() => setHoveredField("destination")}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label style={labelStyle}>Destination</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={16} color="#e11d48" strokeWidth={2.5} />
                  <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where are you going?" onFocus={() => setFocusedField("destination")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, fontWeight: "500" }} />
                </div>
              </div>
              <div style={{ display: "flex", flex: isMobile ? "none" : "2", borderBottom: isMobile ? "1.5px solid #e5e7eb" : "none" }}>
                <div
                  style={{ flex: 1, padding: isMobile ? "14px 16px" : "14px 20px", borderRight: "1.5px solid #e5e7eb", background: fieldBg("checkin"), transition: "background 0.15s", minHeight: "56px" }}
                  onMouseEnter={() => setHoveredField("checkin")}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <label style={labelStyle}>Check-in</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {!isMobile && <Calendar size={16} color="#e11d48" strokeWidth={2.5} />}
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} onFocus={() => setFocusedField("checkin")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, color: checkIn ? "#2B2D42" : "#9ca3af", fontSize: isMobile ? "15px" : "16px" }} />
                  </div>
                </div>
                <div
                  style={{ flex: 1, padding: isMobile ? "14px 16px" : "14px 20px", borderRight: isMobile ? "none" : "1.5px solid #e5e7eb", background: fieldBg("checkout"), transition: "background 0.15s", minHeight: "56px" }}
                  onMouseEnter={() => setHoveredField("checkout")}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <label style={labelStyle}>Check-out</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {!isMobile && <Calendar size={16} color="#e11d48" strokeWidth={2.5} />}
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} onFocus={() => setFocusedField("checkout")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, color: checkOut ? "#2B2D42" : "#9ca3af", fontSize: isMobile ? "15px" : "16px" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flex: isMobile ? "none" : "2" }}>
                <div
                  style={{ flex: 1, padding: isMobile ? "14px 16px" : "14px 20px", borderRight: "1.5px solid #e5e7eb", background: fieldBg("guests"), transition: "background 0.15s", minHeight: "56px" }}
                  onMouseEnter={() => setHoveredField("guests")}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <label style={labelStyle}>Guests</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={isMobile ? 14 : 16} color="#e11d48" strokeWidth={2.5} />
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} onFocus={() => setFocusedField("guests")} onBlur={() => setFocusedField(null)} style={{ ...inputStyle, cursor: "pointer", fontSize: isMobile ? "15px" : "16px" }}>
                      {["1 Guest", "2 Guests", "3 Guests", "4+ Guests"].map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  style={{ padding: isMobile ? "0 24px" : "0 28px", background: "linear-gradient(135deg, #e11d48, #9d174d)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "600", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0, minHeight: "56px", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <Search size={18} />
                  {!isMobile && "Search"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Results ── */}
      {searched && (
        <main
          style={{
            padding: isMobile ? "20px 16px 48px" : isTablet ? "28px 24px 48px" : "36px 40px 60px",
            maxWidth: "1440px",
            margin: "0 auto",
          }}
        >
          {/* Results header */}
          <div style={{ marginBottom: isMobile ? "20px" : "28px" }}>
            <h2 style={{ fontSize: isMobile ? "22px" : "34px", fontWeight: "700", color: "#2B2D42", letterSpacing: "-0.01em" }}>
              {ACCOMMODATIONS.length} stays in {destination}
            </h2>
            <p style={{ fontSize: isMobile ? "14px" : "18px", color: "#78716c", marginTop: "4px" }}>
              All vetted for women&apos;s safety · Sorted by safety rating
            </p>
          </div>

          {/* Safety Map */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #fce7f3",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              overflow: "hidden",
              marginBottom: isMobile ? "20px" : "28px",
              animation: "fadeInUp 0.4s ease 0.1s both",
            }}
          >
            <div
              style={{
                padding: isMobile ? "12px 16px" : "16px 20px",
                borderBottom: "1px solid #fce7f3",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: isMobile ? "15px" : "17px",
                    fontWeight: "700",
                    color: "#2B2D42",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MapPin size={isMobile ? 14 : 16} color="#2D6A4F" />
                  Safety Map — Bangkok
                </h3>
                <p style={{ fontSize: isMobile ? "12px" : "13px", color: "#78716c", marginTop: "3px" }}>
                  {isMobile ? "Tap districts to explore · Pins match hotels below" : "Hover districts to explore · Numbered pins match hotels below"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                {[
                  { label: "Very Safe", bg: "#d4eddd", border: "#6dbf88" },
                  { label: "Safe", bg: "#e5f5ea", border: "#8cc7a0" },
                  { label: "Moderate", bg: "#fef3c7", border: "#fcd34d" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: item.bg, border: `1.5px solid ${item.border}` }} />
                    <span style={{ fontSize: "12px", color: "#57534e", fontWeight: "500" }}>{item.label}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e11d48" }} />
                  <span style={{ fontSize: "12px", color: "#57534e", fontWeight: "500" }}>Hotel</span>
                </div>
              </div>
            </div>
            <div style={{ padding: isMobile ? "10px 12px" : "14px 18px" }}>
              <BangkokSafetyMap />
            </div>
          </div>

          {/* Hotel cards + Safety Tips */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 420px",
              gap: isMobile ? "20px" : "32px",
              alignItems: "start",
            }}
          >
            {/* Cards grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: isMobile ? "16px" : "24px",
              }}
            >
              {ACCOMMODATIONS.map((acc, i) => (
                <AccommodationCard key={acc.id} acc={acc} idx={i} />
              ))}
            </div>

            {/* Safety Tips */}
            <div style={{ position: isMobile || isTablet ? "static" : "sticky", top: `${headerH + 80}px` }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "18px",
                  border: "1px solid #fce7f3",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  animation: "fadeInUp 0.4s ease 0.3s both",
                }}
              >
                <div
                  style={{
                    padding: isMobile ? "14px 18px" : "20px 22px",
                    borderBottom: "1px solid #fce7f3",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Shield size={18} color="#2D6A4F" />
                  <h3 style={{ fontSize: isMobile ? "17px" : "21px", fontWeight: "700", color: "#2B2D42" }}>
                    Safety Tips — Bangkok
                  </h3>
                </div>
                <div
                  style={{
                    padding: isMobile ? "4px 16px" : "10px 20px",
                    display: isTablet ? "grid" : "block",
                    gridTemplateColumns: isTablet ? "repeat(2, 1fr)" : "none",
                    columnGap: "16px",
                  }}
                >
                  {SAFETY_TIPS.map((tip, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: isMobile ? "10px 0" : "12px 0",
                        borderBottom: i < SAFETY_TIPS.length - 1 ? "1px solid #FFF4E8" : "none",
                      }}
                    >
                      <span style={{ fontSize: isMobile ? "18px" : "21px", flexShrink: 0 }}>{tip.icon}</span>
                      <span style={{ fontSize: isMobile ? "14px" : "17px", color: "#44403c", lineHeight: "1.5" }}>
                        {tip.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── How It Works ── */}
      {!searched && (
        <section
          style={{
            padding: isMobile ? "52px 16px 44px" : isTablet ? "64px 24px 52px" : "72px 60px 60px",
            background: "linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 50%, #F0FBF9 100%)",
            borderTop: "1px solid #FFE8D6",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "52px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  background: "rgba(255,107,107,0.08)",
                  border: "1px solid rgba(255,107,107,0.2)",
                  marginBottom: "14px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#FF6B6B", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Simple & Powerful
                </span>
              </div>
              <h2
                style={{
                  fontSize: isMobile ? "clamp(26px, 7vw, 36px)" : "clamp(30px, 3.5vw, 44px)",
                  fontWeight: "700",
                  color: "#2B2D42",
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                  fontFamily: "inherit",
                }}
              >
                How It Works
              </h2>
              <p
                style={{
                  fontSize: isMobile ? "16px" : "19px",
                  color: "#78716c",
                  maxWidth: "500px",
                  margin: "0 auto",
                  lineHeight: "1.6",
                }}
              >
                Find a safe place to stay in three simple steps
              </p>
            </div>

            {/* 3-step grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: isMobile ? "20px" : "28px",
                position: "relative",
              }}
            >
              {[
                {
                  step: "01",
                  emoji: "🗺️",
                  title: "Explore Safety Maps",
                  body: "Browse color-coded neighborhood safety zones for Barcelona, Paris, Bangkok, and more. Green means safe, amber means caution — instantly clear at a glance.",
                  accent: "#FF6B6B",
                  bg: "rgba(255,107,107,0.06)",
                  border: "rgba(255,107,107,0.15)",
                },
                {
                  step: "02",
                  emoji: "🏨",
                  title: "Find Safe Properties",
                  body: "Filter hotels, hostels, and apartments by safety rating, price, and property type. Every listing includes women's reviews and a detailed safety feature list.",
                  accent: "#2D6A4F",
                  bg: "rgba(45,106,79,0.06)",
                  border: "rgba(45,106,79,0.15)",
                },
                {
                  step: "03",
                  emoji: "✅",
                  title: "Book with Confidence",
                  body: "Click any property to read the full safety profile — security features, neighborhood score, and tips from women who've stayed there. Then book directly.",
                  accent: "#2A9D8F",
                  bg: "rgba(42,157,143,0.06)",
                  border: "rgba(42,157,143,0.15)",
                },
              ].map(({ step, emoji, title, body, accent, bg, border }, i) => (
                <div
                  key={step}
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: isMobile ? "28px 24px" : "32px 28px",
                    border: `1px solid ${border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    position: "relative",
                    animation: `fadeInUp 0.5s ease ${i * 0.12}s both`,
                  }}
                >
                  {/* Step number */}
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: accent,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "14px",
                      opacity: 0.7,
                    }}
                  >
                    Step {step}
                  </div>

                  {/* Emoji icon */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: bg,
                      border: `1.5px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      marginBottom: "18px",
                    }}
                  >
                    {emoji}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: isMobile ? "19px" : "21px",
                      fontWeight: "700",
                      color: "#2B2D42",
                      marginBottom: "10px",
                      lineHeight: "1.25",
                      fontFamily: "inherit",
                    }}
                  >
                    {title}
                  </h3>

                  {/* Body */}
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#57534e",
                      lineHeight: "1.65",
                      margin: 0,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div style={{ textAlign: "center", marginTop: isMobile ? "36px" : "48px" }}>
              <a
                href="/map"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: isMobile ? "13px 28px" : "15px 36px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #2D6A4F, #1B4332)",
                  color: "white",
                  fontSize: isMobile ? "15px" : "17px",
                  fontWeight: "700",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(45,106,79,0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(45,106,79,0.38)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.3)";
                }}
              >
                <span>🗺️</span>
                Start Exploring Safely
                <span>→</span>
              </a>
            </div>

          </div>
        </section>
      )}

      {/* ── Why HerSafeStay — trust signals ── */}
      {!searched && (
        <section
          style={{
            padding: isMobile ? "52px 16px 44px" : isTablet ? "64px 24px 52px" : "72px 60px 60px",
            background: "white",
            borderTop: "1px solid #FFE8D6",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "52px" }}>
              <h2
                style={{
                  fontSize: isMobile ? "clamp(26px, 7vw, 36px)" : "clamp(30px, 3.5vw, 44px)",
                  fontWeight: "700",
                  color: "#2B2D42",
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                  fontFamily: "inherit",
                }}
              >
                Why Women Choose{" "}
                <span style={{ color: "#FF6B6B" }}>HerSafeStay</span>
              </h2>
              <p style={{ fontSize: isMobile ? "16px" : "19px", color: "#78716c", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
                Built from the ground up for solo female travelers
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                gap: isMobile ? "16px" : "20px",
              }}
            >
              {[
                {
                  icon: "🛡️",
                  title: "Safety-First Ratings",
                  body: "Every neighborhood rated on crime data, women's reviews, walkability, and time-of-day safety — not just generic star ratings.",
                },
                {
                  icon: "👩",
                  title: "Women's Perspective",
                  body: "Safety scores derived from reviews by women travelers. We filter out reviews that don't address the concerns solo female travelers actually have.",
                },
                {
                  icon: "🗺️",
                  title: "Interactive Safety Maps",
                  body: "See exactly which neighborhoods are safe before you book. Not vague 'safe area' claims — actual polygon zones with transparency scores.",
                },
                {
                  icon: "✅",
                  title: "Verified Properties",
                  body: "Every listing checked for safety features: 24/7 security, CCTV, keycard access, women-only floors, and well-lit entrances.",
                },
                {
                  icon: "📍",
                  title: "Know Before You Go",
                  body: "Safety tips for every neighborhood — which streets to walk, where to avoid at night, and local emergency numbers — all in one place.",
                },
                {
                  icon: "🌍",
                  title: "Growing Every Day",
                  body: "Starting with Barcelona, Paris, and Bangkok. Expanding to 5 cities and beyond. Community-powered with your safety reports feeding future scores.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    padding: isMobile ? "20px 18px" : "22px 20px",
                    borderRadius: "14px",
                    background: "#FAFAF9",
                    border: "1px solid #FFE8D6",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(255,107,107,0.07)",
                      border: "1.5px solid rgba(255,107,107,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#2B2D42",
                        marginBottom: "6px",
                        fontFamily: "inherit",
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: "15px", color: "#78716c", lineHeight: "1.55", margin: 0 }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── Coming Soon ── */}
      <section
        style={{
          padding: isMobile ? "60px 16px 48px" : isTablet ? "70px 24px 56px" : "80px 60px 64px",
          background: "linear-gradient(160deg, #fef5f7 0%, #fffbf5 50%, #f5f7ff 100%)",
          borderTop: "1px solid #fce7f3",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "56px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 18px",
                borderRadius: "999px",
                background: "rgba(45,106,79,0.07)",
                border: "1px solid rgba(45,106,79,0.18)",
                marginBottom: "16px",
              }}
            >
              <Shield size={14} color="#2D6A4F" />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#2D6A4F", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Coming Soon
              </span>
            </div>
            <h2
              style={{
                fontSize: isMobile ? "clamp(26px, 7vw, 36px)" : "clamp(32px, 4vw, 48px)",
                fontWeight: "700",
                color: "#2B2D42",
                lineHeight: "1.2",
                letterSpacing: "-0.02em",
                marginBottom: "14px",
                fontFamily: "inherit",
              }}
            >
              Beyond Accommodations:{" "}
              <span style={{ color: "#2D6A4F" }}>The HerSafe Suite</span>
            </h2>
            <p
              style={{
                fontSize: isMobile ? "17px" : "21px",
                color: "#78716c",
                maxWidth: "560px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Your complete safety companion for every journey
            </p>
          </div>

          {/* Product cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? "20px" : "24px",
              marginBottom: isMobile ? "44px" : "60px",
            }}
          >
            {COMING_SOON.map((product) => (
              <ComingSoonCard key={product.name} product={product} />
            ))}
          </div>

          {/* Survey CTA */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "56px" }}>
            <p
              style={{
                fontSize: isMobile ? "16px" : "19px",
                color: "#57534e",
                marginBottom: "16px",
                lineHeight: "1.5",
                fontFamily: "inherit",
              }}
            >
              Which product should we build first?{" "}
              <span style={{ color: "#e11d48", fontWeight: "600" }}>Tell us in our quick survey.</span>
            </p>
            <a
              href={SURVEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "13px 28px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #e11d48, #9d174d)",
                color: "white",
                fontSize: isMobile ? "15px" : "16px",
                fontWeight: "600",
                fontFamily: "inherit",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(225,29,72,0.3)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Heart size={16} />
              Take Survey — 3 Minutes
            </a>
          </div>

          {/* Email signup */}
          <div
            style={{
              textAlign: "center",
              background: "white",
              borderRadius: "20px",
              border: "1px solid #fce7f3",
              padding: isMobile ? "28px 20px" : "40px 48px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <Shield size={28} color="#2D6A4F" style={{ marginBottom: "12px" }} />
            <h3
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "700",
                color: "#2B2D42",
                marginBottom: "8px",
                fontFamily: "inherit",
              }}
            >
              Be the first to know
            </h3>
            <p style={{ fontSize: "16px", color: "#78716c", marginBottom: "24px", lineHeight: "1.5" }}>
              Get notified when new HerSafe products launch
            </p>

            {notifySubmitted ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "17px",
                  fontWeight: "600",
                  border: "1px solid #bbf7d0",
                }}
              >
                <ShieldCheck size={20} />
                You&apos;re on the list!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (notifyEmail) setNotifySubmitted(true);
                }}
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "10px",
                  maxWidth: "440px",
                  margin: "0 auto",
                }}
              >
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    color: "#2B2D42",
                    outline: "none",
                    background: "#fafafa",
                    minHeight: "50px",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#e11d48"; e.target.style.background = "#FFF8F2"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#fafafa"; }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "14px 28px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #e11d48, #9d174d)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    minHeight: "50px",
                    boxShadow: "0 4px 14px rgba(225,29,72,0.3)",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#2D6A4F",
          padding: isMobile ? "40px 16px 32px" : "56px 60px 40px",
          color: "#FFF8F0",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr 1fr 1fr",
              gap: isMobile ? "32px" : "40px",
              marginBottom: "40px",
            }}
          >
            {/* Brand column */}
            <div>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "14px" }}>
                <svg viewBox="0 0 48 60" width="36" height="45" style={{ display: "block", flexShrink: 0 }}>
                  <path d="M24,4 C14,4 6,12 6,22 C6,35 24,56 24,56 C24,56 42,35 42,22 C42,12 34,4 24,4 Z" fill="#e11d48" stroke="#e11d48" strokeWidth="1.5" />
                  <path d="M24,16 L16,19 L16,27 Q16,33 24,37 Q32,33 32,27 L32,19 Z" fill="#FFF8F0" />
                </svg>
                <span style={{ fontSize: "22px", fontWeight: "700", color: "#FFF8F0", letterSpacing: "-0.01em" }}>HerSafeStay</span>
              </a>
              <p style={{ fontSize: "15px", color: "rgba(255,248,240,0.75)", lineHeight: "1.65", maxWidth: "260px" }}>
                Every listing vetted for women&apos;s safety. Travel where you feel safe and welcome.
              </p>
            </div>

            {/* Links */}
            {[
              { heading: "Explore", links: ["Destinations", "Safety Guides", "Community", "About Us"] },
              { heading: "Products", links: ["HerSafeStay", "HerSafeWay", "HerSafeNight", "HerSafeSweat"] },
              { heading: "Company", links: ["Our Mission", "Privacy Policy", "Terms of Service", "Contact"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "rgba(255,248,240,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
                  {heading}
                </h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ fontSize: "15px", color: "rgba(255,248,240,0.8)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.target.style.color = "#e11d48")}
                        onMouseLeave={(e) => (e.target.style.color = "rgba(255,248,240,0.8)")}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,248,240,0.15)",
              paddingTop: "24px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <p style={{ fontSize: "14px", color: "rgba(255,248,240,0.5)" }}>
              © 2026 HerSafeStay. Built for women who explore.
            </p>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <ShieldCheck size={14} color="#e11d48" />
              <span style={{ fontSize: "13px", color: "rgba(255,248,240,0.6)", fontWeight: "500" }}>
                Every listing safety-verified
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Survey popup — renders after 30s, once per session */}
      {showSurveyPopup && (
        <SurveyPopup onClose={() => setShowSurveyPopup(false)} />
      )}

    </div>
  );
}
