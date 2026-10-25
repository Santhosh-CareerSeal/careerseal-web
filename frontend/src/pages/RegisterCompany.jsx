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

  const props = ['Skill-verified, document-checked candidates', 'Post jobs & manage your pipeline', 'Search verified talent by skill', 'Less screening, fewer bad hires']
  const fieldCls = 'w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none bg-white transition-colors focus:border-[#6b4edb] focus:ring-4 focus:ring-[#6b4edb]/12'

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">

      {/* Left — value panel (desktop) */}
      <div className="hidden md:flex md:w-[38%] relative overflow-hidden flex-col text-white px-10 py-12"
        style={{ background: 'linear-gradient(165deg,#0c1f3d,#3c3489)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 85% 12%, rgba(107,78,219,.5), transparent 55%), radial-gradient(circle at 8% 92%, rgba(13,115,119,.4), transparent 55%)' }}></div>
        <div className="relative z-10 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-xl font-extrabold">GRID</span>
        </div>
        <div className="relative z-10 my-auto">
          <h2 className="text-[26px] font-extrabold leading-tight mb-6" style={{ letterSpacing: '-.01em' }}>Hire verified talent, faster.</h2>
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
        <div className="relative z-10 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <p className="text-white/40 text-[11px] font-bold tracking-wide mb-1">VERIFICATION NOTE</p>
          <p className="text-white/70 text-xs leading-relaxed">Your company is verified by GRID within a week. You can post jobs immediately, and verified companies get a trust badge students can see.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-14 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">

          <div className="flex items-center gap-2 mb-8 md:hidden">
            <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <span className="text-[#17304f] font-extrabold text-xl">GRID</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#17304f] mb-1">Register your company</h1>
          <p className="text-gray-400 text-sm mb-6">
            Are you a student or fresher?{' '}
            <span className="text-[#6b4edb] font-bold cursor-pointer" onClick={() => navigate('/register-student')}>Register as Student →</span>
          </p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <div className="flex flex-col gap-4">

            {/* Company info */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Company Information</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Company Name *</label>
                  <input type="text" placeholder="e.g. TechCorp India Pvt Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} className={fieldCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Industry *</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)} className={fieldCls}>
                    <option value="">Select industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Company Size *</label>
                  <select value={companySize} onChange={e => setCompanySize(e.target.value)} className={fieldCls}>
                    <option value="">Select company size</option>
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Website (optional)</label>
                  <input type="url" placeholder="https://yourcompany.com" value={website} onChange={e => setWebsite(e.target.value)} className={fieldCls} />
                </div>
              </div>
            </div>

            {/* Recruiter info */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Recruiter Information</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Your Full Name *</label>
                  <input type="text" placeholder="Recruiter's full name" value={recruiterName} onChange={e => setRecruiterName(e.target.value)} className={fieldCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Your Designation *</label>
                  <select value={designation} onChange={e => setDesignation(e.target.value)} className={fieldCls}>
                    <option value="">Select your role</option>
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Work Email *</label>
                  <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className={fieldCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Password *</label>
                  <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} className={fieldCls} />
                </div>
              </div>
            </div>

            {/* Verification notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <span className="text-lg flex-shrink-0">⏳</span>
              <p className="text-xs text-amber-800 leading-relaxed">Your company will be verified by GRID within a week. You can post jobs immediately — you'll get an email and notification once verified.</p>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#1a3c6e,#6b4edb 55%,#0d7377)' }}>
              {loading ? 'Creating account…' : 'Register Company →'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already registered?{' '}
              <span className="text-[#6b4edb] font-bold cursor-pointer" onClick={() => navigate('/company-login')}>Sign in</span>
            </p>
            <p className="text-center text-xs text-gray-400">
              By registering, you agree to GRID's{' '}
              <span onClick={() => navigate('/terms')} className="text-[#6b4edb] cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span onClick={() => navigate('/privacy')} className="text-[#6b4edb] cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterCompany
