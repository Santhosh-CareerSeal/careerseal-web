import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const CATEGORIES = ['All', 'Tech', 'Career', 'Business']
const LEVEL_COLORS = {
  Beginner: { bg: '#E1F5EE', color: '#085041' },
  Intermediate: { bg: '#f0f4ff', color: '#1A3C6E' },
  Advanced: { bg: '#FFF9C4', color: '#854F0B' }
}

function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [showRecommended, setShowRecommended] = useState(true)
  const [student, setStudent] = useState(null)
  const [user, setUser] = useState(null)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = async () => {
    try {
      if (!token) { navigate('/login'); return }
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(storedUser)
      const [coursesRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/api/courses`, { headers }),
        axios.get(`${API_URL}/api/profile/details`, { headers })
      ])
      setCourses(coursesRes.data.courses || [])
      setStudent(profileRes.data.student)
    } catch (e) {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleStartCourse = async (course) => {
    try {
      await axios.put(`${API_URL}/api/courses/${course.id}/progress`, { status: 'started' }, { headers })
      window.open(course.url, '_blank')
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: 'started' } : c))
    } catch (e) { console.error(e) }
  }

  const handleMarkComplete = async (course) => {
    try {
      await axios.put(`${API_URL}/api/courses/${course.id}/progress`, { status: 'completed' }, { headers })
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: 'completed' } : c))
    } catch (e) { console.error(e) }
  }

  const filtered = courses.filter(c => {
    if (showRecommended && !c.recommended) return false
    if (category !== 'All' && c.category !== category) return false
    return true
  })

  const recommendedCount = courses.filter(c => c.recommended).length
  const completedCount = courses.filter(c => c.status === 'completed').length

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading courses...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar student={student} user={user} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A3C6E 0%, #0D7377 100%)' }} className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white text-2xl font-bold mb-1">Courses</h1>
          <p className="text-white/60 text-sm mb-4">Free courses curated based on your skills and career roadmap</p>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/50 text-xs mb-1">RECOMMENDED</p>
              <p className="text-white font-bold text-lg">{recommendedCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/50 text-xs mb-1">COMPLETED</p>
              <p className="text-white font-bold text-lg">{completedCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/50 text-xs mb-1">TOTAL COURSES</p>
              <p className="text-white font-bold text-lg">{courses.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setShowRecommended(!showRecommended)}
            className={`text-xs font-bold px-4 py-2 rounded-full border-2 transition-all ${showRecommended ? 'bg-[#0D7377] text-white border-[#0D7377]' : 'border-gray-200 text-gray-500'}`}>
            ⭐ Recommended for you
          </button>
          <div className="h-5 w-px bg-gray-200"></div>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-full border-2 transition-all ${category === cat ? 'bg-[#1A3C6E] text-white border-[#1A3C6E]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-[#1A3C6E] font-bold text-lg mb-2">No courses found</p>
            <p className="text-gray-400 text-sm mb-6">
              {showRecommended ? 'Add skills to your profile or complete your roadmap to get recommendations' : 'Try a different category'}
            </p>
            {showRecommended && (
              <button onClick={() => setShowRecommended(false)} className="bg-[#1A3C6E] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#0D7377] transition-colors">
                Browse All Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course, i) => {
              const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.Beginner
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#f0f4ff] flex items-center justify-center text-2xl">{course.thumbnail}</div>
                    {course.recommended && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">⭐ For you</span>
                    )}
                  </div>

                  <p className="font-bold text-[#1A3C6E] text-sm mb-2 leading-snug">{course.title}</p>

                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: levelStyle.bg, color: levelStyle.color }}>
                      {course.level}
                    </span>
                    {course.free && <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">Free</span>}
                    <span className="text-xs text-gray-400 px-2 py-1">{course.duration}</span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">Skill: {course.skill} · {course.provider}</p>

                  <div className="mt-auto flex gap-2">
                    {course.status === 'completed' ? (
                      <div className="flex-1 bg-green-50 text-green-700 text-center py-2 rounded-xl text-xs font-bold border border-green-200">
                        ✓ Completed
                      </div>
                    ) : course.status === 'started' ? (
                      <>
                        <button onClick={() => window.open(course.url, '_blank')} className="flex-1 bg-[#1A3C6E] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#0D7377] transition-colors">
                          Continue
                        </button>
                        <button onClick={() => handleMarkComplete(course)} className="px-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                          ✓
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleStartCourse(course)} className="flex-1 bg-[#1A3C6E] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#0D7377] transition-colors">
                        Start Course →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses
