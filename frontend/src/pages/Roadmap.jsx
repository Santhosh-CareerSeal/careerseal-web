import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const STUDENT_QUESTIONS = [
  { id: 'class', question: 'Which class are you currently in?', options: ['8th', '9th', '10th', '11th', '12th', 'College 1st Year', 'College 2nd Year', 'College 3rd Year', 'Final Year'] },
  { id: 'subjects', question: 'Which subjects do you enjoy the most?', options: ['Maths & Science', 'Biology & Chemistry', 'Computer Science', 'Arts & Creativity', 'History & Literature', 'Business & Economics', 'Physical Education & Sports'] },
  { id: 'work', question: 'What kind of work excites you the most?', options: ['Building things with technology', 'Designing and constructing structures', 'Healing and helping people', 'Teaching and guiding others', 'Cooking, food and nutrition', 'Business, finance and management', 'Research and discovering new things', 'Creative arts, music and design'] },
  { id: 'location', question: 'Where do you want to work in the future?', options: ['India only', 'Abroad (USA, UK, Canada, Australia etc.)', 'Middle East (Dubai, Qatar etc.)', 'Both India and Abroad', 'Not sure yet'] },
  { id: 'lifestyle', question: 'What lifestyle do you want in 10 years?', options: ['High salary, even if work is demanding', 'Work-life balance with decent salary', 'Government job with stability and pension', 'Run my own business or startup', 'Travel and work from anywhere', 'Help society and make a difference'] }
]

const FRESHER_QUESTIONS = [
  { id: 'degree', question: 'What is your degree and branch?', options: ['B.Tech / B.E (Engineering)', 'BCA / B.Sc Computer Science', 'B.Sc (Science)', 'B.Com / BBA (Commerce)', 'BA (Arts)', 'Medical / Pharmacy', 'Law', 'Other'] },
  { id: 'interest', question: 'Which field interests you the most for your career?', options: ['Software / IT', 'Core Engineering (Mechanical, Civil, Chemical)', 'Healthcare / Medical', 'Finance & Banking', 'Marketing & Sales', 'Teaching & Education', 'Government / Public Service', 'Entrepreneurship'] },
  { id: 'role', question: 'Do you prefer technical or non-technical roles?', options: ['Purely technical (coding, engineering, research)', 'Mix of technical and people skills', 'Purely non-technical (management, sales, HR)', 'I am not sure yet'] },
  { id: 'location', question: 'Where do you want to work?', options: ['Metro city (Bangalore, Mumbai, Delhi, Hyderabad)', 'Tier 2 city (close to home)', 'Remote / Work from home', 'Abroad', 'Open to anywhere'] },
  { id: 'salary', question: 'What is your salary expectation in 3 years?', options: ['3-5 LPA (Stable start)', '5-10 LPA (Growing fast)', '10-20 LPA (Aggressive growth)', '20+ LPA (Top tier)', 'Salary is secondary, learning matters more'] }
]

const EXPERIENCED_QUESTIONS = [
  { id: 'current', question: 'What is your current experience level?', options: ['1-3 years experience', '3-5 years experience', '5-10 years experience', '10+ years experience'] },
  { id: 'reason', question: 'Why do you want to change your career path?', options: ['Want higher salary', 'No growth in current role', 'Want to switch to a different field', 'Want to start my own business', 'Returning after a career break', 'Looking for better work-life balance'] },
  { id: 'target', question: 'What is your target role or field?', options: ['Move to management / leadership', 'Switch to tech from non-tech', 'Switch to non-tech from tech', 'Start a business', 'Go abroad', 'Government / PSU jobs', 'Teaching / Training'] },
  { id: 'relocation', question: 'Are you open to relocation?', options: ['Yes, anywhere in India', 'Yes, including abroad', 'Only within my current city', 'Remote work only'] },
  { id: 'timeline', question: 'What is your timeline for this career change?', options: ['Immediately (1-3 months)', 'Short term (3-6 months)', 'Medium term (6-12 months)', 'Long term (1-2 years)'] }
]

