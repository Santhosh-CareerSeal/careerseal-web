import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function JobTracker() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const response = await axios.get('http://localhost:5000/api/applications/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setApplications(response.data.applications)
      } catch (error) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'interview': return 'bg-blue-100 text-blue-700'
      case 'accepted': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-[#1A3C6E] text-xl font-bold">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">CareerSeal</h1>
        <button onClick={() => navigate('/dashboard')} className="text-white/70 text-sm">Back</button>
      </div>
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-6">My Applications</h2>
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-gray-500">No applications yet</p>
            <button onClick={() => navigate('/jobs')} className="mt-4 bg-[#0D7377] text-white px-6 py-3 rounded-xl font-bold">Browse Jobs</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[#1A3C6E] text-lg font-bold">{app.job.title}</h3>
                    <p className="text-gray-500 text-sm">{app.job.salaryRange}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-3 h-3 bg-[#0D7377] rounded-full"></div>
                  <p className="text-gray-400 text-xs">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobTracker
