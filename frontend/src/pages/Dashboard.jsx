import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../components/Footer'
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
  "Track every application in GRID — never lose sight of where you stand.",
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
  const [emailVerified, setEmailVerified] = useState(true)
  const [resendMsg, setResendMsg] = useState('')

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
        setEmailVerified(profileRes.data.emailVerified !== false)
        setApplications(appRes.data.applications || [])
      } catch (error) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

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
      days.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), count, isToday: i === 0 })
    }
    return days
  }

  const strength = profileStrength()
  const missingFields = getMissingFields()
  const recentApps = applications.slice(0, 3)
  const weeklyTrend = getWeeklyTrend()
  const maxVal = Math.max(...weeklyTrend.map(d => d.count), 1)

  const handleResendVerification = async () => {
    setResendMsg('Sending...')
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      await axios.post(`${API_URL}/api/auth/resend-verification`, { email: u.email })
      setResendMsg('Sent! Check your inbox.')
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to send')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-[#1A3C6E] text-xl font-bold">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar student={student} user={user} />

      {!emailVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-lg">✉️</span>
              <div>
                <p className="text-sm font-bold text-amber-900">Verify your email to unlock your GRID</p>
                <p className="text-xs text-amber-700">Verified profiles can publish publicly and apply to jobs — recruiters need to know you are real.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {resendMsg && <span className="text-xs text-amber-800">{resendMsg}</span>}
              <button onClick={handleResendVerification}
                className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap">
                Resend link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip of the day — slim purple strip */}
      <div className="px-6 py-2 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 60%,#0d7377)' }}>
        <i className="ti ti-bulb text-white text-sm flex-shrink-0" aria-hidden="true"></i>
        <p className="text-white text-xs md:text-sm">
          <span className="font-bold">Tip · {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: </span>
          {tip}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 md:p-5 max-w-6xl mx-auto">

        {/* Left sidebar — identity only */}
        <div className="hidden md:flex w-60 flex-shrink-0 flex-col gap-3">

          <div className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: 'linear-gradient(170deg,#0c1f3d,#3c3489)' }}>
            {student?.photoUrl ? (
              <img src={student.photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>
                {capitalize(user?.name).charAt(0)}
              </div>
            )}
            <div className="text-center">
              <p className="text-white font-bold text-base">{capitalize(user?.name)}</p>
              <p className="text-[#9fe1cb] text-xs mt-1">{student?.education || 'Add education'}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 w-full">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/50 text-xs">Profile strength</p>
                <p className="text-[#9fe1cb] text-xs font-bold">{strength}%</p>
              </div>
              <div className="bg-white/10 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${strength}%`, background: 'linear-gradient(90deg,#6b4edb,#5dcaa5)' }}></div>
              </div>
            </div>
            <div className="w-full flex gap-2">
              <button onClick={() => navigate('/profile-details')} className="flex-1 bg-white text-[#1A3C6E] text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors">Edit profile</button>
              <button onClick={() => navigate('/grid')} className="flex-1 text-white text-xs font-bold py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.1)' }}>GRID Card</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-award text-[#6b4edb] text-base" aria-hidden="true"></i>
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
            <button onClick={() => navigate('/grid')} className="text-[#6b4edb] text-xs font-bold mt-3 block">Verify on GRID →</button>
          </div>

        </div>

        {/* Right main content */}
        <div className="flex-1 flex flex-col gap-3">

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

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">New jobs matched</p>
              <p className="text-[#0d7377] text-2xl font-bold">8</p>
              <p className="text-gray-400 text-xs mt-1">today</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Applications</p>
              <p className="text-[#1A3C6E] text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-gray-400 text-xs mt-1">all time</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Interviews</p>
              <p className="text-[#0d7377] text-2xl font-bold">{stats.interviews}</p>
              <p className="text-gray-400 text-xs mt-1">scheduled</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Profile views</p>
              <p className="text-[#6b4edb] text-2xl font-bold">{stats.profileViews}</p>
              <p className="text-gray-400 text-xs mt-1">this month</p>
            </div>
          </div>

          {/* Consolidated activity */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <i className="ti ti-trending-up text-[#6b4edb] text-base" aria-hidden="true"></i>
                <p className="text-[#1A3C6E] font-bold text-sm">Your activity</p>
              </div>
              <button onClick={() => navigate('/tracker')} className="text-[#6b4edb] text-xs font-bold">View all →</button>
            </div>

            <div className="flex items-end gap-1 h-16 mb-1">
              {weeklyTrend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm transition-all" style={{
                    height: `${Math.max((d.count / maxVal) * 48, 4)}px`,
                    background: d.isToday ? 'linear-gradient(180deg,#6b4edb,#0d7377)' : '#1A3C6E',
                    opacity: d.count === 0 ? 0.12 : 1
                  }}></div>
                  <span style={{ fontSize: '9px' }} className={d.isToday ? 'text-[#6b4edb] font-bold' : 'text-gray-400'}>{d.label}</span>
                </div>
              ))}
            </div>

            {recentApps.length === 0 ? (
              <div className="text-center py-5 border-t border-gray-100 mt-2">
                <p className="text-gray-400 text-sm mb-3">No applications yet — start applying and your pipeline, interviews and weekly trend all show up here.</p>
                <button onClick={() => navigate('/jobs')} className="text-white text-xs font-bold px-5 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 55%,#0d7377)' }}>Browse jobs →</button>
              </div>
            ) : (
              <div className="flex flex-col border-t border-gray-100 mt-2 pt-1">
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
            <div onClick={() => navigate('/jobs')} className="rounded-xl p-4 cursor-pointer transition-transform hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 55%,#0d7377)' }}>
              <i className="ti ti-briefcase text-white text-xl mb-2 block" aria-hidden="true"></i>
              <p className="text-white font-bold text-sm">Browse jobs</p>
              <p className="text-white/60 text-xs mt-1">Find your next opportunity</p>
            </div>
            <div onClick={() => navigate('/tracker')} className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow border border-gray-100">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-[#6b4edb]" style={{ background: '#efedff' }}><i className="ti ti-chart-bar text-xl" aria-hidden="true"></i></span>
              <p className="text-[#1A3C6E] font-bold text-sm">Track applications</p>
              <p className="text-gray-400 text-xs mt-1">View your pipeline</p>
            </div>
          </div>

          {stats.interviews > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <i className="ti ti-calendar-event text-[#6b4edb] text-base" aria-hidden="true"></i>
                <p className="text-[#1A3C6E] font-bold text-sm">Upcoming interviews</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-green-800 font-bold text-sm">Interview scheduled</p>
                <p className="text-green-600 text-xs mt-1">Check your email for details</p>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
