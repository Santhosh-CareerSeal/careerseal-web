import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#060e1f' }}>
      <style>{`
        @keyframes pulse1{0%{opacity:0.6;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(2)}}
        @keyframes pulse2{0%{opacity:0.4;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        .ring{position:absolute;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)}
      `}</style>

      <div style={{ position: 'relative', width: '300px', height: '300px', marginBottom: '32px' }}>
        <div className="ring" style={{ width: '200px', height: '200px', border: '1.5px solid #0D7377', animation: 'pulse1 2.5s ease-out infinite' }}></div>
        <div className="ring" style={{ width: '260px', height: '260px', border: '1.5px solid #EF9F27', animation: 'pulse2 2.5s ease-out infinite 0.8s' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', animation: 'float 3s ease-in-out infinite' }}>
          <p style={{ fontSize: '80px', fontWeight: '900', color: 'white', margin: 0, lineHeight: 1 }}>404</p>
          <p style={{ fontSize: '14px', color: '#0D7377', fontWeight: '600', margin: '8px 0 0', letterSpacing: '3px' }}>PAGE NOT FOUND</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>CareerSeal</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isLoggedIn ? (
            <button onClick={() => navigate('/dashboard')}
              style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Go to Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/register')}
              style={{ background: '#0D7377', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Get Started
            </button>
          )}
          <button onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            Go Back
          </button>
          {!isLoggedIn && (
            <button onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotFound
