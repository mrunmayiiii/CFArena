import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
// import Login    from './pages/Login'
// import Signup   from './pages/Signup'
// import Dashboard from './pages/Dashboard'
// import Lobby    from './pages/Lobby'
// import MatchRoom from './pages/MatchRoom'

/* ── Global styles injected once ─────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: #0a0a0a;
    color: #e8e8e0;
    font-family: 'Space Mono', monospace;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  a { cursor: crosshair; }
  button { cursor: crosshair; }

  /* Ticker animation */
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* Blinking cursor */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  /* Live dot pulse */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar       { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3d3d3d; }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = globalCSS
  document.head.appendChild(style)
}

/* ── Protected route helper (use once auth is wired up) ───────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cf_duel_token')
  return token ? children : <Navigate to="/login" replace />
}
*/

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Landing />} />
        {/* <Route path="/login"   element={<Login />} /> */}
        {/* <Route path="/signup"  element={<Signup />} /> */}

        {/* Protected (uncomment when pages are ready) */}
        {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
        {/* <Route path="/lobby/:code" element={<ProtectedRoute><Lobby /></ProtectedRoute>} /> */}
        {/* <Route path="/match/:id"   element={<ProtectedRoute><MatchRoom /></ProtectedRoute>} /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}