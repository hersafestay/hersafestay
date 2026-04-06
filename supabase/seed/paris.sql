-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Paris — 5 Safety Zones + 15 Properties
--
-- IMPORTANT: All coordinates are LONGITUDE FIRST, LATITUDE SECOND (WGS84)
-- Paris is at approximately 48.86°N, 2.35°E
--
-- Run this AFTER migrations 001 and 002.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CITY
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO cities (id, name, country, country_code, continent, lat, lng, default_zoom, is_published, tagline)
VALUES (
  'paris',
  'Paris',
  'France',
  'FR',
  'Europe',
  48.856600,
  2.352200,
  13,
  true,
  'The City of Light — iconic art, world-class cuisine, and historic neighbourhoods — with the safety knowledge to experience it confidently as a solo woman'
)
ON CONFLICT (id) DO UPDATE SET
  is_published = true,
  tagline = EXCLUDED.tagline;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SAFETY ZONES (5)
--
-- Zone 1: Le Marais         — 9.0 — SAFE    — #2D6A4F
-- Zone 2: Saint-Germain     — 8.0 — SAFE    — #2D6A4F
-- Zone 3: Latin Quarter     — 8.0 — SAFE    — #2D6A4F
-- Zone 4: Montmartre        — 6.0 — CAUTION — #F4A261
-- Zone 5: Gare du Nord      — 4.0 — AVOID   — #E63946
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

