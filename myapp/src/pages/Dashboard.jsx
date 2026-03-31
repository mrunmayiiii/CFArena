import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { API_PATHS } from '../utils/apiPaths'
import './dashboard.css'

function decodeToken(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [cfHandle, setCfHandle] = useState('')
  const [duration, setDuration] = useState(30)
  const [joinCode, setJoinCode] = useState('')

  const [status, setStatus] = useState({ text: '', type: 'ok' })
  const [isSavingHandle, setIsSavingHandle] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [matchStatus, setMatchStatus] = useState(null)

  const token = localStorage.getItem('token')
  const claims = useMemo(() => decodeToken(token), [token])
  const userEmail = claims?.sub || 'player@cfarena'

  const showError = (message) => setStatus({ text: message, type: 'error' })
  const showSuccess = (message) => setStatus({ text: message, type: 'ok' })

  const loadMatchStatus = useCallback(async (code) => {
    if (!code) return
    try {
      const response = await axiosInstance.get(`${API_PATHS.MATCH.STATUS}?inviteCode=${encodeURIComponent(code)}`)
      setMatchStatus(response?.data || null)
    } catch {
      setMatchStatus(null)
    }
  }, [])

  useEffect(() => {
    if (!inviteCode) {
      setMatchStatus(null)
      return
    }
    loadMatchStatus(inviteCode)
    const timer = setInterval(() => loadMatchStatus(inviteCode), 3000)
    return () => clearInterval(timer)
  }, [inviteCode, loadMatchStatus])

  const onLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const onSaveHandle = async (event) => {
    event.preventDefault()
    setStatus({ text: '', type: 'ok' })

    if (!cfHandle.trim()) {
      showError('Enter a valid Codeforces handle.')
      return
    }

    setIsSavingHandle(true)
    try {
      await axiosInstance.post(API_PATHS.USER.ADD_CF_HANDLE, {
        cfHandle: cfHandle.trim(),
      })
      showSuccess('Codeforces handle updated successfully.')
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not update handle.'
      showError(typeof message === 'string' ? message : 'Could not update handle.')
    } finally {
      setIsSavingHandle(false)
    }
  }

  const onCreateMatch = async (event) => {
    event.preventDefault()
    setStatus({ text: '', type: 'ok' })
    setInviteCode('')

    setIsCreating(true)
    try {
      const response = await axiosInstance.post(API_PATHS.MATCH.CREATE, {
        duration: Number(duration),
      })

      const code = response?.data?.inviteCode
      if (!code) {
        showSuccess('Match created successfully.')
      } else {
        setInviteCode(code)
        setMatchStatus(response?.data || null)
        showSuccess('Match created. Share the invite code with your rival.')
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not create match.'
      showError(typeof message === 'string' ? message : 'Could not create match.')
    } finally {
      setIsCreating(false)
    }
  }

  const onJoinMatch = async (event) => {
    event.preventDefault()
    setStatus({ text: '', type: 'ok' })

    if (!joinCode.trim()) {
      showError('Enter an invite code to join a match.')
      return
    }

    setIsJoining(true)
    try {
      const code = joinCode.trim().toUpperCase()
      const response = await axiosInstance.post(`${API_PATHS.MATCH.JOIN}?inviteCode=${encodeURIComponent(code)}`)
      showSuccess('Joined match successfully. Opening room...')
      sessionStorage.setItem('cfduel:lastInviteCode', code)
      navigate(`/match/${code}`, {
        state: {
          role: 'guest',
          joinedMatch: response?.data || null,
        },
      })
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not join match.'
      showError(typeof message === 'string' ? message : 'Could not join match.')
    } finally {
      setIsJoining(false)
    }
  }

  const copyInviteCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      showSuccess('Invite code copied to clipboard.')
    } catch {
      showError('Copy failed. You can copy the code manually.')
    }
  }

  const onStartCreatedMatch = async () => {
    if (!inviteCode) return
    setStatus({ text: '', type: 'ok' })
    setIsStarting(true)
    try {
      await axiosInstance.post(`${API_PATHS.MATCH.START}?inviteCode=${encodeURIComponent(inviteCode)}`)
      showSuccess('Match started. Opening live room...')
      navigate(`/match/${inviteCode}`, { state: { role: 'host' } })
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not start match yet.'
      showError(typeof message === 'string' ? message : 'Could not start match yet.')
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-topbar">
          <Link to="/" className="dashboard-brand">
            CF<span>_</span>DUEL
          </Link>
          <div className="dashboard-actions">
            <Link to="/" className="dashboard-link">
              Home
            </Link>
            <button className="dashboard-logout" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-header">
          <p className="dashboard-kicker">// Dashboard</p>
          <h1>Control your duel workflow.</h1>
          <p>
            Set your Codeforces handle, create a match, and invite rivals from one place.
            This dashboard is designed as your match control panel before entering live battle.
          </p>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <h2>Match Setup</h2>
            <p>Use these actions before starting the live duel room.</p>

            <form className="section" onSubmit={onSaveHandle}>
              <h3>1. Update Codeforces Handle</h3>
              <div className="field">
                <label htmlFor="cfHandle">Codeforces handle</label>
                <input
                  id="cfHandle"
                  type="text"
                  placeholder="tourist"
                  value={cfHandle}
                  onChange={(event) => setCfHandle(event.target.value)}
                />
              </div>
              <div className="btn-row">
                <button className="btn-primary" type="submit" disabled={isSavingHandle}>
                  {isSavingHandle ? 'Saving...' : 'Save handle'}
                </button>
              </div>
            </form>

            <form className="section" onSubmit={onCreateMatch}>
              <h3>2. Create a Match</h3>
              <div className="field">
                <label htmlFor="duration">Duration</label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div className="btn-row">
                <button className="btn-primary" type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create match'}
                </button>
              </div>

              {inviteCode ? (
                <div className="invite-box">
                  <span className="invite-code">{inviteCode}</span>
                  <button className="btn-ghost" type="button" onClick={copyInviteCode}>
                    Copy code
                  </button>
                </div>
              ) : null}

              {inviteCode ? (
                <div className="btn-row">
                  <button className="btn-ghost" type="button" onClick={() => navigate(`/match/${inviteCode}`, { state: { role: 'host' } })}>
                    Open room
                  </button>
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={onStartCreatedMatch}
                    disabled={isStarting || matchStatus?.status !== 'READY'}
                  >
                    {isStarting ? 'Starting...' : 'Start match'}
                  </button>
                </div>
              ) : null}

              {inviteCode ? (
                <p className="status-chip">
                  Match status: {matchStatus?.status || 'WAITING'}
                </p>
              ) : null}
            </form>

            <form className="section" onSubmit={onJoinMatch}>
              <h3>3. Join by Invite Code</h3>
              <div className="field">
                <label htmlFor="joinCode">Invite code</label>
                <input
                  id="joinCode"
                  type="text"
                  placeholder="XK7P2R"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
              <div className="btn-row">
                <button className="btn-primary" type="submit" disabled={isJoining}>
                  {isJoining ? 'Joining...' : 'Join match'}
                </button>
              </div>
            </form>

            {status.text ? (
              <p className={`message ${status.type === 'error' ? 'error' : ''}`}>{status.text}</p>
            ) : null}
          </article>
        </section>
      </section>
    </main>
  )
}
