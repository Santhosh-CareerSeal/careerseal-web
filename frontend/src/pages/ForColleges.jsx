import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import usePageMeta from '../hooks/usePageMeta'

// Public "Partner with GRID" application for colleges / TPOs. Creates a pending
// application the super admin reviews — never an instant login (trust gate).
function ForColleges() {
  usePageMeta({
    title: 'Partner with GRID — For Colleges & TPOs',
    description: 'Partner your institution with GRID: give your students verified career identities and connect them with recruiters. Apply to become a GRID partner college.',
    canonical: 'https://www.thegridcard.com/for-colleges',
  })
  const navigate = useNavigate()
  const [form, setForm] = useState({
    collegeName: '', tpoName: '', tpoEmail: '', tpoPhone: '', city: '', state: '',
    collegeType: '', aisheCode: '', studentCount: '', website: '', message: ''
  })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.collegeName.trim()) { setError('Please enter your institution name'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.tpoEmail)) { setError('Please enter a valid contact email'); return }
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/college/apply`, form)
      setDone(res.data.message || 'Application received!')
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const field = { width: '100%', border: '2px solid #eef0f3', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }
  const lbl = { fontSize: '11px', fontWeight: 700, color: '#6b7280', letterSpacing: '.04em', display: 'block', marginBottom: '6px' }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0e1b2e', display: 'grid', placeItems: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '18px', padding: '36px', maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e7f7ef', color: '#0f7a4f', display: 'grid', placeItems: 'center', fontSize: '26px', margin: '0 auto 16px' }}>✓</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1A3C6E', margin: '0 0 8px' }}>Application received</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 22px' }}>{done} Our team reviews every institution before activation.</p>
          <button onClick={() => navigate('/')} className="grid-shine" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 26px', fontWeight: 700, cursor: 'pointer' }}>Back to home</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e1b2e' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 18px 60px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 800, fontSize: '18px', cursor: 'pointer', marginBottom: '18px' }}>GRID<span style={{ color: '#5dcaa5' }}>.</span></button>

        <div style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 55%,#0d7377)', borderRadius: '18px', padding: '28px', color: '#fff', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: '999px', padding: '4px 11px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px' }}>
            <span style={{ color: '#5dcaa5' }}>✔</span> For colleges &amp; TPOs
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px' }}>Partner with GRID</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.8)', margin: 0, maxWidth: '56ch' }}>Give your students verified career identities, connect them with recruiters, and track placements — all in one portal. Apply below and our team will reach out.</p>
        </div>

        <form onSubmit={submit} style={{ background: '#fff', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && <div style={{ background: '#fdecec', border: '1px solid #f3c2c2', color: '#b42318', fontSize: '13px', borderRadius: '10px', padding: '10px 14px' }}>{error}</div>}

          <div><label style={lbl}>INSTITUTION NAME *</label><input style={field} value={form.collegeName} onChange={set('collegeName')} placeholder="e.g. PES University" /></div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}><label style={lbl}>TPO / CONTACT NAME</label><input style={field} value={form.tpoName} onChange={set('tpoName')} placeholder="Full name" /></div>
            <div style={{ flex: 1, minWidth: '220px' }}><label style={lbl}>CONTACT EMAIL *</label><input style={field} value={form.tpoEmail} onChange={set('tpoEmail')} placeholder="you@college.edu or any email" /></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}><label style={lbl}>CONTACT PHONE</label><input style={field} value={form.tpoPhone} onChange={set('tpoPhone')} placeholder="Mobile number" /></div>
            <div style={{ flex: 1, minWidth: '220px' }}><label style={lbl}>AISHE CODE (optional)</label><input style={field} value={form.aisheCode} onChange={set('aisheCode')} placeholder="If you have it" /></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}><label style={lbl}>CITY</label><input style={field} value={form.city} onChange={set('city')} placeholder="City" /></div>
            <div style={{ flex: 1, minWidth: '160px' }}><label style={lbl}>STATE</label><input style={field} value={form.state} onChange={set('state')} placeholder="State" /></div>
            <div style={{ flex: 1, minWidth: '160px' }}><label style={lbl}>APPROX. STUDENTS</label><input style={field} value={form.studentCount} onChange={set('studentCount')} placeholder="e.g. 2000" /></div>
          </div>

          <div><label style={lbl}>WEBSITE (optional)</label><input style={field} value={form.website} onChange={set('website')} placeholder="https://college.edu" /></div>
          <div><label style={lbl}>ANYTHING ELSE?</label><textarea style={{ ...field, resize: 'vertical' }} rows={3} value={form.message} onChange={set('message')} placeholder="Tell us about your placement needs" /></div>

          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>No institutional email? No problem — any contact email works. Our team verifies and activates partner institutions manually.</p>

          <button type="submit" disabled={loading} className="grid-shine" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)', color: '#fff', border: 'none', borderRadius: '11px', padding: '13px', fontSize: '15px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting…' : 'Apply to partner →'}
          </button>
          <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>Already a partner? <a href="/college-login" style={{ color: '#6b4edb', fontWeight: 700, textDecoration: 'none' }}>Sign in</a></p>
        </form>
      </div>
    </div>
  )
}

export default ForColleges
