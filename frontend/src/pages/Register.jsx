import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [workStatus, setWorkStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const statuses = [
    { id: 'Student', label: "I'm a Student", desc: 'Currently studying in school or college', icon: '🎓' },
    { id: 'Fresher', label: "I'm a Fresher", desc: 'Graduated, no full-time work experience yet', icon: '🌱' },
    { id: 'Experienced', label: "I'm Experienced", desc: 'Have professional work experience', icon: '💼' }
  ]

  const handleSubmit = async () => {
    setError('')
    if (!name || !email || !password || !mobile || !workStatus) {
      setError('Please fill in all fields and select your work status')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/signup`, { name, email, password, role: 'student', workStatus, mobile })
      navigate('/login', { state: { fromRegister: true } })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Left panel */}
      <div className="hidden md:flex w-80 bg-[#1A3C6E] flex-col justify-center px-10 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#0D7377"/>
              <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-white font-bold text-xl">CareerSeal</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Your verified career identity starts here</h2>
          <p className="text-white/60 text-sm mb-8">Join thousands of students and freshers building their career with CareerSeal</p>
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

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#0D7377"/>
              <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-[#1A3C6E] font-bold text-xl">CareerSeal</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1A3C6E] mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-6">Student or Fresher? <span className="text-[#0D7377] font-bold cursor-pointer" onClick={() => navigate('/register-company')}>Register as a Company instead →</span></p>

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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Mobile Number</label>
              <input type="tel" placeholder="10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Password</label>
              <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7377] transition-colors"/>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">I am a...</label>
              <div className="flex flex-col gap-2">
                {statuses.map(s => (
                  <button key={s.id} onClick={() => setWorkStatus(s.id)}
                    className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-left transition-all ${workStatus === s.id ? 'border-[#0D7377] bg-[#0D7377]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className={`text-sm font-bold ${workStatus === s.id ? 'text-[#1A3C6E]' : 'text-gray-700'}`}>{s.label}</p>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                    {workStatus === s.id && <div className="ml-auto w-5 h-5 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L6 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating account...' : 'Create My Account →'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <span className="text-[#0D7377] font-bold cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
