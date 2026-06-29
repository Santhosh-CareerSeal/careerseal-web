import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  // Account
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountMsg, setAccountMsg] = useState({ type: '', text: '' })
  const [accountLoading, setAccountLoading] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState({
    newJob: true, applicationUpdate: true, gridViewed: true, roadmapReminder: false, weeklyDigest: true, smsAlerts: false
  })
  const [notifMsg, setNotifMsg] = useState('')

  // Privacy
  const [privacy, setPrivacy] = useState({
    profilePublic: true, showContact: true, showEmail: false, showSalary: false, allowRecruiterSearch: true
  })
  const [privacyMsg, setPrivacyMsg] = useState('')

  // Subscription
  const [currentPlan] = useState('free')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const init = async () => {
      try {
        if (!token) { navigate('/login'); return }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
        const profileRes = await axios.get(`${API_URL}/api/profile/details`, { headers })
        setStudent(profileRes.data.student)
      } catch (e) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handlePasswordChange = async () => {
    setAccountMsg({ type: '', text: '' })
    if (!newPassword || !confirmPassword) { setAccountMsg({ type: 'error', text: 'Please fill in both password fields' }); return }
    if (newPassword.length < 6) { setAccountMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return }
    if (newPassword !== confirmPassword) { setAccountMsg({ type: 'error', text: 'Passwords do not match' }); return }
    setAccountLoading(true)
    try {
      await axios.put(`${API_URL}/api/auth/change-password`, { newPassword }, { headers })
      setAccountMsg({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword(''); setConfirmPassword('')
    } catch (e) {
      setAccountMsg({ type: 'error', text: e.response?.data?.message || 'Could not update password' })
    } finally {
      setAccountLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account, GRID card and all data. This cannot be undone.')) return
    if (!window.confirm('Last warning — your CareerSeal GRID profile will be deleted forever. Continue?')) return
    try {
      await axios.delete(`${API_URL}/api/auth/delete-account`, { headers })
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/register')
    } catch (e) {
      alert('Could not delete account. Please try again.')
    }
  }

  const handleSaveNotifications = () => {
    setNotifMsg('Notification preferences saved!')
    setTimeout(() => setNotifMsg(''), 3000)
  }

  const handleSavePrivacy = () => {
    setPrivacyMsg('Privacy settings saved!')
    setTimeout(() => setPrivacyMsg(''), 3000)
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'subscription', label: 'Subscription', icon: '⭐' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading settings...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-[#1A3C6E] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white text-lg font-bold">CareerSeal</h1>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/dashboard')} className="text-white/60 text-sm hover:text-white transition-colors">Dashboard</button>
          <button onClick={() => navigate('/jobs')} className="text-white/60 text-sm hover:text-white transition-colors">Jobs</button>
          <button onClick={() => navigate('/grid')} className="text-white/60 text-sm hover:text-white transition-colors">GRID</button>
          <button onClick={() => navigate('/roadmap')} className="text-white/60 text-sm hover:text-white transition-colors">Roadmap</button>
          <button className="text-white text-sm font-bold border-b-2 border-[#0D7377] pb-0.5">Settings</button>
          {student?.photoUrl ? (
            <img src={student.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-[#0D7377]" />
          ) : (
            <div className="w-8 h-8 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A3C6E] mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account, privacy and preferences</p>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl p-1.5 border border-gray-100 flex gap-1 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#1A3C6E] text-white' : 'text-gray-500 hover:text-[#1A3C6E]'}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <div className="flex flex-col gap-4">

            {/* Profile info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-4">Profile Information</p>
              <div className="flex items-center gap-4 mb-4">
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <p className="text-[#0D7377] text-xs font-bold mt-1">{student?.workStatus} · {student?.gridNumber || 'No GRID number yet'}</p>
                </div>
              </div>
              <button onClick={() => navigate('/profile-details')} className="text-sm font-bold text-[#0D7377] hover:underline">Edit profile details →</button>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-4">Change Password</p>

              {accountMsg.text && (
                <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${accountMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {accountMsg.text}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">New Password</label>
                  <input type="password" placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Confirm New Password</label>
                  <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors" />
                </div>
                <button onClick={handlePasswordChange} disabled={accountLoading}
                  className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm disabled:opacity-50">
                  {accountLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Linked accounts */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-4">Linked Accounts</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔵</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Google Account</p>
                      <p className="text-xs text-gray-400">Sign in faster with Google</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-200 px-3 py-1 rounded-full">Coming soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🟢</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Aadhaar Verification</p>
                      <p className="text-xs text-gray-400">Verify your identity with Aadhaar</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-200 px-3 py-1 rounded-full">Coming soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🟠</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">DigiLocker</p>
                      <p className="text-xs text-gray-400">Import certificates from DigiLocker</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-200 px-3 py-1 rounded-full">Coming soon</span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl p-6 border border-red-100">
              <p className="text-sm font-bold text-red-500 mb-2">Danger Zone</p>
              <p className="text-xs text-gray-400 mb-4">Deleting your account will permanently remove your profile, GRID card, roadmap and all data. This action cannot be undone.</p>
              <button onClick={handleDeleteAccount} className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                Delete My Account
              </button>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm font-bold text-[#1A3C6E] mb-6">Notification Preferences</p>

            {notifMsg && <div className="bg-green-50 text-green-700 border border-green-200 text-sm px-4 py-3 rounded-xl mb-4">{notifMsg}</div>}

            <div className="flex flex-col gap-0">
              {[
                { key: 'newJob', label: 'New job matches', desc: 'Get notified when new jobs match your skills and preferences' },
                { key: 'applicationUpdate', label: 'Application status updates', desc: 'When a company updates your application status' },
                { key: 'gridViewed', label: 'GRID profile viewed', desc: 'When a recruiter views your GRID profile or scans your QR code' },
                { key: 'roadmapReminder', label: 'Roadmap reminders', desc: 'Weekly reminder to check your career roadmap progress' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of new jobs, profile views and career tips every Monday' },
                { key: 'smsAlerts', label: 'SMS alerts', desc: 'Receive important updates via SMS (requires verified mobile number)' },
              ].map((item, i, arr) => (
                <div key={item.key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-bold text-gray-700 mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <div onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex items-center ${notifications[item.key] ? 'bg-[#0D7377]' : 'bg-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSaveNotifications} className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm mt-4">
              Save Preferences
            </button>
          </div>
        )}

        {/* ── PRIVACY TAB ── */}
        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-2">Profile Privacy</p>
              <p className="text-xs text-gray-400 mb-6">Control what recruiters and the public can see on your CareerSeal profile</p>

              {privacyMsg && <div className="bg-green-50 text-green-700 border border-green-200 text-sm px-4 py-3 rounded-xl mb-4">{privacyMsg}</div>}

              <div className="flex flex-col gap-0">
                {[
                  { key: 'profilePublic', label: 'Public GRID profile', desc: 'Allow anyone with your QR code or GRID number to view your profile' },
                  { key: 'showContact', label: 'Show contact number', desc: 'Display your mobile number on your public profile' },
                  { key: 'showEmail', label: 'Show email address', desc: 'Display your email on your public profile' },
                  { key: 'showSalary', label: 'Show expected salary', desc: 'Show your salary expectations to recruiters' },
                  { key: 'allowRecruiterSearch', label: 'Allow recruiter search', desc: 'Let companies find you through Search Talent feature' },
                ].map((item, i, arr) => (
                  <div key={item.key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-gray-700 mb-0.5">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex items-center ${privacy[item.key] ? 'bg-[#0D7377]' : 'bg-gray-200'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${privacy[item.key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleSavePrivacy} className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm mt-4">
                Save Privacy Settings
              </button>
            </div>

            <div className="bg-[#f0f4ff] rounded-2xl p-5 border border-blue-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-2">🔒 Your data is safe</p>
              <p className="text-xs text-gray-500 leading-relaxed">CareerSeal never sells your personal data to third parties. Your Aadhaar, PAN and government ID details are never shown publicly. Only the information you choose to share is visible to recruiters.</p>
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTION TAB ── */}
        {activeTab === 'subscription' && (
          <div className="flex flex-col gap-4">

            {/* Current plan */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#1A3C6E]">
              <div className="flex justify-between items-center mb-3">
                <p className="text-base font-bold text-[#1A3C6E]">Free Plan</p>
                <span className="bg-[#1A3C6E] text-white text-xs px-3 py-1 rounded-full font-bold">Current Plan</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">You are on the free plan. Upgrade to unlock premium features.</p>
              <div className="flex flex-col gap-2">
                {['GRID card with QR code', 'Basic job matching', 'AI career roadmap (3 regenerations/month)', 'Public profile page', 'Apply to unlimited jobs'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    <p className="text-xs text-gray-600">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Pro */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#0D7377] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Recommended</div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-bold text-[#1A3C6E]">Student Pro</p>
                <p className="text-xl font-bold text-[#0D7377]">₹499<span className="text-xs text-gray-400">/year</span></p>
              </div>
              <p className="text-xs text-gray-400 mb-4">Everything in Free plus premium features</p>
              <div className="flex flex-col gap-2 mb-5">
                {['Priority job matching with top companies', 'Unlimited roadmap regenerations', 'Resume builder with export', 'Interview preparation resources', 'Verified badge on profile', 'CareerSeal Pro certificate'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    <p className="text-xs text-gray-600">{f}</p>
                  </div>
                ))}
              </div>
              <button className="w-full bg-[#0D7377] text-white py-3 rounded-xl font-bold hover:bg-[#0a5f63] transition-colors text-sm">
                Upgrade to Pro — ₹499/year
              </button>
            </div>

            {/* Career Plus */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-bold text-[#1A3C6E]">Career Plus</p>
                <p className="text-xl font-bold text-[#1A3C6E]">₹999<span className="text-xs text-gray-400">/year</span></p>
              </div>
              <p className="text-xs text-gray-400 mb-4">Everything in Pro plus exclusive career services</p>
              <div className="flex flex-col gap-2 mb-5">
                {['1-on-1 mock interview session', 'Expert resume review', 'Direct recruiter introductions', 'Priority placement assistance', 'Career counselling session'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    <p className="text-xs text-gray-600">{f}</p>
                  </div>
                ))}
              </div>
              <button className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm">
                Upgrade to Career Plus — ₹999/year
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default Settings
