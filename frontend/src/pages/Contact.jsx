import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Footer from '../components/Footer'
import API_URL from '../config'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const homeDest = (() => {
    const token = localStorage.getItem('token')
    if (!token) return '/'
    let user = {}
    try { user = JSON.parse(localStorage.getItem('user') || '{}') } catch (e) {}
    if (user.role === 'company') return '/company'
    if (user.role === 'college') return '/college-portal'
    if (user.role === 'admin') return '/admin'
    return '/dashboard'
  })()

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in your name, email, and message.')
      return
    }
    setSending(true)
    try {
      await axios.post(`${API_URL}/api/public/contact`, form)
      setSent(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Could not send your message. Please try again or email support@thegridcard.com directly.')
    } finally {
      setSending(false)
    }
  }

  const inputClass = 'w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-colors'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-[#1A3C6E] px-6 py-4 flex items-center justify-between">
        <Link to={homeDest} className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span className="text-white font-bold text-lg">GRID</span>
        </Link>
        <Link to={homeDest} className="text-white/80 text-sm font-bold" style={{ textDecoration: 'none' }}>Home</Link>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-extrabold text-[#1A3C6E] mb-2">Get in touch</h1>
        <p className="text-gray-500 text-sm mb-8">Questions, feedback, or want to bring GRID to your college or company? Send us a message and we'll get back to you.</p>

        {sent ? (
          <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#0D7377] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A3C6E] mb-2">Message sent!</h2>
            <p className="text-gray-600 text-sm mb-5">Thanks for reaching out. We'll get back to you at {form.email} soon.</p>
            <Link to={homeDest} className="inline-block bg-[#1A3C6E] text-white font-bold text-sm px-6 py-3 rounded-xl" style={{ textDecoration: 'none' }}>Back to Home</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1A3C6E] mb-1.5">Your name *</label>
              <input type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A3C6E] mb-1.5">Email *</label>
              <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A3C6E] mb-1.5">Subject</label>
              <input type="text" placeholder="What's this about?" value={form.subject} onChange={e => set('subject', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A3C6E] mb-1.5">Message *</label>
              <textarea placeholder="Tell us more..." value={form.message} onChange={e => set('message', e.target.value)} className={`${inputClass} h-32 resize-none`} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button onClick={handleSubmit} disabled={sending}
              className="bg-[#0D7377] text-white font-bold py-3 rounded-xl hover:bg-[#0a5f63] transition-colors disabled:opacity-50">
              {sending ? 'Sending...' : 'Send message'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              Or email us directly at <a href="mailto:support@thegridcard.com" className="text-[#0D7377] font-bold">support@thegridcard.com</a>
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Contact
