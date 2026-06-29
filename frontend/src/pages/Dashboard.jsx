import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const TIPS = [
  "Tailor your skills section for each job — profiles with matching skills get 3x more shortlists.",
  "Add a professional photo — profiles with photos get 3x more views from recruiters.",
  "Follow up on applications after 5 business days — it shows initiative.",
  "Keep your preferred work location updated — recruiters filter by location first.",
  "A complete GRID card builds instant trust with employers — verify today.",
  "Apply within 24 hours of a job posting — early applicants are 3x more likely to be shortlisted.",
  "List specific tools — 'React.js' beats 'Frontend Development' every time.",
  "Write a crisp one-line summary of your skills and goals in your profile.",
  "Apply to at least 3 jobs every day to stay consistent and maximize chances.",
  "Research the company before an interview — it shows genuine interest.",
  "Keep your mobile number updated — recruiters call without warning.",
  "Highlight internship projects even if unpaid — experience is experience.",
  "Use keywords from the job description in your profile skills section.",
  "A verified GRID number makes your profile stand out from unverified ones.",
  "Connect with seniors from your college on LinkedIn for referrals.",
  "Apply to startups too — they often hire faster and give more responsibility.",
  "Keep your education section complete with year of passing — recruiters need it.",
  "Practice explaining your projects in 60 seconds — it sharpens interview answers.",
  "Check your email daily — shortlist notifications expire fast.",
  "Update your hobbies — unique interests make you memorable to interviewers.",
  "Don't apply blindly — read the job description fully before applying.",
  "Your PF account number speeds up onboarding when you get hired.",
  "Add your address — some companies only hire candidates within a certain radius.",
  "Track every application in CareerSeal — never lose sight of where you stand.",
  "A rejection is a redirect — keep applying and the right opportunity will come.",
  "Soft skills matter as much as technical skills — mention teamwork and communication.",
  "Set a daily job search routine — consistency beats intensity.",
  "Your GRID card is your verified identity — share it confidently with employers.",
  "DigiLocker verification adds credibility — get it done when it's available.",
  "Every application is a step forward — celebrate the process, not just the result."
]

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState({ totalApplications: 0, interviews: 0, savedJobs: 0, profileViews: 0 })
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const tipIndex = (today.getDate() - 1) % TIPS.length
  const tip = TIPS[tipIndex]

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
        setApplications(appRes.data.applications || [])
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

  const getMissingFields = () => {
    if (!student) return []
    const checks = [
      { field: student.contactNumber, label: 'Contact number' },
      { field: student.address, label: 'Address' },
      { field: student.education, label: 'Education' },
      { field: student.schoolCollege, label: 'School / College' },
      { field: student.skills, label: 'Skills' },
      { field: student.hobbies, label: 'Hobbies' },
      { field: student.workExperience, label: 'Work experience' },
      { field: student.photoUrl, label: 'Profile photo' },
      { field: student.preferredWorkLocation, label: 'Preferred location' },
    ]
    return checks.filter(c => !c.field || c.field.trim() === '').map(c => c.label)
  }

  const profileStrength = () => {
    if (!student) return 0
    const fields = [student.contactNumber, student.address, student.education, student.schoolCollege, student.skills, student.hobbies, student.workExperience, student.photoUrl, student.preferredWorkLocation]
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

  const getWeeklyTrend = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toDateString()
      const count = applications.filter(app => new Date(app.createdAt).toDateString() === dateStr).length
      days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        count,
        isToday: i === 0
      })
    }
    return days
  }

  const strength = profileStrength()
  const missingFields = getMissingFields()
  const recentApps = applications.slice(0, 3)
  const weeklyTrend = getWeeklyTrend()
  const maxVal = Math.max(...weeklyTrend.map(d => d.count), 1)

  const activityFeed = applications.slice(0, 4).map(app => ({
    text: `Applied to ${app.job?.title}`,
    time: new Date(app.createdAt).toLocaleDateString('en-IN')
  }))

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
          <button onClick={() => navigate('/exams')} className="text-white/60 text-sm hover:text-white transition-colors">Skill Exams</button>
          <button onClick={() => navigate('/roadmap')} className="text-white/60 text-sm hover:text-white transition-colors">Roadmap</button>
          <button onClick={() => navigate('/settings')} className="text-white/60 text-sm hover:text-white transition-colors">Settings</button>
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

      {/* Tip of the day — full width */}
      <div className="bg-[#0D7377] px-6 py-2.5 flex items-center gap-3">
        <i className="ti ti-bulb text-white text-base flex-shrink-0" aria-hidden="true"></i>
        <p className="text-white text-sm">
          <span className="font-bold">Tip of the day · {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: </span>
          {tip}
        </p>
      </div>

      <div className="flex gap-4 p-5 max-w-6xl mx-auto">

        {/* Left sidebar */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">

          {/* Profile card */}
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
            <div className="bg-white/10 rounded-xl p-3 w-full">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/50 text-xs">Profile strength</p>
                <p className="text-[#5DCAA5] text-xs font-bold">{strength}%</p>
              </div>
              <div className="bg-white/10 rounded-full h-1.5">
                <div className="bg-[#5DCAA5] h-1.5 rounded-full transition-all" style={{ width: `${strength}%` }}></div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2">
              <div className="bg-white/10 rounded-lg px-3 py-2 flex justify-between">
                <span className="text-white/50 text-xs">Applications</span>
                <span className="text-white text-xs font-bold">{stats.totalApplications}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 flex justify-between">
                <span className="text-white/50 text-xs">Interviews</span>
                <span className="text-white text-xs font-bold">{stats.interviews}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 flex justify-between">
                <span className="text-white/50 text-xs">Profile views</span>
                <span className="text-white text-xs font-bold">{stats.profileViews}</span>
              </div>
            </div>
          </div>

          {/* My Profile */}
          <div onClick={() => navigate('/profile-details')} className="bg-white rounded-2xl p-4 border border-gray-100 cursor-pointer hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <i className="ti ti-user text-[#1A3C6E] text-base" aria-hidden="true"></i>
              <p className="text-[#1A3C6E] font-bold text-sm">My Profile</p>
            </div>
            <p className="text-gray-400 text-xs">Edit resume and profile details</p>
            <p className="text-[#0D7377] text-xs font-bold mt-2">Edit →</p>
          </div>

          {/* Verification badges */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-award text-[#1A3C6E] text-base" aria-hidden="true"></i>
              <p className="text-[#1A3C6E] font-bold text-sm">Verification</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Email</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">✓ Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Aadhaar</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">DigiLocker</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Pending</span>
              </div>
            </div>
            <button onClick={() => navigate('/grid')} className="text-[#0D7377] text-xs font-bold mt-3 block">Verify on GRID →</button>
          </div>

        </div>

        {/* Right main content */}
        <div className="flex-1 flex flex-col gap-3">

          {/* Missing fields nudge */}
          {missingFields.length > 0 && (
            <div onClick={() => navigate('/profile-details')} className="bg-amber-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:bg-amber-100 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-800 font-bold text-sm mb-2">Complete your profile to get more job matches</p>
                  <div className="flex flex-wrap gap-1">
                    {missingFields.slice(0, 5).map((f, i) => (
                      <span key={i} className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                    {missingFields.length > 5 && (
                      <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">+{missingFields.length - 5} more</span>
                    )}
                  </div>
                </div>
                <i className="ti ti-arrow-right text-amber-600 text-lg flex-shrink-0 mt-1" aria-hidden="true"></i>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">New jobs matched</p>
              <p className="text-[#1A3C6E] text-2xl font-bold">8</p>
              <p className="text-[#0D7377] text-xs mt-1">today</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Total applied</p>
              <p className="text-amber-500 text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-gray-400 text-xs mt-1">all time</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Interviews</p>
              <p className="text-[#0D7377] text-2xl font-bold">{stats.interviews}</p>
              <p className="text-gray-400 text-xs mt-1">scheduled</p>
            </div>
          </div>

          {/* Trend chart + Activity feed */}
          <div className="grid grid-cols-2 gap-3">

            {/* Real weekly trend */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="ti ti-trending-up text-[#1A3C6E] text-base" aria-hidden="true"></i>
                  <p className="text-[#1A3C6E] font-bold text-sm">This week's applications</p>
                </div>
                <span className="text-xs text-gray-400">{weeklyTrend.reduce((a, b) => a + b.count, 0)} total</span>
              </div>
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 gap-2">
                  <div className="flex items-end gap-1 h-12 w-full">
                    {weeklyTrend.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-sm bg-gray-100" style={{ height: '32px' }}></div>
                        <span className="text-gray-300" style={{ fontSize: '9px' }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs">Apply to jobs to see your trend</p>
                </div>
              ) : (
                <div className="flex items-end gap-1 h-20">
                  {weeklyTrend.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max((d.count / maxVal) * 56, 4)}px`,
                          background: d.isToday ? '#0D7377' : '#1A3C6E',
                          opacity: d.count === 0 ? 0.15 : 1
                        }}
                      ></div>
                      <span style={{ fontSize: '9px' }} className={d.isToday ? 'text-[#0D7377] font-bold' : 'text-gray-400'}>{d.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity feed */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <i className="ti ti-bell text-[#1A3C6E] text-base" aria-hidden="true"></i>
                <p className="text-[#1A3C6E] font-bold text-sm">Recent activity</p>
              </div>
              {activityFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-16 gap-1">
                  <p className="text-gray-400 text-xs text-center">No activity yet</p>
                  <p className="text-gray-300 text-xs text-center">Start applying to see activity here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activityFeed.map((activity, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0D7377] flex-shrink-0 mt-1.5"></div>
                      <div>
                        <p className="text-xs text-gray-700">{activity.text}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent applications */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[#1A3C6E] font-bold text-sm">Recent applications</p>
              <button onClick={() => navigate('/tracker')} className="text-[#0D7377] text-xs font-bold">View all →</button>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No applications yet</p>
                <button onClick={() => navigate('/jobs')} className="bg-[#1A3C6E] text-white text-xs font-bold px-4 py-2 rounded-xl">Browse jobs</button>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentApps.map((app, i) => {
                  const s = statusColor(app.status)
                  return (
                    <div key={app.id} className={`flex justify-between items-center py-3 ${i < recentApps.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{app.job?.title}</p>
                        <p className="text-xs text-gray-400">{app.job?.salaryRange} · {new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
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

          {/* Upcoming interviews */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-calendar-event text-[#1A3C6E] text-base" aria-hidden="true"></i>
              <p className="text-[#1A3C6E] font-bold text-sm">Upcoming interviews</p>
            </div>
            {stats.interviews === 0 ? (
              <p className="text-gray-400 text-xs py-2">No interviews scheduled yet. Keep applying!</p>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-green-800 font-bold text-sm">Interview scheduled</p>
                <p className="text-green-600 text-xs mt-1">Check your email for details</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
