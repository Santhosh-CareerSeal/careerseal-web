import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import LoginChooser from './pages/LoginChooser'
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

// Per-route SEO: sets <title>, meta description, canonical, and OG/Twitter
// title+description based on the current path. One central place for all
// public pages; private/app routes fall back to the default.
const SITE = 'https://www.thegridcard.com'
const DEFAULT_META = {
  title: 'GRID — Your Career. Verified. Transparent. Guided.',
  description: 'GRID gives Indian students a verified GRID Card — a skill-tested resume with QR code. Take exams, prove your skills, and land better jobs. Free to join.'
}
const ROUTE_META = {
  '/': DEFAULT_META,
  '/home': DEFAULT_META,
  '/about': {
    title: 'About GRID — Verified Career Identity for Indian Students',
    description: 'GRID is building a verified career identity for India — skill-tested, transparent profiles that help students and freshers get hired on proof, not just claims.'
  },
  '/contact': {
    title: 'Contact GRID',
    description: 'Get in touch with the GRID team — questions about your GRID Card, verification, hiring, or partnering your college with GRID.'
  },
  '/register': {
    title: 'Join GRID — Create Your Verified GRID Card',
    description: 'Sign up free and build your verified GRID Card. Take skill exams, prove what you can do, and get discovered by recruiters. Free for students.'
  },
  '/login': {
    title: 'Log in to GRID',
    description: 'Log in to your GRID account to manage your verified GRID Card, exams, and career roadmap.'
  },
  '/privacy': {
    title: 'Privacy Policy — GRID',
    description: 'How GRID collects, uses, and protects your data. Read the GRID privacy policy.'
  },
  '/terms': {
    title: 'Terms of Service — GRID',
    description: 'The terms that govern your use of GRID and the GRID Card.'
  }
}

function setMetaTag(key, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const meta = ROUTE_META[pathname] || DEFAULT_META
    const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
    const url = SITE + path

    document.title = meta.title
    setMetaTag('description', meta.description)
    setMetaTag('og:title', meta.title, 'property')
    setMetaTag('og:description', meta.description, 'property')
    setMetaTag('og:url', url, 'property')
    setMetaTag('twitter:title', meta.title)
    setMetaTag('twitter:description', meta.description)
    setMetaTag('twitter:url', url)

    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', url)
  }, [pathname])
  return null
}

// Scroll behaviour on navigation: jump to the top when moving forward to a
// new page, but let the browser restore the previous position on back/forward
// (POP), so returning to the homepage resumes where you'd scrolled.
function ScrollManager() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  useEffect(() => {
    if (navType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navType])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <div className="grid-watermark" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
          <defs>
            <pattern id="gw-minor" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M54 0H0V54" fill="none" stroke="#1a3c6e" strokeWidth="1" strokeOpacity="0.05" />
            </pattern>
            <pattern id="gw-major" width="270" height="270" patternUnits="userSpaceOnUse">
              <path d="M270 0H0V270" fill="none" stroke="#1a3c6e" strokeWidth="1.2" strokeOpacity="0.09" />
            </pattern>
            <radialGradient id="gw-glow" cx="82%" cy="16%" r="55%">
              <stop offset="0%" stopColor="#6b4edb" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#6b4edb" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#gw-minor)" />
          <rect width="1200" height="800" fill="url(#gw-major)" />
          <rect width="1200" height="800" fill="url(#gw-glow)" />
          <g stroke="#1a3c6e" strokeOpacity="0.07" fill="none" strokeWidth="1.1">
            <circle cx="1120" cy="90" r="240" />
            <ellipse cx="1120" cy="90" rx="80" ry="240" />
            <ellipse cx="1120" cy="90" rx="160" ry="240" />
            <ellipse cx="1120" cy="90" rx="240" ry="80" />
            <ellipse cx="1120" cy="90" rx="240" ry="160" />
            <line x1="880" y1="90" x2="1360" y2="90" />
            <line x1="1120" y1="-150" x2="1120" y2="330" />
          </g>
        </svg>
      </div>
      <Seo />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<LoginChooser />} />
        <Route path="/student-login" element={<Login fixedRole="student" />} />
        <Route path="/company-login" element={<Login fixedRole="company" />} />
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
