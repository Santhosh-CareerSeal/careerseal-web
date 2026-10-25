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

  const props = ['Skills tested, not just claimed', 'A verified GRID Card with a QR code', 'AI career roadmap & smart job matching', 'Real feedback on every rejection']
  const inputCls = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-[#6b4edb] focus:ring-4 focus:ring-[#6b4edb]/12'

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — value panel */}
      <div className="md:w-[42%] relative overflow-hidden flex flex-col text-white px-8 md:px-12 py-10 md:py-12"
        style={{ background: 'linear-gradient(165deg,#0c1f3d,#3c3489)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 85% 12%, rgba(107,78,219,.5), transparent 55%), radial-gradient(circle at 8% 92%, rgba(13,115,119,.4), transparent 55%)' }}></div>
        <div className="relative z-10 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-xl font-extrabold">GRID</span>
        </div>
        <div className="relative z-10 my-auto">
          <h2 className="text-2xl md:text-[26px] font-extrabold leading-tight mb-6" style={{ letterSpacing: '-.01em' }}>Your verified career starts here.</h2>
          <div className="flex flex-col gap-3">
            {props.map(p => (
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
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-14 bg-white">
        <div className="max-w-sm w-full mx-auto">

          <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-gray-400 text-sm mb-6 hover:text-[#6b4edb] transition-colors">← Back to options</button>

          <h1 className="text-2xl font-extrabold text-[#17304f] mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-6">Takes under a minute — you'll build your profile next.</p>

          <button onClick={() => handleOAuth('Google')} disabled={connecting === 'Google'}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 mb-4 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.3 36.6 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
            {connecting === 'Google' ? 'Connecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-xs">or sign up with email</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-[#17304f] mb-1.5 block">Full Name</label>
              <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17304f] mb-1.5 block">Email Address</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17304f] mb-1.5 block">Password</label>
              <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} className={inputCls} />
            </div>

            <div className="rounded-xl p-3" style={{ background: '#efedff' }}>
              <p className="text-xs" style={{ color: '#3c3489' }}>📋 You'll add your work status, mobile and other details in your profile after signing up.</p>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-opacity mt-1"
              style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 55%,#0d7377)' }}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>

            <p className="text-center text-sm text-gray-400 mt-1">
              Already have an account?{' '}
              <span className="text-[#6b4edb] font-bold cursor-pointer" onClick={() => navigate('/student-login')}>Sign in</span>
            </p>
            <p className="text-center text-xs text-gray-400">
              Are you a recruiter?{' '}
              <span className="text-[#0d7377] font-bold cursor-pointer" onClick={() => navigate('/register-company')}>Register as Company →</span>
            </p>
            <p className="text-center text-xs text-gray-400 mt-3">
              By creating an account, you agree to our{' '}
              <span onClick={() => navigate('/terms')} className="text-[#6b4edb] cursor-pointer hover:underline">Terms</span>
              {' '}and{' '}
              <span onClick={() => navigate('/privacy')} className="text-[#6b4edb] cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterStudent
