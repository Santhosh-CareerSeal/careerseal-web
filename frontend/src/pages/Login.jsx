import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const url = isLogin ? 'https://careerseal-web.onrender.com/api/auth/login' : 'https://careerseal-web.onrender.com/api/auth/signup'
      const data = isLogin ? { email, password } : { name, email, password, role: 'student' }
      const response = await axios.post(url, data)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center px-8">
      <h1 className="text-4xl font-bold text-white mb-2">CareerSeal</h1>
      <p className="text-[#0D7377] text-sm mb-10 tracking-widest uppercase">Your career journey starts here</p>
      <div className="flex bg-white/10 rounded-2xl p-1 mb-8 w-full max-w-sm">
        <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isLogin ? 'bg-white text-[#1A3C6E]' : 'text-white'}`}>Login</button>
        <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${!isLogin ? 'bg-white text-[#1A3C6E]' : 'text-white'}`}>Sign Up</button>
      </div>
      {error ? <p className="text-red-400 mb-4">{error}</p> : null}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {!isLogin && <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="bg-white/10 text-white placeholder-white/50 py-4 px-6 rounded-2xl outline-none focus:bg-white/20" />}
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/10 text-white placeholder-white/50 py-4 px-6 rounded-2xl outline-none focus:bg-white/20" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/10 text-white placeholder-white/50 py-4 px-6 rounded-2xl outline-none focus:bg-white/20" />
        <button onClick={handleSubmit} disabled={loading} className="bg-[#0D7377] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#0a5f63] transition-colors mt-2">
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}

export default Login