function Roadmap() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [collegeSuggestions, setCollegeSuggestions] = useState([])
  const [loadingColleges, setLoadingColleges] = useState(false)
  const [workStatus, setWorkStatus] = useState('Student')
  const [step, setStep] = useState('loading')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [locationInsight, setLocationInsight] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [careerOptions, setCareerOptions] = useState([])
  const [careerLoading, setCareerLoading] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [savedRoadmap, setSavedRoadmap] = useState(null)
  const [regeneratesRemaining, setRegeneratesRemaining] = useState(3)
  const [regenWarning, setRegenWarning] = useState(false)


  const fetchCollegeSuggestions = async (phase, career) => {
    setLoadingColleges(true)
    try {
      let params = {}
      if (phase && phase.includes('Choose Science')) {
        params.stream = phase.includes('Biology') ? 'BiPC' : 'MPC'
      } else if (phase && (phase.includes('Entrance') || phase.includes('B.Tech') || phase.includes('College'))) {
        params.careerField = career || ''
      }
      if (!params.stream && !params.careerField) { setLoadingColleges(false); return }
      const res = await fetch(`${API_URL}/api/college/suggestions?${new URLSearchParams(params)}`)
      const data = await res.json()
      setCollegeSuggestions(data.colleges || [])
    } catch (e) { console.error(e) }
    finally { setLoadingColleges(false) }
  }

  const questions = workStatus === 'Student' ? STUDENT_QUESTIONS
    : workStatus === 'Fresher' ? FRESHER_QUESTIONS
    : EXPERIENCED_QUESTIONS

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const init = async () => {
      try {
        if (!token) { navigate('/login'); return }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
        const [profileRes, roadmapRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile/details`, { headers }),
          axios.get(`${API_URL}/api/roadmap`, { headers })
        ])
        const s = profileRes.data.student
        setStudent(s)
        const ws = s?.workStatus || 'Student'
        setWorkStatus(ws)
        const rm = roadmapRes.data.roadmap
        if (rm?.roadmapContent) {
          setSavedRoadmap(JSON.parse(rm.roadmapContent))
          setSelectedCareer({ career: rm.selectedCareer })
          try {
            const parsed = JSON.parse(rm.roadmapContent)
            const phases = (parsed.milestones || []).map(m => m.phase).join(' ')
            const hasEntrance = phases.includes('Entrance') || phases.includes('JEE')
            const hasScience = phases.includes('Choose Science')
            const token2 = localStorage.getItem('token')
            if (hasScience) {
              const sciRes = await fetch(`${API_URL}/api/college/suggestions?stream=MPC`)
              const sciData = await sciRes.json()
              setCollegeSuggestions(sciData.colleges || [])
            } else if (hasEntrance && rm.selectedCareer) {
              const entRes = await fetch(`${API_URL}/api/college/suggestions?careerField=${encodeURIComponent(rm.selectedCareer)}`)
              const entData = await entRes.json()
              setCollegeSuggestions(entData.colleges || [])
            }
          } catch(e) { console.error(e) }
          const currentMonth = new Date().getMonth()
          const regens = rm.lastRegeneratedMonth === currentMonth ? rm.regeneratesThisMonth : 0
          setRegeneratesRemaining(3 - regens)
          setStep('saved')
          try {
            if (rm.selectedCareer) {
              const entRes = await fetch(`${API_URL}/api/college/suggestions?careerField=${encodeURIComponent(rm.selectedCareer)}`)
              const entData = await entRes.json()
              setCollegeSuggestions(entData.colleges || [])
            }
          } catch(e) { console.error(e) }
        } else {
          if (rm?.selectedCareer) {
            setSelectedCareer({ career: rm.selectedCareer })
            const currentMonth = new Date().getMonth()
            const regens = rm.lastRegeneratedMonth === currentMonth ? rm.regeneratesThisMonth : 0
            setRegeneratesRemaining(3 - regens)
            try {
              const entRes = await fetch(`${API_URL}/api/college/suggestions?careerField=${encodeURIComponent(rm.selectedCareer)}`)
              const entData = await entRes.json()
              setCollegeSuggestions(entData.colleges || [])
            } catch(e) { console.error(e) }
            setStep('saved')
          } else {
            setStep('questions')
          }
        }
      } catch (e) {
        navigate('/login')
      }
    }
    init()
  }, [])

  const handleAnswer = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)

    if (questionId === 'location' && workStatus === 'Student') {
      setStep('location_insight')
      setLocationLoading(true)
      try {
        const res = await axios.post(`${API_URL}/api/roadmap/location-advice`, {
          location: answer, subjects: newAnswers.subjects, work: newAnswers.work
        }, { headers })
        setLocationInsight(res.data.insight)
      } catch (e) {
        setLocationInsight('We could not load location advice right now. Please continue with your choice.')
      } finally {
        setLocationLoading(false)
      }
      return
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      generateCareers(newAnswers)
    }
  }

  const handleLocationDecision = (keepChoice) => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setStep('questions')
    } else {
      generateCareers(answers)
    }
  }

  const generateCareers = async (finalAnswers) => {
    setStep('careers')
    setCareerLoading(true)
    try {
      await axios.post(`${API_URL}/api/roadmap/answers`, { answers: finalAnswers, workStatus }, { headers })
      const res = await axios.post(`${API_URL}/api/roadmap/careers`, { answers: finalAnswers, workStatus }, { headers })
      setCareerOptions(res.data.careers)
    } catch (e) {
      console.error(e)
    } finally {
      setCareerLoading(false)
    }
  }

  const generateRoadmap = async (career) => {
    setSelectedCareer(career)
    setStep('roadmap')
    setRoadmapLoading(true)
    try {
      await axios.post(`${API_URL}/api/roadmap/select`, { selectedCareer: career.career, careerOptions }, { headers })
      const res = await axios.post(`${API_URL}/api/roadmap/generate`, { career: career.career, workStatus }, { headers })
      const roadmapData = res.data.roadmap
      setRoadmap(roadmapData)
      try {
        const phases = (roadmapData.milestones || []).map(m => m.phase).join(' ')
        const hasEntrance = phases.includes('Entrance') || phases.includes('JEE')
        const hasScience = phases.includes('Choose Science')
        if (hasScience) {
          const sciRes = await fetch(`${API_URL}/api/college/suggestions?stream=MPC`)
          const sciData = await sciRes.json()
          setCollegeSuggestions(sciData.colleges || [])
        } else if (hasEntrance) {
          const entRes = await fetch(`${API_URL}/api/college/suggestions?careerField=${encodeURIComponent(career.career)}`)
          const entData = await entRes.json()
          setCollegeSuggestions(entData.colleges || [])
        }
      } catch (e) { console.error(e) }
    } catch (e) {
      console.error(e)
    } finally {
      setRoadmapLoading(false)
    }
  }

  const [roadmapSaved, setRoadmapSaved] = useState(false)
  const [savingRoadmap, setSavingRoadmap] = useState(false)
  const handleSaveRoadmap = async () => {
    setSavingRoadmap(true)
    try {
      const saveRes = await axios.post(`${API_URL}/api/roadmap/save`, { roadmapContent: JSON.stringify(roadmap) }, { headers })
      setRegeneratesRemaining(saveRes.data.regeneratesRemaining)
      setSavedRoadmap(roadmap)
      setRoadmapSaved(true)
      setTimeout(() => setRoadmapSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingRoadmap(false)
    }
  }
  const handleRegenerate = () => {
    if (regeneratesRemaining <= 0) return
    if (!regenWarning) { setRegenWarning(true); return }
    setRegenWarning(false)
    setSavedRoadmap(null); setRoadmap(null); setCareerOptions([])
    setSelectedCareer(null); setAnswers({}); setCurrentQ(0)
    setStep('questions')
  }

  const displayRoadmap = savedRoadmap || roadmap

  if (step === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading your roadmap...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1A3C6E] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white text-lg font-bold">CareerSeal</h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="text-white/60 text-sm hover:text-white">Dashboard</button>
          <button onClick={() => navigate('/jobs')} className="text-white/60 text-sm hover:text-white">Jobs</button>
          <button onClick={() => navigate('/profile-details')} className="text-white/60 text-sm hover:text-white">Profile</button>
          <button className="text-white text-sm font-bold border-b-2 border-[#0D7377] pb-0.5">Roadmap</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {step === 'questions' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <p className="text-white font-bold text-lg">AI Career Guide</p>
                  <p className="text-white/60 text-sm">{workStatus} Track · Question {currentQ + 1} of {questions.length}</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-full h-2">
                <div className="bg-[#5DCAA5] h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-[#1A3C6E] font-bold text-xl mb-2">{questions[currentQ].question}</p>
              <p className="text-gray-400 text-sm mb-6">Choose the option that best describes you</p>
              <div className="flex flex-col gap-3">
                {questions[currentQ].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(questions[currentQ].id, opt)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-[#0D7377] hover:bg-[#0D7377]/5 hover:text-[#1A3C6E] transition-all">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'location_insight' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-6 flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <p className="text-white font-bold text-lg">Work Location Insight</p>
                <p className="text-white/60 text-sm">Honest pros and cons for your career</p>
              </div>
            </div>
            {locationLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1A3C6E] font-bold">Loading location insights...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-6">{locationInsight}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleLocationDecision(true)} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">Continue →</button>
                  <button onClick={() => { setStep('questions'); setCurrentQ(3) }} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-[#1A3C6E] transition-colors">Change my answer</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'careers' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <p className="text-white font-bold text-lg">Your Career Matches</p>
                  <p className="text-white/60 text-sm">Based on your answers · Click to generate your roadmap</p>
                </div>
              </div>
            </div>
            {careerLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1A3C6E] font-bold">Finding your best career matches...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {careerOptions.map((career, i) => (
                  <div key={i} onClick={() => generateRoadmap(career)}
                    className={`bg-white rounded-2xl p-5 border-2 cursor-pointer hover:shadow-md transition-all ${i === 0 ? 'border-[#0D7377]' : 'border-gray-100 hover:border-[#0D7377]'}`}
                    style={i === 0 ? { background: 'linear-gradient(135deg, #f0fafa, white)' } : {}}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{career.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[#1A3C6E] text-base">{career.career}</p>
                            {i === 0 && <span className="bg-[#0D7377] text-white text-xs px-2 py-0.5 rounded-full font-bold">Best match</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{career.demandReason}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold" style={{ color: career.match >= 80 ? '#0D7377' : career.match >= 60 ? '#EF9F27' : '#6b7280' }}>{career.match}%</p>
                        <p className="text-xs text-gray-400">match</p>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5 mb-3">
                      <div className="h-1.5 rounded-full" style={{ width: `${career.match}%`, background: career.match >= 80 ? '#0D7377' : career.match >= 60 ? '#EF9F27' : '#d1d5db' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{career.description}</p>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-400">India Salary</p>
                        <p className="text-xs font-bold text-[#1A3C6E]">{career.indiaSalary}</p>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-400">Abroad Salary</p>
                        <p className="text-xs font-bold text-[#1A3C6E]">{career.abroadSalary}</p>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-400">Global Demand</p>
                        <p className="text-xs font-bold" style={{ color: career.demand === 'Very High' || career.demand === 'High' ? '#0D7377' : '#EF9F27' }}>{career.demand}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(step === 'roadmap' || step === 'saved') && (
          <div>
            {roadmapLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1A3C6E] font-bold text-lg">Generating your personalized roadmap...</p>
                <p className="text-gray-400 text-sm mt-2">Building step-by-step plan for {selectedCareer?.career}</p>
              </div>
            ) : displayRoadmap ? (
              <div>
                <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/60 text-xs mb-1">YOUR PERSONALIZED ROADMAP</p>
                      <p className="text-white font-bold text-xl">{displayRoadmap.title}</p>
                      <p className="text-[#5DCAA5] text-sm mt-1">{workStatus} Track · {selectedCareer?.career}</p>
                    </div>
                    <div className="text-right">
                      {regenWarning ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-48">
                          <p className="text-amber-800 text-xs font-bold mb-2">The best career is one you commit to. Are you sure?</p>
                          <div className="flex gap-2">
                            <button onClick={handleRegenerate} className="flex-1 bg-amber-500 text-white text-xs py-1.5 rounded-lg font-bold">Yes</button>
                            <button onClick={() => setRegenWarning(false)} className="flex-1 bg-white border border-amber-200 text-amber-700 text-xs py-1.5 rounded-lg font-bold">No</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={handleRegenerate} disabled={regeneratesRemaining <= 0}
                          className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors ${regeneratesRemaining > 0 ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'}`}>
                          ↻ Regenerate ({regeneratesRemaining} left this month)
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/50 text-xs mb-1">TIMELINE</p>
                      <p className="text-white font-bold text-sm">{displayRoadmap.totalDuration}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/50 text-xs mb-1">TARGET SALARY</p>
                      <p className="text-white font-bold text-sm">{displayRoadmap.targetSalary}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/50 text-xs mb-1">PHASES</p>
                      <p className="text-[#5DCAA5] font-bold text-sm">{displayRoadmap.milestones?.length} steps</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-4">
                  {displayRoadmap.milestones?.map((milestone, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${milestone.status === 'current' ? 'bg-[#1A3C6E]' : milestone.status === 'done' ? 'bg-[#0D7377]' : 'bg-gray-200'}`}>
                          {milestone.emoji}
                        </div>
                        {i < displayRoadmap.milestones.length - 1 && (
                          <div className="w-0.5 mt-2 bg-gray-200" style={{ minHeight: '32px', flex: 1 }}></div>
                        )}
                      </div>
                      <div className={`flex-1 bg-white rounded-2xl p-4 border-2 mb-4 ${milestone.status === 'current' ? 'border-[#1A3C6E]' : 'border-gray-100'}`}
                        style={milestone.status === 'current' ? { background: 'linear-gradient(135deg, #f0f4ff, white)' } : {}}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-bold text-[#1A3C6E] text-sm">{milestone.phase}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{milestone.duration}</span>
                            {milestone.status === 'done' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">✓ Done</span>}
                            {milestone.status === 'current' && <span className="bg-[#1A3C6E] text-white text-xs px-2 py-0.5 rounded-full font-bold">▶ Now</span>}
                            {milestone.status === 'upcoming' && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Upcoming</span>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{milestone.description}</p>
                        {milestone.actions?.map((action, j) => (
                          <p key={j} className="text-xs text-gray-600 mb-1">→ {action}</p>
                        ))}
                        {milestone.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {milestone.skills.map((skill, j) => (
                              <span key={j} className="bg-[#EEF2FF] text-[#1A3C6E] text-xs px-2 py-0.5 rounded-full font-bold">{skill}</span>
                            ))}
                          </div>
                        )}
                        {(milestone.phase?.includes('Choose Science') || milestone.phase?.includes('Entrance') || milestone.phase?.includes('JEE')) && collegeSuggestions.length > 0 && (
                          <div className="mt-3 bg-[#f0f4ff] rounded-xl p-3 border border-[#1A3C6E]/10">
                            <p className="text-xs font-bold text-[#1A3C6E] mb-2">🏫 CareerSeal partner colleges for this path</p>
                            <div className="flex flex-col gap-2">
                              {collegeSuggestions.map((college, j) => (
                                <div key={j} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                                  <div>
                                    <p className="text-xs font-bold text-[#1A3C6E]">{college.collegeName}</p>
                                    <p className="text-xs text-gray-400">{college.city}{college.state ? ', ' + college.state : ''}</p>
                                  </div>
                                  <span className="bg-[#0D7377] text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0">✓ Verified</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Only CareerSeal-vetted partner colleges are shown here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {displayRoadmap.aiInsight && (
                  <div className="bg-[#1A3C6E] rounded-2xl p-5 flex gap-4 items-start mb-4">
                    <span className="text-2xl flex-shrink-0">🤖</span>
                    <div>
                      <p className="text-white/50 text-xs mb-1">CAREER INSIGHT</p>
                      <p className="text-white text-sm leading-relaxed">{displayRoadmap.aiInsight}</p>
                    </div>
                  </div>
                )}

                <button onClick={() => { setSavedRoadmap(null); setRoadmap(null); setCareerOptions([]); setSelectedCareer(null); setAnswers({}); setCurrentQ(0); setStep('questions'); }} className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-bold hover:border-[#1A3C6E] hover:text-[#1A3C6E] transition-colors text-sm">
                {!savedRoadmap && roadmap && (
                  <div className="mb-3">
                    {roadmapSaved ? (
                      <div className="w-full bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl font-bold text-sm text-center">
                        ✓ Roadmap saved successfully!
                      </div>
                    ) : (
                      <button onClick={handleSaveRoadmap} disabled={savingRoadmap}
                        className="w-full bg-[#0D7377] text-white py-3 rounded-xl font-bold hover:bg-[#0a5f63] transition-colors text-sm disabled:opacity-50">
                        {savingRoadmap ? 'Saving...' : '✓ Save this Roadmap'}
                      </button>
                    )}
                    <p className="text-xs text-gray-400 text-center mt-1">Saving counts as 1 of your 3 monthly regenerations</p>
                  </div>
                )}
                  ← Choose a different career
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Roadmap
