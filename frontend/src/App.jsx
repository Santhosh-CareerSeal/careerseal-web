import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GridCard from './pages/GridCard'
import CompanyDashboard from './pages/CompanyDashboard'
import JobTracker from './pages/JobTracker'
import Jobs from './pages/Jobs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/grid" element={<GridCard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/tracker" element={<JobTracker />} />
        <Route path="/jobs" element={<Jobs />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App