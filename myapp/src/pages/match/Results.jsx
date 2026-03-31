import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import './match.css'

function computeWinner(result) {
  if (result?.winnerId) return result.winnerId
  const score1 = result?.score1 ?? 0
  const score2 = result?.score2 ?? 0
  if (score1 === score2) return 'DRAW'
  return score1 > score2 ? result?.user1 || 'Player 1' : result?.user2 || 'Player 2'
}

export default function Results() {
  const { matchId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const saved = sessionStorage.getItem('cfduel:lastResult')
  const fallback = saved ? JSON.parse(saved) : null
  const result = location?.state?.result || fallback

  const winner = useMemo(() => computeWinner(result), [result])

  const openRoomAgain = () => {
    const code = result?.inviteCode
    if (!code) return
    navigate(`/match/${code}`)
  }

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
          <p className="match-kicker">// Results</p>
          <h1>Match Result · {matchId}</h1>
          <p>This page shows the latest available result snapshot from the live room flow.</p>
        </section>

        <section className="match-grid">
          <article className="card">
            <h2>Final Score</h2>
            {!result ? <p>No result data is available yet. Start and finish a match first.</p> : null}

            {result ? (
              <>
                <div className="score-row">
                  <div className="player-card">
                    <p>{result.user1 || 'Player 1'}</p>
                    <span>Score: {result.score1 ?? 0}</span>
                  </div>
                  <div className="score">{result.score1 ?? 0} - {result.score2 ?? 0}</div>
                  <div className="player-card">
                    <p>{result.user2 || 'Player 2'}</p>
                    <span>Score: {result.score2 ?? 0}</span>
                  </div>
                </div>

                <div className="meta-list">
                  <div className="meta-item">
                    <strong>Winner</strong>
                    <span>{winner}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Invite Code</strong>
                    <span>{result.inviteCode || 'N/A'}</span>
                  </div>
                </div>

                <div className="actions">
                  <button className="btn-primary" type="button" onClick={() => navigate('/match/create')}>
                    Create next match
                  </button>
                  <button className="btn-ghost" type="button" onClick={openRoomAgain} disabled={!result?.inviteCode}>
                    Reopen room
                  </button>
                </div>
              </>
            ) : null}
          </article>

          <aside className="card">
            <h2>What Next</h2>
            <div className="meta-list">
              <div className="meta-item">
                <strong>Rematch</strong>
                <span>Create a new room and share the new invite code.</span>
              </div>
              <div className="meta-item">
                <strong>Switch host</strong>
                <span>Let the other player create the room this time.</span>
              </div>
              <div className="meta-item">
                <strong>Go dashboard</strong>
                <span>Manage handles and quickly access create/join routes.</span>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
