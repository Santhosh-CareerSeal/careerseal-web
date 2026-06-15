import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function CompanyDashboard() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs')
      setJobs(response.data.jobs)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchJobs()
  }, [])

  const handlePostJob = async () => {
    setLoading(true)
    setMessage('')
    try {
      await axios.post('http://localhost:5000/api/jobs', { title, description, salaryRange }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Job posted successfully!')
      setTitle('')
      setDescription('')
      setSalaryRange('')
      fetchJobs()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">CareerSeal — Company</h1>
        <div className="flex gap-4">
  <button onClick={() => navigate('/pipeline')} className="text-white/70 text-sm">Pipeline</button>
  <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }} className="text-white/70 text-sm">Logout</button>
</div>
      </div>
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-6">Post a New Job</h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          {message ? <p className="text-green-600 mb-4 font-bold">{message}</p> : null}
          <div className="flex flex-col gap-4">
            <input type="text" placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377]" />
            <textarea placeholder="Job Description" value={description} onChange={e => setDescription(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] h-32" />
            <input type="text" placeholder="Salary Range (e.g. 5-8 LPA)" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377]" />
            <button onClick={handlePostJob} disabled={loading} className="bg-[#0D7377] text-white py-3 rounded-xl font-bold hover:bg-[#0a5f63] transition-colors">
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </div>
        <h2 className="text-[#1A3C6E] text-2xl font-bold mb-4">Posted Jobs</h2>
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A3C6E] text-lg font-bold">{job.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{job.salaryRange}</p>
              <p className="text-gray-600">{job.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard
