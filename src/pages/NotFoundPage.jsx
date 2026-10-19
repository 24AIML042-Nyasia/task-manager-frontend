import { useNavigate } from 'react-router-dom';
import { C } from '../theme';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', gap: '16px',
    }}>
      <h1 style={{ color: C.accent, fontSize: '72px', margin: 0, fontFamily: 'Georgia, serif' }}>404</h1>
      <p style={{ color: C.text, fontSize: '18px', margin: 0 }}>Page not found</p>
      <button onClick={() => navigate('/tasks')} style={{
        marginTop: '8px', padding: '10px 22px', background: C.accent,
        color: '#fff', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontSize: '15px', fontWeight: '600',
      }}>
        Go to Tasks
      </button>
    </div>
  );
}
