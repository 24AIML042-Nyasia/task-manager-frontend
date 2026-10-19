import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoadingFallback from './components/LoadingFallback';

// ── Minimum delay helper ──────────────────────────────────────────────────────
// Ensures the fallback is shown for at least 300ms on fast connections,
// preventing a flickering loading state that appears and vanishes instantly.
function withMinDelay(importFn, ms = 300) {
  return () =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([module]) => module);
}

// ── Lazy-loaded route chunks ──────────────────────────────────────────────────
// Each import() becomes a separate JS chunk downloaded only when that route is visited
const TasksPage    = lazy(withMinDelay(() => import('./pages/TasksPage')));
const ProfilePage  = lazy(withMinDelay(() => import('./pages/ProfilePage')));
const NotFoundPage = lazy(withMinDelay(() => import('./pages/NotFoundPage')));

// ── Supplementary: AuthForm is the largest non-route component (~25 kB) ───────
// Lazy loading it means logged-in users never download the auth form code.
const AuthForm = lazy(withMinDelay(() => import('./components/AuthForm')));

// ── Decode user from stored JWT without an extra API call ─────────────────────
function getUserFromToken(t) {
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    return { email: payload.email, id: payload.id };
  } catch {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(() =>
    getUserFromToken(localStorage.getItem('token'))
  );

  const handleAuth = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    // Suspense at the top level covers both the auth form and all route chunks.
    // The fallback spinner shows whenever any lazy chunk is being downloaded.
    <Suspense fallback={<LoadingFallback />}>
      {!token ? (
        // Not logged in: only the AuthForm chunk is downloaded
        <AuthForm onAuth={handleAuth} />
      ) : (
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Default redirect from / to /tasks */}
              <Route path="/" element={<Navigate to="/tasks" replace />} />

              {/* Lazy-loaded route 1: main task list */}
              <Route
                path="/tasks"
                element={<TasksPage currentUser={currentUser} onLogout={handleLogout} />}
              />

              {/* Lazy-loaded route 2: user profile */}
              <Route
                path="/profile"
                element={<ProfilePage onLogout={handleLogout} />}
              />

              {/* Lazy-loaded route 3: 404 catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </Suspense>
  );
}
