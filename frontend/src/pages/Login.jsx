import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(null)
  const [showForgot, setShowForgot] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const fromRegister = location.state?.fromRegister || false

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      if (response.data.user.role === 'company') {
        navigate('/company')
      } else if (!response.data.profileComplete) {
        navigate('/profile-details')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-email', { state: { email: err.response.data.email } })
      } else {
        setError(err.response?.data?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  const handleOAuthPlaceholder = (provider) => {
    setError('')
    setConnecting(provider)
    setTimeout(() => { setConnecting(null); setError(`${provider} sign-in is coming soon`) }, 1200)
  }

  const handleForgotPassword = async () => {
    setResetError('')
    if (!resetEmail) { setResetError('Please enter your email'); return }
    setResetLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email: resetEmail })
      setResetSent(true)
    } catch(e) {
      setResetError(e.response?.data?.message || 'Something went wrong')
    } finally {
      setResetLoading(false)
    }
  }
  const closeForgot = () => { setShowForgot(false); setResetSent(false); setResetEmail('') }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">

      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 bg-white">
        <div className="max-w-sm mx-auto w-full">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-1">
            <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <h1 className="text-2xl font-bold text-[#1A3C6E]">CareerSeal</h1>
          </div>
          <p className="text-gray-400 text-sm mb-8">Your career journey starts here</p>

          {/* Success message from register */}
          {fromRegister && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-green-700 text-sm font-bold">✓ Account created successfully!</p>
              <p className="text-green-600 text-xs mt-1">Please sign in with your credentials to continue.</p>
            </div>
          )}

          {/* Role selection — two big cards */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sign in as</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => setRole('student')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'student' ? 'border-[#1A3C6E] bg-[#1A3C6E]/5' : 'border-gray-100 hover:border-gray-200'}`}>
              <span className="text-2xl">🎓</span>
              <div className="text-center">
                <p className={`text-sm font-bold ${role === 'student' ? 'text-[#1A3C6E]' : 'text-gray-600'}`}>Student</p>
                <p className="text-xs text-gray-400">or Fresher</p>
              </div>
              {role === 'student' && (
                <div className="w-4 h-4 rounded-full bg-[#0D7377] flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </div>
              )}
            </button>
            <button onClick={() => setRole('company')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'company' ? 'border-[#0D7377] bg-[#0D7377]/5' : 'border-gray-100 hover:border-gray-200'}`}>
              <span className="text-2xl">🏢</span>
              <div className="text-center">
                <p className={`text-sm font-bold ${role === 'company' ? 'text-[#0D7377]' : 'text-gray-600'}`}>Company</p>
                <p className="text-xs text-gray-400">or Recruiter</p>
              </div>
              {role === 'company' && (
                <div className="w-4 h-4 rounded-full bg-[#0D7377] flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </div>
              )}
            </button>
          </div>

          <h2 className="text-xl font-bold text-[#1A3C6E] mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-5">
            {role === 'student' ? 'Sign in to continue your career journey' : 'Sign in to manage your hiring pipeline'}
          </p>


          {/* Error */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Form */}
          <div className="flex flex-col gap-3">
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
              className="border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm transition-colors" autoComplete="off"/>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              className="border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm transition-colors" autoComplete="off"/>
            <button onClick={() => setShowForgot(true)} className="text-right text-xs text-[#0D7377] font-bold -mt-1">
              Forgot password?
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors mt-1 disabled:opacity-50">
              {loading ? 'Please wait...' : 'Sign In →'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to CareerSeal?{' '}
            <button onClick={() => navigate('/register')} className="text-[#0D7377] font-bold">Join now</button>
          </p>

          {/* Company register hint */}
          {role === 'company' && (
            <p className="text-center text-sm text-gray-400 mt-3">
              Don't have a company account?{' '}
              <button onClick={() => navigate('/register-company')} className="text-[#0D7377] font-bold">Register company →</button>
            </p>
          )}
        </div>
      </div>

      {/* Right panel */}
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
          <h2 className="text-white text-2xl font-bold mb-3">
            {role === 'student' ? 'Build your career identity. Get discovered.' : 'Discover verified talent. Hire with confidence.'}
          </h2>
          <p className="text-white/60 text-sm">
            {role === 'student' ? 'Build your GRID. Get discovered. Get hired.' : 'Post jobs. Find verified students. Hire faster.'}
          </p>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            {!resetSent ? (
              <>
                <h3 className="text-xl font-bold text-[#1A3C6E] mb-2">Reset your password</h3>
                <p className="text-gray-500 text-sm mb-5">Enter your email and we'll send you a reset code.</p>
                <input type="email" placeholder="Email Address" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full mb-4"/>
                {resetError && <p className="text-red-500 text-xs mb-3">{resetError}</p>}
                <button onClick={handleForgotPassword} disabled={resetLoading} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors w-full mb-3 disabled:opacity-50">
                  {resetLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <button onClick={closeForgot} className="text-gray-400 text-sm w-full text-center">Cancel</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#1A3C6E] mb-2">Code sent!</h3>
                <p className="text-gray-500 text-sm mb-5">We sent a 6-digit reset code to <strong>{resetEmail}</strong>. Check your inbox.</p>
                <button onClick={() => { closeForgot(); navigate('/verify-email', { state: { email: resetEmail, mode: 'forgot' } }) }} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold w-full mb-3">
                  Enter Code →
                </button>
                <button onClick={closeForgot} className="text-gray-400 text-sm w-full text-center">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
