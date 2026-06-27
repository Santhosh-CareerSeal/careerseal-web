import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function GridCard() {
  const navigate = useNavigate()
  const [flipped, setFlipped] = useState(false)
  const [gridCard, setGridCard] = useState(null)
  const [student, setStudent] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }

        const [gridRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/grid`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        setGridCard(gridRes.data.gridCard)
        setStudent(profileRes.data.student)
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(storedUser)
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U'

  const skillsList = student?.skills ? student.skills.split(',').map(s => s.trim()) : []

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-[#1A3C6E] text-xl font-bold">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="11" fill="#0D7377" />
          <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <h1 className="text-xl font-bold text-[#1A3C6E]">CareerSeal</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">Your professional identity card</p>

      <div
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: '1200px', width: '340px', height: '460px', cursor: 'pointer' }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>

          {/* FRONT */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: '#1A3C6E',
            borderRadius: '20px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 22 22">
                  <circle cx="11" cy="11" r="11" fill="#0D7377" />
                  <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px' }}>CAREERSEAL</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>GRID CARD</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.2)', display: 'block' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0D7377', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: '500', border: '3px solid rgba(255,255,255,0.2)' }}>
                  {getInitials(user?.name)}
                </div>
              )}
              <p style={{ color: 'white', fontSize: '24px', fontWeight: '500', margin: '0 0 4px' }}>{user?.name}</p>
              <p style={{ color: '#5DCAA5', fontSize: '13px', margin: 0 }}>{user?.email}</p>
            </div>

            <div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '2px', margin: '0 0 8px' }}>GRID NUMBER</p>
                <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', letterSpacing: '2px', margin: 0 }}>{gridCard?.gridNumber || 'Generating...'}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5DCAA5' }}></div>
                  <span style={{ color: '#5DCAA5', fontSize: '12px' }}>Verified</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>Tap to view resume →</span>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex'
          }}>
            {/* Left dark column */}
            <div style={{ width: '115px', background: '#1A3C6E', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '2px solid rgba(255,255,255,0.2)', display: 'block' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#0D7377', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '500', border: '2px solid rgba(255,255,255,0.2)' }}>
                  {getInitials(user?.name)}
                </div>
              )}

              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', margin: '0 0 5px' }}>CONTACT</p>
                {student?.contactNumber && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', margin: '0 0 2px' }}>+91 {student.contactNumber}</p>}
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', margin: '0 0 2px', wordBreak: 'break-all' }}>{user?.email}</p>
                {student?.address && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', margin: 0 }}>{student.address}</p>}
              </div>

              {skillsList.length > 0 && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', margin: '0 0 5px' }}>SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {skillsList.slice(0, 5).map((skill, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '8px', padding: '2px 5px', borderRadius: '4px' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {student?.hobbies && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', margin: '0 0 5px' }}>HOBBIES</p>
                  {student.hobbies.split(',').slice(0, 3).map((h, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', margin: '0 0 2px' }}>{h.trim()}</p>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <div style={{ background: '#0D7377', borderRadius: '6px', padding: '5px 8px', textAlign: 'center' }}>
                  <p style={{ color: 'white', fontSize: '8px', letterSpacing: '1px', margin: 0 }}>VERIFIED</p>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '7px', textAlign: 'center', margin: '4px 0 0', wordBreak: 'break-all' }}>{gridCard?.gridNumber}</p>
              </div>
            </div>

            {/* Right white column */}
            <div style={{ flex: 1, background: 'white', padding: '16px', overflowY: 'auto' }}>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#1A3C6E', margin: '0 0 2px' }}>{user?.name}</p>
              {student?.education && <p style={{ fontSize: '10px', color: '#0D7377', margin: '0 0 10px' }}>{student.education}</p>}

              {student?.education && (
                <div style={{ borderTop: '1.5px solid #1A3C6E', paddingTop: '8px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '500', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 5px' }}>EDUCATION</p>
                  <p style={{ fontSize: '11px', fontWeight: '500', color: '#222', margin: '0 0 1px' }}>{student.education}</p>
                  {student?.schoolCollege && <p style={{ fontSize: '10px', color: '#0D7377', margin: 0 }}>{student.schoolCollege}</p>}
                </div>
              )}

              {student?.workExperience && (
                <div style={{ borderTop: '1.5px solid #1A3C6E', paddingTop: '8px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '500', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 5px' }}>EXPERIENCE</p>
                  <p style={{ fontSize: '9px', color: '#555', margin: 0, lineHeight: '1.4' }}>{student.workExperience}</p>
                </div>
              )}

              {student?.preferredWorkLocation && (
                <div style={{ borderTop: '1.5px solid #1A3C6E', paddingTop: '8px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '500', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 4px' }}>PREFERRED LOCATION</p>
                  <p style={{ fontSize: '11px', color: '#222', margin: 0 }}>{student.preferredWorkLocation}</p>
                </div>
              )}

              {student?.pfAccountNumber && (
                <div style={{ borderTop: '1.5px solid #1A3C6E', paddingTop: '8px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '500', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 4px' }}>PF ACCOUNT</p>
                  <p style={{ fontSize: '10px', color: '#555', margin: 0 }}>{student.pfAccountNumber}</p>
                </div>
              )}

              <p style={{ fontSize: '9px', color: '#aaa', textAlign: 'center', margin: '12px 0 0' }}>Tap to flip back</p>
            </div>
          </div>

        </div>
      </div>

      <button onClick={() => navigate('/dashboard')} className="mt-8 text-[#1A3C6E] text-sm font-bold">
        ← Back to Dashboard
      </button>
    </div>
  )
}

export default GridCard
