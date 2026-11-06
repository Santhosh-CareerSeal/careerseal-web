import { useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../config'
import { clearCache } from '../utils/apiCache'
import { useNavigate, useLocation } from 'react-router-dom'
import getHomeDest from '../utils/homeDest'
import BottomNav from './BottomNav'

function Navbar({ student, user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  // Reserve space at the bottom on mobile so content clears the app tab bar.
  useEffect(() => {
    document.body.classList.add('has-bottomnav')
    return () => document.body.classList.remove('has-bottomnav')
  }, [])

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
      clearCache() // drop cached API data so the next user starts fresh
      navigate('/login')
    }
  }

  return (
    <div className="relative z-50" style={{ background: 'linear-gradient(135deg,#0c1f3d,#3c3489)' }}>
      {/* Main navbar */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(getHomeDest())}>
          <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#6b4edb"/><path d="M6 11.5l3 3l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white text-base font-bold">GRID</h1>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`text-sm font-medium transition-colors ${isActive(item.path) ? 'text-white border-b-2 border-[#9fe1cb] pb-0.5' : 'text-white/60 hover:text-white'}`}>
              {item.label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 focus:outline-none">
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-[#6b4edb]" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-50">
                <button onClick={() => { setShowDropdown(false); navigate('/profile-details') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#1A3C6E] text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  My Profile
                </button>
                <div className="h-px bg-gray-100 mx-2"></div>
                <button onClick={() => { setShowDropdown(false); handleLogout() }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-white/20 mx-1"></div>
        </div>

        <div className="flex md:hidden items-center">
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex focus:outline-none">
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-[#6b4edb]" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#6b4edb,#0d7377)' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-[70]">
                <button onClick={() => { setShowDropdown(false); navigate('/profile-details') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#1A3C6E] text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  My Profile
                </button>
                <button onClick={() => { setShowDropdown(false); navigate('/courses') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Courses</button>
                <button onClick={() => { setShowDropdown(false); navigate('/settings') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Settings</button>
                <div className="h-px bg-gray-100 mx-2"></div>
                <button onClick={() => { setShowDropdown(false); handleLogout() }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Navbar
