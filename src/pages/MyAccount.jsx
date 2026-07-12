import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function MyAccount() {
  const { session, profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [borrows, setBorrows] = useState([])

  useEffect(() => {
    async function load() {
      const { data: subs } = await supabase
        .from('resources')
        .select('*')
        .eq('uploaded_by', session.user.id)
        .order('created_at', { ascending: false })
      setSubmissions(subs || [])

      const { data: br } = await supabase
        .from('borrow_requests')
        .select('*, resources(title)')
        .eq('user_id', session.user.id)
        .order('requested_at', { ascending: false })
      setBorrows(br || [])
    }
    if (session) load()
  }, [session])

  return (
    <div>
      <span className="eyebrow">Account</span>
      <h1 style={{ fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>{profile?.full_name || 'My account'}</h1>
      <p style={{ color: '#555', fontSize: '0.88rem' }}>{profile?.matric_number}</p>

      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '2rem' }}>My submissions</h3>
      {submissions.length === 0 ? (
        <p style={{ color: '#777', fontSize: '0.9rem' }}>You haven't submitted anything yet.</p>
      ) : (
        submissions.map((s) => (
          <div key={s.id} className="card" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{s.title}</span>
            <span className="tag" style={{ color: statusColor(s.status) }}>{s.status}</span>
          </div>
        ))
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '2rem' }}>My borrow requests</h3>
      {borrows.length === 0 ? (
        <p style={{ color: '#777', fontSize: '0.9rem' }}>No borrow requests yet.</p>
      ) : (
        borrows.map((b) => (
          <div key={b.id} className="card" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{b.resources?.title}</span>
            <span className="tag">{b.status}</span>
          </div>
        ))
      )}
    </div>
  )
}

function statusColor(status) {
  if (status === 'approved') return 'var(--forest)'
  if (status === 'rejected') return 'var(--red)'
  return '#8a7a3a'
}
