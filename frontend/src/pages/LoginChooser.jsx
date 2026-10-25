import { useNavigate } from 'react-router-dom'

const options = [
  { emoji: '🎓', title: 'Student', sub: 'or Fresher', to: '/student-login', accent: '#1a3c6e' },
  { emoji: '🏢', title: 'Company', sub: 'or Recruiter', to: '/company-login', accent: '#0d7377' },
  { emoji: '🏫', title: 'College', sub: 'Placement cell / TPO', to: '/college-login', accent: '#3c3489' },
]

function LoginChooser() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(165deg,#0c1f3d,#3c3489)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg width="26" height="26" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-2xl font-extrabold text-white">GRID</h1>
        </div>
        <p className="text-white/50 text-sm text-center mb-8">Log in to your account</p>

        <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-3 text-center">Choose your account type</p>
        <div className="flex flex-col gap-3">
          {options.map(o => (
            <button key={o.title} onClick={() => navigate(o.to)}
              className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 text-left transition-transform hover:-translate-y-0.5"
              style={{ border: '2px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#9fe1cb'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-bold" style={{ color: o.accent }}>{o.title}</span>
                <span className="block text-xs text-gray-400">{o.sub}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={o.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          New to GRID?{' '}
          <button onClick={() => navigate('/register')} className="font-bold" style={{ color: '#9fe1cb' }}>Create an account</button>
        </p>
      </div>
    </div>
  )
}

export default LoginChooser
