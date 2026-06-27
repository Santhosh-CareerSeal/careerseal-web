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
  const [downloading, setDownloading] = useState(false)

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

  const drawRoundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const W = 856
      const H = 540
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')

      drawRoundRect(ctx, 0, 0, W, H, 32)
      ctx.fillStyle = '#1A3C6E'
      ctx.fill()

      ctx.fillStyle = 'rgba(13,115,119,0.15)'
      ctx.beginPath()
      ctx.arc(W - 80, -80, 220, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(13,115,119,0.08)'
      ctx.beginPath()
      ctx.arc(80, H + 60, 200, 0, Math.PI * 2)
      ctx.fill()

      const leftW = 280
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      drawRoundRect(ctx, 0, 0, leftW, H, 0)
      ctx.fill()

      const photoSize = 110
      const photoX = leftW / 2
      const photoY = 100

      ctx.save()
      ctx.beginPath()
      ctx.arc(photoX, photoY, photoSize / 2 + 3, 0, Math.PI * 2)
      ctx.fillStyle = '#0D7377'
      ctx.fill()
      ctx.restore()

      if (student?.photoUrl) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = student.photoUrl
          })
          ctx.save()
          ctx.beginPath()
          ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, photoX - photoSize / 2, photoY - photoSize / 2, photoSize, photoSize)
          ctx.restore()
        } catch {
          ctx.fillStyle = '#0D7377'
          ctx.beginPath()
          ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'white'
          ctx.font = 'bold 48px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(getInitials(user?.name), photoX, photoY)
        }
      } else {
        ctx.fillStyle = '#0D7377'
        ctx.beginPath()
        ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(getInitials(user?.name), photoX, photoY)
      }

      ctx.fillStyle = 'white'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(user?.name || '', photoX, photoY + 80)

      ctx.fillStyle = '#5DCAA5'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(user?.email || '', photoX, photoY + 100)

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      drawRoundRect(ctx, 20, photoY + 120, leftW - 40, 1, 0)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONTACT', 30, photoY + 148)
      ctx.fillStyle = 'white'
      ctx.font = '13px Arial'
      ctx.fillText(student?.contactNumber ? `+91 ${student.contactNumber}` : 'Not provided', 30, photoY + 168)

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      drawRoundRect(ctx, 20, photoY + 183, leftW - 40, 1, 0)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px Arial'
      ctx.fillText('ADDRESS', 30, photoY + 206)
      ctx.fillStyle = 'white'
      ctx.font = '13px Arial'
      const address = student?.address || 'Not provided'
      const words = address.split(' ')
      let line = ''
      let addrY = photoY + 226
      for (const word of words) {
        const test = line + word + ' '
        if (ctx.measureText(test).width > leftW - 60 && line !== '') {
          ctx.fillText(line.trim(), 30, addrY)
          line = word + ' '
          addrY += 18
        } else { line = test }
      }
      ctx.fillText(line.trim(), 30, addrY)

      const rx = leftW + 40
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CAREERSEAL', rx, 56)

      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '10px Arial'
      ctx.textAlign = 'right'
      ctx.fillText('GRID CARD', W - 40, 56)

      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      drawRoundRect(ctx, rx, 80, W - rx - 40, 200, 16)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '11px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('GRID NUMBER', rx + 20, 115)

      ctx.fillStyle = 'white'
      ctx.font = 'bold 26px Arial'
      ctx.fillText(gridCard?.gridNumber || '', rx + 20, 155)

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      drawRoundRect(ctx, rx + 20, 170, W - rx - 80, 1, 0)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '11px Arial'
      ctx.fillText('VALID THRU', rx + 20, 200)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('2026 / Lifetime', rx + 20, 222)

      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '11px Arial'
      ctx.fillText('ISSUED BY', rx + 180, 200)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('CareerSeal India', rx + 180, 222)

      ctx.fillStyle = '#5DCAA5'
      ctx.beginPath()
      ctx.arc(rx, H - 60, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#5DCAA5'
      ctx.font = 'bold 14px Arial'
      ctx.fillText('CareerSeal Verified', rx + 16, H - 54)

      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '11px Arial'
      ctx.textAlign = 'right'
      ctx.fillText('careerseal.in', W - 40, H - 54)

      const link = document.createElement('a')
      link.download = `CareerSeal-GRID-${gridCard?.gridNumber || 'card'}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  }

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

      <div onClick={() => setFlipped(!flipped)} style={{ perspective: '1200px', width: '340px', height: '460px', cursor: 'pointer' }}>
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>

          {/* FRONT */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: '#1A3C6E', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
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

          {/* BACK — Full Resume Layout */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '20px', overflow: 'hidden', display: 'flex' }}>

            {/* Left dark column */}
            <div style={{ width: '115px', background: '#1A3C6E', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '2px solid rgba(255,255,255,0.2)', display: 'block' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#0D7377', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '500' }}>
                  {getInitials(user?.name)}
                </div>
              )}

              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', margin: '0 0 5px' }}>CONTACT</p>
                {student?.contactNumber && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', margin: '0 0 2px' }}>+91 {student.contactNumber}</p>}
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', margin: '0 0 2px', wordBreak: 'break-all' }}>{user?.email}</p>
                {student?.address && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', margin: 0, lineHeight: '1.3' }}>{student.address}</p>}
              </div>

              {skillsList.length > 0 && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', margin: '0 0 5px' }}>SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {skillsList.slice(0, 6).map((skill, i) => (
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

            {/* Right white column — Resume */}
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

      <div className="flex gap-4 mt-8">
        <button onClick={handleDownload} disabled={downloading} className="bg-[#0D7377] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0a5f63] transition-colors flex items-center gap-2">
          <i className="ti ti-download" aria-hidden="true"></i>
          {downloading ? 'Generating...' : 'Download Card'}
        </button>
        <button onClick={() => navigate('/dashboard')} className="text-[#1A3C6E] text-sm font-bold py-3">← Dashboard</button>
      </div>
    </div>
  )
}

export default GridCard
