import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(null)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate(response.data.user.role === 'company' ? '/company' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthPlaceholder = (provider) => {
    setError('')
    setConnecting(provider)
    setTimeout(() => {
      setConnecting(null)
      setError(`${provider} sign-in is coming soon`)
    }, 1200)
  }

  const closeForgot = () => {
    setShowForgot(false)
    setResetSent(false)
    setResetEmail('')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12 bg-white">
        <div className="max-w-sm mx-auto w-full">

          <div className="flex items-center gap-2 mb-1">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#0D7377" />
              <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h1 className="text-2xl font-bold text-[#1A3C6E]">CareerSeal</h1>
          </div>
          <p className="text-gray-400 text-sm mb-8">Your career journey starts here</p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setRole('student')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${role === 'student' ? 'bg-white text-[#1A3C6E] shadow-sm' : 'text-gray-500'}`}>
              Student
            </button>
            <button onClick={() => setRole('company')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${role === 'company' ? 'bg-white text-[#1A3C6E] shadow-sm' : 'text-gray-500'}`}>
              Company
            </button>
          </div>

          <h2 className="text-2xl font-bold text-[#1A3C6E] mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">
            {role === 'student' ? 'Sign in to continue your journey' : 'Sign in to manage your hiring pipeline'}
          </p>

          <button onClick={() => handleOAuthPlaceholder('Google')} disabled={connecting === 'Google'} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 mb-3 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.3 36.6 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
            {connecting === 'Google' ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button onClick={() => handleOAuthPlaceholder('Zoho')} disabled={connecting === 'Zoho'} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 mb-5 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#E42527"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial">Z</text></svg>
            {connecting === 'Zoho' ? 'Connecting...' : 'Continue with Zoho'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-xs">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

          <div className="flex flex-col gap-3">
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm" />
            <button onClick={() => setShowForgot(true)} className="text-right text-xs text-[#0D7377] font-bold -mt-1">
              Forgot password?
            </button>
            <button onClick={handleSubmit} disabled={loading} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors mt-1">
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to CareerSeal?{' '}
            <button onClick={() => navigate('/register')} className="text-[#0D7377] font-bold">
              Join now
            </button>
          </p>

        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-[#1A3C6E] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 text-center px-12">
          <svg width="280" height="280" viewBox="0 0 280 280" fill="none" className="mx-auto mb-8">
            <circle cx="140" cy="140" r="130" fill="#0D7377" opacity="0.15"/>
            <rect x="60" y="90" width="160" height="110" rx="16" fill="white" opacity="0.95"/>
            <circle cx="100" cy="125" r="18" fill="#1A3C6E"/>
            <rect x="130" y="115" width="70" height="8" rx="4" fill="#0D7377"/>
            <rect x="130" y="130" width="50" height="6" rx="3" fill="#CBD5E1"/>
            <rect x="80" y="160" width="120" height="8" rx="4" fill="#E2E8F0"/>
            <rect x="80" y="175" width="90" height="8" rx="4" fill="#E2E8F0"/>
            <circle cx="220" cy="70" r="22" fill="#0D7377"/>
            <path d="M212 70l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <h2 className="text-white text-3xl font-bold mb-3">
            {role === 'student' ? 'Build your career identity. Get discovered.' : 'Discover verified talent. Hire with confidence.'}
          </h2>
          <p className="text-white/70 text-lg">Build your GRID. Get discovered. Get hired.</p>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            {!resetSent ? (
              <>
                <h3 className="text-xl font-bold text-[#1A3C6E] mb-2">Reset your password</h3>
                <p className="text-gray-500 text-sm mb-5">Enter your email and we'll send you a reset link.</p>
                <input type="email" placeholder="Email Address" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full mb-4" />
                <button onClick={() => setResetSent(true)} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors w-full mb-3">
                  Send Reset Link
                </button>
                <button onClick={closeForgot} className="text-gray-400 text-sm w-full text-center">Cancel</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#1A3C6E] mb-2">Check your email</h3>
                <p className="text-gray-500 text-sm mb-5">Password reset coming soon — this is a placeholder for now.</p>
                <button onClick={closeForgot} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold w-full">Got it</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
