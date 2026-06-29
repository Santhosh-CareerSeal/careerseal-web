import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <svg width="26" height="26" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="11" fill="#0D7377"/>
          <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span className="text-[#1A3C6E] font-bold text-2xl">CareerSeal</span>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#1A3C6E] text-center mb-2">Join CareerSeal</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Choose how you want to get started</p>

        {/* Student card */}
        <div
          onClick={() => navigate('/register-student')}
          className="bg-white border-2 border-gray-100 hover:border-[#1A3C6E] rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md mb-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1A3C6E]/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-[#1A3C6E]/20 transition-colors">
            🎓
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-[#1A3C6E] mb-1">I am a Student or Fresher</p>
            <p className="text-sm text-gray-400">Build your verified career identity and get discovered by top companies</p>
          </div>
          <span className="text-[#1A3C6E] text-xl font-bold">→</span>
        </div>

        {/* Company card */}
        <div
          onClick={() => navigate('/register-company')}
          className="bg-white border-2 border-gray-100 hover:border-[#0D7377] rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0D7377]/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-[#0D7377]/20 transition-colors">
            🏢
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-[#1A3C6E] mb-1">I am a Company or Recruiter</p>
            <p className="text-sm text-gray-400">Post jobs and find verified talent from thousands of students across India</p>
          </div>
          <span className="text-[#0D7377] text-xl font-bold">→</span>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <span className="text-[#0D7377] font-bold cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  )
}

export default Register
