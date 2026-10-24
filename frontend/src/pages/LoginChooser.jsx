import { useNavigate } from 'react-router-dom'

const options = [
  { emoji: '🎓', title: 'Student', sub: 'or Fresher', to: '/student-login', accent: '#1A3C6E' },
  { emoji: '🏢', title: 'Company', sub: 'or Recruiter', to: '/company-login', accent: '#0D7377' },
  { emoji: '🏫', title: 'College', sub: 'Placement cell / TPO', to: '/college-login', accent: '#3C3489' },
]

function LoginChooser() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg width="24" height="24" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-2xl font-bold text-white">GRID</h1>
        </div>
        <p className="text-white/50 text-sm text-center mb-8">Log in to your account</p>

        <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3 text-center">Choose your account type</p>
        <div className="flex flex-col gap-3">
          {options.map(o => (
            <button key={o.title} onClick={() => navigate(o.to)}
              className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 text-left hover:translate-y-[-1px] transition-transform">
              <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
              <span className="flex-1">
                <span className="block text-[15px] font-bold" style={{ color: o.accent }}>{o.title}</span>
                <span className="block text-xs text-gray-400">{o.sub}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={o.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          New to GRID?{' '}
          <button onClick={() => navigate('/register')} className="text-[#5DCAA5] font-bold">Create an account</button>
        </p>
      </div>
    </div>
  )
}

export default LoginChooser
