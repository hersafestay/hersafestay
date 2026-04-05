import MapPageClient from './MapPageClient';

export const metadata = {
  title: 'Barcelona Safety Map | HerSafeStay',
  description: 'Interactive safety map for women travelers in Barcelona. Color-coded neighborhoods with safety scores, tips, and local insights.',
};

// Server Component: exports metadata, renders Client Component for the map
// Note: dynamic import with ssr:false must live in the Client Component (MapPageClient)
export default function MapPage() {
  return <MapPageClient />;
}
