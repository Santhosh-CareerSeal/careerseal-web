import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const STAGES = [
  { key: 'applied', label: 'Applied', color: '#1A3C6E', bg: '#f0f4ff' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#854F0B', bg: '#FFF9C4' },
  { key: 'interview', label: 'Interview', color: '#0D7377', bg: '#f0fafa' },
  { key: 'hired', label: 'Hired', color: '#085041', bg: '#E1F5EE' },
  { key: 'rejected', label: 'Rejected', color: '#dc2626', bg: '#FEE2E2' },
]

function JobTracker() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [student, setStudent] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
        const [appRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/applications/my`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setApplications(appRes.data.applications || [])
        setStudent(profileRes.data.student)
      } catch (e) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getCount = (stage) => applications.filter(a => (a.status || 'applied') === stage).length
  const filtered = filter === 'all' ? applications : applications.filter(a => (a.status || 'applied') === filter)
  const daysAgo = (date) => {
    const d = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`
  }
  const getStage = (status) => STAGES.find(s => s.key === (status || 'applied')) || STAGES[0]
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading applications...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar student={student} user={user} />

      <div className="max-w-4xl mx-auto px-4 py-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1A3C6E]">My Applications</h1>
            <p className="text-gray-400 text-sm">{applications.length} total applications</p>
          </div>
          <button onClick={() => navigate('/jobs')} className="bg-[#1A3C6E] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#0D7377] transition-colors">
            Browse Jobs →
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'APPLIED', count: getCount('applied'), color: '#1A3C6E' },
            { label: 'SHORTLISTED', count: getCount('shortlisted'), color: '#EF9F27' },
            { label: 'INTERVIEW', count: getCount('interview'), color: '#0D7377' },
            { label: 'HIRED', count: getCount('hired'), color: '#085041' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-bold mb-1" style={{ letterSpacing: '1px' }}>{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`text-xs font-bold px-4 py-2 rounded-full border-2 transition-all ${filter === 'all' ? 'bg-[#1A3C6E] text-white border-[#1A3C6E]' : 'border-gray-200 text-gray-500 hover:border-[#1A3C6E]'}`}>
            All ({applications.length})
          </button>
          {STAGES.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`text-xs font-bold px-4 py-2 rounded-full border-2 transition-all ${filter === s.key ? 'border-[#1A3C6E] text-[#1A3C6E] bg-[#1A3C6E]/5' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {s.label} ({getCount(s.key)})
            </button>
          ))}
        </div>

        {/* Applications list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-[#1A3C6E] font-bold text-lg mb-2">
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {filter === 'all' ? 'Apply to jobs to track your progress here' : 'Keep applying — your next opportunity is out there!'}
            </p>
            <button onClick={() => navigate('/jobs')} className="bg-[#1A3C6E] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#0D7377] transition-colors">
              Browse Jobs →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((app, i) => {
              const stage = getStage(app.status)
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-[#1A3C6E] text-base mb-1">{app.job?.title || 'Job Title'}</p>
                      <p className="text-xs text-gray-400">{app.job?.company?.companyName || 'Company'} · Applied {daysAgo(app.createdAt)}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: stage.bg, color: stage.color }}>
                      {capitalize(app.status || 'applied')}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex gap-1 mb-3">
                    {STAGES.slice(0, 4).map((s, j) => {
                      const stageIndex = STAGES.findIndex(st => st.key === (app.status || 'applied'))
                      const isActive = j <= stageIndex && app.status !== 'rejected'
                      return (
                        <div key={j} className="flex-1 h-1.5 rounded-full" style={{ background: isActive ? '#0D7377' : '#e5e7eb' }}></div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {app.job?.jobType && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{app.job.jobType}</span>}
                      {app.job?.location && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{app.job.location}</span>}
                      {app.job?.salaryRange && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{app.job.salaryRange}</span>}
                    </div>
                    {app.status === 'hired' && (
                      <span className="text-xs font-bold text-[#085041]">🎉 Congratulations!</span>
                    )}
                    {app.status === 'interview' && (
                      <span className="text-xs font-bold text-[#0D7377]">📅 Interview scheduled</span>
                    )}
                  </div>
                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-700 mb-1">Feedback from the company</p>
                      <p className="text-xs text-red-800">
                        {app.rejectionReason === 'skills_mismatch' ? 'Skills did not match the role' :
                         app.rejectionReason === 'experience_gap' ? 'Not enough relevant experience' :
                         app.rejectionReason === 'position_filled' ? 'The position was already filled' :
                         app.rejectionReason === 'better_candidate' ? 'Another candidate was a closer fit' :
                         'Other reason'}
                      </p>
                      {app.rejectionNote && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{app.rejectionNote}</p>}
                      <p className="text-[10px] text-gray-400 mt-2">Every GRID company must give a reason — so you always know where you stand.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobTracker
