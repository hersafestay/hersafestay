#!/usr/bin/env node
/**
 * distribute-properties.js
 *
 * Generates well-distributed property coordinates inside zone polygons.
 * Uses a point-in-polygon ray-casting algorithm and enforces minimum spacing.
 *
 * Usage:
 *   node scripts/distribute-properties.js
 *
 * Output:
 *   Prints SQL UPDATE statements for each property → pipe to a file or paste into Supabase.
 */

// ─── Point-in-Polygon (Ray Casting) ─────────────────────────────────────────

function isPointInPolygon(point, polygon) {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}

// ─── Random Point Inside Polygon ─────────────────────────────────────────────

function generatePointInPolygon(polygon) {
  const lngs = polygon.map(p => p[0])
  const lats = polygon.map(p => p[1])
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  let attempts = 0
  while (attempts < 1000) {
    const lng = minLng + Math.random() * (maxLng - minLng)
    const lat = minLat + Math.random() * (maxLat - minLat)

    if (isPointInPolygon([lng, lat], polygon)) {
      return { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
    }
    attempts++
  }

  // Fallback to centroid
  return {
    lat: +((minLat + maxLat) / 2).toFixed(6),
    lng: +((minLng + maxLng) / 2).toFixed(6),
  }
}

// ─── Distribute N Properties with Minimum Spacing ────────────────────────────

function distributeProperties(polygon, count, minDistance = 0.002) {
  const points = []

  for (let i = 0; i < count; i++) {
    let point
    let attempts = 0

    do {
      point = generatePointInPolygon(polygon)
      attempts++

      const tooClose = points.some(p => {
        const dist = Math.sqrt(
          Math.pow(p.lat - point.lat, 2) +
          Math.pow(p.lng - point.lng, 2)
        )
        return dist < minDistance
      })

      if (!tooClose || attempts > 200) break
    } while (true)

    points.push(point)
  }

  return points
}

// ─── Verify Point Inside Zone ─────────────────────────────────────────────────

function verifyAllInsideZone(points, polygon, zoneName) {
  let allInside = true
  points.forEach((p, i) => {
    const inside = isPointInPolygon([p.lng, p.lat], polygon)
    if (!inside) {
      console.error(`  ✗ Point ${i + 1} [${p.lat}, ${p.lng}] is OUTSIDE ${zoneName}`)
      allInside = false
    }
  })
  return allInside
}

// ─── Zone Definitions ─────────────────────────────────────────────────────────
// Polygon coordinates: [lng, lat] pairs (GeoJSON order, matching the DB)

const ZONES = {
  // Barcelona
  'bcn-eixample': {
    city: 'barcelona',
    name: 'Eixample',
    polygon: [
      [2.1485, 41.3825], [2.1785, 41.3825],
      [2.1760, 41.4010], [2.1490, 41.4010],
      [2.1485, 41.3825],
    ],
  },
  'bcn-gracia': {
    city: 'barcelona',
    name: 'Gràcia',
    polygon: [
      [2.1505, 41.3990], [2.1680, 41.3990],
      [2.1660, 41.4120], [2.1475, 41.4120],
      [2.1505, 41.3990],
    ],
  },
  'bcn-gothic-quarter': {
    city: 'barcelona',
    name: 'Gothic Quarter',
    polygon: [
      [2.1710, 41.3780], [2.1835, 41.3780],
      [2.1820, 41.3875], [2.1700, 41.3875],
      [2.1710, 41.3780],
    ],
  },
  'bcn-raval': {
    city: 'barcelona',
    name: 'El Raval',
    polygon: [
      [2.1610, 41.3760], [2.1730, 41.3760],
      [2.1720, 41.3880], [2.1600, 41.3880],
      [2.1610, 41.3760],
    ],
  },
  'bcn-barceloneta': {
    city: 'barcelona',
    name: 'Barceloneta',
    polygon: [
      [2.1845, 41.3740], [2.1975, 41.3740],
      [2.1965, 41.3830], [2.1850, 41.3830],
      [2.1845, 41.3740],
    ],
  },
  // Paris
  'par-marais': {
    city: 'paris',
    name: 'Le Marais',
    polygon: [
      [2.3480, 48.8498], [2.3630, 48.8498],
      [2.3620, 48.8610], [2.3470, 48.8610],
      [2.3480, 48.8498],
    ],
  },
  'par-saint-germain': {
    city: 'paris',
    name: 'Saint-Germain-des-Prés',
    polygon: [
      [2.3265, 48.8488], [2.3420, 48.8488],
      [2.3410, 48.8585], [2.3255, 48.8585],
      [2.3265, 48.8488],
    ],
  },
  'par-latin-quarter': {
    city: 'paris',
    name: 'Latin Quarter',
    polygon: [
      [2.3430, 48.8432], [2.3590, 48.8432],
      [2.3580, 48.8545], [2.3420, 48.8545],
      [2.3430, 48.8432],
    ],
  },
  'par-montmartre': {
    city: 'paris',
    name: 'Montmartre',
    polygon: [
      [2.3335, 48.8800], [2.3555, 48.8800],
      [2.3545, 48.8930], [2.3325, 48.8930],
      [2.3335, 48.8800],
    ],
  },
  'par-gare-nord': {
    city: 'paris',
    name: 'Gare du Nord',
    polygon: [
      [2.3480, 48.8740], [2.3680, 48.8740],
      [2.3670, 48.8855], [2.3470, 48.8855],
      [2.3480, 48.8740],
    ],
  },
  // Bangkok
  'bkk-sukhumvit': {
    city: 'bangkok',
    name: 'Sukhumvit',
    polygon: [
      [100.5580, 13.7280], [100.5820, 13.7280],
      [100.5800, 13.7540], [100.5560, 13.7540],
      [100.5580, 13.7280],
    ],
  },
  'bkk-silom': {
    city: 'bangkok',
    name: 'Silom',
    polygon: [
      [100.5240, 13.7250], [100.5400, 13.7250],
      [100.5385, 13.7330], [100.5225, 13.7330],
      [100.5240, 13.7250],
    ],
  },
  'bkk-siam': {
    city: 'bangkok',
    name: 'Siam',
    polygon: [
      [100.5280, 13.7420], [100.5420, 13.7420],
      [100.5408, 13.7530], [100.5268, 13.7530],
      [100.5280, 13.7420],
    ],
  },
  'bkk-khao-san': {
    city: 'bangkok',
    name: 'Khao San Road',
    polygon: [
      [100.4920, 13.7560], [100.5040, 13.7560],
      [100.5030, 13.7640], [100.4910, 13.7640],
      [100.4920, 13.7560],
    ],
  },
  'bkk-patpong': {
    city: 'bangkok',
    name: 'Patpong',
    polygon: [
      [100.5250, 13.7190], [100.5330, 13.7190],
      [100.5320, 13.7260], [100.5240, 13.7260],
      [100.5250, 13.7190],
    ],
  },
}

// ─── Main: Generate Coordinates Per Zone ─────────────────────────────────────

console.log('-- distribute-properties.js output')
console.log('-- Generated:', new Date().toISOString())
console.log('-- Minimum spacing: 0.002 degrees (~200m)')
console.log('')

let totalPoints = 0
let zonesProcessed = 0

Object.entries(ZONES).forEach(([slug, zone]) => {
  const count = 3  // Current DB has 3 properties per zone
  const points = distributeProperties(zone.polygon, count)
  const allValid = verifyAllInsideZone(points, zone.polygon, zone.name)

  console.log(`-- ${zone.city.toUpperCase()} / ${zone.name} (${slug})`)
  console.log(`-- Zone valid: ${allValid ? 'YES ✓' : 'NO ✗'}`)

  points.forEach((p, i) => {
    console.log(`-- Property ${i + 1}: lat=${p.lat}, lng=${p.lng}`)
  })
  console.log('')

  totalPoints += count
  zonesProcessed++
})

console.log(`-- Total: ${zonesProcessed} zones, ${totalPoints} properties`)
console.log('-- Use the *_fixed.sql files in supabase/seed/ to apply these coordinates.')
