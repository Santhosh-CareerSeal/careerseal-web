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
    const shareUrl = `https://thegridcard.com/api/profile-preview?gridNumber=${gridNumber}`
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
  const skillsList = profile?.technicalSkills ? profile.technicalSkills.split(',').map(s => s.trim()) : []

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#1A3C6E] font-bold">Loading profile...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-10 shadow-sm max-w-sm">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-[#1A3C6E] font-bold text-xl mb-2">Profile not found</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <p className="text-gray-400 text-xs">Make sure the student has published their profile to GRID</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-[#1A3C6E] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="11" fill="#0D7377"/>
            <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-white font-bold text-lg">GRID</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5DCAA5]"></div>
          <span className="text-[#5DCAA5] text-xs font-bold">Verified Profile</span>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #1A3C6E 0%, #0D7377 100%)' }} className="px-6 py-8 flex flex-col items-center">
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white/30 mb-4" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 mb-4">
            {getInitials(profile.name)}
          </div>
        )}
        <h1 className="text-white text-2xl font-bold mb-1">{profile.name}</h1>
        {profile.jobTitle && <p className="text-[#5DCAA5] text-sm mb-1">{profile.jobTitle}</p>}
        {profile.workStatus && <p className="text-white/50 text-xs mb-3">{profile.workStatus}</p>}
        <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-white/40 text-xs mb-1">GRID NUMBER</p>
          <p className="text-white font-bold text-sm tracking-widest">{profile.gridNumber}</p>
        </div>
        <button onClick={handleShare} className="mt-3 flex items-center gap-2 bg-[#0D7377] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0a5a5e] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          {copied ? 'Link Copied!' : 'Share Profile'}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Contact</p>
          <div className="flex flex-col gap-2">
            {profile.contactNumber && (
              <div className="flex items-center gap-3">
                <span className="text-lg">📱</span>
                <p className="text-sm text-gray-700 font-medium">+91 {profile.contactNumber}</p>
              </div>
            )}
            {profile.email && (
              <div className="flex items-center gap-3">
                <span className="text-lg">✉️</span>
                <p className="text-sm text-gray-700">{profile.email}</p>
              </div>
            )}
            {(profile.city || profile.state) && (
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <p className="text-sm text-gray-700">{profile.city}{profile.state ? `, ${profile.state}` : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">About</p>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Education */}
        {(profile.collegeName || profile.schoolName) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Education</p>
            <div className="flex flex-col gap-4">
              {profile.pgCollegeName && (
                <div className="border-l-2 border-[#0D7377] pl-4">
                  <p className="text-sm font-bold text-[#1A3C6E]">{profile.pgDegree} {profile.pgBranch && `— ${profile.pgBranch}`}</p>
                  <p className="text-xs text-[#0D7377]">{profile.pgCollegeName}</p>
                  <p className="text-xs text-gray-400">{profile.pgPassingYear} {profile.pgCGPA && `· ${profile.pgCGPA}`}</p>
                </div>
              )}
              {profile.collegeName && (
                <div className="border-l-2 border-[#0D7377] pl-4">
                  <p className="text-sm font-bold text-[#1A3C6E]">{profile.degree} {profile.branch && `— ${profile.branch}`}</p>
                  <p className="text-xs text-[#0D7377]">{profile.collegeName}</p>
                  <p className="text-xs text-gray-400">{profile.collegePassingYear} {profile.collegeCGPA && `· CGPA ${profile.collegeCGPA}`}</p>
                </div>
              )}
              {profile.twelfthSchoolName && (
                <div className="border-l-2 border-gray-200 pl-4">
                  <p className="text-sm font-bold text-gray-700">12th — {profile.twelfthBoard}</p>
                  <p className="text-xs text-[#0D7377]">{profile.twelfthSchoolName}</p>
                  <p className="text-xs text-gray-400">{profile.twelfthPassingYear} {profile.twelfthPercentage && `· ${profile.twelfthPercentage}`}</p>
                </div>
              )}
              {profile.schoolName && (
                <div className="border-l-2 border-gray-200 pl-4">
                  <p className="text-sm font-bold text-gray-700">10th — {profile.schoolBoard}</p>
                  <p className="text-xs text-[#0D7377]">{profile.schoolName}</p>
                  <p className="text-xs text-gray-400">{profile.schoolPassingYear} {profile.schoolPercentage && `· ${profile.schoolPercentage}`}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {profile.workExperience && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Experience</p>
            {profile.currentCompany && (
              <p className="text-sm font-bold text-[#1A3C6E] mb-2">{profile.jobTitle || 'Professional'} — {profile.currentCompany}</p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">{profile.workExperience}</p>
          </div>
        )}

        {/* Skills */}
        {skillsList.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Technical Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, i) => (
                <span key={i} className="bg-[#1A3C6E]/10 text-[#1A3C6E] text-xs font-bold px-3 py-1.5 rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tools + Certifications */}
        {(profile.toolsAndSoftware || profile.certifications) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            {profile.toolsAndSoftware && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Tools & Software</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.toolsAndSoftware.split(',').map((t, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">{t.trim()}</span>
                  ))}
                </div>
              </>
            )}
            {profile.certifications && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Certifications</p>
                <div className="flex flex-col gap-1">
                  {profile.certifications.split(',').map((c, i) => (
                    <p key={i} className="text-sm text-gray-600">✓ {c.trim()}</p>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Preferences */}
        {(profile.preferredWorkLocation || profile.expectedSalary || profile.noticePeriod || profile.preferredJobType) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Job Preferences</p>
            <div className="grid grid-cols-2 gap-3">
              {profile.preferredWorkLocation && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Preferred Location</p>
                  <p className="text-sm font-bold text-[#1A3C6E]">{profile.preferredWorkLocation}</p>
                </div>
              )}
              {profile.expectedSalary && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Expected Salary</p>
                  <p className="text-sm font-bold text-[#1A3C6E]">{profile.expectedSalary}</p>
                </div>
              )}
              {profile.noticePeriod && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Notice Period</p>
                  <p className="text-sm font-bold text-[#1A3C6E]">{profile.noticePeriod}</p>
                </div>
              )}
              {profile.preferredJobType && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Job Type</p>
                  <p className="text-sm font-bold text-[#1A3C6E]">{profile.preferredJobType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#1A3C6E] rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <span className="text-white font-bold text-sm">GRID</span>
          </div>
          <p className="text-white/50 text-xs mb-1">This profile is verified by GRID</p>
          <p className="text-[#5DCAA5] text-xs font-bold">{profile.gridNumber}</p>
        </div>

      </div>
    </div>
  )
}

export default PublicProfile
