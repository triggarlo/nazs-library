import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function SubmitResource() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('book')
  const [courseCode, setCourseCode] = useState('')
  const [author, setAuthor] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    let filePath = null
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('resources').upload(path, file)
      if (uploadError) {
        setBusy(false)
        return setError(uploadError.message)
      }
      filePath = path
    }

    const { error: insertError } = await supabase.from('resources').insert({
      title,
      description,
      type,
      course_code: courseCode || null,
      author_or_source: author || null,
      external_link: externalLink || null,
      file_path: filePath,
      uploaded_by: session.user.id,
      status: 'pending',
    })

    setBusy(false)
    if (insertError) return setError(insertError.message)
    setDone(true)
    setTimeout(() => navigate('/catalogue'), 1800)
  }

  if (done) {
    return (
      <div className="card" style={{ padding: '2rem', maxWidth: 480, margin: '2rem auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Submitted for review</h2>
        <p>An admin will approve it before it appears in the catalogue. Thanks for contributing.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <span className="eyebrow">Contribute</span>
      <h1 style={{ fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>Submit a resource</h1>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Textbooks, past questions, project reports, or lecture notes — anything useful to fellow Zoology students.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.5rem' }}>
        <label style={labelStyle}>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label style={labelStyle}>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="book">Book</option>
            <option value="past_question">Past Question</option>
            <option value="project">Project</option>
            <option value="note">Note</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label style={labelStyle}>
          Course code (optional)
          <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. ZLY 301" />
        </label>

        <label style={labelStyle}>
          Author / source (optional)
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>

        <label style={labelStyle}>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label style={labelStyle}>
          Link (Google Drive, etc.) — optional if uploading a file
          <input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://…" />
        </label>

        <label style={labelStyle}>
          Or upload a file (PDF, DOCX)
          <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
        </label>

        {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>}

        <button className="btn btn-gold" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit for review'}
        </button>
      </form>
    </div>
  )
}

const labelStyle = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500 }
