import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter email and password'); return }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/admin/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1e3d] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="font-bold text-[#1A3C6E] text-lg">GRID Admin</span>
        </div>
        <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Admin access</h1>
        <p className="text-gray-400 text-sm mb-6">Restricted area. Authorized personnel only.</p>

        <div className="flex flex-col gap-3">
          <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm" />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50 mt-1">
            {loading ? 'Please wait...' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
