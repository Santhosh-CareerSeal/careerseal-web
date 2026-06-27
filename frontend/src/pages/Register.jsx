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
    { id: 'student', label: "I'm a Student", desc: 'Currently studying in school or college', icon: 'ti-school' },
    { id: 'fresher', label: "I'm a Fresher", desc: 'Graduated, no full-time work experience yet', icon: 'ti-user-check' },
    { id: 'experienced', label: "I'm Experienced", desc: 'Have professional work experience', icon: 'ti-briefcase' }
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
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name, email, password, role: 'student', workStatus, mobile
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/profile-details')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      <div className="hidden md:flex w-80 bg-[#1A3C6E] flex-col justify-center px-10 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#0D7377" />
              <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h1 className="text-white text-xl font-bold">CareerSeal</h1>
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">On registering, you can</h2>
          <div className="flex flex-col gap-4">
            {[
              'Build your GRID card and get discovered by top companies',
              'Get job postings delivered right to your profile',
              'Track all your applications in one place',
              'Verify your identity and stand out from fake profiles'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ti ti-check text-white text-xs"></i>
                </div>
                <p className="text-white/80 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">

          <div className="flex items-center gap-2 mb-1 md:hidden">
            <svg width="20" height="20" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#0D7377" />
              <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h1 className="text-xl font-bold text-[#1A3C6E]">CareerSeal</h1>
          </div>

          <h2 className="text-2xl font-bold text-[#1A3C6E] mb-1">Create your CareerSeal profile</h2>
          <p className="text-gray-500 text-sm mb-8">Search & apply to jobs from India's most trusted career platform</p>

          {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Full Name <span className="text-red-400">*</span></label>
              <input type="text" placeholder="What is your name?" value={name} onChange={e => setName(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Email ID <span className="text-red-400">*</span></label>
              <input type="email" placeholder="Tell us your Email ID" value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
              <p className="text-gray-400 text-xs mt-1">We'll send relevant jobs and updates to this email</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Password <span className="text-red-400">*</span></label>
              <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
              <p className="text-gray-400 text-xs mt-1">This helps your account stay protected</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Mobile Number <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <div className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50">+91</div>
                <input type="tel" placeholder="Enter your mobile number" value={mobile} onChange={e => setMobile(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm flex-1" />
              </div>
              <p className="text-gray-400 text-xs mt-1">Recruiters will contact you on this number</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Work Status <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-3">
              {statuses.map(s => (
                <button
                  key={s.id}
                  onClick={() => setWorkStatus(s.id)}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${workStatus === s.id ? 'border-[#0D7377] bg-[#0D7377]/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <i className={`ti ${s.icon} text-2xl mb-2 block ${workStatus === s.id ? 'text-[#0D7377]' : 'text-gray-400'}`}></i>
                  <p className={`text-sm font-bold mb-1 ${workStatus === s.id ? 'text-[#1A3C6E]' : 'text-gray-700'}`}>{s.label}</p>
                  <p className="text-xs text-gray-400 leading-tight">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors mb-4">
            {loading ? 'Creating account...' : 'Register & Continue'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-[#0D7377] font-bold">
              Sign in
            </button>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            By registering, you agree to CareerSeal's Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
