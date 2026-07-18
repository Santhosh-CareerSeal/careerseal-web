import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Sidebar({ active, setActive, college, navigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'job-postings', label: 'Job Postings', icon: '💼' },
    { id: 'drives', label: 'Drive Management', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]
  return (
    <div style={{ width: '200px', background: '#0f1e3d', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <svg width="16" height="16" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>GRID</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#0D7377', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
          {college?.collegeName?.charAt(0) || 'C'}
        </div>
        <p style={{ color: 'white', fontSize: '11px', fontWeight: '600', margin: '0 0 2px' }}>{college?.collegeName || 'College'}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', margin: 0 }}>{college?.city}, {college?.state}</p>
      </div>
      {navItems.map(item => (
        <div key={item.id} onClick={() => setActive(item.id)}
          style={{ padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: active === item.id ? '#1A3C6E' : 'transparent', color: active === item.id ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
          <span>{item.icon}</span>{item.label}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)' }}
        onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('college'); navigate('/college-login') }}>
        🚪 Logout
      </div>
    </div>
  )
}

export default function CollegePortal() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [college, setCollege] = useState(null)
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [targetedJobs, setTargetedJobs] = useState([])
  const [drives, setDrives] = useState([])
  const [driveForm, setDriveForm] = useState(null)
  const [driveMsg, setDriveMsg] = useState('')
  const [driveSaving, setDriveSaving] = useState(false)
  const emptyDrive = { title: '', driveCompany: '', salaryRange: '', driveDate: '', driveMode: 'On-campus', driveLocation: '', eligBranches: '', eligMinCGPA: '', eligBatchYear: '', allowBacklogs: true, description: '' }

  const fetchDrives = async () => {
    try { const r = await axios.get(`${API_URL}/api/college/drives`, { headers }); setDrives(r.data.drives || []) } catch (e) { setDrives([]) }
  }
  const saveDrive = async () => {
    setDriveMsg('')
    if (!driveForm.title) { setDriveMsg('Drive title is required'); return }
    setDriveSaving(true)
    try {
      if (driveForm.id) await axios.patch(`${API_URL}/api/college/drives/${driveForm.id}`, driveForm, { headers })
      else await axios.post(`${API_URL}/api/college/drives`, driveForm, { headers })
      setDriveForm(null); await fetchDrives()
    } catch (e) { setDriveMsg(e.response?.data?.message || 'Failed to save drive') }
    finally { setDriveSaving(false) }
  }
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)

  const fetchReports = async () => {
    setReportLoading(true)
    try { const r = await axios.get(`${API_URL}/api/college/reports`, { headers }); setReportData(r.data) }
    catch (e) { setReportData(null) }
    finally { setReportLoading(false) }
  }
  const downloadCSV = (filename, rows) => {
    if (!rows || !rows.length) { alert('No data to export'); return }
    const headers = Object.keys(rows[0])
    const esc = (v) => { const str = String(v ?? ''); return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str }
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
  }

  const deleteDrive = async (id) => {
    if (!window.confirm('Delete this drive? Applicants to it will also be removed.')) return
    try { await axios.delete(`${API_URL}/api/college/drives/${id}`, { headers }); await fetchDrives() } catch (e) { alert('Failed to delete') }
  }

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const handleChangePassword = async () => {
    setPwMsg('')
    if (!currentPassword || !newPassword || !confirmPassword) { setPwMsg('Please fill all fields'); return }
    if (newPassword.length < 6) { setPwMsg('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPwMsg('New passwords do not match'); return }
    setPwLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/college/change-password`, { currentPassword, newPassword }, { headers })
      setPwMsg(res.data.message || 'Password updated!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to update password')
    } finally {
      setPwLoading(false)
    }
  }

  useEffect(() => { if (active === 'reports' && !reportData) fetchReports() }, [active])

  useEffect(() => {
    const init = async () => {
      try {
        if (!token) { navigate('/college-login'); return }
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.role !== 'college') { navigate('/login'); return }
        const [dashRes, studentsRes, analyticsRes] = await Promise.all([
          axios.get(`${API_URL}/api/college/dashboard`, { headers }),
          axios.get(`${API_URL}/api/college/students`, { headers }),
          axios.get(`${API_URL}/api/college/analytics`, { headers })
        ])
        setCollege(dashRes.data.college)
        setStats(dashRes.data.stats)
        setRecentStudents(dashRes.data.recentStudents || [])
        setStudents(studentsRes.data.students || [])
        setAnalytics(analyticsRes.data)
        fetchDrives()
      } catch (e) {
        try {
          const jobsRes = await axios.get(`${API_URL}/api/college/jobs`, { headers })
          setTargetedJobs(jobsRes.data.jobs || [])
        } catch (e) { setTargetedJobs([]) }
        navigate('/college-login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const filteredStudents = students.filter(s => {
    const matchesFilter = filter === 'all' || (filter === 'placed' && s.placed) || (filter === 'grid' && s.gridPublished) || (filter === 'verified' && s.verifiedSkillsCount > 0)
    const matchesSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.branch?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#1A3C6E', fontWeight: '700' }}>Loading college portal...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f4f5f7' }}>
      <Sidebar active={active} setActive={setActive} college={college} navigate={navigate} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* DASHBOARD */}
        {active === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Welcome, {college?.tpoName || college?.collegeName} 👋</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Here's your placement overview for this season</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'TOTAL STUDENTS', value: stats?.totalStudents || 0, color: '#1A3C6E' },
                { label: 'GRID PUBLISHED', value: stats?.gridPublishedCount || 0, color: '#0D7377' },
                { label: 'PLACED', value: stats?.placedCount || 0, color: '#085041' },
                { label: 'PLACEMENT RATE', value: `${analytics?.placementRate || 0}%`, color: '#EF9F27' }
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 6px', fontWeight: '600', letterSpacing: '1px' }}>{s.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 12px' }}>Recently joined students</p>
                {recentStudents.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No students linked yet</p>
                ) : recentStudents.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < recentStudents.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1A3C6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                      {s.name?.charAt(0) || 'S'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>{s.name}</p>
                      <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{s.branch || 'Branch not set'}</p>
                    </div>
                    <span style={{ background: s.verifiedSkillsCount > 0 ? '#E1F5EE' : '#f0f0f0', color: s.verifiedSkillsCount > 0 ? '#085041' : '#9ca3af', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                      {s.verifiedSkillsCount > 0 ? `${s.verifiedSkillsCount} verified` : 'No skills yet'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 12px' }}>Top recruiting companies</p>
                {(analytics?.topCompanies || []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No placements recorded yet</p>
                ) : analytics.topCompanies.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < analytics.topCompanies.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>{c.name}</span>
                    <span style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>{c.count} hired</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {active === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Students</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{students.length} students linked to {college?.collegeName}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or branch..."
                style={{ flex: 1, minWidth: '200px', border: '2px solid #f0f0f0', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
              {['all', 'placed', 'grid', 'verified'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: '2px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderColor: filter === f ? '#1A3C6E' : '#eee', background: filter === f ? '#1A3C6E' : 'white', color: filter === f ? 'white' : '#6b7280' }}>
                  {f === 'all' ? 'All' : f === 'placed' ? 'Placed' : f === 'grid' ? 'GRID Published' : 'Skills Verified'}
                </button>
              ))}
            </div>

            {filteredStudents.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>🎓</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', marginBottom: '6px' }}>No students found</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Students appear here once they select your college in their GRID profile</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #eee', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '10px 16px', borderBottom: '1px solid #f0f0f0', background: '#f8f9fa' }}>
                  {['Student', 'Branch', 'GRID', 'Skills', 'Status'].map((h, i) => (
                    <p key={i} style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', margin: 0, letterSpacing: '1px' }}>{h}</p>
                  ))}
                </div>
                {filteredStudents.map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '12px 16px', borderBottom: i < filteredStudents.length - 1 ? '1px solid #f9f9f9' : 'none', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1A3C6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                        {s.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{s.email}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{s.branch || '—'}</p>
                    <span style={{ background: s.gridPublished ? '#E1F5EE' : '#f0f0f0', color: s.gridPublished ? '#085041' : '#9ca3af', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', display: 'inline-block' }}>
                      {s.gridPublished ? '✓ Live' : 'Not yet'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#1A3C6E', fontWeight: '600' }}>{s.verifiedSkillsCount || 0}</span>
                    <span style={{ background: s.placed ? '#E1F5EE' : s.applicationsCount > 0 ? '#FFF9C4' : '#f0f0f0', color: s.placed ? '#085041' : s.applicationsCount > 0 ? '#854F0B' : '#9ca3af', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', display: 'inline-block' }}>
                      {s.placed ? '🎉 Placed' : s.applicationsCount > 0 ? `${s.applicationsCount} applied` : 'No apps'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JOB POSTINGS */}
        {active === 'job-postings' && (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Job Postings</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>Jobs posted by companies specifically targeting your college students</p>
            {targetedJobs.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>💼</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', marginBottom: '6px' }}>No targeted job postings yet</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>Once companies post jobs targeting {college?.collegeName}, they'll appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {targetedJobs.map(job => (
                  <div key={job.id} style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 3px' }}>{job.title}</p>
                        <p style={{ fontSize: '12px', color: '#0D7377', fontWeight: '600', margin: '0 0 6px' }}>{job.company?.companyName || 'Company'}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{job.jobType || ''}{job.location ? ' · ' + job.location : ''}{job.salaryRange ? ' · ' + job.salaryRange : ''}</p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', background: '#E1F5EE', color: '#085041', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{job.applications?.length || 0} applied</span>
                    </div>
                    {job.requiredSkills && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                        {job.requiredSkills.split(',').slice(0, 5).map((s, i) => (
                          <span key={i} style={{ fontSize: '10px', background: '#f0f4ff', color: '#1A3C6E', padding: '3px 8px', borderRadius: '6px' }}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DRIVE MANAGEMENT */}
        {active === 'drives' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Drive Management</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Schedule and manage placement drives at your college</p>
              </div>
              {!driveForm && (
                <button onClick={() => { setDriveMsg(''); setDriveForm({ ...emptyDrive }) }} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>+ New Drive</button>
              )}
            </div>

            {driveForm && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>{driveForm.id ? 'Edit Drive' : 'New Drive'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Role / Title *</label><input value={driveForm.title} onChange={e => setDriveForm({ ...driveForm, title: e.target.value })} style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Company</label><input value={driveForm.driveCompany} onChange={e => setDriveForm({ ...driveForm, driveCompany: e.target.value })} style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Package</label><input value={driveForm.salaryRange} onChange={e => setDriveForm({ ...driveForm, salaryRange: e.target.value })} placeholder="e.g. 6-8 LPA" style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Drive Date</label><input type="date" value={driveForm.driveDate} onChange={e => setDriveForm({ ...driveForm, driveDate: e.target.value })} style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Mode</label><select value={driveForm.driveMode} onChange={e => setDriveForm({ ...driveForm, driveMode: e.target.value })} style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}}><option>On-campus</option><option>Virtual</option><option>Hybrid</option></select></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Location</label><input value={driveForm.driveLocation} onChange={e => setDriveForm({ ...driveForm, driveLocation: e.target.value })} style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Eligible Branches</label><input value={driveForm.eligBranches} onChange={e => setDriveForm({ ...driveForm, eligBranches: e.target.value })} placeholder="CSE, ECE, IT" style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Min CGPA</label><input value={driveForm.eligMinCGPA} onChange={e => setDriveForm({ ...driveForm, eligMinCGPA: e.target.value })} placeholder="e.g. 7.0" style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Batch Year</label><input value={driveForm.eligBatchYear} onChange={e => setDriveForm({ ...driveForm, eligBatchYear: e.target.value })} placeholder="e.g. 2026" style={{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }}><input type="checkbox" checked={driveForm.allowBacklogs} onChange={e => setDriveForm({ ...driveForm, allowBacklogs: e.target.checked })} /><label style={{ fontSize: '12px', color: '#555' }}>Allow backlogs</label></div>
                </div>
                <div style={{ marginTop: '12px' }}><label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Description</label><textarea value={driveForm.description} onChange={e => setDriveForm({ ...driveForm, description: e.target.value })} rows={3} style={{ ...{"border":"2px solid #f0f0f0","borderRadius":"10px","padding":"9px 12px","fontSize":"13px","outline":"none","fontFamily":"system-ui","width":"100%","boxSizing":"border-box"}, resize: 'vertical' }} /></div>
                {driveMsg && <p style={{ fontSize: '12px', color: '#dc2626', margin: '10px 0 0' }}>{driveMsg}</p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={saveDrive} disabled={driveSaving} style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: driveSaving ? 0.6 : 1 }}>{driveSaving ? 'Saving...' : 'Save Drive'}</button>
                  <button onClick={() => { setDriveForm(null); setDriveMsg('') }} style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {drives.length === 0 && !driveForm ? (
              <div style={{ background: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>📅</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', marginBottom: '6px' }}>No drives scheduled</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Click "+ New Drive" to schedule your first placement drive.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {drives.map(d => (
                  <div key={d.id} style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 3px' }}>{d.title}</p>
                        <p style={{ fontSize: '12px', color: '#0D7377', fontWeight: '600', margin: '0 0 6px' }}>{d.driveCompany || 'Company not set'}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{[d.driveDate, d.driveMode, d.driveLocation, d.salaryRange].filter(Boolean).join(' · ')}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>Eligibility: {[d.eligBranches && ('Branches ' + d.eligBranches), d.eligMinCGPA && ('CGPA ≥ ' + d.eligMinCGPA), d.eligBatchYear && ('Batch ' + d.eligBatchYear), d.allowBacklogs ? 'Backlogs OK' : 'No backlogs'].filter(Boolean).join(' · ') || 'Open to all'}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', background: '#E1F5EE', color: '#085041', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{d.applications?.length || 0} applied</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setDriveMsg(''); setDriveForm({ id: d.id, title: d.title || '', driveCompany: d.driveCompany || '', salaryRange: d.salaryRange || '', driveDate: d.driveDate || '', driveMode: d.driveMode || 'On-campus', driveLocation: d.driveLocation || '', eligBranches: d.eligBranches || '', eligMinCGPA: d.eligMinCGPA || '', eligBatchYear: d.eligBatchYear || '', allowBacklogs: d.allowBacklogs !== false, description: d.description || '' }) }} style={{ background: '#f0f4ff', color: '#1A3C6E', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteDrive(d.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {active === 'analytics' && (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 20px' }}>Analytics</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'TOTAL STUDENTS', value: analytics?.totalStudents || 0 },
                { label: 'PLACED STUDENTS', value: analytics?.placedStudents || 0 },
                { label: 'PLACEMENT RATE', value: `${analytics?.placementRate || 0}%` }
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 6px', fontWeight: '600', letterSpacing: '1px' }}>{s.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>Branch breakdown</p>
                {(analytics?.branchBreakdown || []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No data yet</p>
                ) : analytics.branchBreakdown.map((b, i) => {
                  const max = Math.max(...analytics.branchBreakdown.map(x => x.count))
                  return (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#333' }}>{b.branch}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A3C6E' }}>{b.count}</span>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                        <div style={{ background: '#0D7377', height: '6px', borderRadius: '4px', width: `${(b.count / max) * 100}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>Top recruiting companies</p>
                {(analytics?.topCompanies || []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No placements recorded yet</p>
                ) : analytics.topCompanies.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < analytics.topCompanies.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#333' }}>{c.name}</span>
                    <span style={{ background: '#E1F5EE', color: '#085041', fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>{c.count} hired</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {active === 'reports' && (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Reports</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>Downloadable placement reports (CSV) for NAAC/NBA accreditation</p>

            {reportLoading ? (
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading reports...</p>
            ) : !reportData ? (
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>No report data available yet.</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'TOTAL STUDENTS', value: reportData.summary.totalStudents },
                    { label: 'PLACED', value: reportData.summary.placedCount },
                    { label: 'PLACEMENT RATE', value: reportData.summary.placementRate + '%' }
                  ].map((x, i) => (
                    <div key={i} style={{"background":"white","borderRadius":"14px","padding":"16px","border":"1px solid #eee"}}>
                      <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 6px', fontWeight: '600', letterSpacing: '1px' }}>{x.label}</p>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: '#1A3C6E', margin: 0 }}>{x.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{"background":"white","borderRadius":"14px","padding":"16px","border":"1px solid #eee"}}>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>📊</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Placement Summary (Student-wise)</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px' }}>Every student: branch, batch, CGPA, placed status, company, package</p>
                    <button style={{"background":"#1A3C6E","color":"white","border":"none","borderRadius":"8px","padding":"7px 14px","fontSize":"11px","fontWeight":"600","cursor":"pointer"}} onClick={() => downloadCSV('placement-summary.csv', reportData.studentRows)}>Download CSV</button>
                  </div>
                  <div style={{"background":"white","borderRadius":"14px","padding":"16px","border":"1px solid #eee"}}>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>📚</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Branch-wise Placement</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px' }}>Placement breakdown by branch/department</p>
                    <button style={{"background":"#1A3C6E","color":"white","border":"none","borderRadius":"8px","padding":"7px 14px","fontSize":"11px","fontWeight":"600","cursor":"pointer"}} onClick={() => downloadCSV('branch-wise.csv', reportData.branchRows)}>Download CSV</button>
                  </div>
                  <div style={{"background":"white","borderRadius":"14px","padding":"16px","border":"1px solid #eee"}}>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 4px' }}>Drive Report</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px' }}>Each drive: company, date, applied count, hired count</p>
                    <button style={{"background":"#1A3C6E","color":"white","border":"none","borderRadius":"8px","padding":"7px 14px","fontSize":"11px","fontWeight":"600","cursor":"pointer"}} onClick={() => downloadCSV('drive-report.csv', reportData.driveRows)}>Download CSV</button>
                  </div>
                </div>

                <div style={{ background: '#FFF9C4', borderRadius: '12px', padding: '14px 16px', marginTop: '16px', border: '1px solid #EF9F27' }}>
                  <p style={{ fontSize: '12px', color: '#854F0B', margin: 0 }}>📄 PDF export with college branding is planned for a future update. CSV opens directly in Excel.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {active === 'settings' && (
          <div style={{ maxWidth: '560px' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 20px' }}>Settings</p>
            <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 14px' }}>Institution Profile</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'College Name', value: college?.collegeName },
                  { label: 'City', value: college?.city },
                  { label: 'State', value: college?.state },
                  { label: 'TPO Name', value: college?.tpoName },
                  { label: 'TPO Email', value: college?.tpoEmail },
                  { label: 'TPO Phone', value: college?.tpoPhone || 'Not set' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>{f.label}</span>
                    <span style={{ fontSize: '12px', color: '#333', fontWeight: '500' }}>{f.value || '—'}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px' }}>To update your institution profile, contact your GRID account manager.</p>
            </div>
            <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 12px' }}>Change Password</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ border: '2px solid #f0f0f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
                {pwMsg && <p style={{ fontSize: '12px', color: pwMsg.includes('success') || pwMsg.includes('updated') ? '#0D7377' : '#dc2626', margin: '2px 0' }}>{pwMsg}</p>}
                <button onClick={handleChangePassword} disabled={pwLoading} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: pwLoading ? 0.6 : 1 }}>{pwLoading ? 'Updating...' : 'Update Password'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
