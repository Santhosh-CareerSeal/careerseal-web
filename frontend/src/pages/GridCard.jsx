import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const CAREER_FIELDS = [
  { label: 'Software Engineer', color: 'teal', delay: '0s', pos: { top: '4%', left: '3%' }, rot: '-5deg' },
  { label: 'UI/UX Designer', color: 'amber', delay: '0.5s', pos: { top: '3%', right: '5%' }, rot: '4deg' },
  { label: 'Data Scientist', color: 'white', delay: '1s', pos: { top: '18%', left: '0%' }, rot: '-3deg' },
  { label: 'Product Manager', color: 'blue', delay: '1.5s', pos: { top: '18%', right: '1%' }, rot: '3deg' },
  { label: 'DevOps Engineer', color: 'teal', delay: '0.3s', pos: { top: '34%', left: '0%' }, rot: '-2deg' },
  { label: 'Cloud Architect', color: 'amber', delay: '0.8s', pos: { top: '34%', right: '0%' }, rot: '2deg' },
  { label: 'Chartered Accountant', color: 'white', delay: '1.2s', pos: { bottom: '28%', left: '1%' }, rot: '4deg' },
  { label: 'Marketing Manager', color: 'blue', delay: '0.6s', pos: { bottom: '28%', right: '1%' }, rot: '-4deg' },
  { label: 'Civil Engineer', color: 'teal', delay: '1.8s', pos: { bottom: '13%', left: '4%' }, rot: '-3deg' },
  { label: 'Doctor / MBBS', color: 'amber', delay: '1.1s', pos: { bottom: '13%', right: '4%' }, rot: '3deg' },
  { label: 'Business Analyst', color: 'white', delay: '0.4s', pos: { bottom: '2%', left: '12%' }, rot: '2deg' },
  { label: 'Graphic Designer', color: 'blue', delay: '1.6s', pos: { bottom: '2%', right: '10%' }, rot: '-2deg' },
]

const TAG_STYLES = {
  teal: { background: 'rgba(13,115,119,0.2)', border: '1px solid rgba(13,115,119,0.5)', color: 'rgba(93,202,165,0.95)' },
  amber: { background: 'rgba(239,159,39,0.15)', border: '1px solid rgba(239,159,39,0.4)', color: 'rgba(239,159,39,0.95)' },
  white: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' },
  blue: { background: 'rgba(26,60,110,0.5)', border: '1px solid rgba(93,115,200,0.4)', color: 'rgba(150,180,255,0.95)' },
}

