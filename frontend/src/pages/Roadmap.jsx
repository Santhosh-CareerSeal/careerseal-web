import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const STUDENT_QUESTIONS = [
  {
    id: 'class',
    question: 'Which class are you currently in?',
    options: ['8th', '9th', '10th', '11th', '12th', 'College 1st Year', 'College 2nd Year', 'College 3rd Year', 'Final Year']
  },
  {
    id: 'subjects',
    question: 'Which subjects do you enjoy the most?',
    options: ['Maths & Science', 'Biology & Chemistry', 'Computer Science', 'Arts & Creativity', 'History & Literature', 'Business & Economics', 'Physical Education & Sports']
  },
  {
    id: 'work',
    question: 'What kind of work excites you the most?',
    options: ['Building things with technology', 'Designing and constructing structures', 'Healing and helping people', 'Teaching and guiding others', 'Cooking, food and nutrition', 'Business, finance and management', 'Research and discovering new things', 'Creative arts, music and design']
  },
  {
    id: 'location',
    question: 'Where do you want to work in the future?',
    options: ['India only', 'Abroad (USA, UK, Canada, Australia etc.)', 'Middle East (Dubai, Qatar etc.)', 'Both India and Abroad', 'Not sure yet']
  },
  {
    id: 'lifestyle',
    question: 'What lifestyle do you want in 10 years?',
    options: ['High salary, even if work is demanding', 'Work-life balance with decent salary', 'Government job with stability and pension', 'Run my own business or startup', 'Travel and work from anywhere', 'Help society and make a difference']
  }
]

const FRESHER_QUESTIONS = [
  {
    id: 'degree',
    question: 'What is your degree and branch?',
    options: ['B.Tech / B.E (Engineering)', 'BCA / B.Sc Computer Science', 'B.Sc (Science)', 'B.Com / BBA (Commerce)', 'BA (Arts)', 'Medical / Pharmacy', 'Law', 'Other']
  },
  {
    id: 'interest',
    question: 'Which field interests you the most for your career?',
    options: ['Software / IT', 'Core Engineering (Mechanical, Civil, Chemical)', 'Healthcare / Medical', 'Finance & Banking', 'Marketing & Sales', 'Teaching & Education', 'Government / Public Service', 'Entrepreneurship']
  },
  {
    id: 'role',
    question: 'Do you prefer technical or non-technical roles?',
    options: ['Purely technical (coding, engineering, research)', 'Mix of technical and people skills', 'Purely non-technical (management, sales, HR)', 'I am not sure yet']
  },
  {
    id: 'location',
    question: 'Where do you want to work?',
    options: ['Metro city (Bangalore, Mumbai, Delhi, Hyderabad)', 'Tier 2 city (close to home)', 'Remote / Work from home', 'Abroad', 'Open to anywhere']
  },
  {
    id: 'salary',
    question: 'What is your salary expectation in 3 years?',
    options: ['3-5 LPA (Stable start)', '5-10 LPA (Growing fast)', '10-20 LPA (Aggressive growth)', '20+ LPA (Top tier)', 'Salary is secondary, learning matters more']
  }
]

const EXPERIENCED_QUESTIONS = [
  {
    id: 'current',
    question: 'What is your current role and experience?',
    options: ['1-3 years experience', '3-5 years experience', '5-10 years experience', '10+ years experience']
  },
  {
    id: 'reason',
    question: 'Why do you want to change your career path?',
    options: ['Want higher salary', 'No growth in current role', 'Want to switch to a different field', 'Want to start my own business', 'Returning after a career break', 'Looking for better work-life balance']
  },
  {
    id: 'target',
    question: 'What is your target role or field?',
    options: ['Move to management / leadership', 'Switch to tech from non-tech', 'Switch to non-tech from tech', 'Start a business', 'Go abroad', 'Government / PSU jobs', 'Teaching / Training']
  },
  {
    id: 'relocation',
    question: 'Are you open to relocation?',
    options: ['Yes, anywhere in India', 'Yes, including abroad', 'Only within my current city', 'Remote work only']
  },
  {
    id: 'timeline',
    question: 'What is your timeline for this career change?',
    options: ['Immediately (1-3 months)', 'Short term (3-6 months)', 'Medium term (6-12 months)', 'Long term (1-2 years)']
  }
]

function Roadmap() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [workStatus, setWorkStatus] = useState('')
  const [step, setStep] = useState('loading') // loading, questions, location_insight, careers, roadmap, saved
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

  const questions = workStatus === 'Student' ? STUDENT_QUESTIONS
    : workStatus === 'Fresher' ? FRESHER_QUESTIONS
    : EXPERIENCED_QUESTIONS

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
        const [profileRes, roadmapRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/roadmap`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        const s = profileRes.data.student
        setStudent(s)
        const ws = s?.workStatus || 'Student'
        setWorkStatus(ws)
        const rm = roadmapRes.data.roadmap
        if (rm?.roadmapContent) {
          setSavedRoadmap(JSON.parse(rm.roadmapContent))
          setSelectedCareer(rm.selectedCareer)
          const currentMonth = new Date().getMonth()
          const regens = rm.lastRegeneratedMonth === currentMonth ? rm.regeneratesThisMonth : 0
          setRegeneratesRemaining(3 - regens)
          setStep('saved')
        } else {
          setStep('questions')
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

    // Special handling for location question
    if (questionId === 'location' && workStatus === 'Student') {
      setStep('location_insight')
      setLocationLoading(true)
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1000,
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
            messages: [{
              role: 'user',
              content: `A student in India chose "${answer}" as their preferred work location. Their subjects are "${newAnswers.subjects}" and work interest is "${newAnswers.work}".

Search for current 2025-2026 job market data and give them a balanced, honest comparison of working in India vs abroad for their specific interest area. Include:
1. Current salary comparison (India vs abroad) for their field
2. Current visa/immigration situation for Indians going abroad
3. Current job market demand in India for their field
4. 3 pros and 3 cons of each option
5. A final honest recommendation

Keep it conversational, honest and under 300 words. End with: "Knowing this, would you like to change your preference or stick with ${answer}?"`
            }]
          })
        })
        const data = await response.json()
        const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('')
        setLocationInsight(text)
      } catch (e) {
        setLocationInsight(`Here's what you should know about working in ${answer}:\n\nIndia is currently one of the fastest growing economies with massive job opportunities, especially in tech, infrastructure and manufacturing. Salaries are growing 15-20% annually for skilled professionals.\n\nAbroad offers higher absolute salaries but requires additional qualifications, visa processing (which has become stricter in 2024-2025 for Canada and UK), and you'll be far from family.\n\nKnowing this, would you like to change your preference or stick with ${answer}?`)
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
    if (!keepChoice) {
      setAnswers(prev => ({ ...prev, location: null }))
    }
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
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/roadmap/answers`, { answers: finalAnswers, workStatus }, { headers: { Authorization: `Bearer ${token}` } })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{
            role: 'user',
            content: `Based on these answers from a ${workStatus} in India:
${Object.entries(finalAnswers).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Search for current 2025-2026 global job market data and suggest exactly 5 career options that best match their profile. For each career include:
- Career name and emoji
- Match percentage (realistic, based on their answers)
- Global salary range (entry to senior, in LPA for India and USD for abroad)
- Current global demand (High/Medium/Low) with brief reason
- 2-line description
- Fields: doctor, engineer, teacher, software, CA, chef, scientist, lawyer, designer etc. — not just software

Return ONLY valid JSON array, no markdown, no explanation:
[{"career":"Civil Engineer","emoji":"🏗️","match":92,"indiaSalary":"4-15 LPA","abroadSalary":"$60k-$120k","demand":"High","demandReason":"India infrastructure boom + global construction growth","description":"Design roads bridges buildings. India and Middle East have massive demand for next 20 years."},...]`
          }]
        })
      })
      const data = await response.json()
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('')
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setCareerOptions(parsed)
    } catch (e) {
      setCareerOptions([
        { career: 'Software Engineer', emoji: '💻', match: 85, indiaSalary: '6-25 LPA', abroadSalary: '$80k-$150k', demand: 'Very High', demandReason: 'Global tech demand continues to grow', description: 'Build apps, websites and systems. Highest paying field globally with remote work options.' },
        { career: 'Civil Engineer', emoji: '🏗️', match: 78, indiaSalary: '4-15 LPA', abroadSalary: '$60k-$120k', demand: 'High', demandReason: 'India infrastructure boom', description: 'Design roads, bridges and buildings. India and Middle East have massive demand.' },
        { career: 'Doctor / MBBS', emoji: '🩺', match: 72, indiaSalary: '8-30 LPA', abroadSalary: '$120k-$300k', demand: 'Very High', demandReason: 'Healthcare demand post-pandemic', description: 'Heal and help people. One of the most respected and high paying professions globally.' },
        { career: 'Chartered Accountant', emoji: '📊', match: 65, indiaSalary: '6-20 LPA', abroadSalary: '$70k-$130k', demand: 'High', demandReason: 'Every business needs finance experts', description: 'Manage finances, audit companies and provide tax guidance. Always in demand.' },
        { career: 'Teacher / Professor', emoji: '🎓', match: 60, indiaSalary: '3-12 LPA', abroadSalary: '$40k-$80k', demand: 'Steady', demandReason: 'Education sector always needs qualified teachers', description: 'Shape future generations. Government teaching jobs offer great stability and benefits.' }
      ])
    } finally {
      setCareerLoading(false)
    }
  }

  const generateRoadmap = async (career) => {
    setSelectedCareer(career)
    setStep('roadmap')
    setRoadmapLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/roadmap/select`, { selectedCareer: career.career, careerOptions }, { headers: { Authorization: `Bearer ${token}` } })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{
            role: 'user',
            content: `Generate a detailed career roadmap for a ${workStatus} who wants to become a ${career.career}.
Their profile: ${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join(', ')}

Search for current 2025-2026 requirements, exam patterns, top colleges and salary data for ${career.career} in India and globally.

Return ONLY valid JSON, no markdown:
{
  "title": "Your ${career.career} Roadmap",
  "totalDuration": "X Years",
  "targetSalary": "X-Y LPA",
  "milestones": [
    {
      "phase": "Phase name",
      "duration": "X months/years",
      "emoji": "emoji",
      "status": "current",
      "description": "What to do in this phase",
      "actions": ["action 1", "action 2", "action 3"],
      "skills": ["skill1", "skill2"]
    }
  ],
  "aiInsight": "Personalized motivational insight for this specific student",
  "globalDemand": "Current global demand insight with recent data"
}`
          }]
        })
      })
      const data = await response.json()
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('')
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setRoadmap(parsed)

      const saveRes = await axios.post(`${API_URL}/api/roadmap/save`, { roadmapContent: JSON.stringify(parsed) }, { headers: { Authorization: `Bearer ${token}` } })
      setRegeneratesRemaining(saveRes.data.regeneratesRemaining)
    } catch (e) {
      console.error(e)
    } finally {
      setRoadmapLoading(false)
    }
  }

  const handleRegenerate = () => {
    if (regeneratesRemaining <= 0) return
    if (!regenWarning) {
      setRegenWarning(true)
      return
    }
    setRegenWarning(false)
    setSavedRoadmap(null)
    setRoadmap(null)
    setCareerOptions([])
    setSelectedCareer(null)
    setAnswers({})
    setCurrentQ(0)
    setStep('questions')
  }

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

  const displayRoadmap = savedRoadmap || roadmap

  if (step === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading your roadmap...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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

        {/* QUESTIONS STEP */}
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

        {/* LOCATION INSIGHT STEP */}
        {step === 'location_insight' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-6 flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <p className="text-white font-bold text-lg">Work Location Insight</p>
                <p className="text-white/60 text-sm">Live data from current job market</p>
              </div>
            </div>

            {locationLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1A3C6E] font-bold">Fetching live job market data...</p>
                <p className="text-gray-400 text-sm mt-2">Checking current salaries, visa rules and demand worldwide</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-6">{locationInsight}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleLocationDecision(true)} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">
                    Keep my choice
                  </button>
                  <button onClick={() => { setStep('questions'); setCurrentQ(3) }} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-[#1A3C6E] transition-colors">
                    Change my answer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAREERS STEP */}
        {step === 'careers' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <p className="text-white font-bold text-lg">Your Career Matches</p>
                  <p className="text-white/60 text-sm">Based on your answers + current global market data</p>
                </div>
              </div>
            </div>

            {careerLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1A3C6E] font-bold">AI is analysing global career data...</p>
                <p className="text-gray-400 text-sm mt-2">Searching live salary data, demand and opportunities worldwide</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-gray-500 text-sm mb-2">Click on a career to generate your personalized roadmap</p>
                {careerOptions.map((career, i) => (
                  <div key={i} onClick={() => generateRoadmap(career)}
                    className={`bg-white rounded-2xl p-5 border-2 cursor-pointer hover:shadow-md transition-all ${i === 0 ? 'border-[#0D7377]' : 'border-gray-100 hover:border-[#0D7377]'}`}
                    style={i === 0 ? { background: 'linear-gradient(135deg, #f0fafa, white)' } : {}}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{career.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#1A3C6E] text-base">{career.career}</p>
                            {i === 0 && <span className="bg-[#0D7377] text-white text-xs px-2 py-0.5 rounded-full font-bold">Best match</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{career.demandReason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: career.match >= 80 ? '#0D7377' : career.match >= 60 ? '#EF9F27' : '#6b7280' }}>{career.match}%</p>
                        <p className="text-xs text-gray-400">match</p>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-full h-1.5 mb-3">
                      <div className="h-1.5 rounded-full" style={{ width: `${career.match}%`, background: career.match >= 80 ? '#0D7377' : career.match >= 60 ? '#EF9F27' : '#d1d5db' }}></div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">{career.description}</p>

                    <div className="flex gap-4">
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

        {/* ROADMAP STEP */}
        {(step === 'roadmap' || step === 'saved') && (
          <div>
            {roadmapLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1A3C6E] font-bold text-lg">Generating your personalized roadmap...</p>
                <p className="text-gray-400 text-sm mt-2">AI is searching live data for {selectedCareer?.career} career path</p>
              </div>
            ) : displayRoadmap ? (
              <div>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }} className="rounded-2xl p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/60 text-xs mb-1">AI GENERATED · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-white font-bold text-xl">{displayRoadmap.title}</p>
                      <p className="text-[#5DCAA5] text-sm mt-1">{workStatus} Track · {selectedCareer?.career || savedRoadmap?.title}</p>
                    </div>
                    <div className="text-right">
                      {regenWarning ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-48">
                          <p className="text-amber-800 text-xs font-bold mb-2">Are you sure? The best career is one you commit to!</p>
                          <div className="flex gap-2">
                            <button onClick={handleRegenerate} className="flex-1 bg-amber-500 text-white text-xs py-1 rounded-lg font-bold">Yes, regenerate</button>
                            <button onClick={() => setRegenWarning(false)} className="flex-1 bg-white border border-amber-200 text-amber-700 text-xs py-1 rounded-lg font-bold">No, keep it</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={handleRegenerate} disabled={regeneratesRemaining <= 0}
                          className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors ${regeneratesRemaining > 0 ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'}`}>
                          ↻ Regenerate ({regeneratesRemaining} left)
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
                      <p className="text-white/50 text-xs mb-1">PROGRESS</p>
                      <p className="text-[#5DCAA5] font-bold text-sm">1 / {displayRoadmap.milestones?.length} phases</p>
                    </div>
                  </div>
                </div>

                {/* Global demand */}
                {displayRoadmap.globalDemand && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                    <p className="text-xs font-bold text-blue-700 mb-1">🌍 GLOBAL DEMAND (Live Data)</p>
                    <p className="text-sm text-blue-800">{displayRoadmap.globalDemand}</p>
                  </div>
                )}

                {/* Milestones */}
                <div className="flex flex-col gap-4 mb-4">
                  {displayRoadmap.milestones?.map((milestone, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${milestone.status === 'current' ? 'bg-[#1A3C6E]' : milestone.status === 'done' ? 'bg-[#0D7377]' : 'bg-gray-200'}`}>
                          {milestone.emoji}
                        </div>
                        {i < displayRoadmap.milestones.length - 1 && (
                          <div className="w-0.5 flex-1 mt-2" style={{ background: i === 0 ? '#0D7377' : '#e5e7eb', minHeight: '24px' }}></div>
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
                            {milestone.status === 'upcoming' && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold">Upcoming</span>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{milestone.description}</p>
                        {milestone.actions && (
                          <div className="mb-3">
                            {milestone.actions.map((action, j) => (
                              <p key={j} className="text-xs text-gray-600 mb-1">→ {action}</p>
                            ))}
                          </div>
                        )}
                        {milestone.skills && milestone.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {milestone.skills.map((skill, j) => (
                              <span key={j} className="bg-[#EEF2FF] text-[#1A3C6E] text-xs px-2 py-0.5 rounded-full font-bold">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                {displayRoadmap.aiInsight && (
                  <div className="bg-[#1A3C6E] rounded-2xl p-5 flex gap-4 items-start">
                    <span className="text-2xl flex-shrink-0">🤖</span>
                    <div>
                      <p className="text-white/50 text-xs mb-1">AI PERSONAL INSIGHT</p>
                      <p className="text-white text-sm leading-relaxed">{displayRoadmap.aiInsight}</p>
                    </div>
                  </div>
                )}

                {/* Change career button */}
                <button onClick={() => { setStep('careers') }} className="w-full mt-4 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-bold hover:border-[#1A3C6E] hover:text-[#1A3C6E] transition-colors text-sm">
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
