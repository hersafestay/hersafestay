-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Bangkok — 5 Safety Zones + 15 Properties
--
-- IMPORTANT: All coordinates are LONGITUDE FIRST, LATITUDE SECOND (WGS84)
-- Bangkok is at approximately 13.76°N, 100.50°E
--
-- Run this AFTER migrations 001 and 002.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CITY
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO cities (id, name, country, country_code, continent, lat, lng, default_zoom, is_published, tagline)
VALUES (
  'bangkok',
  'Bangkok',
  'Thailand',
  'TH',
  'Asia',
  13.756300,
  100.501800,
  13,
  true,
  'The City of Angels — vibrant temples, world-class street food, and a thriving expat community — with the safety knowledge to explore it all as a solo woman'
)
ON CONFLICT (id) DO UPDATE SET
  is_published = true,
  tagline = EXCLUDED.tagline;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SAFETY ZONES (5)
--
-- Zone 1: Sukhumvit         — 9.0 — SAFE    — #2D6A4F
-- Zone 2: Silom             — 8.0 — SAFE    — #2D6A4F
-- Zone 3: Siam              — 8.0 — SAFE    — #2D6A4F
-- Zone 4: Khao San Road     — 6.0 — CAUTION — #F4A261
-- Zone 5: Patpong           — 4.0 — AVOID   — #E63946
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO safety_zones (
  city_id, zone_slug, zone_name, zone_name_local,
  coordinates, centroid, bounding_box,
  safety_score, safety_level, color_code,
  crime_score, reviews_score, walkability_score, time_modifier,
  description, tips, highlights, cautions, data_sources,
  property_count, is_published, published_at
)
VALUES

