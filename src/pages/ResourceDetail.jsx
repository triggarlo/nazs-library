import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ResourceDetail() {
  const { id } = useParams()
  const { session } = useAuth()
  const [resource, setResource] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [fileUrl, setFileUrl] = useState(null)
  const [borrowStatus, setBorrowStatus] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: res } = await supabase.from('resources').select('*').eq('id', id).single()
      setResource(res)

      if (res?.file_path) {
        const { data } = supabase.storage.from('resources').getPublicUrl(res.file_path)
        setFileUrl(data.publicUrl)
      }

      const { data: fb } = await supabase
        .from('feedback')
        .select('*, profiles(full_name)')
        .eq('resource_id', id)
        .order('created_at', { ascending: false })
      setFeedback(fb || [])

      if (session) {
        const { data: br } = await supabase
          .from('borrow_requests')
          .select('*')
          .eq('resource_id', id)
          .eq('user_id', session.user.id)
          .order('requested_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        setBorrowStatus(br?.status || null)
      }

      setLoading(false)
    }
    load()
  }, [id, session])

  async function requestBorrow() {
    const { error } = await supabase.from('borrow_requests').insert({
      resource_id: id,
      user_id: session.user.id,
      status: 'requested',
    })
    if (!error) setBorrowStatus('requested')
  }

  async function submitFeedback(e) {
    e.preventDefault()
    const { error } = await supabase.from('feedback').insert({
      resource_id: id,
      user_id: session.user.id,
      rating,
      comment,
    })
    if (!error) {
      setNotice('Thanks for the feedback!')
      setComment('')
      const { data: fb } = await supabase
        .from('feedback')
        .select('*, profiles(full_name)')
        .eq('resource_id', id)
        .order('created_at', { ascending: false })
      setFeedback(fb || [])
    }
  }

  if (loading) return <p style={{ color: '#777' }}>Loading…</p>
  if (!resource) return <p>Resource not found.</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <Link to="/catalogue" className="eyebrow">&larr; Back to catalogue</Link>

      <div style={{ display: 'flex', gap: '0.4rem', margin: '1rem 0 0.5rem' }}>
        <span className="tag">{resource.type.replace('_', ' ')}</span>
        {resource.course_code && <span className="tag">{resource.course_code}</span>}
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>{resource.title}</h1>
      {resource.author_or_source && <p style={{ color: '#555' }}>{resource.author_or_source}</p>}
      {resource.description && <p>{resource.description}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.25rem 0' }}>
        {resource.external_link && (
          <a className="btn" href={resource.external_link} target="_blank" rel="noreferrer">Open link</a>
        )}
        {fileUrl && (
          <a className="btn" href={fileUrl} target="_blank" rel="noreferrer">Download file</a>
        )}
        {session ? (
          <button className="btn btn-outline" onClick={requestBorrow} disabled={!!borrowStatus}>
            {borrowStatus ? `Borrow: ${borrowStatus}` : 'Request to borrow'}
          </button>
        ) : (
          <Link className="btn btn-outline" to="/login">Sign in to borrow</Link>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '2rem 0 1.5rem' }} />

      <h3 style={{ fontFamily: 'var(--font-display)' }}>Feedback</h3>

      {session && (
        <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            Rating
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginLeft: '0.5rem' }}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </label>
          <textarea rows={2} placeholder="Was this useful?" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn btn-gold" type="submit" style={{ alignSelf: 'flex-start' }}>Post feedback</button>
          {notice && <p style={{ color: 'var(--forest)', fontSize: '0.85rem' }}>{notice}</p>}
        </form>
      )}

      {feedback.length === 0 ? (
        <p style={{ color: '#777', fontSize: '0.9rem' }}>No feedback yet.</p>
      ) : (
        feedback.map((f) => (
          <div key={f.id} className="card" style={{ padding: '0.85rem 1rem', marginBottom: '0.6rem' }}>
            <strong style={{ fontSize: '0.85rem' }}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</strong>
            {f.comment && <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem' }}>{f.comment}</p>}
            <span className="eyebrow" style={{ display: 'block', marginTop: '0.3rem' }}>
              {f.profiles?.full_name || 'Anonymous'}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
