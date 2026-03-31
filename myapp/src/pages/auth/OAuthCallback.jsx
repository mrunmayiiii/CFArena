import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  
  console.log('Full URL:', window.location.href)  // ✅ add this
  console.log('Token:', token)                     // ✅ add this

  if (token) {
    localStorage.setItem('token', token)  // ✅ already storing correctly
    navigate('/dashboard', { replace: true })
  } else {
    navigate('/login', { replace: true })
  }
}, [navigate])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e8e8e0',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Logging you in...</p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #c8ff00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
