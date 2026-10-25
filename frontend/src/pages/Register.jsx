import { useNavigate } from 'react-router-dom'

const cards = [
  {
    to: '/register-student', emoji: '🎓', title: 'Student / Fresher',
    desc: 'Build your verified career identity and get discovered by companies that trust it.',
    feats: ['Verified GRID profile', 'AI career roadmap', 'Smart job matching', 'Your own GRID Card'],
    check: '#0d7377', cta: 'Get Started →',
  },
  {
    to: '/register-company', emoji: '🏢', title: 'Company / Recruiter',
    desc: 'Post jobs and hire skill-verified, document-checked talent from across India.',
    feats: ['Post jobs in minutes', 'Smart candidate matching', 'Hiring pipeline', 'Search verified talent'],
    check: '#6b4edb', cta: 'Register Company →',
  },
]

function Register() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(165deg,#0c1f3d,#3c3489)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(13,115,119,.3), transparent 55%), radial-gradient(ellipse at 75% 60%, rgba(107,78,219,.4), transparent 55%)' }}></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-7">
          <svg width="24" height="24" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-extrabold text-xl">GRID</span>
        </div>

        <h1 className="text-white text-3xl font-extrabold text-center mb-2">Join GRID</h1>
        <p className="text-white/50 text-sm text-center mb-9">Your verified career identity starts here</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {cards.map(c => (
            <div key={c.title} onClick={() => navigate(c.to)}
              className="cursor-pointer rounded-2xl p-6 transition-all hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.check}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>{c.emoji}</div>
              <p className="text-white text-base font-bold mb-2">{c.title}</p>
              <p className="text-white/50 text-xs mb-5 leading-relaxed">{c.desc}</p>
              <div className="flex flex-col gap-2 mb-5">
                {c.feats.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.check }}>
                      <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    <span className="text-white/70 text-xs">{f}</span>
                  </div>
                ))}
              </div>
              <div className="text-center py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>{c.cta}</div>
            </div>
          ))}
        </div>

        <p className="text-white/40 text-sm text-center">
          Already have an account?{' '}
          <span className="text-[#9fe1cb] font-bold cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
        </p>
        <p className="text-white/30 text-xs text-center mt-3">
          Are you a college?{' '}
          <span className="text-white/60 font-bold cursor-pointer hover:text-[#9fe1cb] transition-colors" onClick={() => navigate('/college-login')}>College login →</span>
        </p>
      </div>
    </div>
  )
}

export default Register
