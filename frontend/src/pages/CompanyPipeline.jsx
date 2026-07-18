import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function CompanyPipeline() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  const fetchApplications = async () => {
    try {
      const response = await axios.get('https://careerseal-web.onrender.com/api/applications/company', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApplications(response.data.applications)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchApplications()
  }, [])

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(`https://careerseal-web.onrender.com/api/applications/${applicationId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchApplications()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = ['pending', 'interview', 'accepted', 'hired', 'rejected']

  const getColumnColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200'
      case 'interview': return 'bg-blue-50 border-blue-200'
      case 'accepted': return 'bg-green-50 border-green-200'
      case 'hired': return 'bg-emerald-100 border-emerald-300'
      case 'rejected': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getHeaderColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-700'
      case 'interview': return 'text-blue-700'
      case 'accepted': return 'text-green-700'
      case 'hired': return 'text-emerald-800'
      case 'rejected': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-[#1A3C6E] text-xl font-bold">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">GRID — Pipeline</h1>
        <button onClick={() => navigate('/company')} className="text-white/70 text-sm">Back</button>
      </div>
      <div className="px-6 py-6">
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-6">Applicant Pipeline</h2>
        <div className="grid grid-cols-2 gap-4">
          {columns.map(column => (
            <div key={column} className={`rounded-2xl border-2 p-4 ${getColumnColor(column)}`}>
              <h3 className={`font-bold text-sm uppercase mb-4 ${getHeaderColor(column)}`}>
                {column} ({applications.filter(a => a.status === column).length})
              </h3>
              <div className="flex flex-col gap-3">
                {applications.filter(a => a.status === column).map(app => (
                  <div key={app.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-[#1A3C6E] font-bold text-sm">{app.student?.user?.name}</p>
                    <p className="text-gray-500 text-xs mb-3">{app.job?.title}</p>
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompanyPipeline
