'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const signingOut = useRef(false);

  useEffect(() => {
    if (!authLoading && !user && !signingOut.current) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    console.log('[ProfilePage] Sign out button clicked');
    signingOut.current = true;
    try {
      await signOut();
      console.log('[ProfilePage] signOut() resolved — redirecting to /');
    } catch (err) {
      console.error('[ProfilePage] signOut() error:', err);
      signingOut.current = false;
      return;
    }
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 40%, #F0FBF9 70%, #E8F6F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-crimson-pro), Georgia, serif',
        color: '#2D6A4F',
        fontSize: '18px',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 40%, #F0FBF9 70%, #E8F6F4 100%)',
      padding: '40px 24px',
      fontFamily: 'var(--font-crimson-pro), Georgia, serif',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back nav */}
        <Link href="/map" style={{ color: '#2D6A4F', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
          ← Back to Map
        </Link>

        {/* Profile card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #FFE8D6',
          marginBottom: '16px',
        }}>
          {/* Avatar placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B6B, #2D6A4F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: '700',
              flexShrink: 0,
            }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2B2D42', margin: '0 0 4px' }}>
                {profile?.name || 'Traveler'}
              </h1>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{user.email}</p>
            </div>
          </div>

          {profile?.bio && (
            <p style={{ color: '#444', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              {profile.bio}
            </p>
          )}

          {profile?.home_city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#2D6A4F', fontSize: '14px' }}>
              <span>📍</span>
              <span>{profile.home_city}</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #FFE8D6', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/profile/saved" style={actionLinkStyle}>
              🔖 Saved Properties
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: '1.5px solid #FFE8D6',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#c0392b',
                fontSize: '15px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-crimson-pro), Georgia, serif',
                transition: 'background 0.2s',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const actionLinkStyle = {
  display: 'block',
  padding: '12px 16px',
  background: '#FFFDF9',
  border: '1.5px solid #FFE8D6',
  borderRadius: '8px',
  color: '#2B2D42',
  textDecoration: 'none',
  fontSize: '15px',
  transition: 'border-color 0.2s',
};
