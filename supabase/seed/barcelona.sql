-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Barcelona — 5 Safety Zones + 15 Properties
--
-- IMPORTANT: All coordinates are LONGITUDE FIRST, LATITUDE SECOND (WGS84)
-- Barcelona is at approximately 41.38°N, 2.17°E
--
-- Run this AFTER migrations 001 and 002.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CITY
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO cities (id, name, country, country_code, continent, lat, lng, default_zoom, is_published, tagline)
VALUES (
  'barcelona',
  'Barcelona',
  'Spain',
  'ES',
  'Europe',
  41.385100,
  2.173400,
  13,
  true,
  'Mediterranean sunshine, world-class architecture, and a vibrant culture — with the safety knowledge to enjoy it all'
)
ON CONFLICT (id) DO UPDATE SET
  is_published = true,
  tagline = EXCLUDED.tagline;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SAFETY ZONES
--
-- Score formula: safety_score = crime*0.40 + reviews*0.30 + walkability*0.20 + time_modifier
--
-- Zone 1: Eixample         — 9.0 — SAFE    — #2D6A4F
-- Zone 2: Gràcia           — 9.0 — SAFE    — #2D6A4F
-- Zone 3: Gothic Quarter   — 6.0 — CAUTION — #F4A261
-- Zone 4: El Raval         — 4.0 — AVOID   — #E63946
-- Zone 5: Barceloneta      — 8.0 — SAFE    — #2D6A4F
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

