import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function PublicProfile() {
  const { gridNumber } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [expandedJobs, setExpandedJobs] = useState({})
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [showAi, setShowAi] = useState(false)

  const fetchAiSummary = async () => {
    setShowAi(true)
    if (aiSummary || aiLoading) return
    setAiLoading(true); setAiError('')
    try {
      const res = await axios.get(`${API_URL}/api/public/profile/${gridNumber}/ai-summary`)
      setAiSummary(res.data.summary)
    } catch (e) {
      setAiError(e.response?.data?.message || 'Could not generate summary right now.')
    } finally { setAiLoading(false) }
  }
  const toggleJob = (i) => setExpandedJobs(e => ({ ...e, [i]: !e[i] }))

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/profile/${gridNumber}`)
        setProfile(res.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Profile not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [gridNumber])

  const handleShare = async () => {
    const shareUrl = `${API_URL}/share/${gridNumber}`
    const shareData = {
      title: `${profile?.name} — Verified GRID Profile`,
      text: `Check out ${profile?.name}'s verified GRID profile`,
      url: shareUrl
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (e) {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U'

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[#1A3C6E] font-bold">Loading profile...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-10 shadow-sm max-w-sm">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-[#1A3C6E] font-bold text-xl mb-2">Profile not found</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <p className="text-gray-400 text-xs">Make sure the student has published their profile to GRID</p>
      </div>
    </div>
  )

  const isExperienced = profile.workStatus === 'Experienced'
  const skillsList = profile.technicalSkills ? profile.technicalSkills.split(',').map(s => s.trim()).filter(Boolean) : []
  const softList = profile.softSkills ? profile.softSkills.split(',').map(s => s.trim()).filter(Boolean) : []
  const toolsList = profile.toolsAndSoftware ? profile.toolsAndSoftware.split(',').map(s => s.trim()).filter(Boolean) : []
  const langList = profile.languagesKnown ? profile.languagesKnown.split(',').map(s => s.trim()).filter(Boolean) : []
  const certList = profile.certifications ? profile.certifications.split(',').map(s => s.trim()).filter(Boolean) : []
  let projects = []
  let employment = []
  try { projects = profile.projects ? JSON.parse(profile.projects) : [] } catch (e) {}
  try { employment = profile.employmentHistory ? JSON.parse(profile.employmentHistory) : [] } catch (e) {}

  // Education entries (shared)
  const eduEntries = []
  if (profile.pgDegree || profile.pgCollegeName) eduEntries.push({ degree: profile.pgDegree, place: profile.pgCollegeName, year: profile.pgPassingYear, extra: profile.pgCGPA, branch: profile.pgBranch })
  if (profile.degree || profile.collegeName) eduEntries.push({ degree: profile.degree, place: profile.collegeName, year: profile.collegePassingYear, extra: profile.collegeCGPA, branch: profile.branch })
  if (profile.twelfthSchoolName) eduEntries.push({ degree: '12th — ' + (profile.twelfthBoard || ''), place: profile.twelfthSchoolName, year: profile.twelfthPassingYear, extra: profile.twelfthPercentage })
  if (profile.schoolName) eduEntries.push({ degree: '10th — ' + (profile.schoolBoard || ''), place: profile.schoolName, year: profile.schoolPassingYear, extra: profile.schoolPercentage })

  const navy = '#1A3C6E', teal = '#0D7377', mint = '#5DCAA5'

  // Shared: section heading in main column
  const SectionHead = ({ children }) => (
    <div className="mb-3">
      <h2 className="text-sm font-extrabold tracking-wide uppercase" style={{ color: navy }}>{children}</h2>
      <div className="h-0.5 w-full mt-1" style={{ background: '#e5e8ec' }}></div>
    </div>
  )

  const chip = (t, i) => (
    <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#E1F5EE', color: '#085041' }}>{t}</span>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-0 sm:py-6">
      {/* Floating GRID bar */}
      <div className="bg-[#1A3C6E] px-5 py-3 flex items-center justify-between sm:max-w-4xl sm:mx-auto sm:rounded-t-2xl">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-bold text-lg">GRID</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5DCAA5]"></div>
          <span className="text-[#5DCAA5] text-xs font-bold">Verified Profile</span>
        </div>
      </div>

      {/* Document */}
      <div className="sm:max-w-4xl sm:mx-auto bg-white sm:rounded-b-2xl shadow-sm overflow-hidden">

        {/* ============ CV LAYOUT (Experienced) ============ */}
        {isExperienced ? (
          <>
            {/* Header band */}
            <div style={{ background: `linear-gradient(135deg, ${navy}, ${teal})` }} className="px-6 py-6 flex flex-col sm:flex-row items-center gap-5 text-white">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-white/30 flex-shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/15 flex items-center justify-center text-4xl font-bold border-4 border-white/20 flex-shrink-0">{getInitials(profile.name)}</div>
              )}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-extrabold">{profile.name}</h1>
                <p className="text-[#9FE1CB] font-bold text-sm mb-2">{profile.jobTitle || 'Experienced Professional'}</p>
                {profile.bio && <p className="text-white/80 text-xs leading-relaxed max-w-xl">{profile.bio}</p>}
              </div>
            </div>
            {/* Contact strip */}
            <div className="bg-[#12305c] text-white/80 text-xs px-6 py-2.5 flex flex-wrap gap-x-5 gap-y-1 justify-center sm:justify-start">
              {profile.contactNumber && <span>📞 {profile.contactNumber}</span>}
              {profile.email && <span>✉️ {profile.email}</span>}
              {(profile.city || profile.state) && <span>📍 {[profile.city, profile.state].filter(Boolean).join(', ')}</span>}
              <span className="text-[#9FE1CB] font-bold">{profile.gridNumber}</span>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Left / main (2 cols) */}
              <div className="sm:col-span-2 flex flex-col gap-6">
                {showAi && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide mb-2" style={{ color: teal }}>AI Summary</p>
                    {aiLoading && <p className="text-sm text-gray-400">Distilling the highlights...</p>}
                    {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                    {aiSummary && <><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aiSummary}</p><p className="text-[10px] text-gray-300 mt-2">AI-generated — may not capture everything.</p></>}
                  </div>
                )}

                {profile.workExperience && (
                  <div>
                    <SectionHead>Professional Summary</SectionHead>
                    <p className="text-sm text-gray-600 leading-relaxed">{profile.workExperience}</p>
                  </div>
                )}

                {employment.length > 0 && (
                  <div>
                    <SectionHead>Work Experience</SectionHead>
                    <div className="flex flex-col gap-3">
                      {employment.map((job, i) => {
                        const open = expandedJobs[i]
                        const pc = (job.projects || []).length
                        return (
                          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button onClick={() => toggleJob(i)} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold" style={{ color: navy }}>{job.role || 'Role'}{job.company ? ` — ${job.company}` : ''}</p>
                                  {job.duration && <p className="text-xs text-gray-400 mt-0.5">{job.duration}</p>}
                                  {pc > 0 && <p className="text-xs font-bold mt-1" style={{ color: teal }}>{pc} project{pc !== 1 ? 's' : ''}{!open ? ' — tap to view' : ''}</p>}
                                </div>
                                <span className={`text-gray-400 text-lg flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
                              </div>
                            </button>
                            {open && pc > 0 && (
                              <div className="px-4 pb-4 flex flex-col gap-2">
                                {job.projects.map((pr, pi) => (
                                  <div key={pi} className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-bold" style={{ color: teal }}>{pr.title || `Project ${pi + 1}`}</p>
                                    {pr.details && <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{pr.details}</p>}
                                    {pr.role && <p className="text-xs text-gray-500 mt-1"><span className="font-bold">Role:</span> {pr.role}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {eduEntries.length > 0 && (
                  <div>
                    <SectionHead>Education</SectionHead>
                    <div className="flex flex-col gap-3">
                      {eduEntries.map((e, i) => (
                        <div key={i} className="border-l-2 pl-3" style={{ borderColor: teal }}>
                          <p className="text-sm font-bold" style={{ color: navy }}>{e.degree}{e.branch ? ` — ${e.branch}` : ''}</p>
                          {e.place && <p className="text-xs" style={{ color: teal }}>{e.place}</p>}
                          <p className="text-xs text-gray-400">{[e.year, e.extra].filter(Boolean).join(' · ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar (1 col) */}
              <div className="flex flex-col gap-6">
                {skillsList.length > 0 && (
                  <div>
                    <SectionHead>Skills</SectionHead>
                    <div className="flex flex-wrap gap-2">{skillsList.map(chip)}</div>
                  </div>
                )}
                {toolsList.length > 0 && (
                  <div>
                    <SectionHead>Tools</SectionHead>
                    <div className="flex flex-wrap gap-2">{toolsList.map((t, i) => <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>)}</div>
                  </div>
                )}
                {softList.length > 0 && (
                  <div>
                    <SectionHead>Soft Skills</SectionHead>
                    <ul className="text-sm text-gray-600 list-disc pl-4 flex flex-col gap-1">{softList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                {langList.length > 0 && (
                  <div>
                    <SectionHead>Languages</SectionHead>
                    <ul className="text-sm text-gray-600 list-disc pl-4 flex flex-col gap-1">{langList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                {certList.length > 0 && (
                  <div>
                    <SectionHead>Certifications</SectionHead>
                    <ul className="text-sm text-gray-600 list-disc pl-4 flex flex-col gap-1">{certList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                {(profile.preferredWorkLocation || profile.expectedSalary || profile.noticePeriod || profile.preferredJobType) && (
                  <div>
                    <SectionHead>Preferences</SectionHead>
                    <div className="text-xs text-gray-600 flex flex-col gap-1.5">
                      {profile.preferredJobType && <p><span className="text-gray-400">Type:</span> {profile.preferredJobType}</p>}
                      {profile.preferredWorkLocation && <p><span className="text-gray-400">Location:</span> {profile.preferredWorkLocation}</p>}
                      {profile.expectedSalary && <p><span className="text-gray-400">Expected:</span> {profile.expectedSalary}</p>}
                      {profile.noticePeriod && <p><span className="text-gray-400">Notice:</span> {profile.noticePeriod}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ============ RESUME LAYOUT (Student / Fresher) ============ */
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {/* Dark sidebar */}
            <div style={{ background: navy }} className="text-white p-6 flex flex-col gap-6 sm:col-span-1">
              <div className="flex flex-col items-center text-center">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.name} className="w-28 h-28 rounded-full object-cover border-4 border-white/20 mb-3" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center text-4xl font-bold border-4 border-white/20 mb-3">{getInitials(profile.name)}</div>
                )}
                <h1 className="text-lg font-extrabold">{profile.name}</h1>
                <p className="text-[#9FE1CB] text-xs font-bold">{profile.jobTitle || (profile.workStatus === 'Student' ? 'Student' : 'Fresher')}</p>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9FE1CB] mb-2 border-b border-white/15 pb-1">Contact</p>
                <div className="text-xs text-white/80 flex flex-col gap-1.5">
                  {profile.contactNumber && <p>📞 {profile.contactNumber}</p>}
                  {profile.email && <p className="break-all">✉️ {profile.email}</p>}
                  {(profile.city || profile.state) && <p>📍 {[profile.city, profile.state].filter(Boolean).join(', ')}</p>}
                </div>
              </div>

              {skillsList.length > 0 && (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#9FE1CB] mb-2 border-b border-white/15 pb-1">Skills</p>
                  <div className="flex flex-wrap gap-1.5">{skillsList.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10">{t}</span>)}</div>
                </div>
              )}

              {certList.length > 0 && (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#9FE1CB] mb-2 border-b border-white/15 pb-1">Certifications</p>
                  <ul className="text-xs text-white/80 list-disc pl-4 flex flex-col gap-1">{certList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}

              {langList.length > 0 && (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#9FE1CB] mb-2 border-b border-white/15 pb-1">Languages</p>
                  <ul className="text-xs text-white/80 list-disc pl-4 flex flex-col gap-1">{langList.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}

              <div className="text-[10px] text-white/40 mt-auto pt-2">{profile.gridNumber}</div>
            </div>

            {/* White main */}
            <div className="p-6 flex flex-col gap-6 sm:col-span-2">
              {showAi && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide mb-2" style={{ color: teal }}>AI Summary</p>
                  {aiLoading && <p className="text-sm text-gray-400">Distilling the highlights...</p>}
                  {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                  {aiSummary && <><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aiSummary}</p><p className="text-[10px] text-gray-300 mt-2">AI-generated — may not capture everything.</p></>}
                </div>
              )}

              {profile.bio && (
                <div>
                  <SectionHead>Career Objective</SectionHead>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {eduEntries.length > 0 && (
                <div>
                  <SectionHead>Education</SectionHead>
                  <div className="flex flex-col gap-3">
                    {eduEntries.map((e, i) => (
                      <div key={i} className="border-l-2 pl-3" style={{ borderColor: teal }}>
                        <p className="text-sm font-bold" style={{ color: navy }}>{e.degree}{e.branch ? ` — ${e.branch}` : ''}</p>
                        {e.place && <p className="text-xs" style={{ color: teal }}>{e.place}</p>}
                        <p className="text-xs text-gray-400">{[e.year, e.extra].filter(Boolean).join(' · ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <SectionHead>Projects & Internships</SectionHead>
                  <div className="flex flex-col gap-3">
                    {projects.map((pr, i) => (
                      <div key={i} className="border-l-2 pl-3" style={{ borderColor: teal }}>
                        <p className="text-sm font-bold" style={{ color: navy }}>{pr.title || `Project ${i + 1}`}</p>
                        {pr.details && <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{pr.details}</p>}
                        {pr.role && <p className="text-xs text-gray-500 mt-1"><span className="font-bold">Role:</span> {pr.role}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.workExperience && (
                <div>
                  <SectionHead>Summary</SectionHead>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.workExperience}</p>
                </div>
              )}

              {toolsList.length > 0 && (
                <div>
                  <SectionHead>Tools & Software</SectionHead>
                  <div className="flex flex-wrap gap-2">{toolsList.map((t, i) => <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>)}</div>
                </div>
              )}

              {softList.length > 0 && (
                <div>
                  <SectionHead>Soft Skills</SectionHead>
                  <div className="flex flex-wrap gap-2">{softList.map(chip)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verified footer */}
        <div className="bg-[#1A3C6E] px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <span className="text-white font-bold text-sm">GRID</span>
          </div>
          <p className="text-white/50 text-xs">This profile is verified by GRID · {profile.gridNumber}</p>
        </div>
      </div>

      {/* Floating action buttons — corner, always visible */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
        <button onClick={fetchAiSummary} title="AI Summary"
          className="w-13 h-13 px-4 py-3 rounded-full shadow-lg text-white text-sm font-bold flex items-center gap-2" style={{ background: teal }}>
          ✨ <span className="hidden sm:inline">AI Summary</span>
        </button>
        <button onClick={handleShare} title="Share"
          className="w-13 h-13 px-4 py-3 rounded-full shadow-lg text-white text-sm font-bold flex items-center gap-2" style={{ background: navy }}>
          {copied ? '✓' : '🔗'} <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>
    </div>
  )
}

export default PublicProfile
