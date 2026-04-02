import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Navbar from '../../components/Navbar'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #09090b;
    --surface:   #0f0f12;
    --panel:     #111114;
    --panel2:    #141418;
    --border:    #1e1e24;
    --border2:   #2a2a33;
    --accent:    #c8ff00;
    --accent-10: rgba(200,255,0,0.07);
    --accent-20: rgba(200,255,0,0.18);
    --accent-dim: rgba(200,255,0,0.55);
    --text:      #eeeef2;
    --muted:     #46464f;
    --muted2:    #7a7a88;
    --danger:    #f87171;
    --warn:      #fb923c;
    --warn-bg:   rgba(251,146,60,0.06);
    --warn-border: rgba(251,146,60,0.22);
    --mono:      'IBM Plex Mono', monospace;
    --display:   'IBM Plex Mono', monospace;
    --radius:    4px;
  }

  .mr { min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--mono); display:flex; flex-direction:column; -webkit-font-smoothing:antialiased; }
  .mr-main { flex:1; padding:36px 40px 80px; max-width:1200px; margin:0 auto; width:100%; }

  /* ── LOADING ── */
  .mr-loading {
    position: fixed; inset: 0; z-index: 200;
    background: var(--bg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 0;
  }

  /* Scanline texture overlay */
  .mr-loading::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(200,255,0,0.012) 2px,
      rgba(200,255,0,0.012) 4px
    );
    pointer-events: none;
  }

  .mr-loading-inner {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    align-items: center; gap: 0;
    width: 100%; max-width: 480px;
    padding: 0 24px;
  }

  /* Top label */
  .mr-loading-eyebrow {
    font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--muted2); margin-bottom: 28px;
    display: flex; align-items: center; gap: 10px;
  }
  .mr-loading-eyebrow::before,
  .mr-loading-eyebrow::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
    width: 40px;
  }

  /* Big animated title */
  .mr-loading-title {
    font-family: var(--display); font-size: clamp(42px, 8vw, 64px);
    font-weight: 800; letter-spacing: -0.02em; line-height: 1;
    color: var(--text); text-align: center; margin-bottom: 6px;
  }
  .mr-loading-title span {
    color: var(--accent);
    animation: mrFlicker 3s ease-in-out infinite;
  }
  @keyframes mrFlicker {
    0%,100% { opacity: 1; }
    48% { opacity: 1; }
    50% { opacity: 0.4; }
    52% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.6; }
    94% { opacity: 1; }
  }

  .mr-loading-sub {
    font-size: 12px; color: var(--muted2); letter-spacing: 0.1em;
    text-align: center; margin-bottom: 48px;
  }

  /* Progress bar */
  .mr-loading-bar-wrap {
    width: 100%; height: 2px;
    background: var(--border); border-radius: 2px;
    overflow: hidden; margin-bottom: 20px;
    position: relative;
  }
  .mr-loading-bar {
    position: absolute; top: 0; left: -60%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: mrSlide 1.6s ease-in-out infinite;
    border-radius: 2px;
  }
  @keyframes mrSlide {
    0%   { left: -60%; }
    100% { left: 110%; }
  }

  /* Steps list */
  .mr-loading-steps {
    width: 100%; display: flex; flex-direction: column; gap: 10px;
  }
  .mr-loading-step {
    display: flex; align-items: center; gap: 12px;
    font-size: 12px; letter-spacing: 0.08em; color: var(--muted);
  }
  .mr-loading-step.active { color: var(--text); }
  .mr-loading-step.done   { color: var(--muted2); }
  .mr-ls-icon {
    width: 20px; height: 20px; border-radius: 50%;
    border: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 9px; color: var(--muted);
  }
  .mr-loading-step.active .mr-ls-icon {
    border-color: var(--accent);
    color: var(--accent);
    box-shadow: 0 0 8px rgba(200,255,0,0.25);
  }
  .mr-loading-step.active .mr-ls-icon::before { content: ''; width:6px; height:6px; border-radius:50%; background:var(--accent); animation: mrPulse 1s infinite; display:block; }
  .mr-loading-step.done .mr-ls-icon { border-color: var(--muted); color: var(--muted2); }
  .mr-loading-step.done .mr-ls-icon::before { content: '✓'; font-size: 10px; }

  @keyframes mrSpin { to { transform: rotate(360deg); } }
  @keyframes mrDot { 0%,80%,100%{transform:scale(0.5);opacity:0.25} 40%{transform:scale(1);opacity:1} }

  /* ── TOP BAR ── */
  .mr-topbar {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 24px; gap: 16px;
  }
  .mr-tag {
    font-size: 10px; color: var(--muted2); letter-spacing: 0.2em;
    text-transform: uppercase; margin-bottom: 6px;
  }
  .mr-title {
    font-family: var(--display); font-size: 24px; font-weight: 800;
    letter-spacing: -0.01em;
  }
  .mr-title em { color: var(--accent); font-style: normal; }

  .mr-timer {
    font-family: var(--mono); font-size: 52px; font-weight: 400;
    color: var(--accent); letter-spacing: 0; line-height: 1;
    text-align: right;
  }
  .mr-timer.urgent { color: var(--danger); }
  .mr-timer-lbl { font-size: 10px; color: var(--muted2); letter-spacing: 0.16em; text-transform: uppercase; margin-top: 4px; text-align: right; }

  /* ── STATUS ── */
  .mr-status {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px;
    background: var(--panel); border: 1px solid var(--border);
    border-radius: var(--radius); margin-bottom: 22px;
  }
  .mr-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .mr-dot.live    { background: var(--accent); box-shadow: 0 0 8px var(--accent-dim); animation: mrPulse 2s infinite; }
  .mr-dot.waiting { background: var(--warn); animation: mrPulse 2.5s infinite; }
  .mr-dot.done    { background: var(--muted); }
  @keyframes mrPulse { 0%,100%{opacity:1}50%{opacity:0.25} }
  .mr-status-txt { font-size: 12px; color: var(--muted2); letter-spacing: 0.05em; }

  /* ── ERROR ── */
  .mr-err {
    background: #130d0d; border: 1px solid rgba(248,113,113,0.2);
    border-left: 2px solid var(--danger);
    padding: 13px 18px; border-radius: var(--radius);
    margin-bottom: 18px; font-size: 13px; color: #fca5a5;
  }

  /* ── LOBBY ── */
  .mr-lobby {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden; margin-bottom: 20px;
  }
  .mr-lobby-head {
    padding: 28px 28px 22px; border-bottom: 1px solid var(--border);
  }
  .mr-lobby-title {
    font-family: var(--display); font-size: 28px; font-weight: 800;
    letter-spacing: -0.01em; margin-bottom: 5px;
  }
  .mr-lobby-sub { font-size: 12px; color: var(--muted2); letter-spacing: 0.06em; }

  .mr-players { display: grid; grid-template-columns: 1fr 1fr; }
  .mr-player { padding: 24px 28px; border-right: 1px solid var(--border); }
  .mr-player:last-child { border-right: none; }
  .mr-player-lbl {
    font-size: 10px; color: var(--muted); letter-spacing: 0.2em;
    text-transform: uppercase; margin-bottom: 12px;
  }
  .mr-player-name {
    font-family: var(--display); font-size: 19px; font-weight: 700;
    margin-bottom: 10px; letter-spacing: -0.01em;
  }
  .mr-player-name.empty { color: var(--border2); }
  .mr-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .mr-badge {
    font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 2px; border: 1px solid;
  }
  .mr-badge.host  { color: var(--accent); border-color: var(--accent-20); background: var(--accent-10); }
  .mr-badge.you   { color: var(--muted2); border-color: var(--border2); }
  .mr-badge.ready { color: var(--accent); border-color: var(--accent-20); background: var(--accent-10); }
  .mr-badge.joined { color: var(--warn); border-color: var(--warn-border); background: var(--warn-bg); }

  /* Invite code row */
  .mr-code-row { display: flex; align-items: stretch; border-top: 1px solid var(--border); }
  .mr-code-lbl-block {
    padding: 16px 24px; border-right: 1px solid var(--border);
    display: flex; align-items: center; background: var(--surface);
  }
  .mr-code-lbl { font-size: 10px; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }
  .mr-code-val {
    flex: 1; padding: 16px 24px;
    font-family: var(--display); font-size: 22px; font-weight: 800;
    letter-spacing: 0.2em; color: var(--accent); display: flex; align-items: center;
  }
  .mr-copy-btn {
    padding: 0 22px; background: none; border: none;
    border-left: 1px solid var(--border); cursor: pointer;
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--muted2);
    transition: color .15s, background .15s; white-space: nowrap;
  }
  .mr-copy-btn:hover { color: var(--text); background: var(--panel2); }
  .mr-copy-btn.copied { color: var(--accent); }

  /* Lobby footer */
  .mr-lobby-foot {
    padding: 20px 28px; border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 14px;
    background: var(--surface);
  }
  .mr-hint { font-size: 12px; color: var(--muted2); letter-spacing: 0.04em; flex: 1; line-height: 1.8; }
  .mr-hint em { color: var(--accent-dim); font-style: normal; }

  .mr-btn-primary {
    font-family: var(--mono); font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #09090b; background: var(--accent);
    border: none; padding: 13px 26px; border-radius: var(--radius);
    cursor: pointer; transition: opacity .15s, transform .1s; white-space: nowrap; flex-shrink: 0;
  }
  .mr-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .mr-btn-primary:active { transform: translateY(0); }
  .mr-btn-primary:disabled { opacity: 0.2; cursor: not-allowed; transform: none; }

  /* ── SCOREBOARD ── */
  .mr-score {
    display: grid; grid-template-columns: 1fr 80px 1fr;
    border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; margin-bottom: 12px;
    background: var(--panel);
  }
  .mr-score-me {
    padding: 28px 32px;
    border-right: 1px solid var(--border);
    position: relative; overflow: hidden;
  }
  .mr-score-me::after {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent);
  }
  .mr-score-opp { padding: 28px 32px; text-align: right; }
  .mr-score-vs {
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: var(--muted); letter-spacing: 0.2em;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }
  .mr-score-handle {
    font-size: 10px; color: var(--muted2); letter-spacing: 0.14em;
    text-transform: uppercase; margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .mr-score-opp .mr-score-handle { justify-content: flex-end; }
  .mr-score-handle-dot {
    width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0;
  }
  .mr-score-num {
    font-family: var(--mono); font-size: 72px; font-weight: 400;
    line-height: 1; color: var(--text); letter-spacing: 0;
  }
  .mr-score-me .mr-score-num { color: var(--accent); }
  .mr-score-lbl {
    font-size: 10px; color: var(--muted); letter-spacing: 0.18em;
    text-transform: uppercase; margin-top: 8px;
  }

  /* ── STATS ROW ── */
  .mr-stats-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-bottom: 12px;
  }
  .mr-stat-card {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px 20px;
  }
  .mr-stat-top {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 10px;
  }
  .mr-stat-label { font-size: 10px; color: var(--muted2); letter-spacing: 0.16em; text-transform: uppercase; }
  .mr-stat-pct   { font-size: 11px; color: var(--muted2); font-family: var(--mono); }
  .mr-stat-pct.me { color: var(--accent); }
  .mr-stat-bar-bg { height: 5px; background: var(--border2); border-radius: 99px; overflow: hidden; }
  .mr-stat-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
  .mr-stat-bar-fill.me  { background: var(--accent); box-shadow: 0 0 8px rgba(200,255,0,0.4); }
  .mr-stat-bar-fill.opp { background: var(--border2); background: linear-gradient(90deg, #333, #4a4a55); }

  /* ── PROBLEM TABLE ── */
  .mr-prob-table {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
  }
  .mr-prob-table-head {
    display: grid; grid-template-columns: 56px 1fr 160px 160px;
    padding: 11px 24px; border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .mr-th { font-size: 10px; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }
  .mr-th.center { text-align: center; }

  .mr-prob-row {
    display: grid; grid-template-columns: 56px 1fr 160px 160px;
    align-items: center; padding: 18px 24px;
    border-bottom: 1px solid var(--border);
    border-left: 2px solid transparent;
    transition: border-color .2s, background .2s;
  }
  .mr-prob-row:last-child { border-bottom: none; }
  .mr-prob-row.current-row {
    border-left-color: var(--accent);
    background: rgba(200,255,0,0.03);
  }
  .mr-prob-row.solved-row { opacity: 0.6; }

  .mr-prob-n {
    font-family: var(--mono); font-size: 13px; font-weight: 600;
    color: var(--muted); width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border); border-radius: 50%;
  }
  .mr-prob-n.solved  { color: var(--bg); background: var(--accent); border-color: var(--accent); }
  .mr-prob-n.current { color: var(--text); border-color: var(--border2); }

  .mr-prob-name { font-size: 13px; color: var(--muted2); }
  .mr-prob-name.current { color: var(--text); font-weight: 500; }
  .mr-prob-name a {
    color: inherit; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: color .15s;
  }
  .mr-prob-name a:hover { color: var(--accent); }
  .mr-prob-link-icon { font-size: 10px; opacity: 0.6; }

  .mr-prob-cell { text-align: center; }

  /* State chips */
  .mr-state {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 99px; font-weight: 500;
  }
  .mr-state.ac   { color: var(--bg); background: var(--accent); }
  .mr-state.live { color: var(--warn); background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.25); }
  .mr-state.lock { color: var(--muted); background: transparent; }
  .mr-state-dot  { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .mr-state.live .mr-state-dot { background: var(--warn); animation: mrPulse 1.5s infinite; }

  /* ── TOAST ── */
  .mr-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    font-size: 12px; letter-spacing: 0.07em; padding: 10px 22px;
    border-radius: var(--radius); border-left: 2px solid var(--accent);
    background: var(--panel2); color: var(--accent-dim);
    white-space: nowrap; z-index: 300;
    animation: mrToastIn .2s ease;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }
  .mr-toast.error { border-color: var(--danger); background: #130d0d; color: #fca5a5; }
  @keyframes mrToastIn { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  /* ── DIVIDER ── */
  .mr-divider { height: 1px; background: var(--border); margin: 0 -20px; }

  @media (max-width: 640px) {
    .mr-players { grid-template-columns: 1fr; }
    .mr-player  { border-right: none; border-bottom: 1px solid var(--border); }
    .mr-score   { grid-template-columns: 1fr; }
    .mr-score-vs { display: none; }
    .mr-score-opp { text-align: left; border-top: 1px solid var(--border); }
    .mr-stats-row { grid-template-columns: 1fr; }
    .mr-prob-table-head { grid-template-columns: 44px 1fr 90px 90px; }
    .mr-prob-row        { grid-template-columns: 44px 1fr 90px 90px; }
    .mr-timer { font-size: 38px; }
    .mr-main { padding: 20px 16px 60px; }
    .mr-lobby-foot { flex-direction: column; align-items: stretch; }
  }
`

function parseProblem(raw, index) {
  const label = `P${index + 1}`
  const fullLabel = `Problem ${index + 1}`
  if (!raw) return { label, fullLabel, url: '#' }
  if (raw.startsWith('http')) {
    let m = raw.match(/\/contest\/(\d+)\/problem\/([A-Z]\d*)/i)
    if (m) return { label, fullLabel, url: `https://codeforces.com/contest/${m[1]}/problem/${m[2].toUpperCase()}` }
    m = raw.match(/\/problemset\/problem\/(\d+)\/([A-Z]\d*)/i)
    if (m) return { label, fullLabel, url: `https://codeforces.com/contest/${m[1]}/problem/${m[2].toUpperCase()}` }
    return { label, fullLabel, url: raw }
  }
  const m = raw.match(/^(\d+)([A-Z]\d*)$/i)
  if (m) return { label, fullLabel, url: `https://codeforces.com/contest/${m[1]}/problem/${m[2].toUpperCase()}` }
  return { label, fullLabel, url: `https://codeforces.com/problemset?search=${encodeURIComponent(raw)}` }
}

function formatTime(ms) {
  if (ms <= 0) return '00:00'
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function LoadingScreen() {
  const [step, setStep] = useState(0)
  const steps = [
    'Verifying players',
    'Fetching problems from Codeforces',
    'Setting up match room',
  ]

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="mr-loading">
      <div className="mr-loading-inner">
        <div className="mr-loading-eyebrow">CF Arena</div>

        <div className="mr-loading-title">
          Match<br /><span>Starting.</span>
        </div>
        <div className="mr-loading-sub">// fetching problems &amp; initializing room</div>

        <div className="mr-loading-bar-wrap">
          <div className="mr-loading-bar" />
        </div>

        <div className="mr-loading-steps">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`mr-loading-step ${i === step ? 'active' : i < step ? 'done' : ''}`}
            >
              <div className="mr-ls-icon" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MatchRoom() {
  const { inviteCode } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [match, setMatch] = useState(null)
  const [myHandle, setMyHandle] = useState(null)
  const [myHandleReady, setMyHandleReady] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast] = useState(null)
  const [isReadying, setIsReadying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const wsRef = useRef(null)
  const timerRef = useRef(null)
  const prevStatusRef = useRef(null)

  const showToast = (text, type = 'ok') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    axiosInstance.get(API_PATHS.USER.ME)
      .then((r) => { setMyHandle(r?.data?.cfHandle || null); setMyHandleReady(true) })
      .catch(() => { setMyHandleReady(true) })
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `${API_PATHS.MATCH.STATUS}?inviteCode=${encodeURIComponent(inviteCode)}`
      )
      const data = res?.data
      if (data) {
        const prev = prevStatusRef.current
        if ((prev === 'WAITING' || prev === 'READY') && data.status === 'ONGOING') {
          setShowLoading(true)
          const hideAfterProblems = () => {
            if (data.problems && data.problems.length > 0) {
              setTimeout(() => setShowLoading(false), 800)
            } else {
              setTimeout(() => setShowLoading(false), 2000)
            }
          }
          hideAfterProblems()
        }
        prevStatusRef.current = data.status
        setMatch(data)

        if (showLoading && data.problems && data.problems.length > 0) {
          setTimeout(() => setShowLoading(false), 600)
        }

        if (data.status === 'FINISHED') navigate(`/results/${inviteCode}`)
      }
    } catch (err) {
      setLoadError(err?.response?.data?.message || err.message || 'Could not load match.')
    }
  }, [inviteCode, navigate, showLoading])

  useEffect(() => {
    fetchStatus()
    const t = setInterval(fetchStatus, 3000)
    return () => clearInterval(t)
  }, [fetchStatus])

  useEffect(() => {
    const s1 = document.createElement('script')
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script')
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js'
      s2.onload = () => {
        try {
          const sock = new window.SockJS(`${WS_BASE.replace(/^ws/, 'http')}/ws`)
          const client = window.Stomp.over(sock)
          client.debug = null
          client.connect({}, () => {
            client.subscribe(`/topic/match/${inviteCode}`, (msg) => {
              try {
                const data = JSON.parse(msg.body)
                const prev = prevStatusRef.current
                if ((prev === 'WAITING' || prev === 'READY') && data.status === 'ONGOING') {
                  setShowLoading(true)
                  setTimeout(() => setShowLoading(false), data.problems?.length > 0 ? 800 : 2000)
                }
                prevStatusRef.current = data.status
                setMatch(data)
                if (data?.status === 'FINISHED') navigate(`/results/${inviteCode}`)
              } catch {}
            })
          })
          wsRef.current = client
        } catch {}
      }
      document.head.appendChild(s2)
    }
    document.head.appendChild(s1)
    return () => { try { wsRef.current?.disconnect?.() } catch {} }
  }, [inviteCode, navigate])

  useEffect(() => {
    if (!match?.endTime || match.status !== 'ONGOING') {
      clearInterval(timerRef.current); return
    }
    const tick = () => {
      const left = new Date(match.endTime).getTime() - Date.now()
      setTimeLeft(left)
      if (left <= 0) { clearInterval(timerRef.current); fetchStatus() }
    }
    tick()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [match?.endTime, match?.status, fetchStatus])

  useEffect(() => {
    if (!match) return
    const curIdx = match?.curIdx ?? 0
    if (curIdx > 5) navigate(`/results/${inviteCode}`)
  }, [match, navigate, inviteCode])

  const onReady = async () => {
    setIsReadying(true)
    try {
      await axiosInstance.post(`${API_PATHS.MATCH.JOIN}?inviteCode=${encodeURIComponent(inviteCode)}`)
      showToast('Ready! Waiting for host…')
      fetchStatus()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to ready up.', 'error')
    } finally { setIsReadying(false) }
  }

  const onStart = async () => {
    setIsStarting(true)
    setShowLoading(true)
    try {
      await axiosInstance.post(`${API_PATHS.MATCH.START}?inviteCode=${encodeURIComponent(inviteCode)}`)
      fetchStatus()
    } catch (err) {
      setShowLoading(false)
      showToast(err?.response?.data?.message || 'Cannot start yet.', 'error')
    } finally { setIsStarting(false) }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCodeCopied(true)
      showToast('Invite code copied!')
      setTimeout(() => setCodeCopied(false), 2000)
    } catch { showToast('Copy failed.', 'error') }
  }

  // ── Derived state ──
  const navRole = state?.role || 'guest'

  // Once myHandle is loaded, use exact match (case-insensitive) against match users.
  // Until loaded, fall back to navRole so lobby shows correctly.
  const amIUser1 = myHandleReady
    ? (myHandle
        ? match?.user1?.toLowerCase() === myHandle.toLowerCase()
        : navRole === 'host')
    : navRole === 'host'

  const isHost  = amIUser1
  const isGuest = myHandleReady && myHandle
    ? match?.user2?.toLowerCase() === myHandle.toLowerCase()
    : navRole === 'guest'

  const meHandle  = amIUser1 ? match?.user1 : match?.user2
  const oppHandle = amIUser1 ? match?.user2 : match?.user1
  const meScore   = amIUser1 ? (match?.score1 ?? 0) : (match?.score2 ?? 0)
  const oppScore  = amIUser1 ? (match?.score2 ?? 0) : (match?.score1 ?? 0)

  const problems      = match?.problems || []
  const totalProblems = problems.length || 1
  const curIdx        = match?.curIdx ?? 0
  const mePct         = Math.round((meScore / totalProblems) * 100)
  const oppPct        = Math.round((oppScore / totalProblems) * 100)

  const matchStatus  = match?.status || 'WAITING'
  const isLobby      = matchStatus === 'WAITING' || matchStatus === 'READY'
  const isOngoing    = matchStatus === 'ONGOING'
  const timerUrgent  = timeLeft !== null && timeLeft < 5 * 60 * 1000
  const guestJoined  = match?.user2 != null
  const guestReady   = guestJoined && matchStatus === 'READY'
  const canClickReady = !isHost && !guestJoined && navRole === 'guest'

  const dotClass  = isOngoing ? 'live' : matchStatus === 'FINISHED' ? 'done' : 'waiting'
  const statusTxt = !match ? 'Loading…'
    : isOngoing    ? 'Live — match in progress'
    : matchStatus === 'FINISHED' ? 'Match finished'
    : matchStatus === 'READY'   ? 'Both players ready — host can start'
    : 'Waiting for player 2 to join…'

  function myProblemState(i) {
    if (i < meScore)   return 'solved'   // I solved this (my score = count of my solved problems)
    if (i === curIdx)  return 'current'  // currently active problem for me
    return 'locked'
  }
  function oppProblemState(i) {
    if (i < oppScore)  return 'solved'   // opponent solved this independently
    if (i === curIdx)  return 'working'  // opponent on current problem
    return 'locked'
  }

  return (
    <>
      <style>{css}</style>

      {showLoading && <LoadingScreen />}

      <div className="mr">
        <Navbar onCfSaved={() => showToast('CF handle updated!')} />
        <main className="mr-main">

          {/* Top bar */}
          <div className="mr-topbar">
            <div>
              <div className="mr-tag">CF Arena · Match Room</div>
              <div className="mr-title">code_<em>{inviteCode}</em></div>
            </div>
            {isOngoing && (
              <div>
                <div className={`mr-timer ${timerUrgent ? 'urgent' : ''}`}>
                  {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
                <div className="mr-timer-lbl">remaining</div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mr-status">
            <span className={`mr-dot ${dotClass}`} />
            <span className="mr-status-txt">{statusTxt}</span>
          </div>

          {loadError && <div className="mr-err">{loadError}</div>}

          {/* ── LOBBY ── */}
          {isLobby && match && (
            <div className="mr-lobby">
              <div className="mr-lobby-head">
                <div className="mr-lobby-title">
                  {matchStatus === 'READY' ? 'Ready to fight.' : 'Waiting for players.'}
                </div>
                <div className="mr-lobby-sub">// {match.duration || '?'}-minute match · {problems.length || '?'} problems</div>
              </div>

              <div className="mr-players">
                <div className="mr-player">
                  <div className="mr-player-lbl">Player 1 · Host</div>
                  <div className="mr-player-name">{match.user1 || '—'}</div>
                  <div className="mr-badges">
                    {match.user1 && <span className="mr-badge host">host</span>}
                    {isHost && <span className="mr-badge you">you</span>}
                  </div>
                </div>
                <div className="mr-player">
                  <div className="mr-player-lbl">Player 2 · Guest</div>
                  <div className={`mr-player-name ${!guestJoined ? 'empty' : ''}`}>
                    {match.user2 || 'waiting…'}
                  </div>
                  <div className="mr-badges">
                    {guestJoined && (
                      <span className={`mr-badge ${guestReady ? 'ready' : 'joined'}`}>
                        {guestReady ? 'ready' : 'joined'}
                      </span>
                    )}
                    {isGuest && <span className="mr-badge you">you</span>}
                  </div>
                </div>
              </div>

              <div className="mr-code-row">
                <div className="mr-code-lbl-block">
                  <span className="mr-code-lbl">Invite Code</span>
                </div>
                <div className="mr-code-val">{inviteCode}</div>
                <button className={`mr-copy-btn ${codeCopied ? 'copied' : ''}`} onClick={copyCode}>
                  {codeCopied ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>

              <div className="mr-lobby-foot">
                <div className="mr-hint">
                  {isHost
                    ? guestReady
                      ? <>Opponent is ready. <em>Start when you are.</em></>
                      : 'Share the code. Start unlocks once opponent clicks Ready.'
                    : guestJoined
                      ? "You're in. Waiting for host to start."
                      : <>Click <em>Ready Up</em> to signal you're set.</>}
                </div>
                {isHost && (
                  <button className="mr-btn-primary" onClick={onStart} disabled={!guestReady || isStarting}>
                    {isStarting ? 'Starting…' : guestReady ? '⚔ Start Match' : 'Awaiting…'}
                  </button>
                )}
                {canClickReady && (
                  <button className="mr-btn-primary" onClick={onReady} disabled={isReadying}>
                    {isReadying ? 'Joining…' : '✓ Ready Up'}
                  </button>
                )}
                {!isHost && navRole !== 'host' && guestJoined && (
                  <button className="mr-btn-primary" disabled>Waiting for host…</button>
                )}
              </div>
            </div>
          )}

          {/* ── ONGOING ── */}
          {isOngoing && match && (
            <>
              {/* Scoreboard */}
              <div className="mr-score">
                <div className="mr-score-me">
                  <div className="mr-score-handle">
                    <span className="mr-score-handle-dot" />
                    {meHandle || 'you'} · you
                  </div>
                  <div className="mr-score-num">{meScore}</div>
                  <div className="mr-score-lbl">problems solved</div>
                </div>
                <div className="mr-score-vs">VS</div>
                <div className="mr-score-opp">
                  <div className="mr-score-handle">{oppHandle || 'opponent'}</div>
                  <div className="mr-score-num" style={{ textAlign: 'right' }}>{oppScore}</div>
                  <div className="mr-score-lbl" style={{ textAlign: 'right' }}>problems solved</div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="mr-stats-row">
                <div className="mr-stat-card">
                  <div className="mr-stat-top">
                    <span className="mr-stat-label">Your progress</span>
                    <span className="mr-stat-pct me">{mePct}%</span>
                  </div>
                  <div className="mr-stat-bar-bg">
                    <div className="mr-stat-bar-fill me" style={{ width: `${mePct}%` }} />
                  </div>
                </div>
                <div className="mr-stat-card">
                  <div className="mr-stat-top">
                    <span className="mr-stat-label">{oppHandle || 'Opponent'}</span>
                    <span className="mr-stat-pct">{oppPct}%</span>
                  </div>
                  <div className="mr-stat-bar-bg">
                    <div className="mr-stat-bar-fill opp" style={{ width: `${oppPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Problem table */}
              <div className="mr-prob-table">
                <div className="mr-prob-table-head">
                  <span className="mr-th">#</span>
                  <span className="mr-th">Problem</span>
                  <span className="mr-th center">You</span>
                  <span className="mr-th center">{oppHandle || 'Opponent'}</span>
                </div>

                {problems.map((raw, i) => {
                  const { fullLabel, url } = parseProblem(raw, i)
                  const myState  = myProblemState(i)
                  const oppState = oppProblemState(i)
                  const isCurrent = i === curIdx
                  const isSolved  = myState === 'solved'

                  return (
                    <div
                      className={`mr-prob-row ${isCurrent ? 'current-row' : ''} ${isSolved ? 'solved-row' : ''}`}
                      key={i}
                    >
                      <div className={`mr-prob-n ${myState === 'solved' ? 'solved' : myState === 'current' ? 'current' : ''}`}>
                        {i + 1}
                      </div>

                      <div className={`mr-prob-name ${myState === 'current' ? 'current' : ''}`}>
                        {myState === 'current' ? (
                          <a href={url} target="_blank" rel="noreferrer">
                            {fullLabel}
                            <span className="mr-prob-link-icon">↗</span>
                          </a>
                        ) : (
                          fullLabel
                        )}
                      </div>

                      <div className="mr-prob-cell">
                        {myState === 'solved'  && <span className="mr-state ac">✓ Solved</span>}
                        {myState === 'current' && <span className="mr-state live"><span className="mr-state-dot" />Live</span>}
                        {myState === 'locked'  && <span className="mr-state lock">—</span>}
                      </div>

                      <div className="mr-prob-cell">
                        {oppState === 'solved'  && <span className="mr-state ac">✓ Solved</span>}
                        {oppState === 'working' && <span className="mr-state live"><span className="mr-state-dot" />Live</span>}
                        {oppState === 'locked'  && <span className="mr-state lock">—</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

        </main>

        {toast && (
          <div className={`mr-toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.text}</div>
        )}
      </div>
    </>
  )
}