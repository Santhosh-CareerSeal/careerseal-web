import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'

// Public, Google-indexable entry point: anyone types a GRID ID to view a
// verified résumé. Verification-first framing — this is GRID's differentiation.
function VerifyLookup() {
  usePageMeta({
    title: 'Verify a GRID ID — View a candidate’s verified résumé | GRID',
    description: 'Enter a GRID ID to open a verified résumé — education, skills and documents checked. No PDFs, no back-and-forth. For recruiters hiring verified Indian talent.',
    canonical: 'https://www.thegridcard.com/verify',
  })
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const normalize = (raw) => {
    let v = (raw || '').trim().toUpperCase().replace(/\s+/g, '')
    // allow pasting just the 8-digit tail
    if (/^\d{8}$/.test(v)) v = `GRID-IN-${new Date().getFullYear()}-${v}`
    return v
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    const v = normalize(value)
    if (!v || !v.includes('GRID')) {
      setError('Enter a valid GRID ID (e.g. GRID-IN-2026-12345678)')
      return
    }
    navigate(`/id/${v}`)
  }

  return (
    <div className="min-h-screen bg-[#0e1b2e] text-white flex flex-col">
      {/* top bar */}
      <div className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <button onClick={() => navigate('/')} className="font-extrabold text-lg tracking-tight">
          GRID<span className="text-[#5dcaa5]">.</span>
        </button>
        <button onClick={() => navigate('/login')} className="text-sm font-bold text-white/70 hover:text-white">Recruiter sign in</button>
      </div>

      {/* hero */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center -mt-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <span className="text-[#5dcaa5]">✔</span>
            <span className="text-xs font-bold tracking-wide uppercase text-white/80">Verified career identity</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
            Check a candidate with one ID
          </h1>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-md mx-auto">
            No PDFs, no back-and-forth. Enter a GRID ID to open a résumé whose education, skills and documents have been verified.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              placeholder="GRID-IN-2026-12345678"
              className="flex-1 bg-white text-[#1A3C6E] placeholder-gray-400 rounded-xl px-5 py-4 font-bold tracking-wide outline-none focus:ring-2 focus:ring-[#6b4edb]"
            />
            <button type="submit"
              className="grid-shine text-white font-bold px-7 py-4 rounded-xl whitespace-nowrap">
              View résumé →
            </button>
          </form>
          {error && <p className="text-[#ffb4b4] text-sm mt-3">{error}</p>}

          {/* trust row */}
          <div className="grid grid-cols-3 gap-3 mt-12 max-w-lg mx-auto">
            {[
              { t: 'Verified education', i: '🎓' },
              { t: 'Skill-tested', i: '🧪' },
              { t: 'Document-checked', i: '📄' },
            ].map((x) => (
              <div key={x.t} className="bg-white/5 border border-white/10 rounded-xl py-4 px-2">
                <div className="text-xl mb-1">{x.i}</div>
                <div className="text-[11px] sm:text-xs font-bold text-white/70 leading-tight">{x.t}</div>
              </div>
            ))}
          </div>

          <p className="text-white/40 text-xs mt-10">
            Contact details are shown only to signed-in recruiters. Powered by GRID.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyLookup
