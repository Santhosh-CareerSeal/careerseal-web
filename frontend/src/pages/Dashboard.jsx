import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">CareerSeal</h1>
        <div className="w-8 h-8 bg-[#0D7377] rounded-full"></div>
      </div>
      <div className="px-6 py-6">
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-1">Welcome back!</h2>
        <p className="text-gray-500 mb-6">Here is your career summary</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Applications</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">12</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Interviews</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">4</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Saved Jobs</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">8</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Profile Views</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">36</p>
          </div>
        </div>
        <div onClick={() => navigate('/grid')} className="bg-[#1A3C6E] rounded-2xl p-6 cursor-pointer hover:bg-[#0D7377] transition-colors">
          <p className="text-white/70 text-sm mb-1">My GRID Card</p>
          <p className="text-white text-xl font-bold">View your professional identity</p>
          <p className="text-[#0D7377] text-sm mt-2">Tap to open</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard