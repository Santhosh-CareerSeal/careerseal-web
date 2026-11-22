import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

// Public landing for a college's invite link: /join/:slug. Stores the slug so
// the student is auto-linked to this college when they finish their profile.
function JoinCollege() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [college, setCollege] = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/api/college/by-slug/${slug}`)
      .then(r => {
        setCollege(r.data.college)
        try { localStorage.setItem('pendingCollegeSlug', slug) } catch { /* no-op */ }
      })
      .catch(() => setErr(true))
  }, [slug])

  if (err) return (
    <div style={{ minHeight: '100vh', background: '#0e1b2e', display: 'grid', placeItems: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1A3C6E', margin: '0 0 8px' }}>Invite link not found</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }}>This college invite link looks invalid. You can still join GRID directly.</p>
        <button onClick={() => navigate('/register-student')} className="grid-shine" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 26px', fontWeight: 700, cursor: 'pointer' }}>Create your GRID Card</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0e1b2e', display: 'grid', placeItems: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '34px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#f3eefe', color: '#6b4edb', borderRadius: '999px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '16px' }}>🎓 College invite</div>
        {college ? (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A3C6E', margin: '0 0 6px' }}>Join GRID via<br/>{college.collegeName}</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px' }}>{[college.city, college.state].filter(Boolean).join(', ')}{(college.city || college.state) ? ' · ' : ''}Create your verified career identity — you'll be linked to your college automatically.</p>
            <button onClick={() => navigate('/register-student')} className="grid-shine" style={{ width: '100%', background: 'linear-gradient(135deg,#6b4edb,#0d7377)', color: '#fff', border: 'none', borderRadius: '11px', padding: '14px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginBottom: '10px' }}>Create your GRID Card →</button>
            <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: 0 }}>Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#6b4edb', fontWeight: 700, cursor: 'pointer' }}>Sign in</span> and complete your profile — your college will be pre-selected.</p>
          </>
        ) : (
          <p style={{ color: '#6b7280' }}>Loading…</p>
        )}
      </div>
    </div>
  )
}

export default JoinCollege
