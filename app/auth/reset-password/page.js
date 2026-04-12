'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setMessage('Check your email for the password reset link!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF4E8 40%, #F0FBF9 70%, #E8F6F4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-crimson-pro), Georgia, serif',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #FFE8D6',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <svg viewBox="0 0 32 42" width="40" height="52" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M16,0 C7.163,0 0,7.163 0,16 C0,28 16,42 16,42 C16,42 32,28 32,16 C32,7.163 24.837,0 16,0 Z" fill="#FF6B6B"/>
              <path d="M16,7 C19,6 22,7.5 22,10 L22,20 Q22,26 16,27 Q10,26 10,20 L10,10 C10,7.5 13,6 16,7 Z" fill="#FFF8F0"/>
            </svg>
          </a>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2B2D42', margin: '0 0 6px' }}>
            Reset Password
          </h1>
          <p style={{ color: '#2D6A4F', fontSize: '15px', margin: 0 }}>
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {message && (
          <div style={{
            background: '#e5f5ea',
            border: '1px solid #a8d5ba',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#2D6A4F',
            fontSize: '14px',
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff0f0',
            border: '1px solid #ffb3b3',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#c0392b',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2B2D42', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ffb3a7' : 'linear-gradient(135deg, #FF6B6B, #e85555)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-crimson-pro), Georgia, serif',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          <Link href="/auth/login" style={{ color: '#2D6A4F', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #FFE8D6',
  borderRadius: '8px',
  fontSize: '15px',
  color: '#2B2D42',
  background: '#FFFDF9',
  outline: 'none',
  fontFamily: 'var(--font-crimson-pro), Georgia, serif',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
