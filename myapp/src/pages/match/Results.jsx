import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Navbar from '../../components/Navbar'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rs { min-height: 100vh; background: #0a0a0a; color: #e8e8e0; font-family: 'Space Mono', monospace; display: flex; flex-direction: column; }
  .rs-main { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 48px 24px 80px; }

  /* ── Hero ── */
  .rs-eyebrow { font-size: 11px; color: #555; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; text-align: center; }
  .rs-title { font-family: 'Syne', sans-serif; font-size: clamp(40px, 7vw, 80px); font-weight: 800; letter-spacing: -0.03em; text-align: center; line-height: 0.95; margin-bottom: 12px; }
  .rs-winner-name { color: #c8ff00; }
  .rs-draw-txt { color: #ff6b00; }
  .rs-subtitle { font-size: 13px; color: #555; letter-spacing: 0.1em; text-align: center; margin-bottom: 52px; }

  /* ── Main card ── */
  .rs-card { width: 100%; max-width: 640px; border: 1px solid #1e1e1e; background: #0d0d0d; border-radius: 2px; overflow: hidden; position: relative; }
  .rs-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #c8ff0060, transparent); pointer-events: none; }

  /* Score section */
  .rs-score-row { display: flex; align-items: stretch; }
  .rs-player { flex: 1; padding: 36px 28px; text-align: center; }
  .rs-player.winner-bg { background: #0f120a; }
  .rs-player.loser-bg { background: #0a0a0a; }
  .rs-result-tag { display: inline-block; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; padding: 5px 14px; border-radius: 1px; margin-bottom: 16px; }
  .rs-result-tag.win { color: #c8ff00; background: #0f120a; border: 1px solid #c8ff0040; }
  .rs-result-tag.lose { color: #555; background: #111; border: 1px solid #2a2a2a; }
  .rs-result-tag.draw { color: #ff6b00; background: #120d0a; border: 1px solid #ff6b0040; }
  .rs-player-handle { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 6px; word-break: break-all; }
  .rs-you-note { font-size: 10px; color: #c8ff00; letter-spacing: 0.12em; margin-bottom: 16px; }
  .rs-player-score { font-family: 'Syne', sans-serif; font-size: 72px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
  .rs-player-score.won { color: #c8ff00; }
  .rs-player-score.lost { color: #333; }
  .rs-player-score.tied { color: #ff6b00; }
  .rs-score-lbl { font-size: 11px; color: #555; letter-spacing: 0.12em; text-transform: uppercase; }

  .rs-divider-v { width: 1px; background: #1e1e1e; align-self: stretch; }

  /* Meta */
  .rs-meta { border-top: 1px solid #1e1e1e; display: grid; grid-template-columns: 1fr 1fr; }
  .rs-meta-item { padding: 20px 28px; border-right: 1px solid #1e1e1e; border-bottom: 1px solid #1e1e1e; }
  .rs-meta-item:nth-child(even) { border-right: none; }
  .rs-meta-item:nth-last-child(-n+2) { border-bottom: none; }
  .rs-meta-key { font-size: 11px; color: #555; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px; }
  .rs-meta-val { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #e8e8e0; }

  /* Problems */
  .rs-problems { border-top: 1px solid #1e1e1e; padding: 28px; }
  .rs-prob-title { font-size: 11px; color: #555; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 20px; }
  .rs-prob-row { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid #111; }
  .rs-prob-row:last-child { border-bottom: none; }
  .rs-prob-num { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #333; width: 32px; flex-shrink: 0; }
  .rs-prob-name { font-size: 15px; color: #888; flex: 1; }
  .rs-prob-cf { font-size: 12px; color: #c8ff00; border: 1px solid #c8ff0030; padding: 6px 14px; border-radius: 1px; text-decoration: none; letter-spacing: 0.06em; transition: border-color .15s, background .15s; }
  .rs-prob-cf:hover { border-color: #c8ff00; background: #c8ff0010; }

  /* Actions */
  .rs-actions { border-top: 1px solid #1e1e1e; padding: 24px 28px; display: flex; gap: 12px; }
  .rs-btn-ghost { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; background: none; border: 1px solid #2a2a2a; padding: 16px 24px; border-radius: 2px; cursor: crosshair; transition: color .15s, border-color .15s; flex: 1; }
  .rs-btn-ghost:hover { color: #e8e8e0; border-color: #555; }
  .rs-btn-cta { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0a0a0a; background: #c8ff00; border: none; padding: 16px 24px; border-radius: 2px; cursor: crosshair; transition: opacity .15s; flex: 2; }
  .rs-btn-cta:hover { opacity: 0.88; }

  .rs-loading { text-align: center; font-size: 14px; color: #555; letter-spacing: 0.1em; padding: 80px 0; }

  @media (max-width: 520px) {
    .rs-score-row { flex-direction: column; }
    .rs-divider-v { width: auto; height: 1px; }
    .rs-meta { grid-template-columns: 1fr; }
    .rs-meta-item { border-right: none !important; }
    .rs-meta-item:nth-last-child(-n+2) { border-bottom: 1px solid #1e1e1e; }
    .rs-meta-item:last-child { border-bottom: none; }
    .rs-actions { flex-direction: column; }
  }
`

function cfUrl(pid) {
  if (!pid) return '#'
  const m = pid.match(/^(\d+)([A-Z].*)$/i)
  if (!m) return `https://codeforces.com/problemset?search=${encodeURIComponent(pid)}`
  return `https://codeforces.com/contest/${m[1]}/problem/${m[2].toUpperCase()}`
}

function LoadingScreen() {
  return (
    <>
      <style>{css}</style>
      <div className="rs">
        <Navbar />
        <main className="rs-main">
          <div className="rs-loading">Loading results…</div>
        </main>
      </div>
    </>
  )
}

export default function Results() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()

  const [match, setMatch] = useState(null)
  const [myHandle, setMyHandle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get(API_PATHS.USER.ME)
      .then((r) => setMyHandle(r?.data?.cfHandle || null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!inviteCode) return
    axiosInstance
      .get(`${API_PATHS.MATCH.STATUS}?inviteCode=${encodeURIComponent(inviteCode)}`)
      .then((r) => setMatch(r?.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [inviteCode])

  if (loading) return <LoadingScreen />
  if (!match) {
    return (
      <>
        <style>{css}</style>
        <div className="rs">
          <Navbar />
          <main className="rs-main">
            <div className="rs-loading">Match not found.</div>
          </main>
        </div>
      </>
    )
  }

  // ── Outcome ──────────────────────────────────────────────────────────────
  const s1 = match.score1 ?? 0
  const s2 = match.score2 ?? 0
  const isDraw = s1 === s2
  const p1Wins = !isDraw && s1 > s2
  const p2Wins = !isDraw && s2 > s1
  const winner = isDraw ? null : p1Wins ? match.user1 : match.user2

  const durationMs = match.endTime && match.startTime
    ? new Date(match.endTime).getTime() - new Date(match.startTime).getTime()
    : null
  const durationMin = durationMs ? Math.round(durationMs / 60000) : null

  // Tags
  const tag = (isWin, isDr) => isWin ? 'win' : isDr ? 'draw' : 'lose'
  const scoreClass = (isWin, isDr) => isWin ? 'won' : isDr ? 'tied' : 'lost'

  return (
    <>
      <style>{css}</style>
      <div className="rs">
        <Navbar />
        <main className="rs-main">

          {/* Hero */}
          <div className="rs-eyebrow">Match complete · {inviteCode}</div>
          <h1 className="rs-title">
            {isDraw
              ? <span className="rs-draw-txt">Draw.</span>
              : <><span className="rs-winner-name">{winner}</span> wins.</>
            }
          </h1>
          <p className="rs-subtitle">// final results</p>

          <div className="rs-card">

            {/* Score section */}
            <div className="rs-score-row">
              {/* Player 1 */}
              <div className={`rs-player ${p1Wins ? 'winner-bg' : 'loser-bg'}`}>
                <div className={`rs-result-tag ${tag(p1Wins, isDraw)}`}>
                  {isDraw ? 'draw' : p1Wins ? 'winner' : 'defeated'}
                </div>
                <div className="rs-player-handle">{match.user1}</div>
                {match.user1 === myHandle && <div className="rs-you-note">YOU</div>}
                <div className={`rs-player-score ${scoreClass(p1Wins, isDraw)}`}>{s1}</div>
                <div className="rs-score-lbl">solved</div>
              </div>

              <div className="rs-divider-v" />

              {/* Player 2 */}
              <div className={`rs-player ${p2Wins ? 'winner-bg' : 'loser-bg'}`}>
                <div className={`rs-result-tag ${tag(p2Wins, isDraw)}`}>
                  {isDraw ? 'draw' : p2Wins ? 'winner' : 'defeated'}
                </div>
                <div className="rs-player-handle">{match.user2 || '—'}</div>
                {match.user2 === myHandle && <div className="rs-you-note">YOU</div>}
                <div className={`rs-player-score ${scoreClass(p2Wins, isDraw)}`}>{s2}</div>
                <div className="rs-score-lbl">solved</div>
              </div>
            </div>

            {/* Meta grid */}
            <div className="rs-meta">
              <div className="rs-meta-item">
                <div className="rs-meta-key">Duration</div>
                <div className="rs-meta-val">{durationMin != null ? `${durationMin} min` : '—'}</div>
              </div>
              <div className="rs-meta-item">
                <div className="rs-meta-key">Problems</div>
                <div className="rs-meta-val">{match.problems?.length ?? '—'}</div>
              </div>
              <div className="rs-meta-item">
                <div className="rs-meta-key">Started</div>
                <div className="rs-meta-val">
                  {match.startTime
                    ? new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </div>
              </div>
              <div className="rs-meta-item">
                <div className="rs-meta-key">Invite Code</div>
                <div className="rs-meta-val" style={{ letterSpacing: '0.15em' }}>{inviteCode}</div>
              </div>
            </div>

            {/* Problems list */}
            {match.problems?.length > 0 && (
              <div className="rs-problems">
                <div className="rs-prob-title">All Problems</div>
                {match.problems.map((pid, i) => (
                  <div className="rs-prob-row" key={pid + i}>
                    <span className="rs-prob-num">{i + 1}</span>
                    <span className="rs-prob-name">Problem {i + 1}</span>
                    <a className="rs-prob-cf" href={cfUrl(pid)} target="_blank" rel="noreferrer">
                      CF →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="rs-actions">
              <button className="rs-btn-ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button className="rs-btn-cta" onClick={() => navigate('/match/create')}>
                ⚔ New Match
              </button>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}