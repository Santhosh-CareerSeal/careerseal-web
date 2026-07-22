import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const STAGES = ['applied', 'shortlisted', 'interview', 'hired', 'rejected']
const STAGE_COLORS = {
  applied: { bg: '#f0f4ff', border: '#1A3C6E', text: '#1A3C6E', badge: '#1A3C6E' },
  shortlisted: { bg: '#FFF9C4', border: '#EF9F27', text: '#854F0B', badge: '#EF9F27' },
  interview: { bg: '#f0fafa', border: '#0D7377', text: '#0D7377', badge: '#0D7377' },
  hired: { bg: '#E1F5EE', border: '#085041', text: '#085041', badge: '#085041' },
  rejected: { bg: '#FEE2E2', border: '#ef4444', text: '#ef4444', badge: '#ef4444' }
}

function getMatchScore(student, job) {
  if (!student || !job) return 0
  let score = 30
  const studentSkills = (student.technicalSkills || student.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const jobSkills = (job.requiredSkills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  if (studentSkills.length > 0 && jobSkills.length > 0) {
    const matched = studentSkills.filter(s => jobSkills.some(j => j.includes(s) || s.includes(j)))
    score += Math.min((matched.length / Math.max(jobSkills.length, 1)) * 50, 50)
  }
  if (student.preferredJobType && job.jobType && student.preferredJobType.toLowerCase() === job.jobType.toLowerCase()) score += 10
  if (student.workStatus && job.experienceLevel) {
    const ws = student.workStatus.toLowerCase()
    const el = job.experienceLevel.toLowerCase()
    if (ws === el || (ws === 'fresher' && el === 'fresher') || (ws === 'student' && el === 'fresher')) score += 10
  }
  return Math.min(Math.round(score), 99)
}

function Sidebar({ active, setActive, company, navigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'post-job', label: 'Post a Job', icon: '💼' },
    { id: 'candidates', label: 'Candidates', icon: '👥' },
    { id: 'my-jobs', label: 'My Jobs', icon: '📋' },
    { id: 'search-talent', label: 'Search Talent', icon: '🔍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'company-profile', label: 'Company Profile', icon: '🏢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]
  return (
    <div style={{ width: '200px', background: '#0f1e3d', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <svg width="16" height="16" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>GRID</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#0D7377', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
          {company?.companyName?.charAt(0) || 'C'}
        </div>
        <p style={{ color: 'white', fontSize: '11px', fontWeight: '600', margin: '0 0 2px' }}>{company?.companyName || 'Company'}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: company?.mcaStatus === 'verified' ? '#5DCAA5' : '#EF9F27' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>{company?.mcaStatus === 'verified' ? 'Verified' : 'Pending verification'}</p>
        </div>
      </div>
      {navItems.map(item => (
        <div key={item.id} onClick={() => setActive(item.id)}
          style={{ padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: active === item.id ? '#1A3C6E' : 'transparent', color: active === item.id ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
          <span>{item.icon}</span>{item.label}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)' }}
        onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }}>
        🚪 Logout
      </div>
    </div>
  )
}

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [company, setCompany] = useState(null)
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [talent, setTalent] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [colleges, setColleges] = useState([])

  // Post job form
  const [jobForm, setJobForm] = useState({ title: '', description: '', requiredSkills: '', jobType: '', experienceLevel: '', location: '', salaryRange: '', openings: '1', deadline: '', targetCollegeId: '' })
  const [jobError, setJobError] = useState('')
  const [jobSuccess, setJobSuccess] = useState('')
  const [jobLoading, setJobLoading] = useState(false)

  // Search talent
  const [talentSearch, setTalentSearch] = useState({ skills: '', location: '', workStatus: '' })

  // Company profile form
  const [profileForm, setProfileForm] = useState({})
  const [profileSuccess, setProfileSuccess] = useState('')

  // Settings
  const [settingsTab, setSettingsTab] = useState('account')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your company account, all jobs and candidate data.')) return
    if (!window.confirm('Final warning — this cannot be undone. Continue?')) return
    try {
      await axios.delete(`${API_URL}/api/auth/delete-account`, { headers })
      localStorage.removeItem('token'); localStorage.removeItem('user')
      navigate('/login')
    } catch (e) { alert('Could not delete account. Please try again.') }
  }

  useEffect(() => {
    const init = async () => {
      try {
        if (!token) { navigate('/login'); return }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
        if (storedUser.role !== 'company') { navigate('/dashboard'); return }
        const [profileRes, statsRes, jobsRes, candidatesRes, analyticsRes] = await Promise.all([
          axios.get(`${API_URL}/api/company/profile`, { headers }),
          axios.get(`${API_URL}/api/company/dashboard`, { headers }),
          axios.get(`${API_URL}/api/company/jobs`, { headers }),
          axios.get(`${API_URL}/api/company/candidates`, { headers }),
          axios.get(`${API_URL}/api/company/analytics`, { headers })
        ])
        setCompany(profileRes.data.company)
        setStats(statsRes.data)
        setJobs(jobsRes.data.jobs || [])
        setCandidates(candidatesRes.data.applications || [])
        setAnalytics(analyticsRes.data)
        try {
          const collegeRes = await axios.get(`${API_URL}/api/college/list`)
          setColleges(collegeRes.data.colleges || collegeRes.data || [])
        } catch (e) { setColleges([]) }
        setProfileForm({
          companyName: profileRes.data.company.companyName || '',
          description: profileRes.data.company.description || '',
          industry: profileRes.data.company.industry || '',
          companySize: profileRes.data.company.companySize || '',
          website: profileRes.data.company.website || '',
          location: profileRes.data.company.location || '',
          foundedYear: profileRes.data.company.foundedYear || '',
          linkedIn: profileRes.data.company.linkedIn || '',
          twitter: profileRes.data.company.twitter || ''
        })
      } catch (e) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handlePostJob = async () => {
    setJobError(''); setJobSuccess('')
    if (!jobForm.title || !jobForm.jobType || !jobForm.experienceLevel || !jobForm.location || !jobForm.salaryRange) {
      setJobError('Please fill in all required fields'); return
    }
    setJobLoading(true)
    try {
      await axios.post(`${API_URL}/api/company/jobs`, jobForm, { headers })
      setJobSuccess('Job posted successfully!')
      setJobForm({ title: '', description: '', requiredSkills: '', jobType: '', experienceLevel: '', location: '', salaryRange: '', openings: '1', deadline: '', targetCollegeId: '' })
      const jobsRes = await axios.get(`${API_URL}/api/company/jobs`, { headers })
      setJobs(jobsRes.data.jobs || [])
      setTimeout(() => { setActive('my-jobs'); setJobSuccess('') }, 1500)
    } catch (e) {
      setJobError(e.response?.data?.message || 'Could not post job')
    } finally {
      setJobLoading(false)
    }
  }

  const REJECT_REASONS = [
    { key: 'skills_mismatch', label: 'Skills do not match the role' },
    { key: 'experience_gap', label: 'Not enough relevant experience' },
    { key: 'position_filled', label: 'Position already filled' },
    { key: 'better_candidate', label: 'Another candidate was a closer fit' },
    { key: 'other', label: 'Other' }
  ]
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [rejectSaving, setRejectSaving] = useState(false)

  const handleUpdateStatus = async (applicationId, status) => {
    if (status === 'rejected') {
      setRejectModal(applicationId); setRejectReason(''); setRejectNote(''); setRejectError('')
      return
    }
    try {
      await axios.put(`${API_URL}/api/company/applications/${applicationId}`, { status }, { headers })
      setCandidates(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a))
    } catch (e) { console.error(e) }
  }

  const submitRejection = async () => {
    if (!rejectReason) { setRejectError('Please select a reason — candidates deserve to know why.'); return }
    setRejectSaving(true)
    try {
      await axios.put(`${API_URL}/api/company/applications/${rejectModal}`, { status: 'rejected', rejectionReason: rejectReason, rejectionNote: rejectNote }, { headers })
      setCandidates(prev => prev.map(a => a.id === rejectModal ? { ...a, status: 'rejected', rejectionReason: rejectReason, rejectionNote: rejectNote } : a))
      setRejectModal(null)
    } catch (e) { setRejectError(e.response?.data?.message || 'Could not save. Try again.') }
    finally { setRejectSaving(false) }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job? All applications will also be deleted.')) return
    try {
      await axios.delete(`${API_URL}/api/company/jobs/${jobId}`, { headers })
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch (e) { console.error(e) }
  }

  const handleUpdateJobStatus = async (jobId, status) => {
    try {
      await axios.put(`${API_URL}/api/company/jobs/${jobId}`, { status }, { headers })
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j))
    } catch (e) { console.error(e) }
  }

  const handleSearchTalent = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/company/talent`, { params: talentSearch, headers })
      setTalent(res.data.students || [])
    } catch (e) { console.error(e) }
  }

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`${API_URL}/api/company/profile`, profileForm, { headers })
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (e) { console.error(e) }
  }

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  const daysAgo = (date) => {
    const d = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#1A3C6E', fontWeight: '700', fontSize: '18px' }}>Loading company dashboard...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f4f5f7' }}>
      <Sidebar active={active} setActive={setActive} company={company} navigate={navigate} />

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '440px', maxWidth: '90vw' }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Why are you rejecting this candidate?</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>GRID requires feedback so students know where they stand. This is shared with the candidate.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {REJECT_REASONS.map(r => (
                <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', cursor: 'pointer' }}>
                  <input type="radio" name="rejectReason" checked={rejectReason === r.key} onChange={() => { setRejectReason(r.key); setRejectError('') }} />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3} maxLength={500}
              placeholder="Add a short note to help them improve (optional)"
              style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', resize: 'vertical', marginBottom: '10px' }} />
            {rejectError && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', margin: '0 0 10px' }}>{rejectError}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, background: '#f8f9fa', color: '#6b7280', border: '1px solid #eee', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitRejection} disabled={rejectSaving} style={{ flex: 1, background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: rejectSaving ? 0.7 : 1 }}>
                {rejectSaving ? 'Saving...' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* ── DASHBOARD ── */}
        {active === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name}! 👋</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{stats?.totalApplications > 0 ? `You have ${candidates.filter(a => a.status === 'applied').length} new applications to review` : 'Post your first job to start receiving applications'}</p>
              </div>
              <button onClick={() => setActive('post-job')} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>+ Post New Job</button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'ACTIVE JOBS', value: stats?.activeJobs || 0, sub: 'Currently live', color: '#1A3C6E' },
                { label: 'TOTAL APPLICANTS', value: stats?.totalApplications || 0, sub: 'Across all jobs', color: '#1A3C6E' },
                { label: 'SHORTLISTED', value: stats?.shortlisted || 0, sub: 'Pending review', color: '#EF9F27' },
                { label: 'HIRED', value: stats?.hired || 0, sub: 'This month', color: '#0D7377' }
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 6px', fontWeight: '600', letterSpacing: '1px' }}>{s.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Recent applicants */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>Recent Applicants</p>
                  <span onClick={() => setActive('candidates')} style={{ fontSize: '11px', color: '#0D7377', fontWeight: '600', cursor: 'pointer' }}>View all →</span>
                </div>
                {candidates.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No applications yet</p>
                ) : candidates.slice(0, 5).map((app, i) => {
                  const score = getMatchScore(app.student, app.job)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 4 ? '1px solid #f9f9f9' : 'none' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1A3C6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                        {app.student?.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>{app.student?.user?.name || 'Student'}</p>
                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{app.job?.title} · {daysAgo(app.createdAt)}</p>
                      </div>
                      <span style={{ background: score >= 70 ? '#E1F5EE' : '#FFF9C4', color: score >= 70 ? '#085041' : '#854F0B', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{score}% match</span>
                    </div>
                  )
                })}
              </div>

              {/* Hiring pipeline */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 12px' }}>Hiring Pipeline</p>
                {STAGES.map(stage => {
                  const count = candidates.filter(a => (a.status || 'applied') === stage).length
                  const sc = STAGE_COLORS[stage]
                  return (
                    <div key={stage} style={{ background: sc.bg, borderLeft: `3px solid ${sc.border}`, borderRadius: '6px', padding: '8px 12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: sc.text }}>{capitalize(stage)}</span>
                      <span style={{ background: sc.badge, color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Active jobs */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>Active Job Postings</p>
                  <span onClick={() => setActive('my-jobs')} style={{ fontSize: '11px', color: '#0D7377', fontWeight: '600', cursor: 'pointer' }}>Manage all →</span>
                </div>
                {jobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>No jobs posted yet</p>
                    <button onClick={() => setActive('post-job')} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Post your first job</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {jobs.filter(j => j.status === 'active' || !j.status).slice(0, 3).map((job, i) => (
                      <div key={i} style={{ border: '1.5px solid #eee', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>{job.title}</p>
                          <span style={{ background: '#E1F5EE', color: '#085041', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', fontWeight: '600' }}>Active</span>
                        </div>
                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 6px' }}>{job.jobType} · {job.location} · {job.salaryRange}</p>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          {(job.requiredSkills || '').split(',').slice(0, 3).map((s, j) => (
                            <span key={j} style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', fontWeight: '600' }}>{s.trim()}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: '10px', color: '#0D7377', fontWeight: '600', margin: 0 }}>{job.applications?.length || 0} applicants</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── POST JOB ── */}
        {active === 'post-job' && (
          <div style={{ maxWidth: '680px' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Post a New Job</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>Fill in the details — the more specific, the better your candidate matches</p>

            {jobError && <div style={{ background: '#FEE2E2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '13px', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px' }}>{jobError}</div>}
            {jobSuccess && <div style={{ background: '#E1F5EE', border: '1px solid #6ee7b7', color: '#065f46', fontSize: '13px', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px' }}>✓ {jobSuccess}</div>}

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>JOB TITLE *</label>
                <input value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Frontend Developer, Java Engineer, Marketing Manager"
                  style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>JOB DESCRIPTION</label>
                <textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Describe the role, responsibilities and what you're looking for..."
                  rows={4} style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>REQUIRED SKILLS *</label>
                <input value={jobForm.requiredSkills} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} placeholder="e.g. React, Node.js, Python (comma separated)"
                  style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '4px 0 0' }}>These are used for smart candidate matching</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>TARGET COLLEGE (OPTIONAL)</label>
                <select value={jobForm.targetCollegeId} onChange={e => setJobForm({ ...jobForm, targetCollegeId: e.target.value })}
                  style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', background: 'white' }}>
                  <option value="">Open to all colleges</option>
                  {colleges.map(c => <option key={c.id} value={c.id}>{c.collegeName}</option>)}
                </select>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '4px 0 0' }}>Target a specific partner college, or leave open to all students</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>JOB TYPE *</label>
                  <select value={jobForm.jobType} onChange={e => setJobForm({ ...jobForm, jobType: e.target.value })}
                    style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', background: 'white' }}>
                    <option value="">Select type</option>
                    {['Full-time', 'Part-time', 'Internship', 'Remote', 'Freelance'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>EXPERIENCE LEVEL *</label>
                  <select value={jobForm.experienceLevel} onChange={e => setJobForm({ ...jobForm, experienceLevel: e.target.value })}
                    style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', background: 'white' }}>
                    <option value="">Select level</option>
                    {['Fresher', '1-3 years', '3-5 years', '5+ years'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>LOCATION *</label>
                  <input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Hyderabad, Remote"
                    style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>SALARY RANGE *</label>
                  <input value={jobForm.salaryRange} onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })} placeholder="e.g. 5-8 LPA"
                    style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>NO. OF OPENINGS</label>
                  <input type="number" value={jobForm.openings} onChange={e => setJobForm({ ...jobForm, openings: e.target.value })} min="1"
                    style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>APPLICATION DEADLINE</label>
                  <input type="date" value={jobForm.deadline} onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                    style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                </div>
              </div>

              <button onClick={handlePostJob} disabled={jobLoading}
                style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: jobLoading ? 0.7 : 1 }}>
                {jobLoading ? 'Posting...' : 'Post Job →'}
              </button>
            </div>
          </div>
        )}

        {/* ── CANDIDATES ── */}
        {active === 'candidates' && (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>All Candidates</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>Manage applications across all your job postings</p>

            {candidates.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>👥</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A3C6E', marginBottom: '6px' }}>No applications yet</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Post a job to start receiving applications</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {candidates.map((app, i) => {
                  const score = getMatchScore(app.student, app.job)
                  const sc = STAGE_COLORS[app.status || 'applied']
                  return (
                    <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1.5px solid #eee', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1A3C6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
                        {app.student?.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 2px' }}>{app.student?.user?.name || 'Student'}</p>
                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Applied for: {app.job?.title} · {daysAgo(app.createdAt)}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ background: score >= 70 ? '#E1F5EE' : score >= 50 ? '#FFF9C4' : '#f0f0f0', color: score >= 70 ? '#085041' : score >= 50 ? '#854F0B' : '#555', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>{score}% match</span>
                            <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>{capitalize(app.status || 'applied')}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0' }}>
                          {(app.student?.technicalSkills || app.student?.skills || '').split(',').slice(0, 4).map((s, j) => (
                            <span key={j} style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>{s.trim()}</span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                          {app.student?.gridNumber && (
                            <button onClick={() => window.open(`/profile/${app.student.gridNumber}`, '_blank')}
                              style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                              View GRID Profile
                            </button>
                          )}
                          {STAGES.filter(s => s !== (app.status || 'applied')).map(stage => (
                            <button key={stage} onClick={() => handleUpdateStatus(app.id, stage)}
                              style={{ background: STAGE_COLORS[stage].bg, color: STAGE_COLORS[stage].text, border: `1px solid ${STAGE_COLORS[stage].border}`, borderRadius: '6px', padding: '5px 10px', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}>
                              → {capitalize(stage)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MY JOBS ── */}
        {active === 'my-jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>My Job Postings</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{jobs.length} jobs posted</p>
              </div>
              <button onClick={() => setActive('post-job')} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>+ Post New Job</button>
            </div>

            {jobs.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📋</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A3C6E', marginBottom: '8px' }}>No jobs posted yet</p>
                <button onClick={() => setActive('post-job')} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Post your first job</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {jobs.map((job, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1.5px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>{job.title}</p>
                          <span style={{ background: job.status === 'active' || !job.status ? '#E1F5EE' : job.status === 'paused' ? '#FFF9C4' : '#FEE2E2', color: job.status === 'active' || !job.status ? '#085041' : job.status === 'paused' ? '#854F0B' : '#dc2626', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{capitalize(job.status || 'active')}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{job.jobType} · {job.location} · {job.salaryRange} · Posted {daysAgo(job.createdAt)}</p>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#0D7377', margin: 0 }}>{job.applications?.length || 0} applicants</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {(job.requiredSkills || '').split(',').map((s, j) => (
                        <span key={j} style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>{s.trim()}</span>
                      ))}
                      <span style={{ background: '#f8f9fa', color: '#6b7280', fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>{job.experienceLevel}</span>
                      {job.openings && <span style={{ background: '#f8f9fa', color: '#6b7280', fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => setActive('candidates')} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>View Applicants</button>
                      {(job.status === 'active' || !job.status) ? (
                        <button onClick={() => handleUpdateJobStatus(job.id, 'paused')} style={{ background: '#FFF9C4', color: '#854F0B', border: '1px solid #EF9F27', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Pause</button>
                      ) : (
                        <button onClick={() => handleUpdateJobStatus(job.id, 'active')} style={{ background: '#E1F5EE', color: '#085041', border: '1px solid #0D7377', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Reactivate</button>
                      )}
                      <button onClick={() => handleUpdateJobStatus(job.id, 'closed')} style={{ background: '#f8f9fa', color: '#6b7280', border: '1px solid #eee', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                      <button onClick={() => handleDeleteJob(job.id)} style={{ background: '#FEE2E2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SEARCH TALENT ── */}
        {active === 'search-talent' && (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Search Talent</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>Browse verified GRID student profiles</p>

            <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '4px' }}>SKILLS</label>
                <input value={talentSearch.skills} onChange={e => setTalentSearch({ ...talentSearch, skills: e.target.value })} placeholder="e.g. React, Python"
                  style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '4px' }}>LOCATION</label>
                <input value={talentSearch.location} onChange={e => setTalentSearch({ ...talentSearch, location: e.target.value })} placeholder="e.g. Hyderabad"
                  style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '4px' }}>WORK STATUS</label>
                <select value={talentSearch.workStatus} onChange={e => setTalentSearch({ ...talentSearch, workStatus: e.target.value })}
                  style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', background: 'white' }}>
                  <option value="">All</option>
                  <option>Student</option><option>Fresher</option><option>Experienced</option>
                </select>
              </div>
              <button onClick={handleSearchTalent} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Search</button>
            </div>

            {talent.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', marginBottom: '6px' }}>Search for talent</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Enter skills, location or work status to find verified students</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {talent.map((student, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1.5px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1A3C6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
                        {student.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 2px' }}>{student.user?.name}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{student.workStatus} · {student.city || 'Location not set'}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5DCAA5' }}></div>
                        <span style={{ fontSize: '9px', color: '#0D7377', fontWeight: '600' }}>Verified</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {(student.technicalSkills || student.skills || '').split(',').slice(0, 4).map((s, j) => (
                        <span key={j} style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>{s.trim()}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {student.gridNumber && (
                        <button onClick={() => window.open(`/profile/${student.gridNumber}`, '_blank')}
                          style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>View GRID</button>
                      )}
                      <button style={{ background: '#f0f4ff', color: '#1A3C6E', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Invite to Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {active === 'analytics' && (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 20px' }}>Analytics</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'TOTAL JOBS POSTED', value: analytics?.totalJobs || 0 },
                { label: 'TOTAL APPLICATIONS', value: analytics?.totalApplications || 0 },
                { label: 'HIRE RATE', value: analytics?.pipeline?.hired > 0 ? `${Math.round((analytics.pipeline.hired / analytics.totalApplications) * 100)}%` : '0%' }
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 6px', fontWeight: '600', letterSpacing: '1px' }}>{s.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Pipeline */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>Hiring Funnel</p>
                {STAGES.map(stage => {
                  const count = analytics?.pipeline?.[stage] || 0
                  const max = analytics?.pipeline?.applied || 1
                  const sc = STAGE_COLORS[stage]
                  return (
                    <div key={stage} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: sc.text }}>{capitalize(stage)}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A3C6E' }}>{count}</span>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                        <div style={{ background: sc.badge, height: '6px', borderRadius: '4px', width: `${Math.min((count / max) * 100, 100)}%`, transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Top skills */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>Top Skills Among Applicants</p>
                {(analytics?.topSkills || []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No data yet</p>
                ) : analytics.topSkills.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#333' }}>{s.skill}</span>
                    <span style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>{s.count}</span>
                  </div>
                ))}
              </div>

              {/* Top jobs */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee', gridColumn: 'span 2' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>Best Performing Jobs</p>
                {(analytics?.topJobs || []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No data yet</p>
                ) : analytics.topJobs.map((j, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < analytics.topJobs.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{j.title}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0D7377' }}>{j.applications} applications</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── COMPANY PROFILE ── */}
        {active === 'company-profile' && (
          <div style={{ maxWidth: '680px' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Company Profile</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>This is how students see your company on GRID</p>

            {profileSuccess && <div style={{ background: '#E1F5EE', border: '1px solid #6ee7b7', color: '#065f46', fontSize: '13px', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px' }}>✓ {profileSuccess}</div>}

            {company?.mcaStatus !== 'verified' && (
              <div style={{ background: '#FFF9C4', border: '1px solid #EF9F27', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <span>⏳</span>
                <p style={{ fontSize: '12px', color: '#854F0B', margin: 0 }}>Your company is pending verification. GRID will verify within 1 week. You will receive an email once verified.</p>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'COMPANY NAME', key: 'companyName', placeholder: 'Your company name' },
                { label: 'DESCRIPTION', key: 'description', placeholder: 'Tell students about your company, culture and mission...', textarea: true },
                { label: 'INDUSTRY', key: 'industry', placeholder: 'e.g. Information Technology' },
                { label: 'COMPANY SIZE', key: 'companySize', placeholder: 'e.g. 50-200 employees' },
                { label: 'WEBSITE', key: 'website', placeholder: 'https://yourcompany.com' },
                { label: 'HEADQUARTERS / LOCATION', key: 'location', placeholder: 'e.g. Hyderabad, India' },
                { label: 'FOUNDED YEAR', key: 'foundedYear', placeholder: 'e.g. 2018' },
                { label: 'LINKEDIN URL', key: 'linkedIn', placeholder: 'https://linkedin.com/company/...' },
                { label: 'TWITTER / X URL', key: 'twitter', placeholder: 'https://twitter.com/...' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>{field.label}</label>
                  {field.textarea ? (
                    <textarea value={profileForm[field.key] || ''} onChange={e => setProfileForm({ ...profileForm, [field.key]: e.target.value })} placeholder={field.placeholder} rows={3}
                      style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui', resize: 'vertical' }} />
                  ) : (
                    <input value={profileForm[field.key] || ''} onChange={e => setProfileForm({ ...profileForm, [field.key]: e.target.value })} placeholder={field.placeholder}
                      style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                  )}
                </div>
              ))}
              <button onClick={handleUpdateProfile} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                Save Profile →
              </button>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {active === 'settings' && (
          <div style={{ maxWidth: '680px' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 20px' }}>Settings</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'white', borderRadius: '12px', padding: '6px', border: '1px solid #eee' }}>
              {['account', 'notifications', 'subscription', 'team'].map(tab => (
                <button key={tab} onClick={() => setSettingsTab(tab)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: settingsTab === tab ? '#1A3C6E' : 'transparent', color: settingsTab === tab ? 'white' : '#6b7280' }}>
                  {capitalize(tab)}
                </button>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee' }}>

              {settingsTab === 'account' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>Account Settings</p>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                    <input value={user?.email || ''} disabled style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', background: '#f9f9f9', color: '#9ca3af', fontFamily: 'system-ui' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
                    <input type="password" placeholder="Enter new password" style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                  </div>
                  <button style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Update Password</button>
                  <div style={{ borderTop: '1px solid #fee2e2', paddingTop: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', margin: '0 0 6px' }}>Danger Zone</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px' }}>Deleting your account will remove all jobs, candidates and data permanently.</p>
                    <button onClick={handleDeleteAccount} style={{ background: '#FEE2E2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete Account</button>
                  </div>
                </div>
              )}

              {settingsTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>Notification Preferences</p>
                  {[
                    { label: 'New application received', desc: 'Get notified when a student applies to your job' },
                    { label: 'Application milestone', desc: 'When a candidate moves to interview stage' },
                    { label: 'Job posting expiring', desc: '3 days before your job deadline' },
                    { label: 'Weekly hiring summary', desc: 'Summary of all applications every Monday' },
                  ].map((n, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>{n.label}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{n.desc}</p>
                      </div>
                      <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: '#0D7377', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', right: '2px', top: '2px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {settingsTab === 'subscription' && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 16px' }}>Subscription Plan</p>
                  <div style={{ background: '#f0f4ff', border: '2px solid #1A3C6E', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>Free Plan</p>
                      <span style={{ background: '#1A3C6E', color: 'white', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>Current Plan</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px' }}>Post up to 5 jobs · Access candidate profiles · Basic analytics</p>
                  </div>
                  <div style={{ border: '1.5px solid #eee', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>Pro Plan</p>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D7377', margin: 0 }}>₹5,000/month</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px' }}>Unlimited jobs · Priority candidate matching · Advanced analytics · Search talent database · Verified company badge</p>
                    <button style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Upgrade to Pro</button>
                  </div>
                </div>
              )}

              {settingsTab === 'team' && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 16px' }}>Team Members</p>
                  <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>{user?.name}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{user?.email} · Admin</p>
                    </div>
                    <span style={{ background: '#E1F5EE', color: '#085041', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>You</span>
                  </div>
                  <div style={{ border: '2px dashed #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px' }}>Invite team members (coming soon)</p>
                    <input placeholder="colleague@company.com" disabled style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', outline: 'none', marginBottom: '8px', fontFamily: 'system-ui' }} />
                    <button disabled style={{ background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'not-allowed' }}>Send Invite</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
