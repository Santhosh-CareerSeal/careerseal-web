import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: '#060e1f' }}>

      {/* Background glows */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(13,115,119,0.2), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(26,60,110,0.3), transparent 60%)' }}></div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="11" fill="#0D7377"/>
            <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-white font-bold text-xl">CareerSeal</span>
        </div>

        <h1 className="text-white text-3xl font-bold text-center mb-2">Join CareerSeal</h1>
        <p className="text-white/50 text-sm text-center mb-10">Your verified career identity starts here</p>

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          {/* Student card */}
          <div onClick={() => navigate('/register-student')}
            className="cursor-pointer rounded-2xl p-6 transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(13,115,119,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.border = '1.5px solid #0D7377'}
            onMouseLeave={e => e.currentTarget.style.border = '1.5px solid rgba(13,115,119,0.5)'}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(13,115,119,0.2)' }}>🎓</div>
            <p className="text-white text-base font-bold mb-2">Student / Fresher</p>
            <p className="text-white/50 text-xs mb-5 leading-relaxed">Build your verified career identity and get discovered by top companies across India</p>
            <div className="flex flex-col gap-2 mb-5">
              {['GRID verified profile', 'AI career roadmap', 'Smart job matching', 'ATM-style GRID card'].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#0D7377' }}>
                    <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  <span className="text-white/70 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <div className="text-center py-2 rounded-xl font-bold text-sm text-white" style={{ background: '#0D7377' }}>
              Get Started →
            </div>
          </div>

          {/* Company card */}
          <div onClick={() => navigate('/register-company')}
            className="cursor-pointer rounded-2xl p-6 transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.border = '1.5px solid rgba(239,159,39,0.5)'}
            onMouseLeave={e => e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.1)'}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(239,159,39,0.15)' }}>🏢</div>
            <p className="text-white text-base font-bold mb-2">Company / Recruiter</p>
            <p className="text-white/50 text-xs mb-5 leading-relaxed">Post jobs and find verified talent from thousands of students across India</p>
            <div className="flex flex-col gap-2 mb-5">
              {['Post jobs in minutes', 'Smart candidate matching', 'Hiring pipeline', 'Search verified talent'].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EF9F27' }}>
                    <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  <span className="text-white/70 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <div className="text-center py-2 rounded-xl font-bold text-sm" style={{ background: 'rgba(239,159,39,0.15)', color: '#EF9F27', border: '1px solid rgba(239,159,39,0.3)' }}>
              Register Company →
            </div>
          </div>
        </div>

        <p className="text-white/30 text-sm text-center">
          Already have an account?{' '}
          <span className="text-[#5DCAA5] font-bold cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  )
}

export default Register
