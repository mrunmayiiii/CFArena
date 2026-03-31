import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import './match.css'

function formatMs(ms) {
  const safe = Math.max(0, ms)
  const totalSeconds = Math.floor(safe / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function MatchRoom() {
  const { inviteCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const code = (inviteCode || '').toUpperCase()
  const role = location?.state?.role || 'guest'

  const [match, setMatch] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const [status, setStatus] = useState({ text: '', type: 'ok' })
  const [loading, setLoading] = useState(true)
  const [remainingMs, setRemainingMs] = useState(null)
  const [notFoundTicks, setNotFoundTicks] = useState(0)

  const previousActiveMatchRef = useRef(null)

  const startMatch = async () => {
    setStatus({ text: '', type: 'ok' })
    setIsStarting(true)
    try {
      const response = await axiosInstance.post(`${API_PATHS.MATCH.START}?inviteCode=${encodeURIComponent(code)}`)
      const started = response?.data
      if (started) {
        setMatch(started)
        previousActiveMatchRef.current = started
      }
      setStatus({ text: 'Match started. Live updates running...', type: 'ok' })
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Start failed. Host only action.'
      setStatus({ text: typeof message === 'string' ? message : 'Start failed.', type: 'error' })
    } finally {
      setIsStarting(false)
    }
  }

  const loadLiveMatch = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.MATCH.STATUS}?inviteCode=${encodeURIComponent(code)}`)
      const found = response?.data || null

      if (found) {
        setMatch(found)
        if (found.source === 'PRIMARY') {
          previousActiveMatchRef.current = found
        }
        setNotFoundTicks(0)
        setStatus((prev) => (prev.type === 'error' ? { text: '', type: 'ok' } : prev))
      } else {
        setNotFoundTicks((prev) => prev + 1)
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        setMatch(null)
        setNotFoundTicks((prev) => prev + 1)
      } else {
        const message = error?.response?.data?.message || error?.response?.data || 'Unable to fetch live match state.'
        setStatus({ text: typeof message === 'string' ? message : 'Unable to fetch live match state.', type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (!code) {
      navigate('/match/join', { replace: true })
      return
    }
    loadLiveMatch()
    const poll = setInterval(loadLiveMatch, 5000)
    return () => clearInterval(poll)
  }, [code, loadLiveMatch, navigate])

  useEffect(() => {
    if (!match?.endTime) {
      setRemainingMs(null)
      return
    }
    const tick = () => {
      const ms = new Date(match.endTime).getTime() - Date.now()
      setRemainingMs(ms)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [match?.endTime])

  useEffect(() => {
    if (!previousActiveMatchRef.current) return

    const hasLikelyEnded =
      !match && notFoundTicks >= 2

    if (hasLikelyEnded) {
      const snapshot = previousActiveMatchRef.current
      const resultPayload = {
        id: snapshot?.id || code,
        inviteCode: snapshot?.inviteCode || code,
        user1: snapshot?.user1 || 'player-1',
        user2: snapshot?.user2 || 'player-2',
        score1: snapshot?.score1 ?? 0,
        score2: snapshot?.score2 ?? 0,
        winnerId: snapshot?.winnerId || (snapshot?.score1 > snapshot?.score2 ? snapshot?.user1 : snapshot?.score2 > snapshot?.score1 ? snapshot?.user2 : 'DRAW'),
      }
      sessionStorage.setItem('cfduel:lastResult', JSON.stringify(resultPayload))
      navigate(`/results/${resultPayload.id || code}`, {
        replace: true,
        state: {
          result: resultPayload,
        },
      })
    }
  }, [match, notFoundTicks, code, navigate])

  const derivedWinner = useMemo(() => {
    if (!match) return null
    if (match.score1 === match.score2) return 'DRAW'
    return match.score1 > match.score2 ? match.user1 : match.user2
  }, [match])

  return (
    <main className="match-page">
      <section className="match-shell">
        <header className="match-top">
          <Link to="/" className="match-brand">CF<span>_</span>DUEL</Link>
          <nav className="match-nav">
            <Link className="nav-btn" to="/dashboard">Dashboard</Link>
            <Link className="nav-btn" to="/match/create">Create</Link>
            <Link className="nav-btn" to="/match/join">Join</Link>
          </nav>
        </header>

        <section className="match-header">
          <p className="match-kicker">// Live Match Room</p>
          <h1>Room {code}</h1>
          <p>
            This page polls backend live match state. Host can start using this room once both players have joined.
          </p>
          {remainingMs !== null ? <div className="timer">Time left: {formatMs(remainingMs)}</div> : null}
          <div className="actions">
            <button className="btn-primary" type="button" onClick={startMatch} disabled={isStarting}>
              {isStarting ? 'Starting...' : 'Start match'}
            </button>
            <button className="btn-ghost" type="button" onClick={loadLiveMatch}>
              Refresh now
            </button>
          </div>
          {status.text ? <p className={`status ${status.type === 'error' ? 'error' : ''}`}>{status.text}</p> : null}
        </section>

        <section className="match-grid">
          <article className="card">
            <h2>Scoreboard</h2>
            {loading ? <p>Loading match data...</p> : null}
            {!loading && !match ? (
              <p>
                Match not active yet. If host has not started, this is expected. Role: {role}.
              </p>
            ) : null}

            {match ? (
              <>
                <div className="score-row">
                  <div className="player-card">
                    <p>{match.user1 || 'Player 1'}</p>
                    <span>Score: {match.score1 ?? 0}</span>
                  </div>
                  <div className="score">{match.score1 ?? 0} - {match.score2 ?? 0}</div>
                  <div className="player-card">
                    <p>{match.user2 || 'Player 2'}</p>
                    <span>Score: {match.score2 ?? 0}</span>
                  </div>
                </div>

                <div className="meta-list">
                  <div className="meta-item">
                    <strong>Status</strong>
                    <span>{match.status || 'ONGOING'}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Current Problem Index</strong>
                    <span>{match.curIdx ?? 0}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Predicted Winner</strong>
                    <span>{derivedWinner || 'TBD'}</span>
                  </div>
                </div>
              </>
            ) : null}
          </article>

          <aside className="card">
            <h2>Problems</h2>
            <p>Problem links become available once match starts.</p>
            <div className="problem-list">
              {(match?.problems || []).map((url, idx) => (
                <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer" className="problem-link">
                  Problem {idx + 1} · {url}
                </a>
              ))}
              {!match?.problems?.length ? <p>No problems loaded yet.</p> : null}
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
