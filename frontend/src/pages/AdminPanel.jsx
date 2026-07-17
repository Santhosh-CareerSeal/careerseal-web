import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'colleges', label: 'Colleges', icon: '🎓' },
  { id: 'companies', label: 'Companies', icon: '🏢' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'applications', label: 'Applications', icon: '📨' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

function AdminPanel() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [colleges, setColleges] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [companyFilter, setCompanyFilter] = useState('all')
  const [collegeFilter, setCollegeFilter] = useState('all')
  const [verifyFilter, setVerifyFilter] = useState('all')
  const [applications, setApplications] = useState([])
  const [appCounts, setAppCounts] = useState({})
  const [appFilter, setAppFilter] = useState('all')
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [showAddCollege, setShowAddCollege] = useState(false)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    collegeName: '', city: '', state: '', collegeType: 'Degree',
    streams: '', careerFields: '', vetted: true,
    tpoName: '', tpoEmail: '', tpoPhone: '', password: ''
  })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadAll = async () => {
    try {
      const [statsRes, collegesRes, companiesRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/colleges`, { headers }),
        axios.get(`${API_URL}/api/admin/companies`, { headers })
      ])
      setStats(statsRes.data)
      setColleges(collegesRes.data.colleges || [])
      setCompanies(companiesRes.data.companies || [])
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) navigate('/admin-login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { navigate('/admin-login'); return }
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    if (u.role !== 'admin') { navigate('/admin-login'); return }
    loadAll()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers, params: { role: userFilter, search: userSearch }
      })
      setUsers(res.data.users || [])
    } catch (e) { setUsers([]) }
  }

  useEffect(() => {
    if (active === 'users') loadUsers()
  }, [active, userFilter])

  useEffect(() => {
    if (active === 'applications') loadApplications()
  }, [active, appFilter])

  const handleAddCollege = async () => {
    setMsg('')
    if (!form.collegeName || !form.tpoEmail || !form.password) {
      setMsg('College name, TPO email and password are required'); return
    }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/admin/colleges`, form, { headers })
      setMsg('College created successfully!')
      setForm({ collegeName: '', city: '', state: '', collegeType: 'Degree', streams: '', careerFields: '', vetted: true, tpoName: '', tpoEmail: '', tpoPhone: '', password: '' })
      setShowAddCollege(false)
      loadAll()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create college')
    } finally {
      setSaving(false)
    }
  }

  const toggleVetted = async (collegeId) => {
    const prev = colleges
    // Optimistic: flip it on screen immediately
    setColleges(cs => cs.map(c => c.id === collegeId ? { ...c, vetted: !c.vetted } : c))
    try {
      await axios.patch(`${API_URL}/api/admin/colleges/${collegeId}/vetted`, {}, { headers })
      refreshStats()
    } catch (e) {
      setColleges(prev)
      setMsg('Failed to update college')
    }
  }

  const refreshStats = async () => {
    try {
      const r = await axios.get(`${API_URL}/api/admin/stats`, { headers })
      setStats(r.data)
    } catch (e) {}
  }

  const loadApplications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/applications`, {
        headers, params: { status: appFilter }
      })
      setApplications(res.data.applications || [])
      setAppCounts(res.data.counts || {})
    } catch (e) { setApplications([]) }
  }

  const toggleCompanyVerify = async (companyId) => {
    const prev = companies
    setCompanies(cs => cs.map(c => c.id === companyId ? { ...c, mcaStatus: c.mcaStatus === 'verified' ? 'pending' : 'verified' } : c))
    try {
      await axios.patch(`${API_URL}/api/admin/companies/${companyId}/verify`, {}, { headers })
      refreshStats()
    } catch (e) {
      setCompanies(prev)
      setMsg('Failed to update company')
    }
  }

  const handleChangePassword = async () => {
    setPwMsg('')
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwMsg('Please fill all fields'); return }
    if (pwNew.length < 8) { setPwMsg('New password must be at least 8 characters'); return }
    if (pwNew !== pwConfirm) { setPwMsg('New passwords do not match'); return }
    if (pwCurrent === pwNew) { setPwMsg('New password must be different from the current one'); return }
    setPwSaving(true)
    try {
      const res = await axios.post(`${API_URL}/api/admin/change-password`, { currentPassword: pwCurrent, newPassword: pwNew }, { headers })
      setPwMsg(res.data.message || 'Password updated!')
      setPwCurrent(''); setPwNew(''); setPwConfirm('')
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to update password')
    } finally {
      setPwSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin-login')
  }

  const filteredCompanies = companies.filter(c =>
    companyFilter === 'all' ? true :
    companyFilter === 'verified' ? c.mcaStatus === 'verified' :
    c.mcaStatus !== 'verified'
  )

  const inputCls = "border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0D7377] text-sm w-full"

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading admin panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f1e3d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-bold">GRID Admin</span>
        </div>
        <button onClick={handleLogout} className="text-white/50 text-sm hover:text-white">Logout</button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${active === t.id ? 'bg-[#1A3C6E] text-white' : 'text-gray-500 hover:text-[#1A3C6E]'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {msg && <p className={`text-sm mb-4 ${msg.includes('success') ? 'text-[#0D7377]' : 'text-red-500'}`}>{msg}</p>}

        {active === 'dashboard' && stats && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-4">Platform overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'users', label: 'TOTAL USERS', value: stats.totalUsers, breakdown: [
                  { label: 'Students', value: stats.totalStudents, go: () => { setUserFilter('student'); setActive('users') } },
                  { label: 'Companies', value: stats.totalCompanies, go: () => setActive('companies') },
                  { label: 'Colleges', value: stats.totalColleges, go: () => setActive('colleges') },
                  { label: 'Admins', value: stats.totalAdmins, go: () => { setUserFilter('admin'); setActive('users') } }
                ]},
                { id: 'students', label: 'STUDENTS', value: stats.totalStudents, breakdown: [
                  { label: 'Profile complete', value: stats.profileComplete, go: () => { setUserFilter('student'); setVerifyFilter('all'); setActive('users') } },
                  { label: 'Profile incomplete', value: stats.totalStudents - stats.profileComplete, go: () => { setUserFilter('student'); setVerifyFilter('all'); setActive('users') } },
                  { label: 'View all students', value: stats.totalStudents, go: () => { setUserFilter('student'); setVerifyFilter('all'); setActive('users') } }
                ]},
                { id: 'companies', label: 'COMPANIES', value: stats.totalCompanies, breakdown: [
                  { label: 'Verified', value: stats.verifiedCompanies, go: () => { setCompanyFilter('verified'); setActive('companies') } },
                  { label: 'Pending', value: stats.pendingCompanies, go: () => { setCompanyFilter('pending'); setActive('companies') } }
                ]},
                { id: 'colleges', label: 'COLLEGES', value: stats.totalColleges, breakdown: [
                  { label: 'Vetted', value: stats.vettedColleges, go: () => { setCollegeFilter('vetted'); setActive('colleges') } },
                  { label: 'Pending', value: stats.pendingColleges, go: () => { setCollegeFilter('pending'); setActive('colleges') } }
                ]},
                { id: 'grids', label: 'PUBLISHED GRIDS', value: stats.publishedGrids, breakdown: [
                  { label: 'Published', value: stats.publishedGrids, go: () => { setUserFilter('student'); setVerifyFilter('all'); setActive('users') } },
                  { label: 'Not published', value: stats.unpublishedGrids, go: () => { setUserFilter('student'); setVerifyFilter('all'); setActive('users') } }
                ]},
                { id: 'emails', label: 'VERIFIED EMAILS', value: stats.verifiedEmails, breakdown: [
                  { label: 'Verified', value: stats.verifiedEmails, go: () => { setVerifyFilter('verified'); setUserFilter('all'); setActive('users') } },
                  { label: 'Unverified', value: stats.unverifiedEmails, go: () => { setVerifyFilter('unverified'); setUserFilter('all'); setActive('users') } }
                ]},
                { id: 'jobs', label: 'JOBS POSTED', value: stats.totalJobs, breakdown: [
                  { label: 'View companies posting jobs', value: stats.totalJobs, go: () => { setCompanyFilter('all'); setActive('companies') } }
                ]},
                { id: 'apps', label: 'APPLICATIONS', value: stats.totalApplications, breakdown: [
                  { label: 'View all applications', value: stats.totalApplications, go: () => { setAppFilter('all'); setActive('applications') } },
                  { label: 'Hired', value: '', go: () => { setAppFilter('hired'); setActive('applications') } },
                  { label: 'Shortlisted', value: '', go: () => { setAppFilter('shortlisted'); setActive('applications') } }
                ]}
              ].map((s) => (
                <div key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all ${expanded === s.id ? 'border-[#0D7377] shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-[#1A3C6E]">{s.value}</p>
                  {expanded === s.id ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                      {s.breakdown.map((b, j) => (
                        <div key={j} onClick={(e) => { e.stopPropagation(); if (b.go) b.go() }}
                          className={`flex items-center justify-between text-xs ${b.go ? 'cursor-pointer text-[#0D7377] hover:underline font-bold' : 'text-gray-500'}`}>
                          <span>{b.label}</span>
                          <span className="font-bold">{b.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-300 mt-1 font-bold">Tap for breakdown</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'colleges' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-[#1A3C6E]">Colleges ({colleges.length})</h1>
              <button onClick={() => setShowAddCollege(!showAddCollege)}
                className="bg-[#1A3C6E] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0D7377]">
                {showAddCollege ? 'Cancel' : '+ Add College'}
              </button>
            </div>

            {showAddCollege && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                <p className="font-bold text-[#1A3C6E] mb-4">Add a new college</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="College name *" value={form.collegeName} onChange={e => setForm({ ...form, collegeName: e.target.value })} className={inputCls} />
                  <select value={form.collegeType} onChange={e => setForm({ ...form, collegeType: e.target.value })} className={inputCls}>
                    <option value="Degree">Degree</option>
                    <option value="Intermediate">Intermediate</option>
                  </select>
                  <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputCls} />
                  <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inputCls} />
                  {form.collegeType === 'Intermediate' ? (
                    <input placeholder="Streams (MPC, BiPC...)" value={form.streams} onChange={e => setForm({ ...form, streams: e.target.value })} className={inputCls} />
                  ) : (
                    <input placeholder="Career fields (Software Engineer...)" value={form.careerFields} onChange={e => setForm({ ...form, careerFields: e.target.value })} className={inputCls} />
                  )}
                  <input placeholder="TPO name" value={form.tpoName} onChange={e => setForm({ ...form, tpoName: e.target.value })} className={inputCls} />
                  <input placeholder="TPO login email *" value={form.tpoEmail} onChange={e => setForm({ ...form, tpoEmail: e.target.value })} className={inputCls} />
                  <input placeholder="TPO phone" value={form.tpoPhone} onChange={e => setForm({ ...form, tpoPhone: e.target.value })} className={inputCls} />
                  <input type="password" placeholder="TPO login password *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputCls} />
                </div>
                <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <input type="checkbox" checked={form.vetted} onChange={e => setForm({ ...form, vetted: e.target.checked })} className="accent-[#0D7377]" />
                  Mark as vetted (visible to students immediately)
                </label>
                <button onClick={handleAddCollege} disabled={saving}
                  className="bg-[#0D7377] text-white px-5 py-2.5 rounded-xl text-sm font-bold mt-4 hover:bg-[#0a5a5e] disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create College'}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {colleges.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-400 text-sm">No colleges yet. Add your first one above.</p>
                </div>
              ) : colleges.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#1A3C6E] text-sm">{c.collegeName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.vetted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {c.vetted ? '✓ Vetted' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[c.city, c.state].filter(Boolean).join(', ')} · {c.collegeType} · {c.studentCount} students
                    </p>
                    <p className="text-xs text-gray-400">TPO: {c.tpoName || '—'} · {c.tpoEmail}</p>
                  </div>
                  <button onClick={() => toggleVetted(c.id)}
                    className="text-xs font-bold text-[#0D7377] hover:underline whitespace-nowrap">
                    {c.vetted ? 'Un-vet' : 'Mark vetted'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'companies' && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Companies ({companies.length})</h1>
            <p className="text-xs text-gray-400 mb-3">Verify companies so students know they are legitimate</p>
            <div className="flex gap-2 mb-4">
              {[
                { id: 'all', label: 'All', count: companies.length },
                { id: 'verified', label: 'Verified', count: companies.filter(c => c.mcaStatus === 'verified').length },
                { id: 'pending', label: 'Pending', count: companies.filter(c => c.mcaStatus !== 'verified').length }
              ].map(f => (
                <button key={f.id} onClick={() => setCompanyFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${companyFilter === f.id ? 'bg-[#1A3C6E] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {filteredCompanies.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-400 text-sm">No companies registered yet.</p>
                </div>
              ) : filteredCompanies.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#1A3C6E] text-sm">{c.companyName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.mcaStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {c.mcaStatus === 'verified' ? '✓ Verified' : 'Pending'}
                      </span>
                      {c.emailVerified
                        ? <span className="text-[10px] text-green-700">✓ email</span>
                        : <span className="text-[10px] text-amber-700">email pending</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[c.industry, c.companySize, c.location].filter(Boolean).join(' · ') || '—'} · {c.jobCount} jobs
                    </p>
                    <p className="text-xs text-gray-400">Recruiter: {c.recruiterName || '—'} · {c.recruiterEmail}</p>
                    {c.website && <p className="text-[10px] text-[#0D7377]">{c.website}</p>}
                  </div>
                  <button onClick={() => toggleCompanyVerify(c.id)}
                    className="text-xs font-bold text-[#0D7377] hover:underline whitespace-nowrap">
                    {c.mcaStatus === 'verified' ? 'Un-verify' : 'Verify'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'settings' && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Settings</h1>
            <p className="text-xs text-gray-400 mb-4">Manage your admin account</p>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 max-w-md">
              <p className="font-bold text-[#1A3C6E] mb-1">Change password</p>
              <p className="text-xs text-gray-400 mb-4">This password protects every user's data on GRID. Use something long and unique.</p>
              <div className="flex flex-col gap-3">
                <input type="password" placeholder="Current password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} className={inputCls} />
                <input type="password" placeholder="New password (min 8 characters)" value={pwNew} onChange={e => setPwNew(e.target.value)} className={inputCls} />
                <input type="password" placeholder="Confirm new password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()} className={inputCls} />
                {pwMsg && <p className={`text-xs ${pwMsg.includes('updated') || pwMsg.includes('success') ? 'text-[#0D7377]' : 'text-red-500'}`}>{pwMsg}</p>}
                <button onClick={handleChangePassword} disabled={pwSaving}
                  className="bg-[#1A3C6E] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#0D7377] disabled:opacity-50 mt-1">
                  {pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {active === 'applications' && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Applications ({applications.length})</h1>
            <p className="text-xs text-gray-400 mb-3">Every job application across the platform</p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'applied', 'shortlisted', 'hired', 'rejected'].map(f => (
                <button key={f} onClick={() => setAppFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${appFilter === f ? 'bg-[#1A3C6E] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {f}{f !== 'all' && appCounts[f] ? ` (${appCounts[f]})` : ''}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {applications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No applications yet</p>
              ) : applications.map(a => (
                <div key={a.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[#1A3C6E]">{a.studentName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${a.status === 'hired' ? 'bg-green-100 text-green-800' : a.status === 'rejected' ? 'bg-red-50 text-red-600' : a.status === 'shortlisted' ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      applied to <span className="font-bold">{a.jobTitle}</span> at <span className="text-[#0D7377] font-bold">{a.companyName}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">{a.gridNumber}{a.collegeName ? ' · ' + a.collegeName : ''} · {a.studentEmail}</p>
                  </div>
                  <p className="text-[10px] text-gray-300 whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'users' && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-4">Users</h1>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'student', 'company', 'college', 'admin'].map(r => (
                <button key={r} onClick={() => setUserFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${userFilter === r ? 'bg-[#1A3C6E] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {r}
                </button>
              ))}
              <input placeholder="Search name or email..." value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadUsers()}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0D7377] flex-1 min-w-[180px]" />
              <button onClick={loadUsers} className="bg-[#0D7377] text-white px-3 py-1.5 rounded-lg text-xs font-bold">Search</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {users.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No users found</p>
              ) : users.map(u => (
                <div key={u.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#1A3C6E]">{u.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f4ff] text-[#1A3C6E] capitalize">{u.role}</span>
                      {u.emailVerified
                        ? <span className="text-[10px] text-green-700">✓ verified</span>
                        : <span className="text-[10px] text-amber-700">pending</span>}
                    </div>
                    <p className="text-xs text-gray-400">{u.email}</p>
                    {u.student?.gridNumber && <p className="text-[10px] text-gray-400">{u.student.gridNumber} {u.student.gridPublished ? '· published' : ''}</p>}
                    {u.company?.companyName && <p className="text-[10px] text-gray-400">{u.company.companyName}</p>}
                  </div>
                  <p className="text-[10px] text-gray-300">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
