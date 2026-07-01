import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import CollegePortal from './pages/CollegePortal'
import NotFound from './pages/NotFound'
import RegisterCompany from './pages/RegisterCompany'
import RegisterStudent from './pages/RegisterStudent'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
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
        <Route path="/college-portal" element={<CollegePortal />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/register-student" element={<RegisterStudent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
