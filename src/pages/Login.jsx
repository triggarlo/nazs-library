import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)

    if (mode === 'signin') {
      const { error } = await signIn({ email, password })
      setBusy(false)
      if (error) return setError(error.message)
      navigate('/catalogue')
    } else {
      const { error } = await signUp({ email, password, fullName, matricNumber })
      setBusy(false)
      if (error) return setError(error.message)
      setNotice('Account created. Check your email to confirm, then sign in.')
      setMode('signin')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <span className="eyebrow">{mode === 'signin' ? 'Member sign in' : 'Create account'}</span>
      <h1 style={{ fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
        {mode === 'signin' ? 'Welcome back' : 'Join the library'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
        {mode === 'signup' && (
          <>
            <label style={labelStyle}>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label style={labelStyle}>
              Matric number
              <input value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} placeholder="e.g. 20/56ZY123" required />
            </label>
          </>
        )}
        <label style={labelStyle}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={labelStyle}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>

        {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>}
        {notice && <p style={{ color: 'var(--forest)', fontSize: '0.85rem' }}>{notice}</p>}

        <button className="btn btn-gold" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: '1.25rem', fontSize: '0.88rem' }}>
        {mode === 'signin' ? "New here?" : 'Already have an account?'}{' '}
        <button
          className="btn btn-outline"
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.82rem' }}
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice('') }}
        >
          {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
        </button>
      </p>
    </div>
  )
}

const labelStyle = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500 }
