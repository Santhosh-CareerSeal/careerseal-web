import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function CollegeLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/college/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('college', JSON.stringify(res.data.college))
      navigate('/college-portal')
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#060e1f' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(13,115,119,0.15), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(26,60,110,0.2), transparent 60%)' }}></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-bold text-xl">GRID</span>
          <span className="text-white/30 text-sm ml-1">for Colleges</span>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">College Portal Login</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in with your institution credentials</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Institution Email</label>
              <input type="email" placeholder="tpo@college.ac.in" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Password</label>
              <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-700 font-bold mb-1">Access restricted</p>
            <p className="text-xs text-blue-600">This portal is only for GRID partner institutions. Contact us at support@thegridcard.com to partner with us.</p>
          </div>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">Students and companies — <span className="text-white/40 cursor-pointer" onClick={() => navigate('/login')}>sign in here</span></p>
      </div>
    </div>
  )
}

export default CollegeLogin