const BOLTS = [0, 45, 90, 135, 180, 225, 270, 315]
const BOLT_COLORS = [
  'rgba(13,115,119,0.6)', 'rgba(239,159,39,0.5)', 'rgba(255,255,255,0.3)', 'rgba(93,202,165,0.5)',
  'rgba(13,115,119,0.6)', 'rgba(239,159,39,0.5)', 'rgba(255,255,255,0.3)', 'rgba(93,202,165,0.5)'
]

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
      const W = 856, H = 540
      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')
      drawRoundRect(ctx, 0, 0, W, H, 32)
      ctx.fillStyle = '#1A3C6E'; ctx.fill()
      ctx.fillStyle = 'rgba(13,115,119,0.15)'
      ctx.beginPath(); ctx.arc(W - 80, -80, 220, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(13,115,119,0.08)'
      ctx.beginPath(); ctx.arc(80, H + 60, 200, 0, Math.PI * 2); ctx.fill()
      const leftW = 280
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      drawRoundRect(ctx, 0, 0, leftW, H, 0); ctx.fill()
      const photoSize = 110, photoX = leftW / 2, photoY = 100
      ctx.save(); ctx.beginPath()
      ctx.arc(photoX, photoY, photoSize / 2 + 3, 0, Math.PI * 2)
      ctx.fillStyle = '#0D7377'; ctx.fill(); ctx.restore()
      if (student?.photoUrl) {
        try {
          const img = new Image(); img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = student.photoUrl })
          ctx.save(); ctx.beginPath()
          ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2)
          ctx.clip(); ctx.drawImage(img, photoX - photoSize / 2, photoY - photoSize / 2, photoSize, photoSize)
          ctx.restore()
        } catch {
          ctx.fillStyle = 'white'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(getInitials(user?.name), photoX, photoY)
        }
      } else {
        ctx.fillStyle = 'white'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(getInitials(user?.name), photoX, photoY)
      }
      ctx.fillStyle = 'white'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(user?.name || '', photoX, photoY + 80)
      ctx.fillStyle = '#5DCAA5'; ctx.font = '13px Arial'; ctx.textAlign = 'center'
      ctx.fillText(user?.email || '', photoX, photoY + 100)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; drawRoundRect(ctx, 20, photoY + 120, leftW - 40, 1, 0); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px Arial'; ctx.textAlign = 'left'
      ctx.fillText('CONTACT', 30, photoY + 148)
      ctx.fillStyle = 'white'; ctx.font = '13px Arial'
      ctx.fillText(student?.contactNumber ? `+91 ${student.contactNumber}` : 'Not provided', 30, photoY + 168)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; drawRoundRect(ctx, 20, photoY + 183, leftW - 40, 1, 0); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px Arial'
      ctx.fillText('ADDRESS', 30, photoY + 206)
      ctx.fillStyle = 'white'; ctx.font = '13px Arial'
      const address = student?.address || 'Not provided'
      const words = address.split(' '); let line = '', addrY = photoY + 226
      for (const word of words) {
        const test = line + word + ' '
        if (ctx.measureText(test).width > leftW - 60 && line !== '') { ctx.fillText(line.trim(), 30, addrY); line = word + ' '; addrY += 18 } else line = test
      }
      ctx.fillText(line.trim(), 30, addrY)
      const rx = leftW + 40
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px Arial'; ctx.textAlign = 'left'
      ctx.fillText('CAREERSEAL', rx, 56)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '10px Arial'; ctx.textAlign = 'right'
      ctx.fillText('GRID CARD', W - 40, 56)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      drawRoundRect(ctx, rx, 80, W - rx - 40, 200, 16); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px Arial'; ctx.textAlign = 'left'
      ctx.fillText('GRID NUMBER', rx + 20, 115)
      ctx.fillStyle = 'white'; ctx.font = 'bold 26px Arial'
      ctx.fillText(gridCard?.gridNumber || '', rx + 20, 155)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; drawRoundRect(ctx, rx + 20, 170, W - rx - 80, 1, 0); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px Arial'
      ctx.fillText('VALID THRU', rx + 20, 200)
      ctx.fillStyle = 'white'; ctx.font = 'bold 16px Arial'; ctx.fillText('2026 / Lifetime', rx + 20, 222)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px Arial'; ctx.fillText('ISSUED BY', rx + 180, 200)
      ctx.fillStyle = 'white'; ctx.font = 'bold 16px Arial'; ctx.fillText('CareerSeal India', rx + 180, 222)
      ctx.fillStyle = '#5DCAA5'; ctx.beginPath(); ctx.arc(rx, H - 60, 8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#5DCAA5'; ctx.font = 'bold 14px Arial'
      ctx.fillText('CareerSeal Verified', rx + 16, H - 54)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '11px Arial'; ctx.textAlign = 'right'
      ctx.fillText('careerseal.in', W - 40, H - 54)
      const link = document.createElement('a')
      link.download = `CareerSeal-GRID-${gridCard?.gridNumber || 'card'}.png`
      link.href = canvas.toDataURL('image/png', 1.0); link.click()
    } catch (err) { console.error(err) }
    finally { setDownloading(false) }
  }

  const skillsList = student?.technicalSkills ? student.technicalSkills.split(',').map(s => s.trim()) : student?.skills ? student.skills.split(',').map(s => s.trim()) : []

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060e1f' }}>
      <p className="text-white text-xl font-bold">Loading GRID...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#060e1f', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes pulse1{0%{opacity:0.8;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(2)}}
        @keyframes pulse2{0%{opacity:0.6;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)}}
        @keyframes pulse3{0%{opacity:0.5;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}
        @keyframes pulse4{0%{opacity:0.4;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
        @keyframes pulse5{0%{opacity:0.3;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.4)}}
        @keyframes floatTag{0%,100%{transform:translateY(0px) rotate(var(--rot))}50%{transform:translateY(-10px) rotate(var(--rot))}}
        @keyframes flicker{0%,100%{opacity:0.6}50%{opacity:0.15}}
        .energy-ring{position:absolute;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)}
        .field-tag{position:absolute;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;white-space:nowrap;animation:floatTag 3s ease-in-out infinite}
        .bolt{position:absolute;top:50%;left:50%;width:2px;transform-origin:0 0;animation:flicker 1.5s ease-in-out infinite}
      `}</style>

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>CareerSeal</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>Dashboard</button>
          <button onClick={() => navigate('/jobs')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>Jobs</button>
          <button onClick={() => navigate('/tracker')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>Applications</button>
        </div>
      </div>

      {!flipped ? (
        /* GRID CARD FRONT — Dramatic view */
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 57px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

          {/* Background glows */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(13,115,119,0.2) 0%, rgba(26,60,110,0.15) 40%, transparent 70%)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 70%, rgba(239,159,39,0.08) 0%, transparent 50%)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(93,202,165,0.08) 0%, transparent 50%)' }}></div>

          {/* Energy rings */}
          <div className="energy-ring" style={{ width: '300px', height: '300px', border: '1.5px solid #0D7377', animation: 'pulse1 2.5s ease-out infinite' }}></div>
          <div className="energy-ring" style={{ width: '380px', height: '380px', border: '1.5px solid #1A3C6E', animation: 'pulse2 2.5s ease-out infinite 0.5s' }}></div>
          <div className="energy-ring" style={{ width: '460px', height: '460px', border: '1.5px solid #EF9F27', animation: 'pulse3 2.5s ease-out infinite 1s' }}></div>
          <div className="energy-ring" style={{ width: '540px', height: '540px', border: '1px solid rgba(255,255,255,0.25)', animation: 'pulse4 2.5s ease-out infinite 1.5s' }}></div>
          <div className="energy-ring" style={{ width: '620px', height: '620px', border: '1px solid rgba(93,202,165,0.2)', animation: 'pulse5 3s ease-out infinite 0.8s' }}></div>
          <div className="energy-ring" style={{ width: '700px', height: '700px', border: '1px solid rgba(239,159,39,0.15)', animation: 'pulse1 3.5s ease-out infinite 1.3s' }}></div>

          {/* Energy bolts */}
          {BOLTS.map((angle, i) => (
            <div key={i} className="bolt" style={{ height: '200px', background: `linear-gradient(to bottom, ${BOLT_COLORS[i]}, transparent)`, transform: `rotate(${angle}deg)`, animationDelay: `${i * 0.25}s` }}></div>
          ))}

          {/* Floating career tags */}
          {CAREER_FIELDS.map((field, i) => (
            <span key={i} className="field-tag" style={{ ...field.pos, '--rot': field.rot, ...TAG_STYLES[field.color], animationDelay: field.delay }}>{field.label}</span>
          ))}

          {/* GRID Card */}
          <div
            onClick={() => setFlipped(true)}
            style={{ position: 'relative', zIndex: 10, width: '260px', background: 'linear-gradient(135deg, #1A3C6E, #0f2447)', borderRadius: '20px', padding: '26px', border: '1px solid rgba(13,115,119,0.6)', boxShadow: '0 0 60px rgba(13,115,119,0.3), 0 0 120px rgba(13,115,119,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '2px' }}>CAREERSEAL</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>GRID CARD</span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '2px solid rgba(255,255,255,0.2)', display: 'block' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#0D7377', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: '600', border: '2px solid rgba(255,255,255,0.2)' }}>
                  {getInitials(user?.name)}
                </div>
              )}
              <p style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>{user?.name}</p>
              <p style={{ color: '#5DCAA5', fontSize: '11px', margin: 0 }}>{user?.email}</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', border: '1px solid rgba(13,115,119,0.3)' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '2px', margin: '0 0 6px' }}>GRID NUMBER</p>
              <p style={{ color: 'white', fontSize: '12px', fontWeight: '600', letterSpacing: '1.5px', margin: 0 }}>{gridCard?.gridNumber || 'Generating...'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5DCAA5' }}></div>
                <span style={{ color: '#5DCAA5', fontSize: '10px', fontWeight: '600' }}>Verified</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>Click to view resume →</span>
            </div>
          </div>

          {/* Bottom text + download */}
          <div style={{ position: 'relative', zIndex: 10, marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: '0 0 12px' }}>Your verified identity unlocks every opportunity</p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              {downloading ? 'Generating...' : 'Download Card'}
            </button>
          </div>

        </div>
      ) : (
        /* FULL PAGE A4 RESUME — when card is clicked */
        <div style={{ minHeight: 'calc(100vh - 57px)', background: '#f4f5f7', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '794px', marginBottom: '16px' }}>
            <button onClick={() => setFlipped(false)} style={{ background: '#1A3C6E', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>← Back to GRID</button>
            <p style={{ color: '#6b7280', fontSize: '12px' }}>A4 Resume View · Not editable</p>
          </div>

          {/* A4 Resume */}
          <div style={{ width: '100%', maxWidth: '794px', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', minHeight: '1000px' }}>

            {/* Left dark column */}
            <div style={{ width: '260px', background: '#1A3C6E', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', border: '3px solid rgba(255,255,255,0.2)', display: 'block' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#0D7377', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '40px', fontWeight: '600' }}>
                    {getInitials(user?.name)}
                  </div>
                )}
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{user?.name}</p>
                {student?.jobTitle && <p style={{ color: '#5DCAA5', fontSize: '12px', margin: '0 0 4px' }}>{student.jobTitle}</p>}
                {student?.workStatus && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>{student.workStatus}</p>}
              </div>

              {(student?.contactNumber || user?.email || student?.address) && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '2px', margin: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>CONTACT</p>
                  {student?.contactNumber && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: '0 0 6px' }}>📱 +91 {student.contactNumber}</p>}
                  {user?.email && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: '0 0 6px', wordBreak: 'break-all' }}>✉️ {user.email}</p>}
                  {student?.city && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: '0 0 6px' }}>📍 {student.city}{student.state ? `, ${student.state}` : ''}</p>}
                  {student?.address && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', margin: 0, lineHeight: '1.4' }}>{student.address}</p>}
                </div>
              )}

              {skillsList.length > 0 && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '2px', margin: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skillsList.map((skill, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {student?.softSkills && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '2px', margin: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>SOFT SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {student.softSkills.split(',').map((s, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {student?.languagesKnown && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '2px', margin: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>LANGUAGES</p>
                  {student.languagesKnown.split(',').map((l, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: '0 0 4px' }}>{l.trim()}</p>
                  ))}
                </div>
              )}

              {student?.hobbies && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '2px', margin: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>HOBBIES</p>
                  {student.hobbies.split(',').map((h, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: '0 0 4px' }}>{h.trim()}</p>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <div style={{ background: '#0D7377', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', marginBottom: '6px' }}>
                  <p style={{ color: 'white', fontSize: '9px', letterSpacing: '1.5px', margin: 0, fontWeight: '600' }}>CAREERSEAL VERIFIED</p>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', textAlign: 'center', margin: 0, wordBreak: 'break-all' }}>{gridCard?.gridNumber}</p>
              </div>
            </div>

            {/* Right white content */}
            <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {student?.bio && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 8px', paddingBottom: '6px', borderBottom: '2px solid #1A3C6E' }}>ABOUT ME</p>
                  <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', margin: 0 }}>{student.bio}</p>
                </div>
              )}

              {(student?.collegeName || student?.schoolName) && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 12px', paddingBottom: '6px', borderBottom: '2px solid #1A3C6E' }}>EDUCATION</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {student?.pgCollegeName && (
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 2px' }}>{student.pgDegree} {student.pgBranch && `— ${student.pgBranch}`}</p>
                        <p style={{ fontSize: '12px', color: '#0D7377', margin: '0 0 2px' }}>{student.pgCollegeName}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{student.pgPassingYear} {student.pgCGPA && `· ${student.pgCGPA}`}</p>
                      </div>
                    )}
                    {student?.collegeName && (
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 2px' }}>{student.degree} {student.branch && `— ${student.branch}`}</p>
                        <p style={{ fontSize: '12px', color: '#0D7377', margin: '0 0 2px' }}>{student.collegeName}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{student.collegePassingYear} {student.collegeCGPA && `· CGPA ${student.collegeCGPA}`}</p>
                      </div>
                    )}
                    {student?.twelfthSchoolName && (
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>12th Standard — {student.twelfthBoard}</p>
                        <p style={{ fontSize: '12px', color: '#0D7377', margin: '0 0 2px' }}>{student.twelfthSchoolName}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{student.twelfthPassingYear} {student.twelfthPercentage && `· ${student.twelfthPercentage}`}</p>
                      </div>
                    )}
                    {student?.schoolName && (
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>10th Standard — {student.schoolBoard}</p>
                        <p style={{ fontSize: '12px', color: '#0D7377', margin: '0 0 2px' }}>{student.schoolName}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{student.schoolPassingYear} {student.schoolPercentage && `· ${student.schoolPercentage}`}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {student?.workExperience && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 12px', paddingBottom: '6px', borderBottom: '2px solid #1A3C6E' }}>EXPERIENCE</p>
                  {student?.currentCompany && <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A3C6E', margin: '0 0 2px' }}>{student.jobTitle || 'Professional'} — {student.currentCompany}</p>}
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{student.workExperience}</p>
                </div>
              )}

              {student?.certifications && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 10px', paddingBottom: '6px', borderBottom: '2px solid #1A3C6E' }}>CERTIFICATIONS</p>
                  {student.certifications.split(',').map((c, i) => (
                    <p key={i} style={{ fontSize: '12px', color: '#444', margin: '0 0 4px' }}>✓ {c.trim()}</p>
                  ))}
                </div>
              )}

              {student?.toolsAndSoftware && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#1A3C6E', letterSpacing: '1.5px', margin: '0 0 10px', paddingBottom: '6px', borderBottom: '2px solid #1A3C6E' }}>TOOLS & SOFTWARE</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {student.toolsAndSoftware.split(',').map((t, i) => (
                      <span key={i} style={{ background: '#f0f4ff', color: '#1A3C6E', fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: '500' }}>{t.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {student?.preferredWorkLocation && (
                  <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#9ca3af', letterSpacing: '1px', margin: '0 0 4px' }}>PREFERRED LOCATION</p>
                    <p style={{ fontSize: '12px', color: '#1A3C6E', fontWeight: '600', margin: 0 }}>{student.preferredWorkLocation}</p>
                  </div>
                )}
                {student?.expectedSalary && (
                  <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#9ca3af', letterSpacing: '1px', margin: '0 0 4px' }}>EXPECTED SALARY</p>
                    <p style={{ fontSize: '12px', color: '#1A3C6E', fontWeight: '600', margin: 0 }}>{student.expectedSalary}</p>
                  </div>
                )}
                {student?.noticePeriod && (
                  <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#9ca3af', letterSpacing: '1px', margin: '0 0 4px' }}>NOTICE PERIOD</p>
                    <p style={{ fontSize: '12px', color: '#1A3C6E', fontWeight: '600', margin: 0 }}>{student.noticePeriod}</p>
                  </div>
                )}
                {student?.preferredJobType && (
                  <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#9ca3af', letterSpacing: '1px', margin: '0 0 4px' }}>JOB TYPE</p>
                    <p style={{ fontSize: '12px', color: '#1A3C6E', fontWeight: '600', margin: 0 }}>{student.preferredJobType}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GridCard
