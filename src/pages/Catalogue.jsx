import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ResourceCard from '../components/ResourceCard'

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'book', label: 'Books' },
  { value: 'past_question', label: 'Past Questions' },
  { value: 'project', label: 'Projects' },
  { value: 'note', label: 'Notes' },
  { value: 'other', label: 'Other' },
]

export default function Catalogue() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [course, setCourse] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase.from('resources').select('*').eq('status', 'approved').order('created_at', { ascending: false })
      if (type) query = query.eq('type', type)
      if (course) query = query.ilike('course_code', `%${course}%`)
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      const { data, error } = await query
      if (!error) setResources(data || [])
      setLoading(false)
    }
    load()
  }, [search, type, course])

  return (
    <div>
      <span className="eyebrow">Catalogue</span>
      <h1 style={{ fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>Browse the collection</h1>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
        <input
          placeholder="Search title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 240px' }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ flex: '0 0 180px' }}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input
          placeholder="Course code, e.g. ZLY 301"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          style={{ flex: '0 0 200px' }}
        />
      </div>

      {loading ? (
        <p style={{ color: '#777' }}>Loading resources…</p>
      ) : resources.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>No resources match yet. Try a different search, or be the first to submit one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}
    </div>
  )
}
