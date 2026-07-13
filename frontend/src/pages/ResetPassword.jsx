import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const otp = location.state?.otp || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError('')
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword })
      navigate('/login', { state: { message: 'Password reset successfully! Please sign in.' } })
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060e1f' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(13,115,119,0.15), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(26,60,110,0.2), transparent 60%)' }}></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-bold text-xl">GRID</span>
        </div>
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-2">Set new password</h1>
            <p className="text-gray-400 text-sm">Choose a strong password for your account</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">New Password</label>
              <input type="password" placeholder="Minimum 6 characters" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Confirm Password</label>
              <input type="password" placeholder="Repeat your password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <button onClick={handleReset} disabled={loading}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