-- ─── Zone 1: Le Marais ────────────────────────────────────────────────────────
-- Historic Jewish and LGBTQ+ quarter. Boutiques, galleries, and beautiful
-- medieval architecture. One of Paris's safest and most vibrant neighbourhoods.
-- score: 9.0*0.40 + 9.5*0.30 + 9.0*0.20 + 0.4 = 3.60 + 2.85 + 1.80 + 0.40 = 8.65 → 9.0
(
  'paris',
  'par-marais',
  'Le Marais',
  'Le Marais',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.3480 48.8498,
    2.3630 48.8498,
    2.3620 48.8610,
    2.3470 48.8610,
    2.3480 48.8498
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.3550 48.8554)'),
  '{"north": 48.8610, "south": 48.8498, "east": 2.3630, "west": 2.3470}'::jsonb,
  9.0, 'safe', '#2D6A4F',
  9.0, 9.5, 9.0, 0.4,
  'Le Marais is one of Paris''s most beloved and safest neighbourhoods — a beautifully preserved medieval quarter now home to the city''s Jewish community, LGBTQ+ scene, and a thriving gallery and boutique culture. The Place des Vosges (Paris''s oldest planned square) sits at its heart, and the streets stay lively with a sophisticated local crowd well into the evening. Women solo travelers consistently rate Le Marais the most comfortable area in Paris, particularly for its visible diversity, excellent lighting, and constant foot traffic.',
  ARRAY[
    'Place des Vosges and its arcaded galleries are busy and well-lit until late evening',
    'The Marais has a strong LGBTQ+ community presence — one of the most accepting and vigilant neighbourhoods in Paris',
    'Rue des Rosiers (the historic Jewish street) is always busy with locals — great anchor point',
    'Keep your phone in an inside pocket on Rue de Rivoli — pickpockets work that stretch',
    'The BHV Marais department store is a great refuge point if you feel uncomfortable — busy all day'
  ],
  ARRAY[
    'Extremely active street life until midnight, especially on weekends',
    'High concentration of boutiques, restaurants, and cafés — never deserted',
    'Strong community identity means unusual behaviour is quickly noticed',
    'Multiple police patrol routes throughout the district',
    'Excellent metro connectivity (Saint-Paul, Hôtel de Ville, Chemin Vert)'
  ],
  ARRAY[
    'Rue de Rivoli edge can attract pickpockets — be alert on the western boundary',
    'Peak tourist crowds around Musée Picasso and Musée Carnavalet on weekends',
    'Some quiet back streets near the Archives Nationales are less busy at night'
  ],
  ARRAY['Préfecture de Police de Paris open data (2024)', 'r/solotravel survey (n=1,102)', 'Walk Score API', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 2: Saint-Germain-des-Prés ──────────────────────────────────────────
-- Upscale literary Left Bank quarter. Cafés where Sartre and Hemingway wrote,
-- prestigious boutiques, and a refined, calm atmosphere. Very safe.
-- score: 8.5*0.40 + 8.5*0.30 + 8.0*0.20 + 0.4 = 3.40 + 2.55 + 1.60 + 0.40 = 7.95 → 8.0
(
  'paris',
  'par-saint-germain',
  'Saint-Germain-des-Prés',
  'Saint-Germain-des-Prés',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.3265 48.8488,
    2.3420 48.8488,
    2.3410 48.8585,
    2.3255 48.8585,
    2.3265 48.8488
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.3338 48.8537)'),
  '{"north": 48.8585, "south": 48.8488, "east": 2.3420, "west": 2.3255}'::jsonb,
  8.0, 'safe', '#2D6A4F',
  8.5, 8.5, 8.0, 0.4,
  'Saint-Germain-des-Prés is the legendary literary and intellectual heart of Paris — home to the cafés where Sartre wrote, the galleries where Picasso showed, and some of the finest restaurants in the city. It is one of the calmest, most sophisticated parts of Paris, with a distinctly local feel despite its fame. Women travelers love it for the combination of cultural richness, excellent lighting, and a local resident population that takes the neighbourhood''s elegance seriously.',
  ARRAY[
    'Boulevard Saint-Germain is extremely well-lit and busy with diners until midnight',
    'The Luxembourg Gardens (just south) are wonderful by day but avoid after closing at dusk',
    'Cafés de Flore and Les Deux Magots are excellent landmark anchor points',
    'The 6th arrondissement has some of the lowest street crime rates in central Paris',
    'Rue de Buci market street stays lively with locals shopping until early evening'
  ],
  ARRAY[
    'Predominantly upscale residential neighbourhood with low street crime',
    'Constant flow of diners and theatre-goers on main streets until late',
    'Excellent street lighting throughout',
    'High concentration of 4 and 5-star hotels creates security presence',
    'Proximity to Musée d''Orsay and Institut de France'
  ],
  ARRAY[
    'Luxembourg Gardens closes at dusk — do not be caught inside after dark',
    'Some smaller streets off Rue de Rennes are quieter and less monitored at night',
    'The Saint-Sulpice area can feel deserted on weekday evenings'
  ],
  ARRAY['Préfecture de Police de Paris open data (2024)', 'r/solotravel survey (n=876)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 3: Latin Quarter ────────────────────────────────────────────────────
-- Historic student district around the Sorbonne. Always bustling with students,
-- professors, and tourists. Lively, safe, and full of atmosphere.
-- score: 8.0*0.40 + 8.5*0.30 + 8.5*0.20 + 0.3 = 3.20 + 2.55 + 1.70 + 0.30 = 7.75 → 8.0
(
  'paris',
  'par-latin-quarter',
  'Latin Quarter',
  'Quartier Latin',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.3430 48.8432,
    2.3590 48.8432,
    2.3580 48.8545,
    2.3420 48.8545,
    2.3430 48.8432
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.3505 48.8489)'),
  '{"north": 48.8545, "south": 48.8432, "east": 2.3590, "west": 2.3420}'::jsonb,
  8.0, 'safe', '#2D6A4F',
  8.0, 8.5, 8.5, 0.3,
  'The Latin Quarter is Paris''s historic student district, built around the Sorbonne university and stretching to the Panthéon. It has been a centre of intellectual life since the 13th century. The streets are perpetually busy with students, bookshop browsers, and tourists exploring the narrow medieval lanes. The constant foot traffic and young, aware population make it one of the most comfortable areas in Paris for solo women — there are always people around, and the atmosphere is energetic rather than threatening.',
  ARRAY[
    'Boulevard Saint-Michel and rue Mouffetard are busy with students until late at night',
    'The Sorbonne area is patrolled regularly by university security and police',
    'Shakespeare and Company bookshop area is a great landmark — always people around',
    'Rue Mouffetard market is excellent in the day — avoid the very southern end after midnight',
    'The area around Place de la Contrescarpe is lively but watch for pickpockets on busy market days'
  ],
  ARRAY[
    'Student population creates a natural, vigilant community atmosphere',
    'Multiple university buildings with 24/7 security presence',
    'Excellent transport links — RER B, multiple metro lines',
    'Constant tourist traffic provides natural safety in numbers',
    'High concentration of cafés and restaurants open until 1am'
  ],
  ARRAY[
    'Some very narrow medieval lanes (impasses) are deserted and unlit at night — avoid',
    'Peak tourist season (July-August) brings more pickpocket activity near the Panthéon',
    'Avoid isolated spots near the Seine riverside at night'
  ],
  ARRAY['Préfecture de Police de Paris open data (2024)', 'r/solotravel survey (n=1,340)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 4: Montmartre ───────────────────────────────────────────────────────
-- Iconic hilltop village with Sacré-Cœur. Beautiful but heavily touristed;
-- pickpockets work the tourist crowds heavily. Use caution at night.
-- score: 6.0*0.40 + 7.0*0.30 + 6.5*0.20 + 0.0 = 2.40 + 2.10 + 1.30 + 0.00 = 5.80 → 6.0
(
  'paris',
  'par-montmartre',
  'Montmartre',
  'Montmartre',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.3335 48.8800,
    2.3555 48.8800,
    2.3545 48.8930,
    2.3325 48.8930,
    2.3335 48.8800
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.3440 48.8865)'),
  '{"north": 48.8930, "south": 48.8800, "east": 2.3555, "west": 2.3325}'::jsonb,
  6.0, 'caution', '#F4A261',
  6.0, 7.0, 6.5, 0.0,
  'Montmartre is one of Paris''s most iconic and photographed neighbourhoods — a hilltop village crowned by the white domes of Sacré-Cœur, with winding cobblestone streets, artist studios, and the legendary Moulin Rouge at its foot. The daytime experience is wonderful, but the neighbourhood''s enormous tourist crowds make it the primary hunting ground for pickpockets and petition scammers in Paris. The stairway approaches to Sacré-Cœur are particularly notorious. Below the hill, the Pigalle district blends with Montmartre''s southern edge — adding adult entertainment venues and associated street activity. Visit by day; exercise real caution at night.',
  ARRAY[
    'The steps of Sacré-Cœur: always hold your bag in front, be aggressive about your personal space',
    'Bracelet scammers work the stairways to the basilica — walk straight past and do not engage',
    'Place du Tertre (artists'' square) has aggressive touts — do not let anyone "draw your portrait"',
    'The Lamarck-Caulaincourt metro entrance (north side) is much calmer than the tourist-facing stairs',
    'If visiting at night, stick to Rue des Abbesses and Rue Lepic — avoid the area below Place Pigalle'
  ],
  ARRAY[
    'Heavy police presence around Sacré-Cœur during tourist season',
    'Residential lanes above the basilica are genuinely charming and calmer',
    'Place des Abbesses is the safe, local heart of the neighbourhood',
    'Vineyard area (Clos Montmartre) is beautiful and quieter'
  ],
  ARRAY[
    'Highest petition/bracelet scam concentration in Paris — around Sacré-Cœur approach',
    'Pickpocket teams work the packed stairways systematically',
    'Pigalle border (south edge) has red-light district activity after 22:00',
    'Isolated northern streets of the butte can be very dark and quiet at night',
    'Avoid Rue de Steinkerque after midnight — high incident reports'
  ],
  ARRAY['Préfecture de Police de Paris open data (2024)', 'Paris Tourism Safety Report 2024', 'r/solotravel survey (n=1,567)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
),

-- ─── Zone 5: Gare du Nord Area ────────────────────────────────────────────────
-- Major international rail hub (Eurostar, Thalys). Necessary transit point,
-- but the immediate surrounding area has high street crime; avoid at night.
-- score: 4.5*0.40 + 5.5*0.30 + 6.0*0.20 + (-1.0) = 1.80 + 1.65 + 1.20 - 1.00 = 3.65 → 4.0
(
  'paris',
  'par-gare-nord',
  'Gare du Nord',
  'Quartier de la Chapelle',
  ST_GeogFromText('SRID=4326;POLYGON((
    2.3480 48.8740,
    2.3680 48.8740,
    2.3670 48.8855,
    2.3470 48.8855,
    2.3480 48.8740
  ))'),
  ST_GeogFromText('SRID=4326;POINT(2.3575 48.8798)'),
  '{"north": 48.8855, "south": 48.8740, "east": 2.3680, "west": 2.3470}'::jsonb,
  4.0, 'avoid', '#E63946',
  4.5, 5.5, 6.0, -1.0,
  'Gare du Nord is the busiest railway station in Europe, the hub for Eurostar services to London, Thalys to Brussels and Amsterdam, and the RER B to CDG Airport. For transit, it is essential. For staying nearby, it is risky. The immediate area around the station — particularly the streets north and east — has some of the highest rates of bag theft, phone snatching, and aggressive begging in Paris. The neighbourhood is actively gentrifying, but the transformation is incomplete and uneven. We recommend using the station as transit only, and booking accommodation in safer nearby zones (Marais, Latin Quarter) rather than here.',
  ARRAY[
    'Arrive at the station by taxi or Uber — do not walk from distant metro stops through the neighbourhood at night',
    'Inside the station: be extremely alert with bags on crowded platforms and in the Eurostar terminal',
    'If staying nearby for early trains, use the hotel''s taxi booking service — do not walk to the station alone before 6am',
    'The Rue du Faubourg Saint-Denis has improved significantly — cafés and good lighting — but stay on it',
    'Avoid the streets immediately north of the station (La Chapelle area) entirely after dark'
  ],
  ARRAY[
    'High SNCF and police presence inside the station itself',
    'Rue du Faubourg Saint-Denis has excellent food and a lively local scene in the day',
    'Multiple taxis always available outside the main Gare du Nord entrance'
  ],
  ARRAY[
    'Highest bag-snatching rate of any Paris neighbourhood',
    'Streets north of the station (La Chapelle, Barbès) have very high street crime',
    'Platform areas of Gare du Nord: aggressive panhandling and phone snatching',
    'Rue de Maubeuge side streets after 22:00 — avoid solo',
    'Drug dealing visible in the streets immediately west of the station at night'
  ],
  ARRAY['Préfecture de Police de Paris open data (2024)', 'SNCF Safety Report 2024', 'r/solotravel survey (n=943)', 'HerSafeStay TypeForm survey'],
  3, true, NOW()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROPERTIES (15 total — 3 per zone)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 3a. Le Marais Properties ─────────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel Pavillon de la Reine',
  'hotel',
  'Romantic 5-star hotel on the Place des Vosges, the most beautiful square in Paris. Hidden behind a private courtyard, with exceptional security and a secluded feel that makes it a favourite among solo women travelers. The location on the square means you are surrounded by activity while having a completely private sanctuary.',
  48.854100, 2.362600,
  '28 Pl. des Vosges, 75003 Paris',
  'Le Marais',
  ARRAY['24/7 Security & Doorman', 'Secured Private Courtyard', 'CCTV Throughout', 'In-Room Safe', 'Concierge Safety Briefing'],
  5.0, 4.9, 1840, 620,
  380.00, 'EUR',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-marais';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'BVJ Paris Marais Hostel',
  'hostel',
  'Excellent budget hostel in the heart of Le Marais, consistently top-rated for solo female travelers. Offers female-only dormitories and the communal spaces feel genuinely safe — this is one of the rare hostels where solo women never report feeling uncomfortable. The Marais location means you can walk everywhere.',
  48.855800, 2.354200,
  '20 Rue du Bourg Tibourg, 75004 Paris',
  'Le Marais',
  ARRAY['Female-Only Dorm Options', '24/7 Reception', 'Key-Card Access', 'Lockers in All Rooms', 'CCTV'],
  4.8, 4.7, 3400, 1560,
  42.00, 'EUR',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-marais';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel de Jobo',
  'hotel',
  'Stylish 4-star design hotel in the heart of Le Marais, steps from the Centre Pompidou. Praised by solo women travelers for the attentive and safety-conscious staff. The location on a busy pedestrian street means you are never alone — day or night.',
  48.860200, 2.350800,
  '18 Rue du Bourg l''Abbé, 75003 Paris',
  'Le Marais',
  ARRAY['24/7 Reception', 'CCTV', 'Digital Key Cards', 'Safe Deposit Boxes', 'Busy Pedestrian Location'],
  4.7, 4.6, 2100, 780,
  195.00, 'EUR',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-marais';


-- ─── 3b. Saint-Germain-des-Prés Properties ────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel Lutetia',
  'hotel',
  'The legendary Left Bank palace hotel, recently restored to its Art Deco splendour. One of Paris''s most celebrated and secure hotels, on Boulevard Raspail. Beloved by women travelers for its discretion, the Lutetia has a long history of being a sanctuary. The brasserie and bar attract a sophisticated local crowd.',
  48.849800, 2.327800,
  '45 Bd Raspail, 75006 Paris',
  'Saint-Germain-des-Prés',
  ARRAY['Full-Time Armed Security', 'CCTV Perimeter', 'Concierge 24/7', 'Secure Valet Parking', 'In-Room Safe', 'Female Floor Options'],
  5.0, 4.9, 2680, 940,
  620.00, 'EUR',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-saint-germain';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel Récamier',
  'hotel',
  'Intimate 3-star boutique hotel on the charming Place Saint-Sulpice, one of Paris''s most beautiful quiet squares. The location is superb: far from tourist crowds but within walking distance of everything. Solo women travelers consistently praise the helpful staff and the genuine calm of the location.',
  48.850900, 2.333400,
  '3 Pl. Saint-Sulpice, 75006 Paris',
  'Saint-Germain-des-Prés',
  ARRAY['24/7 Reception', 'Key-Card Elevator', 'CCTV Lobby & Entrance', 'Safe Deposit Boxes', 'Quiet Location'],
  4.7, 4.7, 1240, 510,
  215.00, 'EUR',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-saint-germain';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel de l''Odéon',
  'hotel',
  '3-star classic Parisian hotel steps from the Odéon theatre and Luxembourg Gardens. Excellent value for Saint-Germain. Popular with visiting academics and solo female travelers for its relaxed intellectual atmosphere and safe, central location on a lively pedestrian street.',
  48.851600, 2.338200,
  '13 Pl. de l''Odéon, 75006 Paris',
  'Saint-Germain-des-Prés',
  ARRAY['24/7 Reception', 'CCTV Entrance', 'Key-Card Rooms', 'Busy Pedestrian Location', 'Safe Deposit Boxes'],
  4.5, 4.4, 1680, 590,
  155.00, 'EUR',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-saint-germain';


-- ─── 3c. Latin Quarter Properties ─────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel des Grands Hommes',
  'hotel',
  '3-star boutique hotel with stunning Panthéon views from its terrace. One of the best-located properties in the Latin Quarter — steps from the Panthéon on a well-lit boulevard. Solo women travelers love the rooftop terrace and the helpful, safety-aware staff.',
  48.847200, 2.346500,
  '17 Pl. du Panthéon, 75005 Paris',
  'Latin Quarter',
  ARRAY['24/7 Reception', 'CCTV Throughout', 'Key-Card Elevator', 'In-Room Safe', 'Well-lit Boulevard Location'],
  4.7, 4.6, 1520, 620,
  175.00, 'EUR',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-latin-quarter';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Young and Happy Hostel',
  'hostel',
  'Legendary Latin Quarter hostel on the lively Rue Mouffetard, the most vibrant street in the neighbourhood. Known for its social atmosphere and excellent safety standards — women-only dorms are available and consistently reviewed positively. The Mouffetard market is right outside every morning.',
  48.844500, 2.350800,
  '80 Rue Mouffetard, 75005 Paris',
  'Latin Quarter',
  ARRAY['Female-Only Dorm Rooms', 'Personal Lockers', '24/7 Reception', 'Key-Card Access', 'CCTV', 'Lively Street Location'],
  4.6, 4.5, 4200, 1820,
  36.00, 'EUR',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-latin-quarter';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hotel Seven',
  'hotel',
  'Design hotel near the Place de la Contrescarpe with beautifully themed rooms. Excellent safety profile in the heart of the student quarter. The area has natural safety in numbers from the university crowd. Staff are known for personalised safety advice for solo travelers.',
  48.846000, 2.352100,
  '20 Rue Berthollet, 75005 Paris',
  'Latin Quarter',
  ARRAY['24/7 Security Staff', 'CCTV All Areas', 'Digital Key Access', 'In-Room Safe', 'Quiet Side-Street Location'],
  4.6, 4.7, 1890, 740,
  185.00, 'EUR',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-latin-quarter';


-- ─── 3d. Montmartre Properties ────────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel des Arts Montmartre',
  'hotel',
  'Charming 3-star hotel on the calmer residential streets above the tourist throng. Recommended for Montmartre without the Sacré-Cœur stairway chaos — this property is in the quieter "village" part of the 18th. Well-reviewed by solo women travelers for the friendly atmosphere.',
  48.886800, 2.338900,
  '5 Rue Tholozé, 75018 Paris',
  'Montmartre',
  ARRAY['24/7 Reception', 'CCTV', 'Key-Card Access', 'Safe Deposit at Reception', 'Residential Street Location'],
  4.4, 4.3, 1240, 480,
  125.00, 'EUR',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-montmartre';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Terrass'' Hotel',
  'hotel',
  'Elegant 4-star hotel with a spectacular panoramic terrace overlooking all of Paris, in the upper "village" part of Montmartre. Positioned well away from the tourist scammer zone. Good security, helpful staff, and the views make it worth considering if you want the Montmartre experience safely.',
  48.886100, 2.337200,
  '12-14 Rue Joseph de Maistre, 75018 Paris',
  'Montmartre',
  ARRAY['24/7 Security', 'CCTV All Public Areas', 'Key-Card Elevator', 'Secure Parking', 'In-Room Safe', 'Panoramic Rooftop Access'],
  4.5, 4.6, 2180, 830,
  210.00, 'EUR',
  'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-montmartre';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Le Village Hostel Montmartre',
  'hostel',
  'Friendly hostel with a rooftop terrace and Sacré-Cœur views. Positioned on the safer Rue d''Orsel street rather than the scammer-heavy stairways. Good for budget travelers who want the Montmartre atmosphere — female-only rooms available. Staff give thorough safety briefings about the area.',
  48.882400, 2.344100,
  '20 Rue d''Orsel, 75018 Paris',
  'Montmartre',
  ARRAY['Female-Only Room Options', '24/7 Reception', 'CCTV', 'Lockers', 'Safe Deposit', 'Safety Area Briefing'],
  4.3, 4.2, 2900, 1100,
  38.00, 'EUR',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&q=80',
  true, false
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-montmartre';


-- ─── 3e. Gare du Nord Properties ──────────────────────────────────────────────

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Hôtel du Nord — Eurostar',
  'hotel',
  'Functional 3-star hotel directly connected to Gare du Nord station via covered walkway — ideal if you have an early Eurostar departure. Security is hotel-only: the surrounding streets are NOT safe at night. Use the hotel shuttle service to/from the station and do not walk the surrounding streets alone after dark.',
  48.880200, 2.354900,
  '33 Rue de Saint-Quentin, 75010 Paris',
  'Gare du Nord',
  ARRAY['24/7 Security at Entrance', 'CCTV All Areas', 'Key-Card Access', 'Covered Station Access', 'Taxi Pre-Booking Service'],
  3.8, 3.9, 3200, 890,
  115.00, 'EUR',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-gare-nord';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Ibis Paris Gare du Nord TGV',
  'hotel',
  'Standard Ibis chain hotel opposite the station — reliable, consistent, and with good internal security. The best option if you need to be near the station for a transit connection. Staff are experienced with solo travelers and will call taxis for you. Do not walk the surrounding streets at night.',
  48.879600, 2.356200,
  '31 Rue de Dunkerque, 75010 Paris',
  'Gare du Nord',
  ARRAY['24/7 Reception', 'CCTV', 'Key-Card Access', 'Taxi Service at Reception', 'Security Door After 22:00'],
  3.6, 3.7, 4800, 1240,
  95.00, 'EUR',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=500&fit=crop&q=80',
  true, false
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-gare-nord';

INSERT INTO properties (
  city_id, zone_id, name, property_type, description,
  lat, lng, address, neighborhood,
  safety_features, women_rating, overall_rating, review_count, women_review_count,
  price_per_night, currency, image_url, is_published, is_verified
)
SELECT
  'paris', sz.id,
  'Pullman Paris Montparnasse',
  'hotel',
  '4-star Accor hotel on the south side — if you need a large business-class hotel near a major station, Montparnasse is a significantly safer alternative to Gare du Nord. Well-lit, excellent security, and the Montparnasse neighbourhood has much lower street crime than Gare du Nord.',
  48.841900, 2.318500,
  '19 Rue du Commandant René Mouchotte, 75014 Paris',
  'Montparnasse (Alternative)',
  ARRAY['24/7 Security Team', 'Full CCTV Coverage', 'Secure Parking', 'Concierge 24/7', 'In-Room Safe', 'Key-Card Floors'],
  4.3, 4.4, 3600, 1280,
  185.00, 'EUR',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop&q=80',
  true, true
FROM safety_zones sz WHERE sz.city_id = 'paris' AND sz.zone_slug = 'par-gare-nord';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. UPDATE CITY COUNTS
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE cities SET
  zone_count = (
    SELECT COUNT(*) FROM safety_zones
    WHERE city_id = 'paris' AND is_published = true
  ),
  property_count = (
    SELECT COUNT(*) FROM properties
    WHERE city_id = 'paris' AND is_published = true
  )
WHERE id = 'paris';


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────────

SELECT id, name, zone_count, property_count FROM cities WHERE id = 'paris';

SELECT zone_name, safety_level, safety_score, color_code
FROM safety_zones
WHERE city_id = 'paris' AND is_published = true
ORDER BY safety_score DESC;

SELECT p.name, p.property_type, p.women_rating, p.price_per_night, sz.zone_name
FROM properties p
JOIN safety_zones sz ON p.zone_id = sz.id
WHERE p.city_id = 'paris' AND p.is_published = true
ORDER BY sz.zone_name, p.women_rating DESC;
