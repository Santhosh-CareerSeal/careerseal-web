import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      navigate('/verify-email', { state: { email, mode: 'forgot' } })
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
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-[#1A3C6E] mb-2">Forgot password?</h1>
            <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset code</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Email address</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Code →'}
            </button>
            <button onClick={() => navigate('/login')} className="text-gray-400 text-sm text-center hover:text-[#1A3C6E]">
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
