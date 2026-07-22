import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../config'

function AskGrid() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm Ask GRID. I can help with anything about GRID — your profile, jobs, skill exams, documents or how the platform works. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [nudged, setNudged] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post(`${API_URL}/api/ask`, { question: q }, { headers })
      setMessages(m => [...m, { role: 'bot', text: res.data.answer }])
    } catch (e) {
      setMessages(m => [...m, { role: 'bot', text: "Something went wrong. Please try again in a moment." }])
    } finally { setLoading(false) }
  }

  return (
    <>
      {open && (
        <div style={{ position: 'fixed', bottom: '90px', right: '20px', width: '340px', maxWidth: 'calc(100vw - 40px)', height: '460px', maxHeight: 'calc(100vh - 140px)', background: 'white', borderRadius: '18px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', zIndex: 9998, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>Ask GRID</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '2px 0 0' }}>Here to help with GRID</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#f7f8fa' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                <div style={{ maxWidth: '82%', padding: '9px 12px', borderRadius: '14px', fontSize: '13px', lineHeight: 1.5, background: m.role === 'user' ? '#1A3C6E' : 'white', color: m.role === 'user' ? 'white' : '#333', border: m.role === 'user' ? 'none' : '1px solid #eee', whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 12px', borderRadius: '14px', fontSize: '13px', background: 'white', border: '1px solid #eee', color: '#9ca3af' }}>Thinking…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', background: 'white' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="Ask about GRID…" maxLength={500}
              style={{ flex: 1, border: '1.5px solid #eee', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', fontFamily: 'system-ui' }} />
            <button onClick={send} disabled={loading || !input.trim()}
              style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '10px', padding: '0 14px', fontSize: '13px', fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}>Send</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes agThink { 0%,84%,100% { transform: rotate(0) } 88% { transform: rotate(-7deg) } 92% { transform: rotate(5deg) } 96% { transform: rotate(-3deg) } }
        @keyframes agBounce { 0%,20%,50%,80%,100% { transform: translateY(0) } 40% { transform: translateY(-12px) } 60% { transform: translateY(-6px) } }
      `}</style>
      <button onClick={() => { setOpen(o => !o); setNudged(true) }} aria-label="Ask GRID"
        style={{ position: 'fixed', bottom: '20px', right: '20px', height: isMobile ? '56px' : '52px', width: isMobile ? '56px' : 'auto', padding: isMobile ? '0' : (open ? '0 18px' : '0 20px 0 7px'), borderRadius: isMobile ? '50%' : '26px', background: '#0D7377', color: 'white', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.22)', cursor: 'pointer', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '0' : '10px', animation: (isMobile && !open && !nudged) ? 'agBounce 2s ease-in-out infinite' : 'none' }}>
        {open ? (
          <span style={{ fontSize: '15px', fontWeight: 700 }}>Close</span>
        ) : (
          <>
            <span style={{ width: isMobile ? '44px' : '40px', height: isMobile ? '44px' : '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <svg width="30" height="32" viewBox="0 0 30 32" aria-hidden="true" style={{ animation: nudged ? 'none' : 'agThink 5s ease-in-out infinite', transformOrigin: 'bottom center' }}>
                <circle cx="13" cy="12" r="8.5" fill="#EF9F27" />
                <path d="M4.5 9 A8.5 8.5 0 0 1 21.5 9 Z" fill="#1A3C6E" />
                <circle cx="10" cy="13" r="1.3" fill="#1A3C6E" />
                <circle cx="16.5" cy="13" r="1.3" fill="#1A3C6E" />
                <path d="M11 17.5 q2.5 1.8 5 0" stroke="#1A3C6E" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <rect x="6" y="21" width="14" height="12" rx="5" fill="#0D7377" />
                <path d="M20 25 q6 1 4 -6" stroke="#0D7377" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="23.5" cy="18" r="2.5" fill="#EF9F27" />
              </svg>
            </span>
            {!isMobile && <span style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Ask GRID</span>}
          </>
        )}
      </button>
    </>
  )
}

export default AskGrid
