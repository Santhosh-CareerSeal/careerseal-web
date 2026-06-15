import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ totalApplications: 0, interviews: 0, savedJobs: 0, profileViews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const response = await axios.get('http://localhost:5000/api/dashboard/student', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data.user)
        setStats(response.data.stats)
      } catch (error) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-[#1A3C6E] text-xl font-bold">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">CareerSeal</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-white/70 text-sm">Logout</button>
          <div className="w-8 h-8 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-1">Welcome back, {user?.name}!</h2>
        <p className="text-gray-500 mb-6">Here is your career summary</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Applications</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">{stats.totalApplications}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Interviews</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">{stats.interviews}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Saved Jobs</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">{stats.savedJobs}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Profile Views</p>
            <p className="text-[#1A3C6E] text-3xl font-bold">{stats.profileViews}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div onClick={() => navigate('/jobs')} className="bg-[#0D7377] rounded-2xl p-6 cursor-pointer hover:bg-[#0a5f63] transition-colors">
            <p className="text-white/70 text-sm mb-1">Job Board</p>
            <p className="text-white text-xl font-bold">Browse Available Jobs</p>
            <p className="text-white/70 text-sm mt-2">Find your next opportunity →</p>
          </div>
          <div onClick={() => navigate('/tracker')} className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm mb-1">My Applications</p>
            <p className="text-[#1A3C6E] text-xl font-bold">Track Application Status</p>
            <p className="text-[#0D7377] text-sm mt-2">View timeline →</p>
          </div>
          <div onClick={() => navigate('/grid')} className="bg-[#1A3C6E] rounded-2xl p-6 cursor-pointer hover:bg-[#0D7377] transition-colors">
            <p className="text-white/70 text-sm mb-1">My GRID Card</p>
            <p className="text-white text-xl font-bold">View your professional identity</p>
            <p className="text-white/70 text-sm mt-2">Tap to open →</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
