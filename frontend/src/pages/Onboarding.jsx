import { useNavigate } from 'react-router-dom'

function Onboarding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center px-8">
      <h1 className="text-5xl font-bold text-white mb-4">GRID</h1>
      <p className="text-[#0D7377] text-lg mb-16 tracking-widest uppercase">Shape your future</p>

      <div className="flex flex-col gap-6 w-full max-w-sm mb-16">
        <div className="bg-white/10 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Build Your GRID</h2>
          <p className="text-white/70">Create your professional identity card with skills, goals and achievements</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Track Applications</h2>
          <p className="text-white/70">Manage your job applications and interview pipeline in one place</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Get Discovered</h2>
          <p className="text-white/70">Let recruiters find you based on your verified skills and experience</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button onClick={() => navigate('/login')} className="bg-[#0D7377] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#0a5f63] transition-colors">
          Get Started
        </button>
        <button onClick={() => navigate('/login')} className="border-2 border-white/30 text-white py-4 rounded-2xl text-lg font-bold hover:border-white transition-colors">
          I already have an account
        </button>
      </div>
    </div>
  )
}

export default Onboarding