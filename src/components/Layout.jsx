import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import nazsLogo from '../assets/nazs-logo.png'

export default function Layout({ children }) {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: '5px',
          background: 'linear-gradient(90deg, var(--terracotta) 0 25%, var(--gold) 25% 50%, var(--forest) 50% 75%, var(--blue) 75% 100%)',
        }}
      />
      <header
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={nazsLogo} alt="NAZS logo" style={{ height: '48px', width: '48px', objectFit: 'contain' }} />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span className="eyebrow">NAZS &middot; Unilorin</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600 }}>
                Digital Library
              </span>
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.9rem' }}>
            <NavLink to="/catalogue" style={navStyle}>Catalogue</NavLink>
            {session && <NavLink to="/submit" style={navStyle}>Submit Resource</NavLink>}
            {session && <NavLink to="/my-account" style={navStyle}>My Account</NavLink>}
            {profile?.is_admin && <NavLink to="/admin" style={navStyle}>Admin</NavLink>}
            {session ? (
              <button className="btn btn-outline" onClick={handleSignOut}>Sign out</button>
            ) : (
              <NavLink to="/login" className="btn">Sign in</NavLink>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '1.5rem', textAlign: 'center' }}>
        <span className="eyebrow">Built for NAZS by the office of the Librarian</span>
      </footer>
    </div>
  )
}

const navStyle = ({ isActive }) => ({
  color: isActive ? 'var(--forest)' : 'var(--ink)',
  fontWeight: isActive ? 600 : 500,
  borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
  paddingBottom: '2px',
})
