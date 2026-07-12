import { Link } from 'react-router-dom'

const TYPE_LABELS = {
  book: 'Book',
  past_question: 'Past Question',
  project: 'Project',
  note: 'Note',
  other: 'Resource',
}

export default function ResourceCard({ resource }) {
  return (
    <Link to={`/resource/${resource.id}`} className="card" style={{ display: 'block', padding: '1.1rem', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        <span className="tag">{TYPE_LABELS[resource.type] || 'Resource'}</span>
        {resource.course_code && <span className="tag">{resource.course_code}</span>}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '0 0 0.35rem' }}>
        {resource.title}
      </h3>
      {resource.author_or_source && (
        <p style={{ fontSize: '0.82rem', color: '#5a5a52', margin: '0 0 0.5rem' }}>{resource.author_or_source}</p>
      )}
      {resource.description && (
        <p style={{ fontSize: '0.85rem', color: '#444', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {resource.description}
        </p>
      )}
    </Link>
  )
}
