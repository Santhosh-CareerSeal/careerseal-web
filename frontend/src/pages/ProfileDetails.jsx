import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import { supabase } from '../supabaseClient'

function ProfileDetails() {
  const navigate = useNavigate()

  const [contactNumber, setContactNumber] = useState('')
  const [address, setAddress] = useState('')
  const [schoolCollege, setSchoolCollege] = useState('')
  const [education, setEducation] = useState('')
  const [skills, setSkills] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [workExperience, setWorkExperience] = useState('')
  const [preferredWorkLocation, setPreferredWorkLocation] = useState('')
  const [pfAccountNumber, setPfAccountNumber] = useState('')

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const uploadPhoto = async () => {
    if (!photoFile) return null
    setUploadingPhoto(true)
    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, photoFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName)
      return data.publicUrl
    } catch (err) {
      console.error(err)
      return null
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!education.trim() || !contactNumber.trim()) {
      setError('Please fill at least your contact number and education')
      return
    }
    setLoading(true)
    try {
      const photoUrl = photoFile ? await uploadPhoto() : null
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/profile/complete`, {
        contactNumber,
        address,
        schoolCollege,
        education,
        skills,
        hobbies,
        workExperience,
        preferredWorkLocation,
        pfAccountNumber,
        photoUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 mb-2">
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="11" fill="#0D7377" />
            <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <h1 className="text-2xl font-bold text-[#1A3C6E]">CareerSeal</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">One last step before you start exploring opportunities</p>

        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A3C6E] mb-1">Complete your profile</h2>
          <p className="text-gray-500 text-sm mb-6">This helps companies discover you and powers your GRID card.</p>

          {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">No photo</span>
              )}
            </div>
            <label className="text-[#0D7377] text-sm font-bold cursor-pointer">
              {photoFile ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <div className="flex flex-col gap-4">

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Contact Number</label>
              <input type="tel" placeholder="e.g. 9876543210" value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Address</label>
              <input type="text" placeholder="House no, street, city, state, pincode" value={address} onChange={e => setAddress(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">School / College</label>
              <input type="text" placeholder="e.g. MIT" value={schoolCollege} onChange={e => setSchoolCollege(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Education</label>
              <input type="text" placeholder="e.g. B.Tech CSE, 2025" value={education} onChange={e => setEducation(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Skills</label>
              <input type="text" placeholder="e.g. React, Node.js, Python" value={skills} onChange={e => setSkills(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Hobbies</label>
              <input type="text" placeholder="e.g. Chess, Photography, Reading" value={hobbies} onChange={e => setHobbies(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Work Experience (if any)</label>
              <textarea placeholder="e.g. Frontend Intern at Acme Corp, Jan-Jun 2025" value={workExperience} onChange={e => setWorkExperience(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full h-20" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Preferred Work Location</label>
              <input type="text" placeholder="e.g. Bangalore, Remote" value={preferredWorkLocation} onChange={e => setPreferredWorkLocation(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">PF Account Number (if any)</label>
              <input type="text" placeholder="e.g. KA/BNG/1234567/000/0000000" value={pfAccountNumber} onChange={e => setPfAccountNumber(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full" />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
              Aadhaar verification is handled separately on your GRID Card page after this step.
            </div>

            <button onClick={handleSubmit} disabled={loading || uploadingPhoto} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors mt-2">
              {loading || uploadingPhoto ? 'Saving...' : 'Continue to Dashboard'}
            </button>

            <button onClick={handleSkip} className="text-gray-400 text-sm font-bold py-1">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileDetails
