import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../components/api';
import { C } from '../theme';

export default function ProfilePage({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const json = await getMe();
        if (json.success) {
          setUser(json.user);
        } else {
          setError(json.error || 'Failed to load profile.');
        }
      } catch {
        setError('Network error. Is the backend running on port 5000?');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <button onClick={() => navigate('/tasks')} style={{
            background: 'none', border: 'none', color: C.accent,
            cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: 0,
          }}>
            Back to Tasks
          </button>
          <button onClick={onLogout} style={{
            padding: '7px 14px', background: 'transparent', color: C.textMuted,
            border: `1px solid ${C.rowBorder}`, borderRadius: '6px',
            cursor: 'pointer', fontSize: '13px',
          }}>
            Logout
          </button>
        </div>

        <h1 style={{ color: C.text, fontSize: '22px', fontWeight: '700', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          My Profile
        </h1>

        {isLoading && <p style={{ color: C.textMuted }}>Loading profile...</p>}

        {error && (
          <div style={{ background: C.errorBg, color: C.errorText, padding: '10px 14px', borderRadius: '6px', fontSize: '14px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {user && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.rowBorder}`, borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: C.accent, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '28px', color: '#fff', fontWeight: '700',
              }}>
                {user.email[0].toUpperCase()}
              </div>
            </div>

            <Field label="Email" value={user.email} />
            <Field label="Account ID" value={user._id} mono />
            <Field label="Member since" value={new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p style={{ color: C.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: C.text, fontSize: '15px', margin: 0, fontFamily: mono ? 'monospace' : 'sans-serif', wordBreak: 'break-all' }}>{value}</p>
    </div>
  );
}
