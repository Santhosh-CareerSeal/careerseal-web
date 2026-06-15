import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Jobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs')
        setJobs(response.data.jobs)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleApply = async (jobId) => {
    setApplying(jobId)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:5000/api/applications', { jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Applied successfully!')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong')
    } finally {
      setApplying(null)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-[#1A3C6E] text-xl font-bold">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">CareerSeal</h1>
        <button onClick={() => navigate('/dashboard')} className="text-white/70 text-sm">Dashboard</button>
      </div>
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-6">Available Jobs</h2>
        {message ? <p className="text-green-600 font-bold mb-4">{message}</p> : null}
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A3C6E] text-lg font-bold">{job.title}</h3>
              <p className="text-[#0D7377] text-sm font-bold mb-2">{job.salaryRange}</p>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <button onClick={() => handleApply(job.id)} disabled={applying === job.id} className="bg-[#1A3C6E] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">
                {applying === job.id ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Jobs