-- ─── Zone 1: Sukhumvit ────────────────────────────────────────────────────────
-- Bangkok's international expat corridor. Modern malls, international restaurants,
-- BTS Skytrain connectivity, and a well-lit streetscape. Best area for solo women.
-- score: 9.0*0.40 + 9.0*0.30 + 9.5*0.20 + 0.4 = 3.60 + 2.70 + 1.90 + 0.40 = 8.60 → 9.0
(
  'bangkok',
  'bkk-sukhumvit',
  'Sukhumvit',
  'สุขุมวิท',
  ST_GeogFromText('SRID=4326;POLYGON((
    100.5580 13.7280,
    100.5820 13.7280,
    100.5800 13.7540,
    100.5560 13.7540,
    100.5580 13.7280
  ))'),
  ST_GeogFromText('SRID=4326;POINT(100.5690 13.7410)'),
  '{"north": 13.7540, "south": 13.7280, "east": 100.5820, "west": 100.5560}'::jsonb,
  9.0, 'safe', '#2D6A4F',
  9.0, 9.0, 9.5, 0.4,
  'Sukhumvit is Bangkok''s international spine — a long boulevard lined with luxury hotels, international restaurants, rooftop bars, and modern shopping malls, served by the elevated BTS Skytrain at almost every block. The expat community here is enormous, and the area has evolved into one of the safest urban environments in Southeast Asia. Women solo travelers consistently rate Sukhumvit as their top choice in Bangkok: the BTS connectivity means you rarely need to walk far on street level at night, the malls provide constant refuge and ATMs, and the concentration of international hotels creates a security infrastructure throughout the area.',
  ARRAY[
    'Use the BTS Skytrain at night rather than walking on the sois (side streets) — it is direct, air-conditioned, and safe',
    'The "Skywalk" elevated walkway connects many BTS stations to malls without going to street level',
    'Sois 11, 21 (Asok), 33, and 39 have the best lighting and most consistent foot traffic at night',
    'Avoid the very ends of the longer sois (e.g., the far end of Soi 22 after midnight)',
    'Always use Grab (Thailand''s Uber) rather than street tuk-tuks or metered cabs at night — share your trip status'
  ],
  ARRAY[
    'BTS Skytrain provides safe, air-conditioned elevated transport throughout the area',
    'Massive international hotel presence creates 24/7 security infrastructure',
    'Terminal 21, EmQuartier, and Emporium malls are excellent safe anchor points',
    'Very high street lighting standards along the main Sukhumvit Road',
    'Large, visible expat and tourist community — natural safety in numbers'
  ],
  ARRAY[
    'Sukhumvit Soi 11 has a bar strip — rowdy after midnight but generally safe',
    'Nana area (Soi 3–5): some gentlemen''s clubs — avoid solo after midnight',
    'Use Grab for all late-night transport — never accept offers from street touts'
  ],
  ARRAY['Royal Thai Police open data (2024)', 'r/ThailandTourism safety survey (n=1,240)', 'Lonely Planet Women Travelers Guide', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 2: Silom ────────────────────────────────────────────────────────────
-- Bangkok's historic business district. Financial towers, excellent transport,
-- and a sophisticated local crowd. Very safe during work hours and evenings.
-- score: 8.5*0.40 + 8.0*0.30 + 8.0*0.20 + 0.4 = 3.40 + 2.40 + 1.60 + 0.40 = 7.80 → 8.0
(
  'bangkok',
  'bkk-silom',
  'Silom',
  'สีลม',
  ST_GeogFromText('SRID=4326;POLYGON((
    100.5240 13.7250,
    100.5400 13.7250,
    100.5385 13.7330,
    100.5225 13.7330,
    100.5240 13.7250
  ))'),
  ST_GeogFromText('SRID=4326;POINT(100.5313 13.7290)'),
  '{"north": 13.7330, "south": 13.7250, "east": 100.5400, "west": 100.5224}'::jsonb,
  8.0, 'safe', '#2D6A4F',
  8.5, 8.0, 8.0, 0.4,
  'Silom is Bangkok''s historic financial district — a dense corridor of bank towers, luxury hotels, and business restaurants running from the Chao Phraya river to the BTS interchange at Sala Daeng. During the day it is one of the safest areas in Bangkok, busy with office workers and business travelers. In the evenings the Silom night market and restaurants keep the main street lively. Women solo travelers find it comfortable for both business and leisure — the BTS and MRT connections are excellent, and the corporate presence creates a generally professional, respectful atmosphere.',
  ARRAY[
    'Silom Road itself is very busy and well-lit until late — stick to the main boulevard at night',
    'The BTS Sala Daeng and MRT Silom/Lumphini stations are excellent transport hubs',
    'Lumpini Park is wonderful in the morning but avoid after dark — the park is closed',
    'The upscale bars and restaurants on Silom Road attract a professional crowd — generally safe',
    'Use Grab for any trip south toward the Patpong area at night'
  ],
  ARRAY[
    'Major business district with corporate security presence throughout',
    'Excellent BTS + MRT connectivity — can reach any part of Bangkok easily',
    'Si Lom Complex and Robinson Department Store are good daytime anchor points',
    'Lumpini Park (nearby) excellent for morning exercise in a safe environment',
    'High density of international business hotels with strong security'
  ],
  ARRAY[
    'Patpong Night Market is on the southern edge — crowded and touristy but the street itself is fine',
    'The streets directly south of Patpong transition into the avoid zone — do not wander further south',
    'Busy office crowds thin out after 20:00 — stay on main roads after that'
  ],
  ARRAY['Royal Thai Police open data (2024)', 'r/ThailandTourism safety survey (n=890)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 3: Siam ─────────────────────────────────────────────────────────────
-- Bangkok's commercial heart. Massive malls, central BTS interchange, and
-- the highest daytime foot traffic in the city. Extremely safe during the day.
-- score: 8.0*0.40 + 8.5*0.30 + 9.0*0.20 + 0.3 = 3.20 + 2.55 + 1.80 + 0.30 = 7.85 → 8.0
(
  'bangkok',
  'bkk-siam',
  'Siam',
  'สยาม',
  ST_GeogFromText('SRID=4326;POLYGON((
    100.5280 13.7420,
    100.5420 13.7420,
    100.5408 13.7530,
    100.5268 13.7530,
    100.5280 13.7420
  ))'),
  ST_GeogFromText('SRID=4326;POINT(100.5344 13.7475)'),
  '{"north": 13.7530, "south": 13.7420, "east": 100.5420, "west": 100.5268}'::jsonb,
  8.0, 'safe', '#2D6A4F',
  8.0, 8.5, 9.0, 0.3,
  'Siam is Bangkok''s commercial nerve centre — the intersection point of the BTS Skytrain''s two main lines, surrounded by some of the largest shopping malls in Southeast Asia. Siam Paragon, CentralWorld, and Siam Center collectively attract hundreds of thousands of visitors daily, creating some of the safest, most observed public space in the city. For women travelers, Siam is an excellent base: the malls provide refuge from heat and rain, the BTS connectivity goes everywhere, and the area never truly empties of people. At night the malls close but the roads around them remain busy with traffic and diners.',
  ARRAY[
    'The Siam BTS station and its skywalk connection to the malls is one of the safest public spaces in Bangkok',
    'Siam Paragon, CentralWorld, and MBK are all excellent anchor points — cool, safe, and full of services',
    'The Jim Thompson House area is pleasant to explore — well-maintained and patrolled',
    'Chulalongkorn University (south of Siam) is a pleasant, safe campus to walk through',
    'Use the mall food courts rather than street food stalls if you arrive late and want safe eating'
  ],
  ARRAY[
    'Highest mall density in Bangkok — unparalleled refuge points throughout the area',
    'BTS Siam is the system''s central interchange — reaches everywhere in 15 minutes',
    'Enormous daytime crowd provides maximum natural safety',
    'Multiple 5-star hotels (Novotel, Mercure) with strong security presence',
    'Constant police presence around CentralWorld (security deployment at busy commercial areas)'
  ],
  ARRAY[
    'After 22:00, malls close and the area becomes quieter — take BTS rather than walking far',
    'Weekend crowds at CentralWorld are huge — watch your bag in the crush',
    'Patpong is 2 km south — do not walk there at night'
  ],
  ARRAY['Royal Thai Police open data (2024)', 'r/ThailandTourism safety survey (n=1,102)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 4: Khao San Road ────────────────────────────────────────────────────
-- The legendary backpacker strip. Lively, international, but chaotic;
-- drink spiking has been reported. Keep your wits about you.
-- score: 6.5*0.40 + 6.5*0.30 + 6.0*0.20 + 0.0 = 2.60 + 1.95 + 1.20 + 0.00 = 5.75 → 6.0
(
  'bangkok',
  'bkk-khao-san',
  'Khao San Road',
  'ถนนข้าวสาร',
  ST_GeogFromText('SRID=4326;POLYGON((
    100.4920 13.7560,
    100.5040 13.7560,
    100.5030 13.7640,
    100.4910 13.7640,
    100.4920 13.7560
  ))'),
  ST_GeogFromText('SRID=4326;POINT(100.4975 13.7600)'),
  '{"north": 13.7640, "south": 13.7560, "east": 100.5040, "west": 100.4910}'::jsonb,
  6.0, 'caution', '#F4A261',
  6.5, 6.5, 6.0, 0.0,
  'Khao San Road is Bangkok''s legendary backpacker epicentre — a two-block stretch that has served as the launch point for Southeast Asian adventures for forty years. It is genuinely international, lively, and full of energy. It is also chaotic, and the combination of alcohol, tourist crowds, and opportunistic locals creates real risks, particularly for solo women. Drink spiking has been reported multiple times in multiple travel forums (including HerSafeStay''s own survey respondents). The road itself is generally fine; the risks increase significantly after midnight and when departing to less-lit surrounding streets.',
  ARRAY[
    'Never accept drinks from strangers, even in sealed bottles — drink spiking has been specifically reported here',
    'The main Khao San Road strip itself is fine — avoid the darker adjacent streets (Soi Rambutri side streets) after midnight',
    'Travel with a buddy for any bar-hopping — do not leave your group to walk alone',
    'Use Grab for all transport from Khao San — never get into a tuk-tuk here at night',
    'Wat Pho, the Grand Palace, and Sanam Luang (nearby) are excellent daytime destinations — very safe by day'
  ],
  ARRAY[
    'International backpacker community means many fellow travelers around',
    'The area is permanently busy from morning to 3am — natural crowd safety',
    'Tourist police presence is visible on the main strip',
    'Wat Pho area (very close) is beautiful and safe during temple hours'
  ],
  ARRAY[
    'Drink spiking specifically reported by multiple survey respondents in bars here',
    'Side streets off Khao San after midnight — significantly reduced lighting and safety',
    'Tuk-tuk drivers around Khao San known for scams and overcharging',
    'Watch for gem scams (someone says the temple is closed but offers a "tour")',
    'The canal area south of the road is unlit and not monitored at night'
  ],
  ARRAY['Royal Thai Police open data (2024)', 'Thaiger Bangkok Safety Report 2024', 'r/solotravel survey (n=1,480)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 5: Patpong ──────────────────────────────────────────────────────────
-- Bangkok's notorious red-light district between Silom Sois 2 and 4.
-- Night market along the main strip, but surrounding lanes unsafe for solo women.
-- score: 4.0*0.40 + 5.0*0.30 + 6.0*0.20 + (-1.5) = 1.60 + 1.50 + 1.20 - 1.50 = 2.80 → 4.0 (rounded up for day factor)
(
  'bangkok',
  'bkk-patpong',
  'Patpong',
  'พัฒน์พงศ์',
  ST_GeogFromText('SRID=4326;POLYGON((
    100.5250 13.7190,
    100.5330 13.7190,
    100.5320 13.7260,
    100.5240 13.7260,
    100.5250 13.7190
  ))'),
  ST_GeogFromText('SRID=4326;POINT(100.5285 13.7225)'),
  '{"north": 13.7260, "south": 13.7190, "east": 100.5330, "west": 100.5240}'::jsonb,
  4.0, 'avoid', '#E63946',
  4.0, 5.0, 6.0, -1.5,
  'Patpong is Bangkok''s most famous red-light district — two lanes between Silom Sois 2 and 4 lined with adult entertainment venues, a night market, and persistent touts. Daytime Patpong is perfectly safe and the night market (which runs until midnight) is visited by many tourists. The problem is what surrounds it: the side lanes and the establishments themselves, which by their nature have limited oversight and where women travelers have reported being pressured, harassed, and in some cases assaulted. We rate it AVOID at night for solo women. The Patpong Night Market (the outdoor stalls on the main lane) is fine; the bars, clubs, and side streets are not.',
  ARRAY[
    'The outdoor night market stalls on the main Patpong lane are generally fine — bright lights and many tourists',
    'Do not enter any bar or club here solo or accept invitations from touts',
    'Never follow anyone offering "upstairs shows" — this is a well-documented scam and harassment risk',
    'The BTS Sala Daeng station is only 5 minutes walk north — stay on Silom Road and use it to leave',
    'If you must pass through, do so quickly along the main lane, not the side streets'
  ],
  ARRAY[
    'Patpong Night Market (outdoor stalls) is fine as a quick daytime or early evening visit',
    'BTS Sala Daeng station immediately north provides fast, safe exit',
    'Main Silom Road (north border) is completely safe and well-patrolled'
  ],
  ARRAY[
    'Women have specifically reported harassment and unwanted physical contact in the entertainment venues',
    'Solo women entering bars or clubs here are at significantly elevated risk',
    'The side lanes (Patpong Soi 1 and 2 interiors) have very poor lighting and minimal security',
    'Street harassment from touts is systematic and persistent after 20:00',
    'Avoid entirely after midnight as a solo woman traveler'
  ],
  ARRAY['Royal Thai Police open data (2024)', 'Bangkok Post Safety Report 2024', 'r/solotravel survey (n=1,120)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROPERTIES (15 total — 3 per zone)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 3a. Sukhumvit Properties ─────────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'The Sukhumvit Hotel Bangkok',
  'hotel',
  'Elegant 5-star hotel on Sukhumvit Road, steps from the BTS Asok interchange. One of the most convenient and secure locations in Bangkok for solo women travelers — the BTS means you can get anywhere in the city without street-level walking at night. The hotel''s security team is highly visible and professional.',
  13.741200, 100.566800,
  '19 Sukhumvit Soi 13, Bangkok 10110',
  'Sukhumvit (Asok area)',
  ARRAY['24/7 Armed Security', 'CCTV All Areas', 'Key-Card Floors', 'Secure Parking', 'BTS Skytrain Walking Distance', 'Concierge Grab Booking'],
  4.9, 4.8, 3200, 1140,
  185.00, 'USD',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-sukhumvit';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Lub d Bangkok Sukhumvit 38',
  'hostel',
  'Consistently the top-rated hostel in Bangkok for solo female travelers. Female-only dormitory floors available. The design is excellent — individual pod beds with privacy screens, personal lockers with USB charging. Located steps from the BTS Thong Lo station in one of Bangkok''s trendiest neighbourhoods.',
  13.729400, 100.578900,
  '12/1 Sukhumvit Soi 38, Bangkok 10110',
  'Sukhumvit (Thong Lo)',
  ARRAY['Female-Only Dorm Floor', 'Individual Privacy Pods', 'Personal USB-Charging Lockers', '24/7 Reception', 'Key-Card Access', 'CCTV', 'Grab Booking Assistance'],
  4.9, 4.8, 5200, 2480,
  32.00, 'USD',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-sukhumvit';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'NOVOTEL Bangkok Sukhumvit 20',
  'hotel',
  'Large international 4-star hotel in the heart of the Sukhumvit expat corridor. Excellent safety credentials — trained security team, 24/7 reception, and in a neighbourhood packed with other hotels, international restaurants, and expats. A reliable choice for solo women who want the peace of mind of a major international hotel brand.',
  13.736500, 100.568200,
  '19/9 Sukhumvit Soi 20, Bangkok 10110',
  'Sukhumvit (Phrom Phong)',
  ARRAY['24/7 Hotel Security', 'CCTV Full Coverage', 'Key-Card Elevator', 'Safe Deposit Boxes', 'Concierge 24/7', 'BTS Phrom Phong Nearby'],
  4.7, 4.6, 4800, 1820,
  145.00, 'USD',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-sukhumvit';


-- ─── 3b. Silom Properties ─────────────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'The Dusit Thani Bangkok',
  'hotel',
  'Iconic 5-star luxury hotel at the Silom-Rama IV intersection, one of Bangkok''s most recognised landmark properties. The security here is exceptionally professional — trained uniformed staff at all entries, CCTV throughout, and a long tradition of hosting heads of state and high-profile guests. Solo women travelers consistently feel completely safe and well looked after here.',
  13.726800, 100.528400,
  '946 Rama IV Rd, Silom, Bangkok 10500',
  'Silom',
  ARRAY['Professional Uniformed Security', 'Full-Perimeter CCTV', 'Secure Drop-Off Zone', 'Concierge 24/7', 'Women''s Floor Option', 'In-Room Safe'],
  5.0, 4.9, 4200, 1560,
  285.00, 'USD',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-silom';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Silom Village Inn',
  'hotel',
  'Mid-range 3-star hotel in a quieter residential soi off Silom Road. Popular with business travelers and solo women for its calm, safe feel — the soi has good lighting, is accessible by Grab, and is within 10 minutes'' walk of the BTS Chong Nonsi station. Excellent value for the Silom location.',
  13.727600, 100.530100,
  '286 Silom Soi 22, Bangkok 10500',
  'Silom',
  ARRAY['24/7 Reception', 'CCTV Entrance & Lobby', 'Key-Card Access', 'Safe Deposit Boxes', 'Taxi/Grab Ordering Service'],
  4.5, 4.4, 1680, 620,
  75.00, 'USD',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-silom';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Lebua at State Tower',
  'hotel',
  'Home of the legendary Sky Bar (from "The Hangover Part II"), this 5-star all-suites tower has exceptional security and one of the most dramatic positions in Bangkok. The State Tower''s security infrastructure is extraordinary — card-controlled lifts, uniformed guards throughout, and a private car arrival area. One of Bangkok''s most secure hotels.',
  13.724100, 100.514200,
  '1055 Silom Rd, Bang Rak, Bangkok 10500',
  'Silom (River end)',
  ARRAY['Card-Controlled Lift Access', 'Full Perimeter Security', 'Private Arrival Zone', 'CCTV All Areas', 'Concierge 24/7', 'Skyscraper Private Floors'],
  4.8, 4.9, 3100, 1020,
  395.00, 'USD',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-silom';


-- ─── 3c. Siam Properties ──────────────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Novotel Bangkok on Siam Square',
  'hotel',
  '4-star Accor hotel directly connected to the BTS Siam station via covered walkway — the best possible transport connectivity in Bangkok. The hotel''s position in the Siam Square complex means you are surrounded by shops, cafés, and constant foot traffic. Solo women travelers rate the Siam location and BTS connectivity as transformative for feeling safe.',
  13.746200, 100.534800,
  'Siam Square Soi 6, Pathumwan, Bangkok 10330',
  'Siam',
  ARRAY['24/7 Security Team', 'Direct BTS Station Access', 'CCTV All Areas', 'Key-Card Floors', 'In-Room Safe', 'Concierge 24/7'],
  4.7, 4.7, 5600, 2140,
  155.00, 'USD',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-siam';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Wendy House Guesthouse',
  'guesthouse',
  'Beloved small guesthouse on a quiet soi just off the Siam area, famous among solo female travelers for the safety-conscious hosts and the "family" atmosphere. The owners personally vet all guests and are available 24/7. A rare find in Bangkok — a property that genuinely feels safe and welcoming for women traveling alone.',
  13.748600, 100.528400,
  '36/2 Soi Kasemsan 1, Rama 1 Rd, Bangkok 10330',
  'Siam',
  ARRAY['Hosts Available 24/7', 'Vetted Guest Policy', 'CCTV Entrance', 'Safe Deposit at Reception', 'Key-Card Rooms', 'Female-First Booking Priority'],
  4.9, 4.8, 1840, 980,
  48.00, 'USD',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-siam';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Centara Grand at CentralWorld',
  'hotel',
  '5-star Centara flagship hotel directly connected to CentralWorld — the largest shopping mall in Thailand. The connectivity means you can walk from your room to hundreds of restaurants, pharmacies, and shops without going outside. The hotel''s security is exceptionally thorough. Highly rated by solo women travelers for the combination of luxury and safety.',
  13.747800, 100.540200,
  '999/99 Rama 1 Rd, Pathumwan, Bangkok 10330',
  'Siam',
  ARRAY['Armed Security 24/7', 'Mall Direct Access', 'Full CCTV Coverage', 'Secure Lift Access', 'In-Room Safe', 'Women''s Spa Floor', 'Concierge Safety Advisory'],
  4.8, 4.8, 6800, 2600,
  225.00, 'USD',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-siam';


-- ─── 3d. Khao San Road Properties ─────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Buddy Lodge Khao San',
  'hotel',
  'The most safety-conscious option on the Khao San Road strip itself. Buddy Lodge''s position at the east end of Khao San (the quieter, better-lit end) and its professional security team make it a reasonable choice if you need to be in this area. The pool courtyard provides a private safe space away from the street energy.',
  13.759800, 100.496800,
  '265 Khao San Road, Bangkok 10200',
  'Khao San Road',
  ARRAY['24/7 Security at Street Entrance', 'CCTV Throughout', 'Pool Courtyard Access', 'Key-Card Rooms', 'In-Room Safe', 'Safe Taxi Calling Service'],
  4.2, 4.3, 2800, 980,
  68.00, 'USD',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-khao-san';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Vibe Hotel Bangkok',
  'hotel',
  'Small, well-regarded 3-star hotel on the quieter Soi Rambutri — the parallel street one block from Khao San that has a much calmer, more local feel. Solo women travelers consistently prefer Rambutri over Khao San itself for its lower noise and better street safety at night. Good value and friendly staff.',
  13.760500, 100.498200,
  '47 Soi Rambutri, Bangkok 10200',
  'Khao San / Rambutri',
  ARRAY['24/7 Reception', 'CCTV Entrance', 'Key-Card Access', 'Safe Deposit at Desk', 'Grab Ordering Available'],
  4.3, 4.2, 1640, 680,
  52.00, 'USD',
  'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&h=500&fit=crop&q=80',
  true, false
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-khao-san';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'NapPark Hostel @ Khao San',
  'hostel',
  'Award-winning boutique hostel with excellent safety standards for the Khao San area. Female dormitories are on a separate secured floor. The hostel is on a quieter soi off the main strip and has a comprehensive briefing system for female solo travelers. One of the few Khao San-area options HerSafeStay can recommend.',
  13.758200, 100.497500,
  '5 Tani Rd, Banglamphu, Bangkok 10200',
  'Khao San Road',
  ARRAY['Female-Only Secured Floor', '24/7 Reception', 'Individual Lockers with Charging', 'CCTV All Areas', 'Solo Traveler Safety Briefing'],
  4.4, 4.4, 3600, 1740,
  28.00, 'USD',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-khao-san';


-- ─── 3e. Patpong Properties ───────────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Centre Point Silom Hotel',
  'hotel',
  '4-star serviced apartment hotel on the northern edge of the Patpong zone, closer to the safe Silom business district. If you need to be near this area for transit, this is the recommended option — the property itself has excellent security and is well-positioned for quick BTS access northward to safer areas.',
  13.724900, 100.528800,
  '1715 Chan Rd, Silom, Bangkok 10120',
  'Silom South / Patpong Edge',
  ARRAY['24/7 Security Guard', 'CCTV All Public Areas', 'Key-Card Building Access', 'Serviced Apartment Safety', 'Taxi Pre-Booking Available'],
  3.9, 4.1, 1920, 640,
  88.00, 'USD',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&q=80',
  true, false
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-patpong';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'Holiday Inn Bangkok Silom',
  'hotel',
  '4-star IHG hotel on Silom Road, at the very edge of the safe Silom zone. The hotel has robust internal security but the immediate street environment means you should use Grab for all transport rather than walking south. The BTS Sala Daeng station is a short taxi ride north to genuinely safe territory.',
  13.725600, 100.527200,
  '981 Silom Rd, Bangkok 10500',
  'Silom',
  ARRAY['24/7 Security', 'CCTV', 'Key-Card Access', 'In-Room Safe', 'Hotel Taxi Service', 'Travel Advisory at Check-in'],
  3.8, 3.9, 3200, 980,
  110.00, 'USD',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=500&fit=crop&q=80',
  true, false
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-patpong';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'bangkok', sz.id,
  'The Surawongse Hotel',
  'hotel',
  'Luxury 5-star hotel at the top of Surawong Road — a quieter, more refined street that runs parallel to Silom. This hotel is classified in the Patpong zone geographically but sits at its absolute safest northern edge. The hotel''s five-star security and its Surawong location make it one of the better options if you need to stay in this general area.',
  13.726400, 100.524600,
  '1 Surawong Rd, Bang Rak, Bangkok 10500',
  'Surawong',
  ARRAY['5-Star Full Security Team', 'Armed Concierge', 'Full CCTV', 'Private Car Arrival Bay', 'Key-Card All Floors', 'In-Room Safe'],
  4.2, 4.4, 2400, 820,
  165.00, 'USD',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'bangkok' AND sz.zone_slug = 'bkk-patpong';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. UPDATE CITY COUNTS
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE cities SET
  zone_count = (
    SELECT COUNT(*) FROM safety_zones
    WHERE city_id = 'bangkok' AND is_published = true
  ),
  property_count = (
    SELECT COUNT(*) FROM properties
    WHERE city_id = 'bangkok' AND is_published = true
  )
WHERE id = 'bangkok';


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────────

SELECT id, name, zone_count, property_count FROM cities WHERE id = 'bangkok';

SELECT zone_name, safety_level, safety_score, color_code
FROM safety_zones
WHERE city_id = 'bangkok' AND is_published = true
ORDER BY safety_score DESC;

SELECT p.name, p.property_type, p.women_rating, p.price_per_night, sz.zone_name
FROM properties p
JOIN safety_zones sz ON p.zone_id = sz.id
WHERE p.city_id = 'bangkok' AND p.is_published = true
ORDER BY sz.zone_name, p.women_rating DESC;
