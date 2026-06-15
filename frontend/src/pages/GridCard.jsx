import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function GridCard() {
  const navigate = useNavigate()
  const [gridCard, setGridCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState('')
  const [verified, setVerified] = useState({ aadhaar: false, digilocker: false })
  const [education, setEducation] = useState('')
  const [skills, setSkills] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')

  const fetchGridCard = async () => {
    try {
      const response = await axios.get('https://careerseal-web.onrender.com/api/grid', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGridCard(response.data.gridCard)
      setEducation(response.data.gridCard.education !== 'Not verified yet' ? response.data.gridCard.education : '')
      setSkills(response.data.gridCard.skills !== 'Not added yet' ? response.data.gridCard.skills : '')
    } catch (error) {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchGridCard()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await axios.put('https://careerseal-web.onrender.com/api/grid/profile', { education, skills }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Profile updated!')
      fetchGridCard()
    } catch (error) {
      setMessage('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async (type) => {
    setVerifying(type)
    try {
      await axios.post(`https://careerseal-web.onrender.com/api/grid/verify/${type}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVerified(prev => ({ ...prev, [type]: true }))
    } catch (error) {
      console.error(error)
    } finally {
      setVerifying('')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-[#1A3C6E] text-xl font-bold">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1A3C6E] px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">CareerSeal</h1>
        <button onClick={() => navigate('/dashboard')} className="text-white/70 text-sm">Dashboard</button>
      </div>
      <div className="px-6 py-6 max-w-sm mx-auto">
        <div className="bg-[#1A3C6E] rounded-3xl p-8 shadow-xl mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-white text-2xl font-bold">{gridCard?.name}</h2>
              <p className="text-[#0D7377]">{gridCard?.email}</p>
            </div>
            <div className="w-12 h-12 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-xl">
              {gridCard?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs">Education</p>
              <p className="text-white font-bold">{gridCard?.education}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs">Skills</p>
              <p className="text-white font-bold">{gridCard?.skills}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs">GRID Number</p>
              <p className="text-white font-bold text-sm">{gridCard?.gridNumber}</p>
            </div>
          </div>
          <div className="bg-[#0D7377] rounded-xl p-3 text-center">
            <p className="text-white font-bold tracking-widest text-sm">CAREERSEAL VERIFIED</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h3 className="text-[#1A3C6E] font-bold mb-4">Update Profile</h3>
          {message ? <p className="text-green-600 text-sm mb-3">{message}</p> : null}
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Education (e.g. B.Tech CSE, MIT)" value={education} onChange={e => setEducation(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm" />
            <input type="text" placeholder="Skills (e.g. React, Node.js)" value={skills} onChange={e => setSkills(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm" />
            <button onClick={handleSaveProfile} disabled={saving} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold text-sm">{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A3C6E] font-bold mb-4">Verification Status</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-[#1A3C6E]">Aadhaar eKYC</p>
                <p className="text-gray-400 text-xs">Identity verification</p>
              </div>
              {verified.aadhaar ? <span className="text-green-600 font-bold text-sm">Verified</span> :
                <button onClick={() => handleVerify('aadhaar')} disabled={verifying === 'aadhaar'} className="bg-[#0D7377] text-white px-4 py-2 rounded-lg text-xs font-bold">{verifying === 'aadhaar' ? 'Verifying...' : 'Verify'}</button>}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-[#1A3C6E]">DigiLocker</p>
                <p className="text-gray-400 text-xs">Education documents</p>
              </div>
              {verified.digilocker ? <span className="text-green-600 font-bold text-sm">Verified</span> :
                <button onClick={() => handleVerify('digilocker')} disabled={verifying === 'digilocker'} className="bg-[#0D7377] text-white px-4 py-2 rounded-lg text-xs font-bold">{verifying === 'digilocker' ? 'Verifying...' : 'Verify'}</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GridCard
