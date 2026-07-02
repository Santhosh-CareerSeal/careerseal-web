import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const JOB_ICONS = {
  'frontend': '💻', 'react': '⚛️', 'java': '☕', 'python': '🐍',
  'design': '🎨', 'ui': '🎨', 'ux': '🎨', 'backend': '⚙️',
  'data': '📊', 'ml': '🤖', 'ai': '🤖', 'mobile': '📱',
  'android': '📱', 'ios': '📱', 'devops': '🔧', 'cloud': '☁️',
  'default': '💼'
}

function getJobIcon(title = '') {
  const t = title.toLowerCase()
  for (const key of Object.keys(JOB_ICONS)) {
    if (t.includes(key)) return JOB_ICONS[key]
  }
  return JOB_ICONS.default
}

function getMatchScore(job, student) {
  if (!student) return 0
  let score = 0

  const studentSkills = (student.technicalSkills || student.skills || '')
    .toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const jobSkills = (job.requiredSkills || job.description || '')
    .toLowerCase().split(',').map(s => s.trim()).filter(Boolean)

  if (studentSkills.length > 0 && jobSkills.length > 0) {
    const matched = studentSkills.filter(skill =>
      jobSkills.some(js => js.includes(skill) || skill.includes(js)) ||
      (job.title || '').toLowerCase().includes(skill) ||
      (job.description || '').toLowerCase().includes(skill)
    )
    const skillScore = Math.min((matched.length / Math.max(studentSkills.length, 1)) * 50, 50)
    score += skillScore
  }

  if (student.preferredWorkLocation && job.location) {
    const sl = student.preferredWorkLocation.toLowerCase()
    const jl = job.location.toLowerCase()
    if (sl.includes(jl) || jl.includes(sl) || sl.includes('remote') || jl.includes('remote')) {
      score += 20
    }
  }

  if (student.preferredJobType && job.jobType) {
    if (student.preferredJobType.toLowerCase() === job.jobType.toLowerCase()) score += 15
  }

  if (student.workStatus && job.experienceLevel) {
    const ws = student.workStatus.toLowerCase()
    const el = job.experienceLevel.toLowerCase()
    if (ws === el || (ws === 'fresher' && el === 'fresher') || (ws === 'student' && el === 'fresher')) score += 15
  } else {
    score += 10
  }

  return Math.round(Math.min(score, 100))
}

function getMatchLabel(score) {
  if (score >= 70) return { label: 'Best match', color: '#0D7377', bg: '#0D7377', text: 'white' }
  if (score >= 40) return { label: 'Good match', color: '#EF9F27', bg: '#FFF9C4', text: '#854F0B' }
  return null
}

function Jobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [student, setStudent] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [applied, setApplied] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [sortBy, setSortBy] = useState('match')
  const [activeChip, setActiveChip] = useState('All jobs')
  const [filters, setFilters] = useState({ jobType: [], salary: [], experience: [] })

  const chips = ['All jobs', 'Full-time', 'Internship', 'Remote', 'Fresher', '0–5 LPA', '5–10 LPA', '10+ LPA']

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
        const [jobsRes, profileRes, appRes] = await Promise.all([
          axios.get(`${API_URL}/api/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/applications/my`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setJobs(jobsRes.data.jobs || [])
        setStudent(profileRes.data.student)
        setApplied((appRes.data.applications || []).map(a => a.jobId))
      } catch (e) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const toggleFilter = (cat, val) => {
    setFilters(f => ({
      ...f,
      [cat]: f[cat].includes(val) ? f[cat].filter(v => v !== val) : [...f[cat], val]
    }))
  }

  const filteredJobs = jobs.filter(job => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      job.title?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      job.requiredSkills?.toLowerCase().includes(q)
    const matchesLocation = !location ||
      job.location?.toLowerCase().includes(location.toLowerCase()) ||
      job.description?.toLowerCase().includes(location.toLowerCase())
    const matchesChip = activeChip === 'All jobs' ||
      job.jobType?.toLowerCase().includes(activeChip.toLowerCase()) ||
      job.experienceLevel?.toLowerCase().includes(activeChip.toLowerCase()) ||
      (activeChip === 'Fresher' && job.experienceLevel?.toLowerCase() === 'fresher')
    return matchesSearch && matchesLocation && matchesChip
  }).map(job => ({
    ...job,
    matchScore: getMatchScore(job, student)
  })).sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore
    if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt)
    return 0
  })

  const handleApply = async (jobId) => {
    setApplying(jobId)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/applications`, { jobId }, { headers: { Authorization: `Bearer ${token}` } })
      setApplied(prev => [...prev, jobId])
    } catch (e) {
      alert(e.response?.data?.message || 'Could not apply')
    } finally {
      setApplying(null)
    }
  }

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-[#1A3C6E] text-xl font-bold">Loading jobs...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar student={student} user={user} />

      {/* Hero search */}
      <div style={{ background: 'linear-gradient(135deg, #1A3C6E 0%, #0D7377 100%)' }} className="px-6 pt-6 pb-10">
        <p className="text-white/70 text-sm mb-1">👋 {greeting()}, {capitalize(user?.name)}</p>
        <p className="text-white text-2xl font-bold mb-5">Find your next opportunity</p>
        <div className="flex gap-3 bg-white/15 backdrop-blur-sm rounded-2xl p-2">
          <div className="flex-1 bg-white rounded-xl px-4 py-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Job title, skills, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-none outline-none text-sm flex-1 bg-transparent"
            />
          </div>
          <div className="w-44 bg-white rounded-xl px-4 py-3 flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="border-none outline-none text-sm flex-1 bg-transparent"
            />
          </div>
          <button className="bg-white text-[#1A3C6E] font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Search
          </button>
        </div>
      </div>

      {/* Chip bar — overlaps hero */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-2 overflow-x-auto -mt-4 rounded-t-2xl relative z-10 shadow-sm">
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`flex-shrink-0 border-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${activeChip === chip ? 'bg-[#1A3C6E] text-white border-[#1A3C6E]' : 'border-gray-200 text-gray-500 hover:border-[#1A3C6E] hover:text-[#1A3C6E]'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="flex gap-4 p-5 max-w-6xl mx-auto">

        {/* Filter panel */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 sticky top-4">
            <p className="text-sm font-bold text-[#1A3C6E] mb-4">Filters</p>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Job type</p>
            {['Full-time', 'Part-time', 'Internship', 'Remote', 'Freelance'].map(t => (
              <label key={t} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={filters.jobType.includes(t)} onChange={() => toggleFilter('jobType', t)} className="accent-[#0D7377]" />
                <span className="text-xs text-gray-600">{t}</span>
              </label>
            ))}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 mt-4">Salary range</p>
            {['0–3 LPA', '3–6 LPA', '6–10 LPA', '10+ LPA'].map(s => (
              <label key={s} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={filters.salary.includes(s)} onChange={() => toggleFilter('salary', s)} className="accent-[#0D7377]" />
                <span className="text-xs text-gray-600">{s}</span>
              </label>
            ))}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 mt-4">Experience</p>
            {['Fresher', '1–3 years', '3+ years'].map(e => (
              <label key={e} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={filters.experience.includes(e)} onChange={() => toggleFilter('experience', e)} className="accent-[#0D7377]" />
                <span className="text-xs text-gray-600">{e}</span>
              </label>
            ))}

            {(filters.jobType.length > 0 || filters.salary.length > 0 || filters.experience.length > 0) && (
              <button onClick={() => setFilters({ jobType: [], salary: [], experience: [] })} className="text-xs text-red-400 font-bold mt-4">Clear all</button>
            )}
          </div>
        </div>

        {/* Jobs list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-[#1A3C6E]">{filteredJobs.length} jobs</span>
              {search && ` for "${search}"`}
              {student?.technicalSkills && <span className="text-[#0D7377]"> · sorted by match score</span>}
            </p>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none bg-white">
              <option value="match">Best match first</option>
              <option value="latest">Latest first</option>
            </select>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 font-bold mb-2">No jobs found</p>
              <p className="text-gray-400 text-sm mb-4">Try different search terms or clear your filters</p>
              <button onClick={() => { setSearch(''); setLocation(''); setActiveChip('All jobs') }} className="bg-[#1A3C6E] text-white text-xs font-bold px-4 py-2 rounded-xl">Clear search</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredJobs.map(job => {
                const isApplied = applied.includes(job.id)
                const isApplying = applying === job.id
                const matchLabel = getMatchLabel(job.matchScore)
                const icon = getJobIcon(job.title)
                const daysAgo = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24))
                const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
                const skillsList = (job.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean)

                return (
                  <div key={job.id} className={`bg-white rounded-2xl p-5 border-2 transition-all hover:shadow-md ${matchLabel?.label === 'Best match' ? 'border-[#0D7377]' : 'border-gray-100 hover:border-gray-200'}`}
                    style={matchLabel?.label === 'Best match' ? { background: 'linear-gradient(135deg, #f0fafa, white)' } : {}}>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 items-start flex-1">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${matchLabel?.label === 'Best match' ? 'bg-[#0D7377]/10' : 'bg-gray-100'}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-base font-bold text-gray-800">{job.title}</p>
                            {matchLabel && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: matchLabel.bg, color: matchLabel.text }}>
                                {matchLabel.label} · {job.matchScore}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {job.company?.companyName || 'Company'}
                            {job.location && ` · ${job.location}`}
                            {` · ${timeLabel}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-sm font-bold text-[#1A3C6E]">{job.salaryRange || 'Salary not disclosed'}</p>
                        {job.jobType && <p className="text-xs text-gray-400 mt-1">{job.jobType}</p>}
                      </div>
                    </div>

                    {/* Match score bar */}
                    {job.matchScore > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-400">Profile match</span>
                          <span className="text-xs font-bold" style={{ color: job.matchScore >= 70 ? '#0D7377' : job.matchScore >= 40 ? '#EF9F27' : '#9ca3af' }}>{job.matchScore}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all" style={{
                            width: `${job.matchScore}%`,
                            background: job.matchScore >= 70 ? '#0D7377' : job.matchScore >= 40 ? '#EF9F27' : '#d1d5db'
                          }}></div>
                        </div>
                      </div>
                    )}

                    {job.description && (
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{job.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 flex-wrap">
                        {skillsList.slice(0, 4).map((skill, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{skill}</span>
                        ))}
                        {job.experienceLevel && (
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${job.experienceLevel === 'Fresher' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>
                      {isApplied ? (
                        <span className="text-xs font-bold px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200">✓ Applied</span>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={isApplying}
                          className="bg-[#1A3C6E] text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-[#0D7377] transition-colors flex-shrink-0"
                        >
                          {isApplying ? 'Applying...' : 'Apply now →'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Jobs
