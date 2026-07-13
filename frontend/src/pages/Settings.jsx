import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountMsg, setAccountMsg] = useState({ type: '', text: '' })
  const [accountLoading, setAccountLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    newJob: true, applicationUpdate: true, gridViewed: true, roadmapReminder: false, weeklyDigest: true, smsAlerts: false
  })
  const [notifMsg, setNotifMsg] = useState('')
  const [privacy, setPrivacy] = useState({
    profilePublic: true, showContact: true, showEmail: false, showSalary: false, allowRecruiterSearch: true
  })
  const [privacyMsg, setPrivacyMsg] = useState('')

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
    if (!newPassword || !confirmPassword) { setAccountMsg({ type: 'error', text: 'Please fill in both fields' }); return }
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
    if (!window.confirm('Are you sure? This will permanently delete your GRID account, GRID card and all data.')) return
    if (!window.confirm('Final warning — this cannot be undone. Continue?')) return
    try {
      await axios.delete(`${API_URL}/api/auth/delete-account`, { headers })
      localStorage.removeItem('token'); localStorage.removeItem('user')
      navigate('/register')
    } catch (e) { alert('Could not delete account. Please try again.') }
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
      <Navbar student={student} user={user} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          {student?.photoUrl ? (
            <img src={student.photoUrl} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-[#1A3C6E]">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <p className="text-[#0D7377] text-xs font-bold mt-0.5">{student?.workStatus} · {student?.gridNumber || 'No GRID yet'}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl p-1.5 border border-gray-100 flex gap-1 mb-5">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-[#1A3C6E] text-white' : 'text-gray-500 hover:text-[#1A3C6E]'}`}>
              <span>{tab.icon}</span><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
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
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Confirm Password</label>
                  <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377]" />
                </div>
                <button onClick={handlePasswordChange} disabled={accountLoading}
                  className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm disabled:opacity-50">
                  {accountLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-4">Linked Accounts</p>
              {[
                { icon: '🔵', label: 'Google Account', desc: 'Sign in faster with Google' },
                { icon: '🟢', label: 'Aadhaar Verification', desc: 'Verify your identity' },
                { icon: '🟠', label: 'DigiLocker', desc: 'Import certificates' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full">Coming soon</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-red-100">
              <p className="text-sm font-bold text-red-500 mb-2">Danger Zone</p>
              <p className="text-xs text-gray-400 mb-4">Permanently delete your account and all GRID data. This cannot be undone.</p>
              <button onClick={handleDeleteAccount} className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                Delete My Account
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-bold text-[#1A3C6E] mb-5">Notification Preferences</p>
            {notifMsg && <div className="bg-green-50 text-green-700 border border-green-200 text-sm px-4 py-3 rounded-xl mb-4">{notifMsg}</div>}
            <div className="flex flex-col">
              {[
                { key: 'newJob', label: 'New job matches', desc: 'When new jobs match your skills' },
                { key: 'applicationUpdate', label: 'Application updates', desc: 'When your application status changes' },
                { key: 'gridViewed', label: 'GRID profile viewed', desc: 'When a recruiter views your profile' },
                { key: 'roadmapReminder', label: 'Roadmap reminders', desc: 'Weekly reminder to check progress' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary every Monday morning' },
                { key: 'smsAlerts', label: 'SMS alerts', desc: 'Important updates via SMS' },
              ].map((item, i, arr) => (
                <div key={item.key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-bold text-gray-700 mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <div onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className="w-11 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                    style={{ background: notifications[item.key] ? '#0D7377' : '#e5e7eb' }}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5"
                      style={{ transform: notifications[item.key] ? 'translateX(20px)' : 'translateX(0)' }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setNotifMsg('Preferences saved!'); setTimeout(() => setNotifMsg(''), 3000) }}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm mt-4">
              Save Preferences
            </button>
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-2">Profile Privacy</p>
              <p className="text-xs text-gray-400 mb-5">Control what recruiters and the public can see</p>
              {privacyMsg && <div className="bg-green-50 text-green-700 border border-green-200 text-sm px-4 py-3 rounded-xl mb-4">{privacyMsg}</div>}
              <div className="flex flex-col">
                {[
                  { key: 'profilePublic', label: 'Public GRID profile', desc: 'Anyone with your QR code can view your profile' },
                  { key: 'showContact', label: 'Show contact number', desc: 'Display mobile on public profile' },
                  { key: 'showEmail', label: 'Show email address', desc: 'Display email on public profile' },
                  { key: 'showSalary', label: 'Show expected salary', desc: 'Show salary expectations to recruiters' },
                  { key: 'allowRecruiterSearch', label: 'Allow recruiter search', desc: 'Let companies find you in Search Talent' },
                ].map((item, i, arr) => (
                  <div key={item.key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-gray-700 mb-0.5">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="w-11 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                      style={{ background: privacy[item.key] ? '#0D7377' : '#e5e7eb' }}>
                      <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5"
                        style={{ transform: privacy[item.key] ? 'translateX(20px)' : 'translateX(0)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setPrivacyMsg('Privacy settings saved!'); setTimeout(() => setPrivacyMsg(''), 3000) }}
                className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm mt-4">
                Save Privacy Settings
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-sm font-bold text-[#1A3C6E] mb-1">🔒 Your data is safe</p>
              <p className="text-xs text-gray-500 leading-relaxed">GRID never sells your data. Government IDs are never shown publicly.</p>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === 'subscription' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border-2 border-[#1A3C6E]">
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-bold text-[#1A3C6E]">Free Plan</p>
                <span className="bg-[#1A3C6E] text-white text-xs px-3 py-1 rounded-full font-bold">Current</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">You are on the free plan</p>
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

            <div className="bg-white rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#0D7377] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Recommended</div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-bold text-[#1A3C6E]">Student Pro</p>
                <p className="text-xl font-bold text-[#0D7377]">₹499<span className="text-xs text-gray-400">/year</span></p>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {['Priority job matching', 'Unlimited roadmap regenerations', 'Resume builder', 'Interview prep resources', 'Verified Pro badge'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    <p className="text-xs text-gray-600">{f}</p>
                  </div>
                ))}
              </div>
              <button className="w-full bg-[#0D7377] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0a5f63] transition-colors">
                Upgrade to Pro — ₹499/year
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-bold text-[#1A3C6E]">Career Plus</p>
                <p className="text-xl font-bold text-[#1A3C6E]">₹999<span className="text-xs text-gray-400">/year</span></p>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {['1-on-1 mock interview', 'Expert resume review', 'Direct recruiter introductions', 'Career counselling session'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    <p className="text-xs text-gray-600">{f}</p>
                  </div>
                ))}
              </div>
              <button className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0D7377] transition-colors">
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
