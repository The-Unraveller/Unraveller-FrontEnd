import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ─── Session Guard ───────────────────────────────────────────────────────────
// sessionStorage is cleared when the tab closes or the page is hard-refreshed.
// This means: every time `npm run dev` restarts and reloads the browser,
// OR whenever the user opens a fresh tab, the old token is wiped and they
// start from the homepage — no stale admin/user sessions bleed between runs.
if (!sessionStorage.getItem('app_session_v1')) {
  localStorage.removeItem('token');
  sessionStorage.setItem('app_session_v1', 'true');
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