-- ─── Zone 1: Eixample ────────────────────────────────────────────────────────
-- Barcelona's famous grid district. Modernista architecture, wide boulevards,
-- excellent street lighting. One of the safest areas in the city.
-- score: 9.0*0.40 + 9.5*0.30 + 9.5*0.20 + 0.4 = 3.60 + 2.85 + 1.90 + 0.40 = 8.75 → 9.0
(
  'barcelona',
  'bcn-eixample',
  'Eixample',
  'Eixample',
  -- Polygon: wide grid district, bounded by Paral·lel, Diagonal, Urgell, Marina
  -- Coordinates: (lng lat) pairs, first = last to close the ring
  ST_GeogFromText('SRID=4326;POLYGON((
    2.1485 41.3825,
    2.1785 41.3825,
    2.1760 41.4010,
    2.1490 41.4010,
    2.1485 41.3825
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.1622 41.3917)'),
  '{"north": 41.4010, "south": 41.3825, "east": 2.1785, "west": 2.1485}'::jsonb,
  9.0, 'safe', '#2D6A4F',
  9.0, 9.5, 9.5, 0.4,
  'Eixample is Barcelona''s iconic grid district, designed by urban planner Ildefons Cerdà in the 19th century. With its wide, well-lit octagonal block intersections and Passeig de Gràcia as its backbone, it is consistently rated the safest and most walkable area in Barcelona. Women travelers love it for its abundance of cafés, boutiques, and the famous Modernista architecture by Gaudí and Domènech i Montaner.',
  ARRAY[
    'Passeig de Gràcia and Rambla de Catalunya are exceptionally well-lit at night — great for evening walks',
    'Taxis and rideshares are abundant and easy to hail on the main boulevards',
    'The superblocks (superilles) project has calmed traffic and made many side streets pedestrian-friendly',
    'Pharmacies, 24-hour shops, and security guards are plentiful throughout',
    'If you feel uncomfortable, duck into any hotel lobby — they are required to assist'
  ],
  ARRAY[
    'Excellent street lighting on all major avenues',
    'Heavy tourist and local foot traffic until midnight',
    '24/7 hotel security presence throughout the district',
    'Wide sidewalks — never feel cornered',
    'Multiple metro stations with CCTV coverage'
  ],
  ARRAY[
    'Watch for pickpockets around the Sagrada Família on busy tourist days',
    'Avoid poorly lit side streets in the far northern tip after 2am',
    'Be alert at ATMs — card skimming has been reported at isolated machines'
  ],
  ARRAY['Mossos d''Esquadra open data (2024)', 'r/solotravel survey (n=847)', 'Walk Score API', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 2: Gràcia ──────────────────────────────────────────────────────────
-- Bohemian village feel within the city. Small plazas, family-run bars,
-- strong local community. Extremely safe and very walkable.
-- score: 9.0*0.40 + 9.5*0.30 + 9.0*0.20 + 0.5 = 3.60 + 2.85 + 1.80 + 0.50 = 8.75 → 9.0
(
  'barcelona',
  'bcn-gracia',
  'Gràcia',
  'Gràcia',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.1505 41.3990,
    2.1680 41.3990,
    2.1660 41.4120,
    2.1475 41.4120,
    2.1505 41.3990
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.1580 41.4055)'),
  '{"north": 41.4120, "south": 41.3990, "east": 2.1680, "west": 2.1475}'::jsonb,
  9.0, 'safe', '#2D6A4F',
  9.0, 9.5, 9.0, 0.5,
  'Gràcia retains the soul of a Catalan village despite being fully absorbed into the city. Its network of small plazas — Plaça del Sol, Plaça de la Vila de Gràcia, Plaça de la Virreina — are filled with locals of all ages from morning to midnight. The strong community character means unusual behavior is quickly noticed. It is one of the few areas in Barcelona where you will feel genuinely relaxed walking alone at night.',
  ARRAY[
    'Plaça del Sol and surrounding plazas are lively with locals until late — never deserted',
    'The neighbourhood Facebook groups are hyperactive — residents report suspicious activity quickly',
    'Carrer de Verdi (the main street) has excellent lighting and constant foot traffic',
    'Local community is tight-knit; asking for help from anyone on the street is always safe',
    'Park Güell (top of the district) is best visited before 18:00 — avoid the area at night'
  ],
  ARRAY[
    'Strong local community with active neighbourhood watch culture',
    'Multiple well-lit plazas with outdoor seating until midnight',
    'Low vehicle traffic — many streets pedestrianized',
    'Excellent proximity to Hospital de la Santa Creu i Sant Pau (emergency services)',
    'Active street life driven by families and young professionals'
  ],
  ARRAY[
    'Park Güell surroundings become quieter at night — avoid solo walks after dark up the hill',
    'Carrer Gran de Gràcia can feel busier and less relaxed near the Diagonal end'
  ],
  ARRAY['Mossos d''Esquadra open data (2024)', 'r/solotravel survey (n=623)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 3: Gothic Quarter (Barri Gòtic) ────────────────────────────────────
-- Historic medieval core. Stunning architecture but dense tourist crowds
-- and persistent pickpocket activity. Fine during the day, use caution at night.
-- score: 6.0*0.40 + 7.0*0.30 + 7.5*0.20 + 0.0 = 2.40 + 2.10 + 1.50 + 0.00 = 6.0
(
  'barcelona',
  'bcn-gothic-quarter',
  'Gothic Quarter',
  'Barri Gòtic',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.1710 41.3780,
    2.1835 41.3780,
    2.1820 41.3875,
    2.1700 41.3875,
    2.1710 41.3780
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.1765 41.3828)'),
  '{"north": 41.3875, "south": 41.3780, "east": 2.1835, "west": 2.1700}'::jsonb,
  6.0, 'caution', '#F4A261',
  6.0, 7.0, 7.5, 0.0,
  'The Gothic Quarter is Barcelona''s medieval heart — a maze of narrow stone streets around the Cathedral and Plaça Reial that dates back to Roman times. It is unmissable for first-time visitors, but its very popularity makes it the city''s top pickpocketing hotspot. By day it is generally safe; by night the narrow, poorly-lit streets and the mix of drunk tourists and opportunistic thieves warrants real caution. Stay on the main streets, keep your bag in front, and trust your instincts.',
  ARRAY[
    'Keep valuables in a front-facing crossbody bag or money belt — not a backpack',
    'Las Ramblas runs along the western edge: do not carry anything you cannot afford to lose',
    'Stick to the main streets (Carrer del Bisbe, Carrer de Ferran) after 22:00',
    'Plaça Reial is beautiful but attracts scammers after midnight — visit during the day',
    'If someone spills something on you or bumps you: immediately check all your pockets'
  ],
  ARRAY[
    'Heavy police presence, especially around Las Ramblas',
    'Excellent daytime safety — extremely busy with tourists and locals',
    'The Cathedral area is well-lit and monitored by security cameras',
    'Plenty of open restaurants and bars until late'
  ],
  ARRAY[
    'Highest pickpocket rate of any Barcelona neighbourhood — particularly Las Ramblas edge',
    'Narrow alleys north of the Cathedral are poorly lit and rarely patrolled at night',
    'Street scammers ("shell game", petition scams) common near tourist attractions',
    'Avoid the narrow streets between El Raval and Gothic Quarter after midnight',
    'Aggressive touts near Plaça Reial at night'
  ],
  ARRAY['Mossos d''Esquadra open data (2024)', 'Barcelona Tourism Safety Report 2024', 'r/solotravel survey (n=1,204)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 4: El Raval ────────────────────────────────────────────────────────
-- Multicultural neighbourhood west of Las Ramblas. Gentrifying rapidly
-- but still has pockets of high crime and drug activity, especially at night.
-- score: 5.0*0.40 + 6.0*0.30 + 7.0*0.20 + (-1.0) = 2.00 + 1.80 + 1.40 - 1.00 = 4.2 → 4.0
(
  'barcelona',
  'bcn-raval',
  'El Raval',
  'El Raval',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.1610 41.3760,
    2.1730 41.3760,
    2.1720 41.3880,
    2.1600 41.3880,
    2.1610 41.3760
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.1663 41.3820)'),
  '{"north": 41.3880, "south": 41.3760, "east": 2.1730, "west": 2.1600}'::jsonb,
  4.0, 'avoid', '#E63946',
  5.0, 6.0, 7.0, -1.0,
  'El Raval is one of Barcelona''s most complex neighbourhoods: home to MACBA (the contemporary art museum), Hip restaurants, and a genuinely diverse community, but also the area with the highest concentration of drug-related incidents and street crime in the city. The northern part near MACBA and the Rambla del Raval is significantly safer and more vibrant than the southern end near the port. We rate it AVOID at night — not because the whole district is dangerous, but because the risk to solo women travelers in poorly-lit streets here is meaningfully higher than elsewhere in Barcelona.',
  ARRAY[
    'If you visit, stick to the northern half around MACBA and the Rambla del Raval',
    'Go with a group at night — do not walk the southern streets solo after 22:00',
    'The area around Carrer de Sant Pau and Carrer dels Tallers is generally fine during the day',
    'Trust your gut immediately: if a street feels wrong, turn around',
    'Hotel España and Barceló Raval are good base options — their lobbies are always safe to enter'
  ],
  ARRAY[
    'Northern Raval (near MACBA) is actively gentrifying and much safer',
    'Rambla del Raval is a pleasant, busy boulevard during the day',
    'Growing restaurant and bar scene attracts a mixed local and tourist crowd',
    'Mossos d''Esquadra patrol increased in 2023–2024'
  ],
  ARRAY[
    'Highest drug-related incident rate in central Barcelona',
    'Southern streets (near Carrer de Sant Rafael) can be unsafe solo at night',
    'Street harassment has been specifically reported by women solo travelers in multiple surveys',
    'Avoid using your phone conspicuously while walking',
    'The narrow streets between Carrer de l''Hospital and the waterfront at night'
  ],
  ARRAY['Mossos d''Esquadra open data (2024)', 'Ajuntament de Barcelona crime report 2024', 'r/solotravel survey (n=892)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 5: Barceloneta ─────────────────────────────────────────────────────
-- Barcelona's beach neighbourhood. Safe and lively during the day;
-- busy beach bars make evenings generally safe but crowded.
-- score: 8.0*0.40 + 8.5*0.30 + 8.0*0.20 + 0.5 = 3.20 + 2.55 + 1.60 + 0.50 = 7.85 → 8.0
(
  'barcelona',
  'bcn-barceloneta',
  'Barceloneta',
  'La Barceloneta',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.1845 41.3740,
    2.1975 41.3740,
    2.1965 41.3830,
    2.1850 41.3830,
    2.1845 41.3740
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.1910 41.3785)'),
  '{"north": 41.3830, "south": 41.3740, "east": 2.1975, "west": 2.1845}'::jsonb,
  8.0, 'safe', '#2D6A4F',
  8.0, 8.5, 8.0, 0.5,
  'Barceloneta is Barcelona''s beloved beach neighbourhood — a dense grid of narrow streets that open onto 4 km of Mediterranean beaches. It is safe, busy, and extremely well-patrolled during the summer season. The Passeig Marítim (beachfront promenade) is lined with bars, restaurants, and hotels, creating a constant stream of foot traffic. The beach itself closes at midnight and is well lit. Solo women travelers consistently rate it highly for the combination of safety and vibrancy.',
  ARRAY[
    'The Passeig Marítim promenade is well-lit and busy with joggers and couples until midnight',
    'Beach police (Guàrdia Urbana) patrol actively during summer months',
    'The Hotel Arts and W Barcelona area is very safe — always busy with guests and staff',
    'Stick to the Passeig Marítim or interior streets; avoid isolated beach stretches after midnight',
    'Lock your belongings when swimming — opportunistic beach bag theft is the main risk'
  ],
  ARRAY[
    'Extremely busy beach promenade with constant foot traffic',
    'Multiple 5-star hotels create a security presence along the waterfront',
    'Well-lit streets throughout the compact neighbourhood grid',
    'Ambulance and emergency services nearby at Parc de la Ciutadella',
    'Active bar and restaurant scene creates natural safety in numbers'
  ],
  ARRAY[
    'Beach bag theft while swimming is common — use a locker or buddy system',
    'The beach after midnight can attract rowdy groups — stay on the promenade',
    'Peak summer weekends: watch for drink-spiking in busy beach bars'
  ],
  ARRAY['Guàrdia Urbana Barcelona statistics (2024)', 'r/solotravel survey (n=731)', 'Barcelona Tourism Safety Report 2024', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROPERTIES (15 total — 3 per zone)
-- Using zone slugs in a subquery to get zone IDs
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 3a. Eixample Properties (3) — Zone: bcn-eixample ────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Hotel Majestic Barcelona',
  'hotel',
  'Grand 5-star hotel on Passeig de Gràcia, the safest and most prestigious boulevard in Barcelona. The building itself is a landmark. Known among women travelers for its discretion, excellent security, and central Eixample location.',
  41.392400, 2.163800,
  'Passeig de Gràcia, 68, 08008 Barcelona',
  'Eixample Dreta',
  ARRAY['24/7 Doorman & Security', 'CCTV Throughout', 'Secure Key-Card Access', 'Concierge Safety Advice', 'Well-lit Entrance'],
  4.9, 4.8, 2840, 712,
  245.00, 'USD',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-eixample';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Cosmo Hotel Barcelona',
  'hotel',
  'Design boutique hotel on the pedestrianized Carrer d''Enric Granados — a tree-lined street considered one of the most pleasant and safest in the city. Popular with solo women travelers for its relaxed, artsy atmosphere and helpful female-led front desk staff.',
  41.390200, 2.158900,
  'Carrer d''Enric Granados, 40, 08007 Barcelona',
  'Eixample Esquerra',
  ARRAY['24/7 Reception', 'CCTV', 'Safe Deposit Boxes', 'Key-Card Rooms', 'Female Staff at Front Desk'],
  4.8, 4.7, 1620, 489,
  145.00, 'USD',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-eixample';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Praktik Bakery Hotel',
  'hotel',
  'Unique hotel concept combining a boutique hotel with an artisan bakery in the heart of Eixample. Excellent safety profile — the constant bakery traffic from 7am means you are never the only person around. Great value for the neighbourhood.',
  41.394100, 2.161200,
  'Carrer de Provença, 279, 08037 Barcelona',
  'Eixample Dreta',
  ARRAY['24/7 Reception', 'Digital Key Access', 'CCTV', 'Busy Street-Level Activity All Day'],
  4.7, 4.6, 1180, 367,
  115.00, 'USD',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-eixample';


-- ─── 3b. Gràcia Properties (3) — Zone: bcn-gracia ────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Casa Gracia Barcelona Hostel',
  'hostel',
  'Highly-rated boutique hostel in a beautiful Modernista building, consistently praised by solo female travelers. Women-only dorm options available. The communal areas feel genuinely safe and social without being rowdy. Prime Gràcia location.',
  41.402200, 2.156000,
  'Passeig de Gràcia, 116, 08008 Barcelona',
  'Gràcia',
  ARRAY['Women-Only Dorm Rooms', '24/7 Reception', 'Lockers in All Rooms', 'CCTV', 'Vetted Guest Policy'],
  4.9, 4.8, 3200, 1140,
  38.00, 'USD',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-gracia';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Hotel Catalonia Gracia',
  'hotel',
  '4-star hotel on the northern edge of Gràcia, minutes from Park Güell entrance. Professional security, underground parking, and a calm neighbourhood feel. Staff are known for giving excellent local safety advice to solo travelers.',
  41.403800, 2.160200,
  'Carrer de Còrsega, 189, 08036 Barcelona',
  'Gràcia',
  ARRAY['24/7 Security Guard', 'Underground Secure Parking', 'CCTV', 'Safe Deposit Boxes', 'Multilingual Concierge'],
  4.7, 4.6, 1890, 504,
  135.00, 'USD',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-gracia';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Generator Barcelona',
  'hostel',
  'Modern, well-run hostel chain known for strong safety standards and a great social atmosphere that doesn''t feel unsafe. Mixed and female-only rooms available. Located right on the edge of Gràcia, steps from the action.',
  41.405500, 2.158500,
  'Carrer de Còrsega, 373, 08037 Barcelona',
  'Gràcia',
  ARRAY['Female-Only Room Options', 'Key-Card Access Throughout', 'CCTV', '24/7 Security Staff', 'Secure Bag Storage'],
  4.6, 4.5, 4100, 1650,
  42.00, 'USD',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-gracia';


-- ─── 3c. Gothic Quarter Properties (3) — Zone: bcn-gothic-quarter ────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Hotel Neri',
  'hotel',
  'Intimate 5-star hotel inside a restored 18th-century palace, steps from Barcelona Cathedral. Among the best-situated luxury hotels in the Gothic Quarter. Despite the challenging neighbourhood, this property maintains excellent internal security and is a safe haven.',
  41.382200, 2.175700,
  'Carrer de Sant Sever, 5, 08002 Barcelona',
  'Barri Gòtic',
  ARRAY['24/7 Armed Security', 'CCTV Entire Perimeter', 'Secure Entry Buzzer', 'In-Room Safe', 'Concierge Safe Route Advice'],
  4.8, 4.8, 1240, 398,
  340.00, 'USD',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-gothic-quarter';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Barceló Gothic',
  'hotel',
  'Large 4-star hotel on a main street of the Gothic Quarter, benefiting from constant pedestrian traffic and a professional security team. Good value for the location. Staff proactively brief solo travelers on areas to avoid.',
  41.383600, 2.177400,
  'Carrer de Jaume I, 14, 08002 Barcelona',
  'Barri Gòtic',
  ARRAY['24/7 Reception & Security', 'CCTV', 'Key-Card Elevator Access', 'In-Room Safe', 'Solo Traveler Safety Briefing on Check-in'],
  4.5, 4.4, 2680, 821,
  165.00, 'USD',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-gothic-quarter';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Hostal Llorens',
  'guesthouse',
  'Family-run guesthouse on a quieter Gothic Quarter street, repeatedly praised for the owners'' personal safety advice and helpfulness. Budget-friendly without sacrificing safety basics. Ideal if you want authentic Gothic Quarter atmosphere with reliable hosts.',
  41.381000, 2.179200,
  'Carrer de Sant Pau, 4, 08001 Barcelona',
  'Barri Gòtic',
  ARRAY['24-Hour Reception', 'CCTV Entrance', 'Safe Deposit at Reception', 'Hosts Give Local Safety Briefing'],
  4.4, 4.3, 890, 312,
  78.00, 'USD',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop&q=80',
  true, false
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-gothic-quarter';


-- ─── 3d. El Raval Properties (3) — Zone: bcn-raval ───────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Hotel España',
  'hotel',
  'Historic 4-star hotel designed by Lluís Domènech i Montaner (the architect of Palau de la Música). Situated on the edge of Raval near Las Ramblas — one of the safer pockets of the neighbourhood. The restaurant and public areas are excellent. Best El Raval option for safety.',
  41.380100, 2.166800,
  'Carrer de Sant Pau, 9-11, 08001 Barcelona',
  'El Raval (Northern)',
  ARRAY['24/7 Doorman', 'Security Cameras Throughout', 'Key-Card Room Access', 'Busy Tourist Area Location', 'In-Room Safe'],
  4.4, 4.5, 2100, 634,
  125.00, 'USD',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-raval';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Barceló Raval',
  'hotel',
  'Striking circular tower hotel on Rambla del Raval — the safest and most vibrant street in the neighbourhood. The rooftop bar gives you a 360° view of the city. A good choice if you want to be close to MACBA and the arts district while maintaining safety.',
  41.381900, 2.164800,
  'Rambla del Raval, 17-21, 08001 Barcelona',
  'El Raval (Rambla del Raval)',
  ARRAY['24/7 Security Team', 'CCTV All Areas', 'Secure Parking', 'Busy Street-Level Location', 'Digital Room Keys'],
  4.3, 4.4, 3400, 1020,
  140.00, 'USD',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-raval';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Casa Camper Barcelona',
  'hotel',
  'Design hotel by the Majorcan shoe brand, situated in the northern MACBA area of Raval — the safest part. The 24-hour free snack lounge means staff are always active at all hours, giving it an unusually secure feel for the neighbourhood.',
  41.384500, 2.168200,
  'Carrer d''Elisabets, 11, 08001 Barcelona',
  'El Raval (MACBA area)',
  ARRAY['24/7 Staffed Snack Lounge', 'Security Guard at Entrance', 'Key-Card Floors', 'CCTV', 'Quiet Interior Rooms Away from Street'],
  4.5, 4.6, 1560, 498,
  195.00, 'USD',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-raval';


-- ─── 3e. Barceloneta Properties (3) — Zone: bcn-barceloneta ──────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Hotel Arts Barcelona',
  'hotel',
  'Iconic 5-star skyscraper hotel on the beachfront, part of the Marriott Luxury Collection. One of the most secure hotels in Barcelona — full perimeter security, 24/7 armed staff, and a completely controlled access environment. The beach views are extraordinary.',
  41.387800, 2.196500,
  'Carrer de la Marina, 19-21, 08005 Barcelona',
  'Barceloneta',
  ARRAY['Armed 24/7 Security', 'Full Perimeter CCTV', 'Controlled Building Access', 'Concierge Safety Briefing', 'Private Beach Access', 'Women-Only Spa'],
  5.0, 4.9, 5200, 1480,
  420.00, 'USD',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-barceloneta';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'H10 Port Vell',
  'hotel',
  '4-star hotel right on the marina, steps from the beach and the Barceloneta neighbourhood. Consistently praised by solo women travelers for its central beach location and the safety of the promenade outside. Ask for a sea-view room for the best experience.',
  41.377400, 2.191800,
  'Passeig de Joan de Borbó, 39, 08003 Barcelona',
  'Barceloneta',
  ARRAY['24/7 Reception', 'CCTV All Public Areas', 'Key-Card Elevator Access', 'Safe Deposit Boxes', 'Well-Lit Promenade Outside'],
  4.7, 4.6, 2980, 934,
  175.00, 'USD',
  'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-barceloneta';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'barcelona',
  sz.id,
  'Sea Point Hostel',
  'hostel',
  'Best-rated beach hostel in Barcelona for solo female travelers. Offers female-only dormitories and mixed rooms with personal lockers. The location — right behind the beach on a residential Barceloneta street — means you''re surrounded by locals, not just tourists.',
  41.378900, 2.189500,
  'Plaça del Mar, 4, 08003 Barcelona',
  'Barceloneta',
  ARRAY['Female-Only Dorm Option', 'Personal Lockers in All Rooms', '24/7 Reception', 'CCTV', 'Secure Luggage Storage', 'Safe Beach Route Maps at Reception'],
  4.8, 4.7, 4600, 2100,
  45.00, 'USD',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'barcelona' AND sz.zone_slug = 'bcn-barceloneta';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. UPDATE CITY COUNTS
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE cities SET
  zone_count = (
    SELECT COUNT(*) FROM safety_zones
    WHERE city_id = 'barcelona' AND is_published = true
  ),
  property_count = (
    SELECT COUNT(*) FROM properties
    WHERE city_id = 'barcelona' AND is_published = true
  )
WHERE id = 'barcelona';


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────────

-- Should return 1 city row
SELECT id, name, zone_count, property_count FROM cities WHERE id = 'barcelona';

-- Should return 5 zones with safety scores
SELECT zone_name, safety_level, safety_score, color_code, property_count
FROM safety_zones
WHERE city_id = 'barcelona' AND is_published = true
ORDER BY safety_score DESC;

-- Should return 15 properties across 5 zones
SELECT p.name, p.property_type, p.women_rating, p.price_per_night, sz.zone_name
FROM properties p
JOIN safety_zones sz ON p.zone_id = sz.id
WHERE p.city_id = 'barcelona' AND p.is_published = true
ORDER BY sz.zone_name, p.women_rating DESC;
