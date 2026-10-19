# Performance Metrics: Before and After Code Splitting

## Before Optimization

Single bundle, no routing, no lazy loading. All components loaded upfront on every visit.

**Build output (single bundle):**

| File | Size | Gzipped |
|------|------|---------|
| `dist/assets/index.js` | 158.75 kB | 50.21 kB |
| `dist/assets/index.css` | 0.09 kB | 0.10 kB |
| **Total JS** | **158.75 kB** | **50.21 kB** |

**Characteristics:**
- One JavaScript file downloaded on every page load
- AuthForm, TasksPage, ProfilePage all bundled together
- User visits /tasks but still downloads auth form code
- No fallback UI during load

---

## After Optimization

Route-based code splitting using `React.lazy()` and `Suspense`. Each page is a separate chunk downloaded only when that route is visited.

**Build output (code split):**

| File | Size | Gzipped | Loaded when |
|------|------|---------|-------------|
| `dist/assets/index.js` | 184.27 kB | 60.77 kB | Always (React + router) |
| `dist/assets/AuthForm.js` | 7.09 kB | 2.26 kB | Login / register screen only |
| `dist/assets/TasksPage.js` | 6.94 kB | 2.32 kB | /tasks route only |
| `dist/assets/ProfilePage.js` | 2.59 kB | 1.14 kB | /profile route only |
| `dist/assets/NotFoundPage.js` | 0.75 kB | 0.46 kB | Unknown routes only |
| `dist/assets/theme.js` | 0.83 kB | 0.40 kB | Shared, loaded with first route |
| `dist/assets/api.js` | 1.29 kB | 0.41 kB | Shared, loaded with first route |
| `dist/assets/index.css` | 0.09 kB | 0.10 kB | Always |

**On first visit to /tasks (logged in user):**
Downloads: `index.js` + `TasksPage.js` + `theme.js` + `api.js` = 193.33 kB (63.90 kB gzipped)

**AuthForm never downloaded** for a logged-in user (saves 7.09 kB).
**ProfilePage never downloaded** until the user navigates to /profile (saves 2.59 kB).

---

## Analysis

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total bundle size | 158.75 kB | 184.27 kB main + chunks | Split across files |
| JS on initial /tasks load | 158.75 kB | 193.33 kB | +34 kB overhead from router |
| JS if user never visits /profile | 158.75 kB | 190.74 kB | AuthForm + Profile never downloaded |
| Number of JS files | 1 | 7 | Each route is a separate chunk |
| Fallback UI during load | None | Spinner shown | Meaningful loading state |

**Note on main bundle size increase:**
The main bundle grew from 158.75 kB to 184.27 kB because `react-router-dom` (~26 kB) was added as a dependency. This is the trade-off for gaining routing and code splitting capability. On real-world apps with many pages and heavy components, the savings per route far outweigh this overhead.

---

## How to Verify Code Splitting in DevTools

1. Run `npm run build` and inspect the `dist/assets/` folder — separate `.js` files confirm splitting.
2. Open the app in Chrome, open DevTools, go to the **Network** tab.
3. Filter by **JS**, reload the page.
4. On first load to `/tasks` you will see `index.js` and `TasksPage.js` downloaded.
5. Navigate to `/profile` — `ProfilePage.js` downloads at that moment (not before).
6. Log out — `AuthForm.js` downloads at that moment.
7. To simulate slow connection: in DevTools Network tab, set throttle to **Slow 3G** and reload. The `LoadingFallback` spinner will be visible for several seconds before the chunk loads.

---

## Supplementary: AuthForm Lazy Loaded as Additional Component

Beyond the required route-based components, `AuthForm` is also lazy loaded:

```js
const AuthForm = lazy(withMinDelay(() => import('./components/AuthForm')));
```

This means logged-in users never download the login/register form code (7.09 kB saved).
The `withMinDelay` wrapper ensures the fallback spinner shows for at least 300ms, preventing
a flickering loading state on fast connections.
