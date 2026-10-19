// Shown by Suspense while a lazy-loaded chunk is being fetched
export default function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#2c1a0e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid #6b3d1e',
        borderTopColor: '#c8813a',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ color: '#a07850', fontSize: '14px', margin: 0 }}>Loading page...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
