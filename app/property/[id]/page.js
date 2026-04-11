import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getPropertyById, getNearbyProperties } from '@/lib/database';
import PropertyDetailView from '@/components/property/PropertyDetailView';

// ISR: revalidate every hour so property data stays fresh
export const revalidate = 3600;

// Pre-generate paths for all published properties
export async function generateStaticParams() {
  const { data } = await supabase
    .from('properties')
    .select('id')
    .eq('is_published', true);

  return (data ?? []).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return { title: 'Property Not Found | HerSafeStay' };
  }

  const cityName  = property.city?.name         ?? '';
  const zoneName  = property.zone?.zone_name     ?? '';
  const score     = property.zone?.safety_score;
  const typeCap   = property.property_type
    ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
    : 'Property';

  const description = property.description
    ? property.description.slice(0, 155)
    : `Safe ${property.property_type} in ${zoneName}, ${cityName}. Women's safety score: ${score ?? '—'}/10. Verified safe for solo female travellers.`;

  return {
    title: `${property.name} — Safe ${typeCap} in ${cityName} | HerSafeStay`,
    description,
    openGraph: {
      title: property.name,
      description: `Safety Score: ${score ?? '—'}/10 · ${zoneName}, ${cityName}`,
      ...(property.image_url ? { images: [property.image_url] } : {}),
    },
  };
}

export default async function PropertyPage({ params }) {
  const { id } = await params;

  const property = await getPropertyById(id);
  if (!property) notFound();

  const nearby = await getNearbyProperties(id, property.city_id);

  return <PropertyDetailView property={property} nearbyProperties={nearby} />;
}
