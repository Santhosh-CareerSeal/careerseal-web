import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

function VerifyEmailLink() {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      if (!token) {
        setStatus('error')
        setMessage('Verification link is invalid or incomplete.')
        return
      }
      try {
        const res = await axios.get(`${API_URL}/api/auth/verify-email-link?token=${token}`)
        setStatus('success')
        setMessage(res.data.message || 'Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.')
      }
    }
    verify()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#0D7377] border-t-transparent animate-spin"></div>
            <h2 className="text-xl font-bold text-[#1A3C6E] mb-2">Verifying your email...</h2>
            <p className="text-gray-500 text-sm">Just a moment please.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A3C6E] mb-2">Email Verified! ✓</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">
              Go to Dashboard →
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A3C6E] mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailLink
