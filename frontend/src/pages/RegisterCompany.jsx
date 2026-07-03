import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function RegisterCompany() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [recruiterName, setRecruiterName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [designation, setDesignation] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const industries = ['Information Technology', 'Manufacturing', 'Healthcare & Pharma', 'Finance & Banking', 'Education', 'E-commerce & Retail', 'Construction & Real Estate', 'Media & Entertainment', 'Government & PSU', 'Other']
  const sizes = ['1-10 employees', '10-50 employees', '50-200 employees', '200-500 employees', '500-1000 employees', '1000+ employees']
  const designations = ['HR Manager', 'Recruiter', 'Talent Acquisition', 'Founder / CEO', 'CTO / Technical Lead', 'Department Manager', 'Other']

  const handleSubmit = async () => {
    setError('')
    if (!companyName || !recruiterName || !email || !password || !designation || !industry || !companySize) {
      setError('Please fill in all required fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup/initiate`, {
        name: recruiterName, email, password,
        role: 'company', companyName, industry, companySize, website, designation
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/company')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

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
          <h2 className="text-white text-2xl font-bold mb-4">Find verified talent for your company</h2>
          <p className="text-white/60 text-sm mb-8">Access thousands of verified student profiles with GRID cards across India</p>
          <div className="flex flex-col gap-3">
            {['Post jobs in minutes', 'Smart candidate matching', 'View verified GRID profiles', 'Manage hiring pipeline', 'Search talent by skills'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0D7377] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L6 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-white/10 rounded-xl p-4">
            <p className="text-white/40 text-xs mb-1">VERIFICATION NOTE</p>
            <p className="text-white/70 text-xs leading-relaxed">Your company will be verified by CareerSeal within 1 week. You can post jobs immediately. Verified companies get a trust badge visible to all students.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">

          <div className="flex items-center gap-2 mb-8 md:hidden">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#0D7377"/>
              <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-[#1A3C6E] font-bold text-xl">CareerSeal</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1A3C6E] mb-1">Register your company</h1>
          <p className="text-gray-400 text-sm mb-6">
            Are you a student or fresher?{' '}
            <span className="text-[#0D7377] font-bold cursor-pointer" onClick={() => navigate('/register')}>Register as Student →</span>
          </p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-4">

            {/* Company info */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Company Information</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Company Name *</label>
                  <input type="text" placeholder="e.g. TechCorp India Pvt Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Industry *</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors">
                    <option value="">Select industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Company Size *</label>
                  <select value={companySize} onChange={e => setCompanySize(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors">
                    <option value="">Select company size</option>
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Website (optional)</label>
                  <input type="url" placeholder="https://yourcompany.com" value={website} onChange={e => setWebsite(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors"/>
                </div>
              </div>
            </div>

            {/* Recruiter info */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Recruiter Information</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Your Full Name *</label>
                  <input type="text" placeholder="Recruiter's full name" value={recruiterName} onChange={e => setRecruiterName(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Your Designation *</label>
                  <select value={designation} onChange={e => setDesignation(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors">
                    <option value="">Select your role</option>
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Work Email *</label>
                  <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Password *</label>
                  <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D7377] bg-white transition-colors"/>
                </div>
              </div>
            </div>

            {/* Verification notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <span className="text-lg flex-shrink-0">⏳</span>
              <p className="text-xs text-amber-800 leading-relaxed">Your company will be verified by CareerSeal within 1 week. You can post jobs immediately after registration. You will receive an email and notification once verified.</p>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register Company →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By registering, you agree to CareerSeal's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterCompany
