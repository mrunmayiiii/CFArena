import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import './match.css'

export default function MatchCreate() {
  const navigate = useNavigate()
  const [duration, setDuration] = useState(30)
  const [isCreating, setIsCreating] = useState(false)
  const [createdMatch, setCreatedMatch] = useState(null)
  const [status, setStatus] = useState({ text: '', type: 'ok' })

  const createMatch = async (event) => {
    event.preventDefault()
    setStatus({ text: '', type: 'ok' })
    setCreatedMatch(null)
    setIsCreating(true)
    try {
      const response = await axiosInstance.post(API_PATHS.MATCH.CREATE, {
        duration: Number(duration),
      })
      const match = response?.data
      setCreatedMatch(match)
      setStatus({ text: 'Match created successfully. Share the invite code now.', type: 'ok' })
      if (match?.inviteCode) {
        sessionStorage.setItem('cfduel:lastInviteCode', match.inviteCode)
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not create match.'
      setStatus({ text: typeof message === 'string' ? message : 'Could not create match.', type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  const copyCode = async () => {
    if (!createdMatch?.inviteCode) return
    try {
      await navigator.clipboard.writeText(createdMatch.inviteCode)
      setStatus({ text: 'Invite code copied to clipboard.', type: 'ok' })
    } catch {
      setStatus({ text: 'Copy failed. Please copy the code manually.', type: 'error' })
    }
  }

  const goToRoom = () => {
    if (!createdMatch?.inviteCode) return
    navigate(`/match/${createdMatch.inviteCode}`, {
      state: {
        role: 'host',
        createdMatch,
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
            <Link className="nav-btn" to="/match/join">Join Match</Link>
          </nav>
        </header>

        <section className="match-header">
          <p className="match-kicker">// Match Create</p>
          <h1>Create your room and invite your rival.</h1>
          <p>Pick a duration, generate an invite code, and move to the live room when both players are ready.</p>
        </section>

        <section className="match-grid">
          <article className="card">
            <h2>Create Match</h2>
            <p>This route is dedicated to host workflow and invite generation.</p>

            <form onSubmit={createMatch}>
              <div className="field">
                <label htmlFor="duration">Match duration</label>
                <select id="duration" value={duration} onChange={(event) => setDuration(event.target.value)}>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div className="actions">
                <button className="btn-primary" type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Generate invite code'}
                </button>
              </div>
            </form>

            {createdMatch?.inviteCode ? (
              <div className="code-box">
                <span className="code-value">{createdMatch.inviteCode}</span>
                <div className="actions">
                  <button className="btn-ghost" type="button" onClick={copyCode}>Copy</button>
                  <button className="btn-primary" type="button" onClick={goToRoom}>Open room</button>
                </div>
              </div>
            ) : null}

            {status.text ? <p className={`status ${status.type === 'error' ? 'error' : ''}`}>{status.text}</p> : null}
          </article>

          <aside className="card">
            <h2>Host Checklist</h2>
            <div className="meta-list">
              <div className="meta-item">
                <strong>1. Generate code</strong>
                <span>Creating a match returns a unique invite code.</span>
              </div>
              <div className="meta-item">
                <strong>2. Share with opponent</strong>
                <span>Send the code to another logged-in user.</span>
              </div>
              <div className="meta-item">
                <strong>3. Enter live room</strong>
                <span>Use Open room and click start once opponent joins.</span>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
