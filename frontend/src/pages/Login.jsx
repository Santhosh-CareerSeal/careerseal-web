import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center px-8">
      <h1 className="text-4xl font-bold text-white mb-2">CareerSeal</h1>
      <p className="text-[#0D7377] text-sm mb-10 tracking-widest uppercase">Your career journey starts here</p>
      <div className="flex bg-white/10 rounded-2xl p-1 mb-8 w-full max-w-sm">
        <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isLogin ? 'bg-white text-[#1A3C6E]' : 'text-white'}`}>Login</button>
        <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${!isLogin ? 'bg-white text-[#1A3C6E]' : 'text-white'}`}>Sign Up</button>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input type="email" placeholder="Email Address" className="bg-white/10 text-white placeholder-white/50 py-4 px-6 rounded-2xl outline-none focus:bg-white/20" />
        <input type="password" placeholder="Password" className="bg-white/10 text-white placeholder-white/50 py-4 px-6 rounded-2xl outline-none focus:bg-white/20" />
        <button onClick={() => navigate('/dashboard')} className="bg-[#0D7377] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#0a5f63] transition-colors mt-2">{isLogin ? 'Login' : 'Create Account'}</button>
      </div>
    </div>
  )
}

export default Login
