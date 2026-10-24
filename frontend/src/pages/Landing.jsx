import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const FAQS = [
  { q: 'What is a GRID Card?', a: "A GRID Card is your verified career identity in one place. Your skills are tested through exams and your documents are checked — not just claimed — so your profile means something the moment a recruiter opens it. Every GRID Card carries a unique GRID number and QR code that companies can trust." },
  { q: 'How do I get started on GRID?', a: "Create your GRID Card, add your education, skills and experience, and upload your documents for verification. Then take AI skill exams to prove what you can do. Once your card is ready, publish it and recruiters can find you." },
  { q: 'How does GRID verify my skills?', a: "You take AI-generated skill exams on GRID. Pass one, and that skill shows as 'verified' on your GRID Card. Your uploaded documents — education and experience — are checked too, so recruiters see proof instead of claims." },
  { q: 'How is GRID different from LinkedIn or Naukri?', a: "On other platforms anyone can claim any skill — nothing is checked. GRID verifies what you can actually do, so you stand out in a world full of inflated, AI-written resumes. It's proof, not promises." },
  { q: 'Does GRID guarantee a job?', a: "No platform can honestly promise that. What GRID does is make your real skills visible and trusted, so you get a fair shot — and every rejection comes with real feedback, so you always know where you stand instead of disappearing into silence." },
  { q: 'How do companies hire on GRID?', a: "Companies browse skill-verified, document-checked candidates and hire directly — spending far less time sorting real talent from inflated resumes. Fewer fakes to filter means faster hiring and fewer bad hires." },
  { q: 'Can my college use GRID for placements?', a: "Yes. Colleges can run placement drives on GRID and generate NAAC/NBA-ready reports in a click, while their students get verified GRID Cards that recruiters actually trust." }
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
}

