import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GridCard from './pages/GridCard'
import CompanyDashboard from './pages/CompanyDashboard'
import JobTracker from './pages/JobTracker'
import Jobs from './pages/Jobs'
import CompanyPipeline from './pages/CompanyPipeline'
import ProfileDetails from './pages/ProfileDetails'
import PublicProfile from './pages/PublicProfile'
import Roadmap from './pages/Roadmap'
import Settings from './pages/Settings'
import Exams from './pages/Exams'
import Courses from './pages/Courses'
import CollegeLogin from './pages/CollegeLogin'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import Legal from './pages/Legal'
import VerifyEmailLink from './pages/VerifyEmailLink'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import ResetPassword from './pages/ResetPassword'
import CollegePortal from './pages/CollegePortal'
import NotFound from './pages/NotFound'
import RegisterCompany from './pages/RegisterCompany'
import RegisterStudent from './pages/RegisterStudent'
import AskGrid from './components/AskGrid'
import Landing from './pages/Landing'
import About from './pages/About'
import Contact from './pages/Contact'

// Keeps a single <link rel="canonical"> in the <head> updated to the
// current route, always on the www host. Fixes the "Duplicate without
// user-selected canonical" warning and keeps www/non-www consistent.
function Canonical() {
  const { pathname } = useLocation()
  useEffect(() => {
    const base = 'https://www.thegridcard.com'
    const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
    const href = base + path
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', href)
  }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <Canonical />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/grid" element={<GridCard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/tracker" element={<JobTracker />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/pipeline" element={<CompanyPipeline />} />
        <Route path="/profile-details" element={<ProfileDetails />} />
        <Route path="/profile/:gridNumber" element={<PublicProfile />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/college-login" element={<CollegeLogin />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/verify-email-link" element={<VerifyEmailLink />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/college-portal" element={<CollegePortal />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/register-student" element={<RegisterStudent />} />
      </Routes>
      <AskGrid />
    </BrowserRouter>
  )
}

export default App
