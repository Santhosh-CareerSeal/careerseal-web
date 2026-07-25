import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer style={{ background: '#1A3C6E', padding: '2rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ maxWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#5DCAA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5l9-9" stroke="#1A3C6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>GRID</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>Your career, verified. The GRID Card for every student.</p>
          </div>

          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.05em', margin: '0 0 10px' }}>COMPANY</p>
            <p style={{ margin: '0 0 7px' }}><Link to="/about" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>About</Link></p>
            <p style={{ margin: '0 0 7px' }}><a href="mailto:support@thegridcard.com" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>Contact</a></p>
          </div>

          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.05em', margin: '0 0 10px' }}>REACH US</p>
            <p style={{ margin: '0 0 10px' }}><a href="mailto:support@thegridcard.com" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>support@thegridcard.com</a></p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: 'M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.3a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5zM19 19h-3v-4.7c0-1.1-.4-1.9-1.4-1.9a1.5 1.5 0 00-1.4 1 2 2 0 00-.1.7V19h-3v-9h3v1.3a3 3 0 012.7-1.5c2 0 3.5 1.3 3.5 4.1z', url: '#', label: 'LinkedIn' },
                { icon: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6zm0 7.9a3.1 3.1 0 110-6.2 3.1 3.1 0 010 6.2zm6.1-8.1a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z', url: '#', label: 'Instagram' },
                { icon: 'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z', url: '#', label: 'Facebook' },
                { icon: 'M18.9 2H22l-6.7 7.7L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.2-8.2L2 2h6.3l4.4 5.8zm-1.1 18h1.7L7.3 3.8H5.5z', url: '#', label: 'X' }
              ].map(s => (
                <a key={s.label} href={s.url} aria-label={s.label} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d={s.icon}/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '20px', paddingTop: '14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>© 2026 GRID Card Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
