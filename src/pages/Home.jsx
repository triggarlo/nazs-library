import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import nazsLogo from '../assets/nazs-logo.png'

export default function Home() {
  const { session } = useAuth()

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
        <img src={nazsLogo} alt="NAZS logo" style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '50%' }} />
        <span className="eyebrow">National Association of Zoology Students &middot; Unilorin</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', maxWidth: 620, margin: '0.5rem 0 1rem' }}>
        A shared collection, built by the department, for the department.
      </h1>
      <p style={{ maxWidth: 560, color: '#444', marginBottom: '2rem' }}>
        Textbooks, past questions by course code, final-year projects, and lecture notes —
        submitted by students, reviewed by the Librarian, and open to every member of NAZS.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link className="btn btn-gold" to="/catalogue">Browse the catalogue</Link>
        {!session && <Link className="btn btn-outline" to="/login">Create your account</Link>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '3rem' }}>
        <Feature title="Search & filter" body="Find resources instantly by type or course code — ZLY 301, 303, 305 and beyond." />
        <Feature title="Submit resources" body="Upload a file or drop a link. The Librarian reviews before it goes live." />
        <Feature title="Borrow & feedback" body="Request physical items and leave ratings so the best resources rise to the top." />
      </div>
    </div>
  )
}

function Feature({ title, body }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.4rem', fontSize: '1.05rem' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>{body}</p>
    </div>
  )
}
