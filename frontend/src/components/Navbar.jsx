import { useState } from 'react'
import axios from 'axios'
import API_URL from '../config'
import { useNavigate, useLocation } from 'react-router-dom'

function Navbar({ student, user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'GRID', path: '/grid' },
    { label: 'Exams', path: '/exams' },
    { label: 'Courses', path: '/courses' },
    { label: 'Roadmap', path: '/roadmap' },
    { label: 'Settings', path: '/settings' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (e) { console.error(e) }
    finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('college')
      navigate('/login')
    }
  }

  return (
    <div className="bg-[#1A3C6E] relative z-50">
      {/* Main navbar */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white text-base font-bold">CareerSeal</h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`text-sm font-medium transition-colors ${isActive(item.path) ? 'text-white border-b-2 border-[#0D7377] pb-0.5' : 'text-white/60 hover:text-white'}`}>
              {item.label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          {student?.photoUrl ? (
            <img src={student.photoUrl} className="w-8 h-8 rounded-full object-cover border-2 border-[#0D7377] cursor-pointer" onClick={() => navigate('/profile-details')} />
          ) : (
            <div className="w-8 h-8 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer" onClick={() => navigate('/profile-details')}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {student?.photoUrl ? (
            <img src={student.photoUrl} className="w-8 h-8 rounded-full object-cover border-2 border-[#0D7377]" />
          ) : (
            <div className="w-8 h-8 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-1">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f1e3d] border-t border-white/10">
          {navItems.map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false) }}
              className={`w-full text-left px-5 py-3 text-sm font-medium border-b border-white/5 transition-colors ${isActive(item.path) ? 'text-white bg-[#1A3C6E]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
              {item.label}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default Navbar
