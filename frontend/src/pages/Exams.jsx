import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const LEVEL_COLORS = {
  beginner: { bg: '#E1F5EE', color: '#085041', label: 'Beginner' },
  intermediate: { bg: '#f0f4ff', color: '#1A3C6E', label: 'Intermediate' },
  advanced: { bg: '#FFF9C4', color: '#854F0B', label: 'Advanced' }
}

const STATUS_CONFIG = {
  verified: { bg: '#E1F5EE', color: '#085041', icon: '✓', label: 'Verified' },
  expired: { bg: '#FEE2E2', color: '#dc2626', icon: '⚠️', label: 'Expired' },
  cooldown: { bg: '#FFF9C4', color: '#854F0B', icon: '⏳', label: 'Cooldown' },
  failed_max: { bg: '#FEE2E2', color: '#dc2626', icon: '✗', label: 'Max attempts' },
  not_verified: { bg: '#f0f0f0', color: '#6b7280', icon: '○', label: 'Not verified' }
}

function ExamPage({ skill, questions, timeLimit, attemptNumber, onFinish, onBack }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const [violations, setViolations] = useState(0)
  const [warning, setWarning] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const MAX_VIOLATIONS = 3

  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).map(q => ({
      ...q,
      options: [...q.options].map((opt, i) => ({ opt, origIdx: i })).sort(() => Math.random() - 0.5)
    }))
    setShuffledQuestions(shuffled)
  }, [])

  useEffect(() => {
    const enter = async () => { try { await document.documentElement.requestFullscreen(); setIsFullscreen(true) } catch(e) {} }
    enter()
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) }
  }, [])

  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement && !submitted) { setIsFullscreen(false); addViolation("You exited fullscreen! Click Return to Fullscreen to continue.", true) }
      else setIsFullscreen(true)
    }
    document.addEventListener("fullscreenchange", onFSChange)
    return () => document.removeEventListener("fullscreenchange", onFSChange)
  }, [submitted, violations])

  useEffect(() => {
    const onHide = () => { if (document.hidden && !submitted) addViolation("You switched tabs!") }
    const onBlur = () => { if (!submitted) addViolation("You left the exam window!") }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("blur", onBlur)
    return () => { document.removeEventListener("visibilitychange", onHide); window.removeEventListener("blur", onBlur) }
  }, [submitted, violations])

  useEffect(() => {
    const prevent = (e) => e.preventDefault()
    document.addEventListener("contextmenu", prevent)
    document.addEventListener("copy", prevent)
    document.addEventListener("cut", prevent)
    return () => {
      document.removeEventListener("contextmenu", prevent)
      document.removeEventListener("copy", prevent)
      document.removeEventListener("cut", prevent)
    }
  }, [])

  const addViolation = (msg, persistent = false) => {
    setViolations(prev => {
      const n = prev + 1
      if (n >= MAX_VIOLATIONS) {
        setWarning("Maximum violations reached! Exam is being auto-submitted.")
        setTimeout(() => handleSubmit(), 2000)
      } else {
        setWarning(msg + " Warning " + n + " of " + MAX_VIOLATIONS + ". Exam auto-submits on " + MAX_VIOLATIONS + " violations.")
        if (!persistent) setTimeout(() => setWarning(null), 4000)
      }
      return n
    })
  }

  const reenterFullscreen = async () => {
    try { await document.documentElement.requestFullscreen(); setIsFullscreen(true); setWarning(null) } catch(e) {}
  }

  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const handleSubmit = async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    setSubmitted(true)
    try {
      const res = await axios.post(`${API_URL}/api/exams/${skill}/submit`, { answers }, { headers: { Authorization: `Bearer ${token}` } })
      setResult(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const answered = answers.filter(a => a !== null).length
  const progress = (current / questions.length) * 100

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">{result.passed ? '🎉' : '😔'}</div>
          <h2 className="text-2xl font-bold text-[#1A3C6E] mb-2">{result.passed ? 'Congratulations!' : 'Better luck next time!'}</h2>
          <p className="text-gray-500 text-sm mb-6">{result.message}</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="text-4xl font-bold mb-1" style={{ color: result.passed ? '#0D7377' : '#dc2626' }}>{result.score}%</div>
            <p className="text-gray-400 text-sm">{result.correct} / {result.total} correct · Pass mark: 70%</p>

            {result.passed && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-green-700 text-sm font-bold">✓ {skill} is now verified on your GRID!</p>
                <p className="text-green-600 text-xs mt-1">Valid for 3 months</p>
              </div>
            )}

            {!result.passed && result.nextRetryAt && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-amber-700 text-sm font-bold">Next attempt available:</p>
                <p className="text-amber-600 text-xs mt-1">{new Date(result.nextRetryAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}

            {result.redirectToCourses && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-blue-700 text-sm font-bold">Maximum attempts reached</p>
                <p className="text-blue-600 text-xs mt-1">We recommend taking a course to strengthen your skills first</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {result.redirectToCourses ? (
              <button onClick={() => navigate('/courses')} className="flex-1 bg-[#0D7377] text-white py-3 rounded-xl font-bold hover:bg-[#0a5f63] transition-colors text-sm">
                Browse Courses →
              </button>
            ) : null}
            <button onClick={() => onFinish(result.passed)} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm">
              Back to Skills
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isFullscreen && !submitted && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
          <div style={{ fontSize: "48px" }}>🔒</div>
          <p style={{ color: "white", fontSize: "20px", fontWeight: "700", textAlign: "center" }}>Exam Paused</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", textAlign: "center", maxWidth: "320px" }}>
            You must be in fullscreen mode to continue the exam.
          </p>
          <div style={{ background: "#dc2626", color: "white", fontSize: "13px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", marginBottom: "8px" }}>
            ⚠️ Violation {violations} of {MAX_VIOLATIONS}
          </div>
          <button onClick={reenterFullscreen}
            style={{ background: "#0D7377", color: "white", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
            Return to Fullscreen →
          </button>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", textAlign: "center" }}>
            Timer is still running. Return to fullscreen immediately.
          </p>
        </div>
      )}
      {/* Exam header */}
      <div className="bg-[#1A3C6E] px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-white font-bold">{skill} Exam</p>
            <p className="text-white/60 text-xs">Attempt {attemptNumber} · Question {current + 1} of {shuffledQuestions.length || questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-white/60">Answered</p>
              <p className="text-white font-bold">{answered}/{questions.length}</p>
            </div>
            <div className="text-center px-3 py-1 rounded-xl bg-red-500/20 border border-red-400/30">
              <p className="text-xs text-red-300">Violations</p>
              <p className="text-white font-bold">{violations}/{MAX_VIOLATIONS}</p>
            </div>
            <div className={`text-center px-3 py-1 rounded-xl ${timeLeft < 300 ? 'bg-red-500' : 'bg-[#0D7377]'}`}>
              <p className="text-xs text-white/80">Time left</p>
              <p className="text-white font-bold">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <div className="bg-white/10 rounded-full h-1.5">
            <div className="bg-[#5DCAA5] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      {warning && (
        <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white text-xl">⚠️</span>
            <p className="text-white text-sm font-bold">{warning}</p>
          </div>
          {!isFullscreen && (
            <button onClick={reenterFullscreen} className="bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg">
              Return to Fullscreen
            </button>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Question */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
          <p className="text-xs font-bold text-gray-400 mb-3">QUESTION {current + 1}</p>
          <p className="text-[#1A3C6E] font-bold text-base leading-relaxed">{(shuffledQuestions[current] || questions[current]).question}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-6">
          {(shuffledQuestions[current]?.options?.map(o => o.opt) || questions[current].options).map((option, i) => (
            <button key={i} onClick={() => {
              const newAnswers = [...answers]
              newAnswers[current] = i
              setAnswers(newAnswers)
            }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium text-sm ${answers[current] === i ? 'border-[#0D7377] bg-[#0D7377]/5 text-[#1A3C6E]' : 'border-gray-100 bg-white hover:border-gray-200 text-gray-700'}`}>
              <span className="inline-flex w-6 h-6 rounded-full border-2 items-center justify-center mr-3 flex-shrink-0 text-xs font-bold"
                style={{ borderColor: answers[current] === i ? '#0D7377' : '#e5e7eb', background: answers[current] === i ? '#0D7377' : 'white', color: answers[current] === i ? 'white' : '#9ca3af' }}>
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:border-gray-300 disabled:opacity-30 text-sm">
            ← Previous
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)}
              className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors text-sm">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-[#0D7377] text-white py-3 rounded-xl font-bold hover:bg-[#0a5f63] transition-colors text-sm disabled:opacity-50">
              {submitting ? 'Submitting...' : `Submit Exam (${answered}/${questions.length} answered)`}
            </button>
          )}
        </div>

        {/* Question grid */}
        <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 mb-3">QUESTION NAVIGATOR</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: i === current ? '#1A3C6E' : answers[i] !== null ? '#0D7377' : '#f0f0f0',
                  color: i === current || answers[i] !== null ? 'white' : '#9ca3af'
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Exams() {
  const navigate = useNavigate()
  const [skillStatus, setSkillStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [user, setUser] = useState(null)
  const [activeExam, setActiveExam] = useState(null)
  const [examData, setExamData] = useState(null)
  const [loadingExam, setLoadingExam] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = async () => {
    try {
      if (!token) { navigate('/login'); return }
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(storedUser)
      const [profileRes, examRes] = await Promise.all([
        axios.get(`${API_URL}/api/profile/details`, { headers }),
        axios.get(`${API_URL}/api/exams`, { headers })
      ])
      setStudent(profileRes.data.student)
      setSkillStatus(examRes.data.skillStatus || [])
    } catch (e) {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleStartExam = async (skill) => {
    setError('')
    setLoadingExam(true)
    try {
      const res = await axios.get(`${API_URL}/api/exams/${skill}`, { headers })
      setExamData(res.data)
      setActiveExam(skill)
    } catch (e) {
      setError(e.response?.data?.message || 'Could not start exam')
      if (e.response?.data?.redirectToCourses) navigate('/courses')
    } finally {
      setLoadingExam(false)
    }
  }

  const handleExamFinish = async (passed) => {
    setActiveExam(null)
    setExamData(null)
    setLoading(true)
    await fetchData()
  }

  const formatExpiry = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const days = Math.floor((d - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Expired'
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    return `Expires in ${days} days`
  }

  const formatRetry = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const hours = Math.floor((d - new Date()) / (1000 * 60 * 60))
    if (hours < 1) return 'Available soon'
    if (hours < 24) return `Retry in ${hours}h`
    const days = Math.floor(hours / 24)
    return `Retry in ${days}d`
  }

  if (activeExam && examData) {
    return <ExamPage skill={activeExam} questions={examData.questions} timeLimit={examData.timeLimit} attemptNumber={examData.attemptNumber} onFinish={handleExamFinish} onBack={() => setActiveExam(null)} />
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading your skills...</p>
    </div>
  )

  const verifiedCount = skillStatus.filter(s => s.status === 'verified').length
  const totalCount = skillStatus.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-[#1A3C6E] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white text-lg font-bold">CareerSeal</h1>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/dashboard')} className="text-white/60 text-sm hover:text-white">Dashboard</button>
          <button onClick={() => navigate('/jobs')} className="text-white/60 text-sm hover:text-white">Jobs</button>
          <button className="text-white text-sm font-bold border-b-2 border-[#0D7377] pb-0.5">Skill Exams</button>
          <button onClick={() => navigate('/grid')} className="text-white/60 text-sm hover:text-white">GRID</button>
          <button onClick={() => navigate('/roadmap')} className="text-white/60 text-sm hover:text-white">Roadmap</button>
          {student?.photoUrl ? (
            <img src={student.photoUrl} className="w-8 h-8 rounded-full object-cover border-2 border-[#0D7377]" />
          ) : (
            <div className="w-8 h-8 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A3C6E 0%, #0D7377 100%)' }} className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-2xl font-bold mb-1">Skill Verification Exams</h1>
          <p className="text-white/60 text-sm mb-4">Verify your skills to make them active on your GRID profile</p>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/50 text-xs mb-1">VERIFIED</p>
              <p className="text-white font-bold text-lg">{verifiedCount}/{totalCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 flex-1">
              <p className="text-white/50 text-xs mb-2">VERIFICATION PROGRESS</p>
              <div className="bg-white/10 rounded-full h-2">
                <div className="bg-[#5DCAA5] h-2 rounded-full" style={{ width: totalCount > 0 ? `${(verifiedCount / totalCount) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        {skillStatus.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-[#1A3C6E] font-bold text-lg mb-2">No skills added yet</p>
            <p className="text-gray-400 text-sm mb-6">Add your technical skills in Profile Details to start verifying them</p>
            <button onClick={() => navigate('/profile-details')} className="bg-[#1A3C6E] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#0D7377] transition-colors">
              Add Skills →
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#1A3C6E]">Your Skills ({totalCount})</p>
              <button onClick={() => navigate('/profile-details')} className="text-xs text-[#0D7377] font-bold hover:underline">+ Add more skills</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillStatus.map((item, i) => {
                const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_verified
                const levelConfig = item.level ? LEVEL_COLORS[item.level] : null

                return (
                  <div key={i} className={`bg-white rounded-2xl p-5 border-2 transition-all ${item.status === 'verified' ? 'border-[#0D7377]' : 'border-gray-100'}`}
                    style={item.status === 'verified' ? { background: 'linear-gradient(135deg, #f0fafa, white)' } : {}}>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                          style={{ background: item.status === 'verified' ? '#0D7377' : item.status === 'expired' ? '#dc2626' : '#1A3C6E' }}>
                          {item.skill.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1A3C6E] text-base">{item.skill}</p>
                          {levelConfig && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: levelConfig.bg, color: levelConfig.color }}>
                              {levelConfig.label} · {item.questionCount} questions
                            </span>
                          )}
                          {!item.hasExam && (
                            <span className="text-xs text-gray-400">Exam coming soon</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ background: statusConfig.bg, color: statusConfig.color }}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </div>

                    {item.status === 'verified' && item.expiresAt && (
                      <div className="bg-green-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-green-700 font-bold">✓ Active on GRID · {formatExpiry(item.expiresAt)}</p>
                      </div>
                    )}

                    {item.status === 'expired' && (
                      <div className="bg-red-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-red-600 font-bold">⚠️ Verification expired — retake to reactivate on GRID</p>
                      </div>
                    )}

                    {item.status === 'cooldown' && item.nextRetryAt && (
                      <div className="bg-amber-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-amber-700 font-bold">⏳ {formatRetry(item.nextRetryAt)}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Attempt {item.attemptCount} of 4</p>
                      </div>
                    )}

                    {item.status === 'failed_max' && (
                      <div className="bg-red-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-red-600 font-bold">Maximum attempts reached</p>
                        <p className="text-xs text-red-500 mt-0.5">Take a course to strengthen your skills first</p>
                      </div>
                    )}

                    {item.status === 'not_verified' && item.hasExam && (
                      <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-gray-500">Skill is faded on profile — verify to activate on GRID</p>
                      </div>
                    )}

                    {item.hasExam ? (
                      item.status === 'failed_max' ? (
                        <button onClick={() => navigate('/courses')} className="w-full bg-[#0D7377] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#0a5f63] transition-colors">
                          Browse Courses →
                        </button>
                      ) : item.canRetake ? (
                        <button onClick={() => handleStartExam(item.examKey)} disabled={loadingExam}
                          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${item.status === 'verified' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-[#1A3C6E] text-white hover:bg-[#0D7377]'}`}>
                          {loadingExam ? 'Loading...' : item.status === 'verified' ? 'Renew Verification' : item.attemptCount > 0 ? `Retry Exam (Attempt ${item.attemptCount + 1}/4)` : 'Take Exam →'}
                        </button>
                      ) : (
                        <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
                          {item.status === 'cooldown' ? `⏳ ${formatRetry(item.nextRetryAt)}` : 'Not available'}
                        </button>
                      )
                    ) : (
                      <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
                        Exam coming soon
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 bg-[#1A3C6E] rounded-2xl p-5 flex gap-4 items-start">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div>
                <p className="text-white font-bold text-sm mb-1">How skill verification works</p>
                <p className="text-white/60 text-xs leading-relaxed">Only verified skills appear on your GRID profile. Pass the exam with 70%+ to get a ✓ badge valid for 3 months. If you fail, wait the cooldown period before retrying. After 4 failed attempts, take a course to strengthen your knowledge first.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Exams