function Landing() {
  const token = localStorage.getItem('token')
  let loggedUser = {}
  try { loggedUser = JSON.parse(localStorage.getItem('user') || '{}') } catch (e) {}
  const loginDest = loggedUser.role === 'company' ? '/company' : loggedUser.role === 'college' ? '/college-portal' : loggedUser.role === 'admin' ? '/admin' : '/dashboard'
  const [openFaq, setOpenFaq] = useState(0)
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ background: '#1A3C6E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#5DCAA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5l9-9" stroke="#1A3C6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '17px' }}>GRID</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {token ? (
            <Link to={loginDest} style={{ background: '#5DCAA5', color: '#1A3C6E', fontSize: '13px', fontWeight: 700, textDecoration: 'none', padding: '8px 16px', borderRadius: '8px' }}>Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '8px 14px' }}>Log in</Link>
              <Link to="/register" style={{ background: '#5DCAA5', color: '#1A3C6E', fontSize: '13px', fontWeight: 700, textDecoration: 'none', padding: '8px 16px', borderRadius: '8px' }}>Get started</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)', padding: '4rem 1.5rem 4.5rem', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#9FE1CB', margin: '0 0 16px' }}>YOUR CAREER. VERIFIED. TRANSPARENT. GUIDED.</p>
          <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 18px' }}>Talent is everywhere.<br/>Proof of it isn't.</h1>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: '0 0 28px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
            GRID gives every student a verified career identity — skills tested, documents checked — so companies can trust what they see, and no one gets overlooked for lack of a fancy resume.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register-student" style={{ background: '#5DCAA5', color: '#1A3C6E', fontSize: '15px', fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: '10px' }}>Create your GRID Card</Link>
            <a href="#how" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', padding: '13px 28px', borderRadius: '10px' }}>See how it works</a>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '18px 0 0' }}>Hiring, or a college? <a href="#audiences" style={{ color: '#9FE1CB', fontWeight: 700, textDecoration: 'none' }}>Choose your path below ↓</a></p>
        </div>
      </div>

      <div id="about" style={{ padding: '3.5rem 1.5rem', maxWidth: '760px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#0D7377', margin: '0 0 10px' }}>WHY GRID EXISTS</p>
        <p style={{ fontSize: '15px', color: '#5b6470', lineHeight: 1.8, margin: '0 0 24px' }}>
          Every year, capable students get passed over because a resume can't prove what they can actually do — and companies waste weeks sorting real from fake. GRID fixes both. We verify every student's skills through exams and check their documents, so a profile means something the moment a recruiter opens it. No inflated resumes. No silent rejections. No one left guessing.
        </p>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {[['Verified', 'skills, not claims'], ['Transparent', 'feedback, always'], ['Free', 'to start, for students']].map(([a, b]) => (
            <div key={a}>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A3C6E', margin: 0 }}>{a}</p>
              <p style={{ fontSize: '12px', color: '#8a929c', margin: '2px 0 0' }}>{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="how" style={{ background: '#f4f6f9', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A3C6E', textAlign: 'center', margin: '0 0 8px' }}>How GRID works</h2>
          <p style={{ fontSize: '14px', color: '#8a929c', textAlign: 'center', margin: '0 0 32px' }}>Three steps to a career identity companies trust.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              ['1', 'Build your profile', 'Add your education, skills and experience. Upload documents for verification.'],
              ['2', 'Prove your skills', 'Take AI-generated skill exams. Pass, and your skills show as verified on your GRID Card.'],
              ['3', 'Get discovered', 'Publish your GRID Card. Companies find you, and every rejection comes with real feedback.']
            ].map(([n, t, d]) => (
              <div key={n} style={{ background: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #eef0f3' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#E1F5EE', color: '#0D7377', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>{n}</div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A3C6E', margin: '0 0 6px' }}>{t}</p>
                <p style={{ fontSize: '13px', color: '#6b7480', lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="audiences" style={{ padding: '3.5rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A3C6E', textAlign: 'center', margin: '0 0 8px' }}>Find your path</h2>
        <p style={{ fontSize: '14px', color: '#8a929c', textAlign: 'center', margin: '0 0 32px' }}>GRID works for everyone in hiring. Pick the one that's you.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { icon: 'M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 6v1h18v-1c0-3.5-4-6-9-6z', tint: '#E1F5EE', iconColor: '#0F6E56', title: 'For students', desc: 'Prove your skills, get a verified GRID Card, and be seen by companies that trust it.', cta: 'Join as a student', to: '/register-student' },
            { icon: 'M3 21V7l6-4 6 4v14M9 21v-4h2v4M17 21V11l4 2v8M6 9h.01M6 12h.01M6 15h.01', tint: '#E6F1FB', iconColor: '#185FA5', title: 'For companies', desc: 'Hire skill-verified, document-checked candidates. Spend less time sorting out fakes.', cta: 'Hire on GRID', to: '/register-company' },
            { icon: 'M12 3L2 8l10 5 10-5-10-5zM4 10v6c0 1 3.5 3 8 3s8-2 8-3v-6', tint: '#EEEDFE', iconColor: '#3C3489', title: 'For colleges', desc: 'Run placements and drives, and generate NAAC/NBA-ready reports in a click.', cta: 'Bring GRID to your college', to: '/college-login' }
          ].map(a => (
            <div key={a.title} style={{ background: '#fff', border: '1px solid #eef0f3', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: a.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
              </span>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#1A3C6E', margin: '0 0 8px' }}>{a.title}</p>
              <p style={{ fontSize: '13px', color: '#6b7480', lineHeight: 1.65, margin: '0 0 18px', flex: 1 }}>{a.desc}</p>
              <Link to={a.to} style={{ display: 'inline-block', textAlign: 'center', background: '#1A3C6E', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none', padding: '11px 16px', borderRadius: '9px' }}>{a.cta}</Link>
            </div>
          ))}
        </div>
      </div>

      <div id="faq" style={{ background: '#f4f6f9', padding: '3.5rem 1.5rem' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#0D7377', textAlign: 'center', margin: '0 0 10px' }}>COMMON QUESTIONS</p>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A3C6E', textAlign: 'center', margin: '0 0 8px' }}>Questions, answered</h2>
          <p style={{ fontSize: '14px', color: '#8a929c', textAlign: 'center', margin: '0 0 32px' }}>Everything students, companies and colleges ask before they start.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={i} style={{ background: '#fff', border: `1px solid ${open ? '#dce7ee' : '#eef0f3'}`, borderRadius: '14px', overflow: 'hidden', boxShadow: open ? '0 6px 20px rgba(26,60,110,.06)' : 'none' }}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '16px', fontWeight: 700, color: '#1A3C6E', fontFamily: 'inherit' }}>
                    <span>{f.q}</span>
                    <span style={{ flex: '0 0 auto', width: '26px', height: '26px', borderRadius: '50%', background: open ? '#5DCAA5' : '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s, background .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </span>
                  </button>
                  {open && (
                    <div style={{ padding: '0 20px 20px', fontSize: '14px', lineHeight: 1.7, color: '#6b7480' }}>{f.a}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)', padding: '3rem 1.5rem', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px' }}>Your verified career starts here</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 22px' }}>Join GRID free and build a career identity companies trust.</p>
        <Link to="/register-student" style={{ background: '#5DCAA5', color: '#1A3C6E', fontSize: '15px', fontWeight: 700, textDecoration: 'none', padding: '13px 30px', borderRadius: '10px' }}>Create your GRID Card</Link>
      </div>

      <Footer />
    </div>
  )
}

export default Landing
