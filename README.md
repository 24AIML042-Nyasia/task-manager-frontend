# Task Manager Frontend

React + Vite frontend for the full-stack Task Manager app.
Connects to the Express + MongoDB backend at `http://localhost:5000`.

## Requirements

- [Node.js](https://nodejs.org/) v18 or later
- The backend must be running before starting the frontend

## Setup and Run

```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173`.

## Routes

| Path | Page | Lazy loaded |
|------|------|-------------|
| / | Redirects to /tasks | No |
| /tasks | Task list (CRUD) | Yes |
| /profile | User profile | Yes |
| * | 404 Not Found | Yes |

## Usage

1. Open the app and register or log in
2. Create tasks, cycle status with the icon, delete with the button
3. Click Profile to view your account details
4. Click Logout to end your session
5. Forgot password link available on the login screen
6. If your token expires (1 hour), you are redirected to login automatically

## Features

- JWT auth with localStorage persistence
- Email shown on reload without re-logging in (decoded from token)
- Three task sections: Pending, Ongoing, Completed
- Clickable status icons to cycle task state
- Timestamps shown when task enters pending and when completed
- Per-user task isolation (each account sees only its own tasks)
- Password reset via email link
- Route-based code splitting with React.lazy and Suspense
- Animated loading fallback shown while lazy chunks download

## Code Splitting

All route-based pages are lazy loaded using `React.lazy()` and wrapped in `Suspense`:

```jsx
const TasksPage    = lazy(withMinDelay(() => import('./pages/TasksPage')));
const ProfilePage  = lazy(withMinDelay(() => import('./pages/ProfilePage')));
const NotFoundPage = lazy(withMinDelay(() => import('./pages/NotFoundPage')));

// Supplementary: AuthForm lazy loaded so logged-in users never download auth code
const AuthForm = lazy(withMinDelay(() => import('./components/AuthForm')));

<Suspense fallback={<LoadingFallback />}>
  <Routes>
    <Route path="/"        element={<Navigate to="/tasks" replace />} />
    <Route path="/tasks"   element={<TasksPage currentUser={currentUser} onLogout={handleLogout} />} />
    <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />
    <Route path="*"        element={<NotFoundPage />} />
  </Routes>
</Suspense>
```

The `withMinDelay` wrapper ensures the fallback spinner shows for at least 300ms,
preventing a flickering loading state on fast connections.

## Before and After Bundle Comparison

### Before (no code splitting, single bundle)

| File | Size | Gzipped |
|------|------|---------|
| `index.js` | 158.75 kB | 50.21 kB |
| Total JS transferred on load | 158.75 kB | 50.21 kB |

All components (auth form, task list, profile) bundled together and downloaded on every visit.

### After (code splitting applied)

| File | Size | Gzipped | Loaded when |
|------|------|---------|-------------|
| `index.js` | 184.27 kB | 60.77 kB | Always (React + router) |
| `AuthForm.js` | 7.09 kB | 2.26 kB | Login screen only |
| `TasksPage.js` | 6.94 kB | 2.32 kB | /tasks only |
| `ProfilePage.js` | 2.59 kB | 1.14 kB | /profile only |
| `NotFoundPage.js` | 0.75 kB | 0.46 kB | Unknown routes only |
| `theme.js` | 0.83 kB | 0.40 kB | Shared chunk |
| `api.js` | 1.29 kB | 0.41 kB | Shared chunk |

JS downloaded on first visit to /tasks (logged in): 193.33 kB gzipped 63.90 kB.
AuthForm (7.09 kB) and ProfilePage (2.59 kB) never downloaded unless needed.

The main bundle increased due to adding react-router-dom (~26 kB). In larger
real-world apps with many routes, per-route savings far outweigh this overhead.

Full analysis and DevTools verification steps: [docs/performance-metrics.md](./docs/performance-metrics.md)

## Project Structure

```
src/
  App.jsx                  router shell, auth state, lazy imports
  theme.js                 shared colour palette and status helpers
  pages/
    TasksPage.jsx          main task list (lazy loaded)
    ProfilePage.jsx        user profile page (lazy loaded)
    NotFoundPage.jsx       404 page (lazy loaded)
  components/
    api.js                 fetch wrappers for all backend endpoints
    AuthForm.jsx           login, register, forgot and reset password (lazy loaded)
    LoadingFallback.jsx    Suspense fallback spinner
  index.css                base reset and background colour
main.jsx                   app entry point
docs/
  performance-metrics.md   full before/after bundle comparison and analysis
```

## Backend Repo

https://github.com/24AIML042-Nyasia/task-manager-api-24AIML042
