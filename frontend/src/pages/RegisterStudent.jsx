import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function RegisterStudent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(null)

  const handleSubmit = async () => {
    setError('')
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup/initiate`, { name, email, password, role: 'student' })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/profile-details')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setConnecting('Google')
      setError('')
      try {
        const res = await axios.post(`${API_URL}/api/auth/google`, {
          credential: tokenResponse.access_token,
          role: 'student'
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/profile-details')
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-up failed')
      } finally {
        setConnecting(null)
      }
    },
    onError: () => { setError('Google sign-up was cancelled or failed'); setConnecting(null) }
  })

  const handleOAuth = (provider) => {
    if (provider === 'Google') { googleLogin(); return }
    setConnecting(provider)
    setTimeout(() => { setConnecting(null); setError(`${provider} sign-up is coming soon`) }, 1200)
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Left panel */}
      <div className="hidden md:flex w-80 bg-[#1A3C6E] flex-col justify-center px-10 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <span className="text-white font-bold text-xl">GRID</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Your verified career identity starts here</h2>
          <p className="text-white/60 text-sm mb-8">Join thousands of students building their career with GRID</p>
          <div className="flex flex-col gap-3">
            {['GRID verified profile', 'AI career roadmap', 'Smart job matching', 'ATM-style GRID card'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L6 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16">
        <div className="max-w-md w-full mx-auto">

          <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-gray-400 text-sm mb-6 hover:text-[#1A3C6E] transition-colors">
            ← Back to register options
          </button>

          <h1 className="text-2xl font-bold text-[#1A3C6E] mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-6">
            Are you a recruiter?{' '}
            <span className="text-[#0D7377] font-bold cursor-pointer" onClick={() => navigate('/register-company')}>Register as Company →</span>
          </p>

          {/* OAuth buttons */}
          <button onClick={() => handleOAuth('Google')} disabled={connecting === 'Google'}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 rounded-xl px-4 py-3 mb-3 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.3 36.6 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            {connecting === 'Google' ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button onClick={() => handleOAuth('Zoho')} disabled={connecting === 'Zoho'}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 rounded-xl px-4 py-3 mb-5 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#E42527"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial">Z</text></svg>
            {connecting === 'Zoho' ? 'Connecting...' : 'Continue with Zoho'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-xs">OR register manually</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
              <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Email Address</label>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Password</label>
              <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                📋 You'll fill in your work status, mobile and other details in your profile after signing up.
              </p>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50 mt-1">
              {loading ? 'Creating account...' : 'Create My Account →'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <span className="text-[#0D7377] font-bold cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
            </p>
            <p className="text-center text-xs text-gray-400 mt-4">
              By creating an account, you agree to our{' '}
              <span onClick={() => navigate('/terms')} className="text-[#0D7377] cursor-pointer hover:underline">Terms</span>
              {' '}and{' '}
              <span onClick={() => navigate('/privacy')} className="text-[#0D7377] cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterStudent
