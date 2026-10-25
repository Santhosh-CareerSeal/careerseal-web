import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Login({ fixedRole }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState(fixedRole || 'student')
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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setConnecting('Google')
      setError('')
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const res = await axios.post(`${API_URL}/api/auth/google`, {
          credential: tokenResponse.access_token,
          googleUser: userInfo.data,
          role
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        if (res.data.user.role === 'company') navigate('/company')
        else navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed')
      } finally {
        setConnecting(null)
      }
    },
    onError: () => { setError('Google sign-in was cancelled or failed'); setConnecting(null) }
  })

  const handleOAuthPlaceholder = (provider) => {
    if (provider === 'Google') { googleLogin(); return }
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
    } catch (e) {
      setResetError(e.response?.data?.message || 'Something went wrong')
    } finally {
      setResetLoading(false)
    }
  }
  const closeForgot = () => { setShowForgot(false); setResetSent(false); setResetEmail('') }

  const isCompany = role === 'company'
  const panel = isCompany
    ? { h: 'Hire verified talent, faster.', props: ['Skill-verified, document-checked candidates', 'Less screening, fewer bad hires', 'A verified talent pool in one place'] }
    : { h: 'Build a career identity companies trust.', props: ['Skills tested, not just claimed', 'A verified GRID Card with a QR code', 'Real feedback on every rejection'] }
  const registerDest = isCompany ? '/register-company' : fixedRole === 'student' ? '/register-student' : '/register'

  const inputCls = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-[#6b4edb] focus:ring-4 focus:ring-[#6b4edb]/12'

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — value panel */}
      <div className="md:w-1/2 relative overflow-hidden flex flex-col text-white px-8 md:px-12 py-10 md:py-12"
        style={{ background: 'linear-gradient(165deg,#0c1f3d,#3c3489)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 85% 12%, rgba(107,78,219,.5), transparent 55%), radial-gradient(circle at 8% 92%, rgba(13,115,119,.4), transparent 55%)' }}></div>
        <div className="relative z-10 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-xl font-extrabold">GRID</span>
        </div>
        <div className="relative z-10 my-auto">
          <h2 className="text-2xl md:text-[26px] font-extrabold leading-tight mb-6" style={{ letterSpacing: '-.01em' }}>{panel.h}</h2>
          <div className="flex flex-col gap-3">
            {panel.props.map(p => (
              <div key={p} className="flex items-center gap-3 text-sm text-white/85">
                <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>
                  <svg width="11" height="11" viewBox="0 0 10 10"><path d="M2 5l2.2 2.2L8 2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
                </span>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 pt-5 border-t border-white/12">
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(107,78,219,.3)', border: '1px solid rgba(159,225,203,.4)' }}>Early access</span>
          <p className="text-xs text-white/70 m-0">Be one of the first on GRID.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="md:w-1/2 flex flex-col justify-center px-8 md:px-14 py-12 bg-white">
        <div className="max-w-sm mx-auto w-full">

          {fromRegister && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-green-700 text-sm font-bold">✓ Account created successfully!</p>
              <p className="text-green-600 text-xs mt-1">Please sign in with your credentials to continue.</p>
            </div>
          )}

          {!fixedRole && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setRole('student')}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === 'student' ? 'border-[#6b4edb] bg-[#efedff] text-[#3c3489]' : 'border-gray-100 text-gray-500'}`}>🎓 Student</button>
              <button onClick={() => setRole('company')}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === 'company' ? 'border-[#0d7377] bg-[#0d7377]/5 text-[#0d7377]' : 'border-gray-100 text-gray-500'}`}>🏢 Company</button>
            </div>
          )}

          <h2 className="text-2xl font-extrabold text-[#17304f] mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">{isCompany ? 'Sign in to manage your hiring pipeline' : 'Sign in to continue your career journey'}</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex flex-col gap-3">
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={inputCls} autoComplete="off" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} className={inputCls} autoComplete="off" />
            <button onClick={() => setShowForgot(true)} className="text-right text-xs text-[#6b4edb] font-bold -mt-1">Forgot password?</button>
            <button onClick={handleSubmit} disabled={loading}
              className="text-white py-3 rounded-xl font-bold mt-1 disabled:opacity-50 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 55%,#0d7377)' }}>
              {loading ? 'Please wait…' : 'Sign In →'}
            </button>
          </div>

          {!isCompany && (<>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <button onClick={() => handleOAuthPlaceholder('Google')} disabled={connecting === 'Google'}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {connecting === 'Google' ? 'Connecting…' : 'Continue with Google'}
            </button>
          </>)}

          <p className="text-center text-sm text-gray-500 mt-6">
            New to GRID?{' '}
            <button onClick={() => navigate(registerDest)} className="text-[#6b4edb] font-bold">{isCompany ? 'Register company →' : 'Join now'}</button>
          </p>
          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-[#6b4edb] hover:underline">Terms</button>
            {' '}and{' '}
            <button onClick={() => navigate('/privacy')} className="text-[#6b4edb] hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            {!resetSent ? (
              <>
                <h3 className="text-xl font-bold text-[#17304f] mb-2">Reset your password</h3>
                <p className="text-gray-500 text-sm mb-5">Enter your email and we'll send you a reset code.</p>
                <input type="email" placeholder="Email Address" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} className={inputCls + ' mb-4'} />
                {resetError && <p className="text-red-500 text-xs mb-3">{resetError}</p>}
                <button onClick={handleForgotPassword} disabled={resetLoading} className="text-white py-3 rounded-xl font-bold w-full mb-3 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>
                  {resetLoading ? 'Sending…' : 'Send Reset Code'}
                </button>
                <button onClick={closeForgot} className="text-gray-400 text-sm w-full text-center">Cancel</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#17304f] mb-2">Code sent!</h3>
                <p className="text-gray-500 text-sm mb-5">We sent a 6-digit reset code to <strong>{resetEmail}</strong>. Check your inbox.</p>
                <button onClick={() => { closeForgot(); navigate('/verify-email', { state: { email: resetEmail, mode: 'forgot' } }) }} className="text-white py-3 rounded-xl font-bold w-full mb-3" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>
                  Enter Code →
                </button>
                <button onClick={closeForgot} className="text-gray-400 text-sm w-full text-center">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
