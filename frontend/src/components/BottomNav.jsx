import { useNavigate, useLocation } from 'react-router-dom'

// App-style bottom tab bar, shown on phones only. Desktop keeps the top navbar.
function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isOn = p => pathname === p

  const Tab = ({ path, label, children }) => (
    <button onClick={() => navigate(path)} className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 ${isOn(path) ? 'text-[#6b4edb]' : 'text-gray-400'}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  )

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 flex items-end justify-around px-1"
      style={{ height: '68px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))', boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}>
      <Tab path="/dashboard" label="Home">
        <path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
      </Tab>
      <Tab path="/jobs" label="Jobs">
        <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
      </Tab>
      {/* Center — GRID (elevated) */}
      <button onClick={() => navigate('/grid')} className="flex flex-col items-center flex-1">
        <span className="flex items-center justify-center rounded-full border-4 border-white -mt-7"
          style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#6b4edb,#0d7377)', boxShadow: '0 6px 16px rgba(107,78,219,0.4)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M7 9h10M7 13h6" />
          </svg>
        </span>
        <span className={`text-[10px] font-bold mt-0.5 ${isOn('/grid') ? 'text-[#6b4edb]' : 'text-gray-400'}`}>GRID</span>
      </button>
      <Tab path="/exams" label="Exams">
        <path d="M12 15a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M10 19h-5a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7" />
      </Tab>
      <Tab path="/roadmap" label="Roadmap">
        <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4" /><path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5" />
      </Tab>
    </div>
  )
}

export default BottomNav
