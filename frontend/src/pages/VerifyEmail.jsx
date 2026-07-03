import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const mode = location.state?.mode || 'register'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (!email) { navigate('/register'); return }
    startCountdown()
  }, [])

  const startCountdown = () => {
    setCountdown(60)
    setCanResend(false)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val.slice(-1)
    setOtp(newOtp)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
    if (newOtp.every(d => d !== '')) handleVerify(newOtp.join(''))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newOtp = pasted.split('')
      setOtp(newOtp)
      inputs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (code) => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await axios.post(`${API_URL}/api/auth/signup/verify`, { email, otp: code })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        setSuccess('Email verified! Setting up your profile...')
        setTimeout(() => navigate('/profile-details'), 1500)
      } else if (mode === 'forgot') {
        setSuccess('Code verified! Set your new password.')
        setTimeout(() => navigate('/reset-password', { state: { email, otp: code } }), 1500)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid code. Please try again.')
      if (e.response?.data?.expired) {
        setTimeout(() => navigate(mode === 'register' ? '/register' : '/forgot-password'), 2000)
      }
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      if (mode === 'register') {
        await axios.post(`${API_URL}/api/otp/send`, { email })
      } else {
        await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      }
      startCountdown()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060e1f' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(13,115,119,0.15), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(26,60,110,0.2), transparent 60%)' }}></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-bold text-xl">CareerSeal</span>
        </div>
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{mode === 'forgot' ? '🔑' : '📧'}</div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-2">{mode === 'forgot' ? 'Reset password' : 'Verify your email'}</h1>
            <p className="text-gray-400 text-sm">We sent a 6-digit code to</p>
            <p className="text-[#0D7377] font-bold text-sm">{email}</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 text-center">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl mb-4 text-center">{success}</div>}

          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input key={idx} ref={el => inputs.current[idx] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all"
                style={{ borderColor: digit ? '#0D7377' : '#e5e7eb', background: digit ? '#f0fafa' : 'white', color: '#1A3C6E' }}
                disabled={loading}
              />
            ))}
          </div>

          <button onClick={() => handleVerify(otp.join(''))} disabled={loading || otp.some(d => !d)}
            className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50 mb-4">
            {loading ? 'Verifying...' : 'Verify →'}
          </button>

          <div className="text-center">
            {canResend ? (
              <button onClick={handleResend} disabled={resending} className="text-[#0D7377] font-bold text-sm hover:underline disabled:opacity-50">
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            ) : (
              <p className="text-gray-400 text-sm">Resend code in <span className="font-bold text-[#1A3C6E]">{countdown}s</span></p>
            )}
          </div>
        </div>
        <p className="text-white/20 text-xs text-center mt-6">Check your spam folder if you don't see the email</p>
      </div>
    </div>
  )
}

export default VerifyEmail
