import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState({ totalApplications: 0, interviews: 0, savedJobs: 0, profileViews: 0 })
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const [dashRes, profileRes, appRes] = await Promise.all([
          axios.get(`${API_URL}/api/dashboard/student`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/applications/my`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setUser(dashRes.data.user)
        setStats(dashRes.data.stats)
        setStudent(profileRes.data.student)
        setApplications(appRes.data.applications?.slice(0, 3) || [])
      } catch (error) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const profileStrength = () => {
    if (!student) return 0
    const fields = [student.contactNumber, student.address, student.education, student.skills, student.hobbies, student.workExperience, student.photoUrl, student.preferredWorkLocation]
    const filled = fields.filter(f => f && f.trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }

  const statusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#FFF9C4', text: '#854F0B', label: 'Pending' }
      case 'interview': return { bg: '#E1F5EE', text: '#085041', label: 'Interview' }
      case 'accepted': return { bg: '#E1F5EE', text: '#085041', label: 'Accepted' }
      case 'rejected': return { bg: '#FFEBEE', text: '#A32D2D', label: 'Rejected' }
      default: return { bg: '#f0f0ee', text: '#666', label: status }
    }
  }

  const strength = profileStrength()

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-[#1A3C6E] text-xl font-bold">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-[#1A3C6E] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="11" fill="#0D7377" />
            <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <h1 className="text-white text-lg font-bold">CareerSeal</h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/jobs')} className="text-white/60 text-sm hover:text-white transition-colors">Jobs</button>
          <button onClick={() => navigate('/tracker')} className="text-white/60 text-sm hover:text-white transition-colors">Applications</button>
          <button onClick={() => navigate('/grid')} className="text-white/60 text-sm hover:text-white transition-colors">GRID</button>
          <button onClick={handleLogout} className="text-white/60 text-sm hover:text-white transition-colors">Logout</button>
          {student?.photoUrl ? (
            <img src={student.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-[#0D7377]" />
          ) : (
            <div className="w-8 h-8 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {capitalize(user?.name).charAt(0)}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 p-5 max-w-5xl mx-auto">

        {/* Left sidebar — Profile card */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">
          <div className="bg-[#1A3C6E] rounded-2xl p-5 flex flex-col items-center gap-3">
            {student?.photoUrl ? (
              <img src={student.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20">
                {capitalize(user?.name).charAt(0)}
              </div>
            )}
            <div className="text-center">
              <p className="text-white font-bold text-sm">{capitalize(user?.name)}</p>
              <p className="text-[#5DCAA5] text-xs mt-1">{student?.education || 'Add education'}</p>
            </div>

            <div className="bg-white/8 rounded-xl p-3 w-full">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/50 text-xs">Profile strength</p>
                <p className="text-[#5DCAA5] text-xs font-bold">{strength}%</p>
              </div>
              <div className="bg-white/10 rounded-full h-1.5">
                <div className="bg-[#5DCAA5] h-1.5 rounded-full transition-all" style={{ width: `${strength}%` }}></div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="bg-white/8 rounded-lg px-3 py-2 flex justify-between">
                <span className="text-white/50 text-xs">Applications</span>
                <span className="text-white text-xs font-bold">{stats.totalApplications}</span>
              </div>
              <div className="bg-white/8 rounded-lg px-3 py-2 flex justify-between">
                <span className="text-white/50 text-xs">Interviews</span>
                <span className="text-white text-xs font-bold">{stats.interviews}</span>
              </div>
              <div className="bg-white/8 rounded-lg px-3 py-2 flex justify-between">
                <span className="text-white/50 text-xs">Profile views</span>
                <span className="text-white text-xs font-bold">{stats.profileViews}</span>
              </div>
            </div>

            <button onClick={() => navigate('/grid')} className="w-full bg-[#0D7377] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#0a5f63] transition-colors">
              View GRID Card
            </button>
          </div>
        </div>

        {/* Right — Main content */}
        <div className="flex-1 flex flex-col gap-3">

          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">New jobs matched</p>
              <p className="text-[#1A3C6E] text-2xl font-bold">8</p>
              <p className="text-[#0D7377] text-xs mt-1">today</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Pending responses</p>
              <p className="text-[#EF9F27] text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-gray-400 text-xs mt-1">awaiting</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Interviews</p>
              <p className="text-[#0D7377] text-2xl font-bold">{stats.interviews}</p>
              <p className="text-gray-400 text-xs mt-1">this week</p>
            </div>
          </div>

          {/* Recent applications */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[#1A3C6E] font-bold text-sm">Recent applications</p>
              <button onClick={() => navigate('/tracker')} className="text-[#0D7377] text-xs font-bold">View all →</button>
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No applications yet</p>
                <button onClick={() => navigate('/jobs')} className="bg-[#1A3C6E] text-white text-xs font-bold px-4 py-2 rounded-xl">Browse jobs</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {applications.map((app, i) => {
                  const s = statusColor(app.status)
                  return (
                    <div key={app.id} className={`flex justify-between items-center py-3 ${i < applications.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{app.job?.title}</p>
                        <p className="text-xs text-gray-400">{app.job?.salaryRange} · {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => navigate('/jobs')} className="bg-[#0D7377] rounded-xl p-4 cursor-pointer hover:bg-[#0a5f63] transition-colors">
              <i className="ti ti-briefcase text-white text-xl mb-2 block" aria-hidden="true"></i>
              <p className="text-white font-bold text-sm">Browse jobs</p>
              <p className="text-white/60 text-xs mt-1">Find your next opportunity</p>
            </div>
            <div onClick={() => navigate('/tracker')} className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow border border-gray-100">
              <i className="ti ti-chart-bar text-[#1A3C6E] text-xl mb-2 block" aria-hidden="true"></i>
              <p className="text-[#1A3C6E] font-bold text-sm">Track applications</p>
              <p className="text-gray-400 text-xs mt-1">View your pipeline</p>
            </div>
          </div>

          {/* Complete profile nudge */}
          {strength < 100 && (
            <div onClick={() => navigate('/profile-details')} className="bg-[#1A3C6E] rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-[#0D7377] transition-colors">
              <div>
                <p className="text-white/60 text-xs mb-1">Complete your profile to get more matches</p>
                <p className="text-white font-bold text-sm">Add missing details → {100 - strength}% remaining</p>
              </div>
              <i className="ti ti-arrow-right text-white text-xl flex-shrink-0" aria-hidden="true"></i>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Dashboard
