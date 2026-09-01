import { useState } from 'react';
import { registerUser, loginUser } from './api';

// ── same brown palette as App.jsx ─────────────────────────────────────────────
const C = {
  pageBg:      '#2c1a0e',
  cardBg:      '#3d2410',
  inputBg:     '#2c1a0e',
  inputBorder: '#6b3d1e',
  accent:      '#c8813a',
  text:        '#f5e6d3',
  textMuted:   '#a07850',
  errorBg:     '#5c1a1a',
  errorText:   '#ffaaaa',
  rowBorder:   '#6b3d1e',
};

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const json = isLogin
        ? await loginUser(email, password)
        : await registerUser(email, password);

      if (json.success) {
        // Persist token and notify App
        localStorage.setItem('token', json.token);
        onAuth(json.token, json.user);
      } else {
        setError(json.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error. Is the backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '16px',
    }}>
      <div style={{
        background: C.cardBg,
        border: `1px solid ${C.rowBorder}`,
        borderRadius: '10px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{
          textAlign: 'center',
          color: C.text,
          fontSize: '22px',
          fontFamily: 'Georgia, serif',
          marginBottom: '6px',
        }}>
          Task Manager
        </h1>
        <p style={{
          textAlign: 'center',
          color: C.textMuted,
          fontSize: '14px',
          marginBottom: '28px',
        }}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {error && (
          <div style={{
            background: C.errorBg,
            color: C.errorText,
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', color: C.textMuted, fontSize: '13px', marginBottom: '5px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${C.inputBorder}`,
                background: C.inputBg,
                color: C.text,
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: C.textMuted, fontSize: '13px', marginBottom: '5px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${C.inputBorder}`,
                background: C.inputBg,
                color: C.text,
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '4px',
              padding: '11px',
              background: C.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: C.textMuted }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: C.accent,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              padding: 0,
            }}
          >
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
