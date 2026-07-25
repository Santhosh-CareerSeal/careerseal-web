import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

function About() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ background: '#1A3C6E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#5DCAA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5l9-9" stroke="#1A3C6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '17px' }}>GRID</span>
        </Link>
        <Link to="/home" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#0D7377', margin: '0 0 12px' }}>ABOUT GRID</p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 800, color: '#1A3C6E', lineHeight: 1.2, margin: '0 0 20px' }}>Talent is everywhere. Proof of it isn't.</h1>

        <p style={{ fontSize: '15px', color: '#5b6470', lineHeight: 1.85, margin: '0 0 20px' }}>
          GRID — The GRID Card — is a verified career-identity platform for students. We started with a simple frustration: capable students get overlooked every year because a resume can't prove what they can actually do, while companies waste weeks sorting real candidates from inflated claims.
        </p>
        <p style={{ fontSize: '15px', color: '#5b6470', lineHeight: 1.85, margin: '0 0 20px' }}>
          So we built GRID to fix both sides at once. Every student on GRID gets a verified career identity — their GRID Card — where skills are tested through exams and documents are checked, not just claimed. When a recruiter opens a GRID profile, they can trust what they see. And when a company passes on a candidate, they have to say why — so students always know where they stand, instead of disappearing into silence.
        </p>

        <div style={{ background: '#f4f6f9', borderRadius: '14px', padding: '24px', margin: '28px 0' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A3C6E', margin: '0 0 14px' }}>What we stand for</p>
          {[
            ['Verified, not claimed', 'Skills are proven through exams. Documents are checked. Trust is built in.'],
            ['Transparent, always', 'Real feedback on every rejection. No silent black holes.'],
            ['Open to everyone', 'Free for students to start. Talent should never be gated by cost.']
          ].map(([t, d]) => (
            <div key={t} style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D7377', margin: '0 0 2px' }}>{t}</p>
              <p style={{ fontSize: '13px', color: '#6b7480', lineHeight: 1.6, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A3C6E', margin: '28px 0 10px' }}>Get in touch</p>
        <p style={{ fontSize: '14px', color: '#5b6470', lineHeight: 1.7, margin: '0 0 6px' }}>
          Questions, partnerships, or want to bring GRID to your college? We'd love to hear from you.
        </p>
        <a href="mailto:support@thegridcard.com" style={{ fontSize: '14px', fontWeight: 700, color: '#0D7377', textDecoration: 'none' }}>support@thegridcard.com</a>
      </div>

      <Footer />
    </div>
  )
}

export default About
