import { useNavigate } from 'react-router-dom'

function GridCard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6">
      <div className="bg-[#1A3C6E] rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-white text-2xl font-bold">John Doe</h2>
            <p className="text-[#0D7377]">Software Engineer</p>
          </div>
          <div className="w-12 h-12 bg-[#0D7377] rounded-full"></div>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <p className="text-white/60 text-xs">University</p>
            <p className="text-white font-bold">MIT</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <p className="text-white/60 text-xs">Graduation Year</p>
            <p className="text-white font-bold">2025</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <p className="text-white/60 text-xs">Skills</p>
            <p className="text-white font-bold">React, Node.js, Python</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <p className="text-white/60 text-xs">Goal</p>
            <p className="text-white font-bold">Full Stack Developer</p>
          </div>
        </div>
        <div className="bg-[#0D7377] rounded-xl p-3 text-center">
          <p className="text-white font-bold tracking-widest text-sm">CAREERSEAL VERIFIED</p>
        </div>
      </div>
      <button onClick={() => navigate('/dashboard')} className="mt-8 text-[#1A3C6E] font-bold">
        Back to Dashboard
      </button>
    </div>
  )
}

export default GridCard
