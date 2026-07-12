import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [borrows, setBorrows] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const { data: p } = await supabase.from('resources').select('*, profiles(full_name)').eq('status', 'pending').order('created_at')
    setPending(p || [])

    const { data: b } = await supabase
      .from('borrow_requests')
      .select('*, resources(title), profiles(full_name, matric_number)')
      .order('requested_at', { ascending: false })
    setBorrows(b || [])

    const { data: a } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
    setAll(a || [])
    setLoading(false)
  }

  useEffect(() => {
    if (profile?.is_admin) loadAll()
  }, [profile])

  if (!authLoading && !profile?.is_admin) return <Navigate to="/catalogue" replace />

  async function setResourceStatus(id, status) {
    await supabase.from('resources').update({ status }).eq('id', id)
    loadAll()
  }

  async function deleteResource(id) {
    if (!confirm('Delete this resource permanently?')) return
    await supabase.from('resources').delete().eq('id', id)
    loadAll()
  }

  async function setBorrowStatus(id, status) {
    await supabase.from('borrow_requests').update({ status }).eq('id', id)
    loadAll()
  }

  return (
    <div>
      <span className="eyebrow">Librarian tools</span>
      <h1 style={{ fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>Admin dashboard</h1>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0 1.5rem' }}>
        {['pending', 'borrows', 'all'].map((t) => (
          <button
            key={t}
            className={tab === t ? 'btn' : 'btn btn-outline'}
            onClick={() => setTab(t)}
          >
            {t === 'pending' ? `Pending (${pending.length})` : t === 'borrows' ? 'Borrow requests' : 'All resources'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#777' }}>Loading…</p>
      ) : tab === 'pending' ? (
        pending.length === 0 ? <p style={{ color: '#777' }}>Nothing pending review.</p> :
        pending.map((r) => (
          <div key={r.id} className="card" style={{ padding: '1rem', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{r.title}</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#555' }}>
                  {r.type.replace('_', ' ')} {r.course_code && `· ${r.course_code}`} · submitted by {r.profiles?.full_name || 'unknown'}
                </p>
                {r.description && <p style={{ margin: 0, fontSize: '0.85rem' }}>{r.description}</p>}
                {r.external_link && <a href={r.external_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--forest)' }}>View link</a>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <button className="btn btn-gold" onClick={() => setResourceStatus(r.id, 'approved')}>Approve</button>
                <button className="btn btn-outline" onClick={() => setResourceStatus(r.id, 'rejected')}>Reject</button>
              </div>
            </div>
          </div>
        ))
      ) : tab === 'borrows' ? (
        borrows.length === 0 ? <p style={{ color: '#777' }}>No borrow requests yet.</p> :
        borrows.map((b) => (
          <div key={b.id} className="card" style={{ padding: '0.85rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{b.resources?.title}</strong>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#555' }}>
                {b.profiles?.full_name} ({b.profiles?.matric_number}) · {b.status}
              </p>
            </div>
            <select value={b.status} onChange={(e) => setBorrowStatus(b.id, e.target.value)}>
              {['requested', 'approved', 'borrowed', 'returned', 'declined'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))
      ) : (
        all.map((r) => (
          <div key={r.id} className="card" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <span>{r.title} <span className="tag" style={{ marginLeft: '0.4rem' }}>{r.status}</span></span>
            <button className="btn btn-outline" onClick={() => deleteResource(r.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  )
}
