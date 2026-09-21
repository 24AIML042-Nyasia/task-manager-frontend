import { useState, useEffect } from 'react';
import { registerUser, loginUser, forgotPassword, resetPassword } from './api';

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
  successBg:   '#0a2010',
  successText: '#70c080',
  rowBorder:   '#6b3d1e',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: `1px solid ${C.inputBorder}`,
  background: C.inputBg,
  color: C.text,
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  color: C.textMuted,
  fontSize: '13px',
  marginBottom: '5px',
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: C.accent,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  padding: 0,
};

// ── eye icons as inline SVG ───────────────────────────────────────────────────
function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ── reusable password input with toggle ───────────────────────────────────────
function PasswordInput({ value, onChange, placeholder = 'Minimum 6 characters' }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        style={{ ...inputStyle, paddingRight: '42px' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        title={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '12px', top: '50%',
          transform: 'translateY(-50%)', background: 'none',
          border: 'none', cursor: 'pointer', color: C.textMuted,
          display: 'flex', alignItems: 'center', padding: 0,
        }}
      >
        {show ? <EyeOff /> : <EyeOpen />}
      </button>
    </div>
  );
}

export default function AuthForm({ onAuth }) {
  // mode: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check URL for reset token on mount e.g. /reset-password/<token>
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/reset-password\/([a-f0-9]+)/);
    if (match) {
      setResetToken(match[1]);
      setMode('reset');
    }
  }, []);

  const reset = () => {
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
  };

  const switchMode = (next) => { reset(); setMode(next); };

  // ── login / register ────────────────────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const json = mode === 'login'
        ? await loginUser(email, password)
        : await registerUser(email, password);
      if (json.success) {
        localStorage.setItem('token', json.token);
        onAuth(json.token, json.user);
      } else {
        setError(json.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Is the backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  // ── forgot password ─────────────────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const json = await forgotPassword(email);
      if (json.success) {
        setSuccess('Reset link sent. Check your inbox (and spam folder).');
      } else {
        setError(json.error || 'Failed to send reset email.');
      }
    } catch {
      setError('Network error. Is the backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  // ── reset password ──────────────────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const json = await resetPassword(resetToken, password);
      if (json.success) {
        setSuccess('Password reset! You can now sign in.');
        // Clear the token from URL and switch to login after a moment
        window.history.replaceState({}, '', '/');
        setTimeout(() => switchMode('login'), 2000);
      } else {
        setError(json.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Is the backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  // ── shared card wrapper ─────────────────────────────────────────────────────
  const subtitle = {
    login:    'Sign in to your account',
    register: 'Create a new account',
    forgot:   'Enter your email to receive a reset link',
    reset:    'Enter your new password',
  }[mode];

  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', padding: '16px',
    }}>
      <div style={{
        background: C.cardBg, border: `1px solid ${C.rowBorder}`,
        borderRadius: '10px', padding: '36px 32px', width: '100%', maxWidth: '400px',
      }}>
        <h1 style={{ textAlign: 'center', color: C.text, fontSize: '22px', fontFamily: 'Georgia, serif', marginBottom: '6px' }}>
          Task Manager
        </h1>
        <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '14px', marginBottom: '28px' }}>
          {subtitle}
        </p>

        {/* Error banner */}
        {error && (
          <div style={{ background: C.errorBg, color: C.errorText, padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div style={{ background: C.successBg, color: C.successText, padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        {/* LOGIN / REGISTER */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={isLoading} style={{
              marginTop: '4px', padding: '11px', background: C.accent, color: '#fff',
              border: 'none', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: '600', opacity: isLoading ? 0.7 : 1,
            }}>
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inputStyle} />
            </div>
            <button type="submit" disabled={isLoading} style={{
              marginTop: '4px', padding: '11px', background: C.accent, color: '#fff',
              border: 'none', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: '600', opacity: isLoading ? 0.7 : 1,
            }}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={isLoading} style={{
              marginTop: '4px', padding: '11px', background: C.accent, color: '#fff',
              border: 'none', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: '600', opacity: isLoading ? 0.7 : 1,
            }}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: C.textMuted, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mode === 'login' && (
            <>
              <p style={{ margin: 0 }}>
                Don't have an account?{' '}
                <button onClick={() => switchMode('register')} style={linkBtnStyle}>Register</button>
              </p>
              <p style={{ margin: 0 }}>
                <button onClick={() => switchMode('forgot')} style={{ ...linkBtnStyle, fontSize: '13px', color: C.textMuted }}>
                  Forgot password?
                </button>
              </p>
            </>
          )}
          {mode === 'register' && (
            <p style={{ margin: 0 }}>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} style={linkBtnStyle}>Sign In</button>
            </p>
          )}
          {mode === 'forgot' && (
            <p style={{ margin: 0 }}>
              <button onClick={() => switchMode('login')} style={linkBtnStyle}>Back to Sign In</button>
            </p>
          )}
          {mode === 'reset' && (
            <p style={{ margin: 0 }}>
              <button onClick={() => { window.history.replaceState({}, '', '/'); switchMode('login'); }} style={linkBtnStyle}>
                Back to Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
