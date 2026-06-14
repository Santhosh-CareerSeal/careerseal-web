import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GridCard from './pages/GridCard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/grid" element={<GridCard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App