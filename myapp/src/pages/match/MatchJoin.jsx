import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import './match.css'

export default function MatchJoin() {
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState(sessionStorage.getItem('cfduel:lastInviteCode') || '')
  const [isJoining, setIsJoining] = useState(false)
  const [joinedMatch, setJoinedMatch] = useState(null)
  const [status, setStatus] = useState({ text: '', type: 'ok' })

  const joinMatch = async (event) => {
    event.preventDefault()
    setStatus({ text: '', type: 'ok' })

    const code = inviteCode.trim().toUpperCase()
    if (!code) {
      setStatus({ text: 'Enter a valid invite code.', type: 'error' })
      return
    }

    setIsJoining(true)
    try {
      const response = await axiosInstance.post(`${API_PATHS.MATCH.JOIN}?inviteCode=${encodeURIComponent(code)}`)
      setJoinedMatch(response?.data || null)
      setStatus({ text: 'Joined successfully. Open room and wait for host to start.', type: 'ok' })
      sessionStorage.setItem('cfduel:lastInviteCode', code)

      navigate(`/match/${code}`, {
        state: {
          role: 'guest',
          joinedMatch: response?.data || null,
        },
      })
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not join with this code.'
      setStatus({ text: typeof message === 'string' ? message : 'Could not join with this code.', type: 'error' })
    } finally {
      setIsJoining(false)
    }
  }

  const openRoom = () => {
    const code = inviteCode.trim().toUpperCase()
    if (!code) return
    navigate(`/match/${code}`, {
      state: {
        role: 'guest',
        joinedMatch,
      },
    })
  }

  return (
    <main className="match-page">
      <section className="match-shell">
        <header className="match-top">
          <Link to="/" className="match-brand">CF<span>_</span>DUEL</Link>
          <nav className="match-nav">
            <Link className="nav-btn" to="/dashboard">Dashboard</Link>
            <Link className="nav-btn" to="/match/create">Create Match</Link>
          </nav>
        </header>

        <section className="match-header">
          <p className="match-kicker">// Match Join</p>
          <h1>Join room using invite code.</h1>
          <p>Paste the host code, join the room, and move to live tracking once the host starts the duel.</p>
        </section>

        <section className="match-grid">
          <article className="card">
            <h2>Join Match</h2>
            <p>Invite code is case-insensitive. It will be normalized to uppercase.</p>

            <form onSubmit={joinMatch}>
              <div className="field">
                <label htmlFor="inviteCode">Invite code</label>
                <input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  placeholder="XK7P2R"
                  maxLength={10}
                />
              </div>
              <div className="actions">
                <button className="btn-primary" type="submit" disabled={isJoining}>
                  {isJoining ? 'Joining...' : 'Join room'}
                </button>
                <button className="btn-ghost" type="button" onClick={openRoom} disabled={!inviteCode.trim()}>
                  Open room
                </button>
              </div>
            </form>

            {status.text ? <p className={`status ${status.type === 'error' ? 'error' : ''}`}>{status.text}</p> : null}
          </article>

          <aside className="card">
            <h2>Join Checklist</h2>
            <div className="meta-list">
              <div className="meta-item">
                <strong>1. Login with another account</strong>
                <span>Use a different browser profile or incognito session.</span>
              </div>
              <div className="meta-item">
                <strong>2. Use host invite code</strong>
                <span>Host generates this from create route.</span>
              </div>
              <div className="meta-item">
                <strong>3. Wait for start</strong>
                <span>Host starts match in room. Live score appears automatically.</span>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
