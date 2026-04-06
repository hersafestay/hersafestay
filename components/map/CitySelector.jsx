'use client';

import { useState } from 'react';

const CITIES = [
  { id: 'barcelona', name: 'Barcelona', country: 'Spain',    flag: '🇪🇸' },
  { id: 'paris',     name: 'Paris',     country: 'France',   flag: '🇫🇷' },
  { id: 'bangkok',   name: 'Bangkok',   country: 'Thailand', flag: '🇹🇭' },
];

/**
 * CitySelector — compact pill-style tab selector.
 * Renders inline, intended to sit in the map page header.
 *
 * Props:
 *   currentCity {string}   - active city ID
 *   onCityChange {Function} - called with new city ID
 */
export default function CitySelector({ currentCity, onCityChange }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        background: 'rgba(0,0,0,0.05)',
        borderRadius: '10px',
        padding: '3px',
      }}
      role="tablist"
      aria-label="Select city"
    >
      {CITIES.map(({ id, name, flag }) => {
        const isActive = currentCity === id;
        const isHov = hovered === id;

        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCityChange(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: isActive ? '700' : '500',
              fontFamily: 'var(--font-crimson-pro, Georgia, serif)',
              color: isActive ? '#2B2D42' : '#78716c',
              background: isActive
                ? 'white'
                : isHov
                ? 'rgba(255,255,255,0.5)'
                : 'transparent',
              boxShadow: isActive
                ? '0 1px 4px rgba(0,0,0,0.10)'
                : 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{flag}</span>
            {name}
          </button>
        );
      })}
    </div>
  );
}
