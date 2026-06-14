import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-white mb-4">CareerSeal</h1>
      <p className="text-[#0D7377] text-xl tracking-widest uppercase">Your career journey starts here</p>
    </div>
  )
}

export default Splash