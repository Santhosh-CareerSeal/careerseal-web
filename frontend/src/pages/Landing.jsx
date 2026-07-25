import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

function Landing() {
  const token = localStorage.getItem('token')
  let loggedUser = {}
  try { loggedUser = JSON.parse(localStorage.getItem('user') || '{}') } catch (e) {}
  const loginDest = loggedUser.role === 'company' ? '/company' : loggedUser.role === 'college' ? '/college-portal' : loggedUser.role === 'admin' ? '/admin' : '/dashboard'
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
            <Link to="/register" style={{ background: '#5DCAA5', color: '#1A3C6E', fontSize: '15px', fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: '10px' }}>Create your GRID Card</Link>
            <a href="#how" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', padding: '13px 28px', borderRadius: '10px' }}>See how it works</a>
          </div>
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

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '860px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A3C6E', textAlign: 'center', margin: '0 0 32px' }}>Built for everyone in hiring</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            ['For students', 'A verified GRID Card that proves your skills, an AI career roadmap, and jobs that actually see you. Free.', '/register', 0],
            ['For companies', 'Hire from a pool of skill-verified, document-checked candidates. Less time on fakes, more on real talent.', '/register', 0],
            ['For colleges', 'Manage placements, run drives, and generate NAAC/NBA-ready reports in a click. We onboard you.', 'mailto:support@thegridcard.com', 1]
          ].map(([t, d, link, isMail]) => (
            <div key={t} style={{ border: '1px solid #eef0f3', borderRadius: '14px', padding: '22px' }}>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#1A3C6E', margin: '0 0 8px' }}>{t}</p>
              <p style={{ fontSize: '13px', color: '#6b7480', lineHeight: 1.65, margin: '0 0 14px' }}>{d}</p>
              {isMail ? (
                <a href={link} style={{ fontSize: '13px', fontWeight: 700, color: '#0D7377', textDecoration: 'none' }}>Get in touch →</a>
              ) : (
                <Link to={link} style={{ fontSize: '13px', fontWeight: 700, color: '#0D7377', textDecoration: 'none' }}>Get started →</Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)', padding: '3rem 1.5rem', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px' }}>Your verified career starts here</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 22px' }}>Join GRID free and build a career identity companies trust.</p>
        <Link to="/register" style={{ background: '#5DCAA5', color: '#1A3C6E', fontSize: '15px', fontWeight: 700, textDecoration: 'none', padding: '13px 30px', borderRadius: '10px' }}>Create your GRID Card</Link>
      </div>

      <Footer />
    </div>
  )
}

export default Landing
