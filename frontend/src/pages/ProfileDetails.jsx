import { useState, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../utils/cropImage'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import { supabase } from '../supabaseClient'

const TABS = ['Personal', 'Education', 'Profession', 'Skills', 'Others', 'Documents']

function ProfileDetails() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showGridInfo, setShowGridInfo] = useState(false)
  const [verifiedSkills, setVerifiedSkills] = useState([])
  const [colleges, setColleges] = useState([])
  const [gridMsg, setGridMsg] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [emailVerified, setEmailVerified] = useState(true)
  const [resendMsg, setResendMsg] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [updatesRemaining, setUpdatesRemaining] = useState(3)

  const [form, setForm] = useState({
    legalFullName: '',
    photoUrl: '', dateOfBirth: '', gender: '', contactNumber: '',
    address: '', city: '', state: '', pincode: '',
    schoolName: '', schoolBoard: '', schoolPassingYear: '', schoolPercentage: '',
    twelfthSchoolName: '', twelfthBoard: '', twelfthPassingYear: '', twelfthPercentage: '',
    collegeName: '', collegeId: '', degree: '', branch: '', collegePassingYear: '', collegeCGPA: '',
    pgCollegeName: '', pgDegree: '', pgBranch: '', pgPassingYear: '', pgCGPA: '',
    workStatus: '', currentCompany: '', jobTitle: '', workExperience: '',
    preferredJobType: '', preferredWorkLocation: '', noticePeriod: '', expectedSalary: '',
    technicalSkills: '', softSkills: '', languagesKnown: '', certifications: '', toolsAndSoftware: '',
    hobbies: '', pfAccountNumber: '', aadhaarNumber: '', panNumber: '', passportNumber: '',
    digiLockerStatus: '', bio: ''
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const REQUIRED_FIELDS = [
    'legalFullName', 'photoUrl', 'dateOfBirth', 'gender', 'contactNumber', 'city',
    'schoolName', 'schoolPassingYear', 'schoolPercentage',
    'twelfthSchoolName', 'twelfthPassingYear', 'twelfthPercentage',
    'collegeName', 'degree', 'branch', 'collegePassingYear',
    'workStatus', 'technicalSkills'
  ]
  const [documents, setDocuments] = useState([])
  const filledCount = REQUIRED_FIELDS.filter(f => (form[f] || '').toString().trim() !== '').length
  const hasVerifiedSkill = Array.isArray(verifiedSkills) && verifiedSkills.some(s => s && (s.passed || s.status === 'passed' || s.verified))
  const hasDocument = documents.length > 0
  const fieldsPct = (filledCount / REQUIRED_FIELDS.length) * 95
  const completionPct = Math.round(fieldsPct + (hasVerifiedSkill ? 2.5 : 0) + (hasDocument ? 2.5 : 0))

  const TAB_FIELDS = [
    ['legalFullName', 'photoUrl', 'dateOfBirth', 'gender', 'contactNumber', 'city'],
    ['schoolName', 'schoolPassingYear', 'schoolPercentage', 'twelfthSchoolName', 'twelfthPassingYear', 'twelfthPercentage', 'collegeName', 'degree', 'branch', 'collegePassingYear'],
    ['workStatus'],
    ['technicalSkills'],
    [],
    []
  ]
  const tabComplete = (i) => {
    if (i === 4) return true
    if (i === 5) return documents.length > 0
    const fields = TAB_FIELDS[i] || []
    if (!fields.length) return false
    return fields.every(f => (form[f] || '').toString().trim() !== '')
  }

  const [docUploading, setDocUploading] = useState('')
  const [docMsg, setDocMsg] = useState('')
  const [docErrors, setDocErrors] = useState({})
  const setDocError = (type, msg) => setDocErrors(prev => ({ ...prev, [type]: msg }))
  const [docLabels, setDocLabels] = useState({})

  const DOC_TYPES = [
    { key: 'tenth', label: '10th Marksheet', multiple: false },
    { key: 'twelfth', label: '12th Marksheet', multiple: false },
    { key: 'degree', label: 'Degree Marksheet / Certificate', multiple: false },
    { key: 'pg', label: 'Post-Graduate Documents', multiple: false },
    { key: 'experience', label: 'Experience Letter', multiple: true },
    { key: 'epfo', label: 'EPFO / EPF Passbook', multiple: true },
    { key: 'id_proof', label: 'ID Proof', multiple: false },
    { key: 'other', label: 'Other', multiple: true }
  ]
  const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png']

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/documents/my`, { headers: { Authorization: `Bearer ${token}` } })
      setDocuments(res.data.documents || [])
    } catch (e) { setDocuments([]) }
  }

  const handleDocUpload = async (docType, file, label) => {
    if (!file) return
    setDocMsg('')
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) { setDocError(docType, 'Only PDF, JPG, or PNG files are allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setDocError(docType, 'File must be under 5 MB'); return }
    setDocUploading(docType)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('docType', docType)
      if (label) fd.append('label', label)
      await axios.post(`${API_URL}/api/documents/upload`, fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      await fetchDocuments()
      setDocErrors(prev => ({ ...prev, [docType]: '' }))
      setDocMsg('Uploaded successfully')
    } catch (e) { setDocError(docType, e.response?.data?.message || 'Upload failed') }
    finally { setDocUploading('') }
  }

  const handleDocView = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/documents/${id}/view`, { headers: { Authorization: `Bearer ${token}` } })
      window.open(res.data.url, '_blank')
    } catch (e) { setDocMsg('Could not open document') }
  }

  const handleDocDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      await fetchDocuments()
    } catch (e) { setDocMsg('Could not delete') }
  }

  const handleResendVerification = async () => {
    setResendMsg('Sending...')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await axios.post(`${API_URL}/api/auth/resend-verification`, { email: user.email })
      setResendMsg('Verification email sent! Check your inbox.')
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to send. Try again.')
    }
  }

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const res = await axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } })
        setEmailVerified(res.data.emailVerified || false)
        const s = res.data.student
        if (s) {
          setForm(f => ({
            ...f,
            legalFullName: s.legalFullName || '',
            photoUrl: s.photoUrl || '', dateOfBirth: s.dateOfBirth || '',
            gender: s.gender || '', contactNumber: s.contactNumber || '',
            address: s.address || '', city: s.city || '', state: s.state || '', pincode: s.pincode || '',
            schoolName: s.schoolName || '', schoolBoard: s.schoolBoard || '',
            schoolPassingYear: s.schoolPassingYear || '', schoolPercentage: s.schoolPercentage || '',
            twelfthSchoolName: s.twelfthSchoolName || '', twelfthBoard: s.twelfthBoard || '',
            twelfthPassingYear: s.twelfthPassingYear || '', twelfthPercentage: s.twelfthPercentage || '',
            collegeName: s.collegeName || '', collegeId: s.collegeId || '', degree: s.degree || '',
            branch: s.branch || '', collegePassingYear: s.collegePassingYear || '', collegeCGPA: s.collegeCGPA || '',
            pgCollegeName: s.pgCollegeName || '', pgDegree: s.pgDegree || '',
            pgBranch: s.pgBranch || '', pgPassingYear: s.pgPassingYear || '', pgCGPA: s.pgCGPA || '',
            workStatus: s.workStatus || '', currentCompany: s.currentCompany || '',
            jobTitle: s.jobTitle || '', workExperience: s.workExperience || '',
            preferredJobType: s.preferredJobType || '', preferredWorkLocation: s.preferredWorkLocation || '',
            noticePeriod: s.noticePeriod || '', expectedSalary: s.expectedSalary || '',
            technicalSkills: s.technicalSkills || '', softSkills: s.softSkills || '',
            languagesKnown: s.languagesKnown || '', certifications: s.certifications || '',
            toolsAndSoftware: s.toolsAndSoftware || '',
            hobbies: s.hobbies || '', pfAccountNumber: s.pfAccountNumber || '',
            aadhaarNumber: s.aadhaarNumber || '', panNumber: s.panNumber || '',
            passportNumber: s.passportNumber || '', digiLockerStatus: s.digiLockerStatus || '',
            bio: s.bio || ''
          }))
          if (s.photoUrl) setPhotoPreview(s.photoUrl)
          const currentMonth = new Date().getMonth()
          const used = s.gridLastUpdatedMonth === currentMonth ? s.gridUpdatesThisMonth : 0
          setUpdatesRemaining(3 - used)
        }
        try {
          const examRes = await axios.get(`${API_URL}/api/exams`, { headers: { Authorization: `Bearer ${token}` } })
          setVerifiedSkills(examRes.data.skillStatus || [])
        } catch (e) { console.error(e) }
        try { await fetchDocuments() } catch (e) { console.error(e) }
        try {
          const collegeRes = await axios.get(`${API_URL}/api/college/list`)
          setColleges(collegeRes.data.colleges || [])
        } catch (e) { console.error(e) }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate before opening cropper
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, or WEBP images are allowed')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB')
        return
      }
      setError('')
      setImageToCrop(URL.createObjectURL(file))
      setCropModalOpen(true)
    }
    e.target.value = '' // reset so same file can be re-selected
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropSave = async () => {
    try {
      const { file, url } = await getCroppedImg(imageToCrop, croppedAreaPixels)
      setPhotoFile(file)
      setPhotoPreview(url)
      setCropModalOpen(false)
      setImageToCrop(null)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
    } catch (e) {
      setError('Could not crop image. Please try another.')
      setCropModalOpen(false)
    }
  }

  const handleCropCancel = () => {
    setCropModalOpen(false)
    setImageToCrop(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
  }

  const uploadPhoto = async () => {
    if (!photoFile) return form.photoUrl
    // Security: validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(photoFile.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed')
      return form.photoUrl
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (photoFile.size > maxSize) {
      setError('Image must be smaller than 5MB')
      return form.photoUrl
    }
    setUploadingPhoto(true)
    try {
      const fileExt = photoFile.name.split('.').pop().toLowerCase()
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anon'
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('profile-photos').upload(fileName, photoFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: photoFile.type
      })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName)
      return data.publicUrl
    } catch (e) { console.error(e); return form.photoUrl }
    finally { setUploadingPhoto(false) }
  }

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const photoUrl = photoFile ? await uploadPhoto() : form.photoUrl
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/profile/complete`, { ...form, photoUrl }, { headers: { Authorization: `Bearer ${token}` } })
      setSuccess('Profile saved successfully!')
      setForm(f => ({ ...f, photoUrl }))
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong') }
    finally { setSaving(false) }
  }

  const handleMoveToGrid = async () => {
    setSaving(true)
    try {
      const photoUrl = photoFile ? await uploadPhoto() : form.photoUrl
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/profile/complete`, { ...form, photoUrl }, { headers: { Authorization: `Bearer ${token}` } })
      const res = await axios.post(`${API_URL}/api/profile/move-to-grid`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setUpdatesRemaining(res.data.updatesRemaining)
      setGridMsg(`Published to GRID! ${res.data.updatesRemaining} update${res.data.updatesRemaining !== 1 ? 's' : ''} remaining this month.`)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (e) {
      setGridMsg(e.response?.data?.message || 'Could not publish to GRID')
    } finally { setSaving(false) }
  }

  const inputClass = "border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full"
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block"
  const sectionTitle = "text-base font-bold text-[#1A3C6E] mb-4 pl-3 border-l-4 border-[#0D7377] leading-tight"

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading profile...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-[#1A3C6E] text-lg">Adjust your photo</h3>
              <p className="text-xs text-gray-400">Drag to reposition, pinch or slide to zoom</p>
            </div>
            <div className="relative w-full" style={{ height: '320px', background: '#1a1a1a' }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-400">Zoom</span>
                <input type="range" min={1} max={3} step={0.1} value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#0D7377]" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCropCancel}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleCropSave}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A3C6E] text-white font-bold text-sm hover:bg-[#0D7377]">
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-[#1A3C6E] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white font-bold text-lg">GRID</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white/60 text-sm hover:text-white">← Dashboard</button>
          <button onClick={() => navigate('/roadmap')} className="text-[#5DCAA5] text-sm font-bold hover:text-white transition-colors">AI Roadmap →</button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="profileHero rounded-2xl p-5 mb-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1A3C6E, #0D7377)' }}>
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white/25">
            {(photoPreview || form.photoUrl) ? (
              <img src={photoPreview || form.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">{(form.legalFullName || 'G').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-xl truncate">{form.legalFullName || 'My Profile'}</p>
            <p className="text-white/60 text-xs mt-0.5">{form.degree ? form.degree + (form.branch ? ' · ' + form.branch : '') : 'Complete your profile to get discovered by companies'}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-white/15 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{completionPct}% complete</span>
              {emailVerified && <span className="bg-[#5DCAA5]/20 text-[#5DCAA5] text-[10px] font-bold px-2 py-0.5 rounded-full">Email verified</span>}
              {hasVerifiedSkill && <span className="bg-[#5DCAA5]/20 text-[#5DCAA5] text-[10px] font-bold px-2 py-0.5 rounded-full">Skill verified</span>}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[#1A3C6E]">Profile {completionPct}% complete</p>
            <p className="text-xs text-gray-400">{filledCount}/{REQUIRED_FIELDS.length} details{!hasVerifiedSkill ? ' · skill pending' : ''}{!hasDocument ? ' · document pending' : ''}</p>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: completionPct + '%', background: completionPct === 100 ? '#0D7377' : 'linear-gradient(90deg, #1A3C6E, #5DCAA5)' }}></div>
          </div>
          <p className="text-xs mt-2 font-medium" style={{ color: completionPct === 100 ? '#0D7377' : '#9ca3af' }}>
            {completionPct === 100 ? 'Your profile is complete — publish it to GRID!' : completionPct >= 60 ? 'Almost there — verified profiles get noticed faster.' : 'A complete profile is 3x more likely to be discovered by recruiters.'}
          </p>
        </div>

        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 mb-6 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${activeTab === i ? 'bg-[#1A3C6E] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
              {tabComplete(i) && <span className={activeTab === i ? 'text-[#5DCAA5]' : 'text-[#0D7377]'}>✓</span>}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-700 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-green-700 text-sm">{success}</div>}
        {gridMsg && <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-blue-700 text-sm">{gridMsg}</div>}

        <div className="bg-white rounded-2xl p-6 shadow-sm">

          {/* PERSONAL */}
          {activeTab === 0 && (
            <div className="flex flex-col gap-4">
              <p className={sectionTitle}>👤 Personal details</p>

              <div className="flex flex-col items-center mb-2">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3">
                  {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs text-center px-2">No photo</span>}
                </div>
                <label className="text-[#0D7377] text-sm font-bold cursor-pointer">
                  {photoFile ? 'Change photo' : 'Upload photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className={labelClass}>Legal full name <span className="text-red-400">*</span></label>
                <input type="text" placeholder="Full name as on Aadhaar / PAN / Passport" value={form.legalFullName} onChange={e => set('legalFullName', e.target.value)} className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Enter your name exactly as it appears on your government ID</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date of birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputClass}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Contact number</label>
                <div className="flex gap-2">
                  <div className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50">+91</div>
                  <input type="tel" placeholder="Mobile number" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} className={`${inputClass} flex-1`} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Address</label>
                <input type="text" placeholder="House no, street name" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input type="text" placeholder="Pincode" value={form.pincode} onChange={e => set('pincode', e.target.value)} className={inputClass} />
                </div>
              </div>

              <button onClick={() => setActiveTab(1)} className="bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors mt-2">
                Next: Education →
              </button>
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === 1 && (
            <div className="flex flex-col gap-6">

              <div>
                <p className={sectionTitle}>📘 10th standard</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>School name</label><input type="text" placeholder="e.g. St. Mary's High School" value={form.schoolName} onChange={e => set('schoolName', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Board</label>
                    <select value={form.schoolBoard} onChange={e => set('schoolBoard', e.target.value)} className={inputClass}>
                      <option value="">Select board</option>
                      <option>CBSE</option><option>ICSE</option><option>State Board</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Passing year</label><input type="text" placeholder="e.g. 2018" value={form.schoolPassingYear} onChange={e => set('schoolPassingYear', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Percentage / CGPA</label><input type="text" placeholder="e.g. 85%" value={form.schoolPercentage} onChange={e => set('schoolPercentage', e.target.value)} className={inputClass} /></div>
                </div>
              </div>

              <div>
                <p className={sectionTitle}>📗 12th standard</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>School / College name</label><input type="text" placeholder="e.g. Delhi Public School" value={form.twelfthSchoolName} onChange={e => set('twelfthSchoolName', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Board</label>
                    <select value={form.twelfthBoard} onChange={e => set('twelfthBoard', e.target.value)} className={inputClass}>
                      <option value="">Select board</option>
                      <option>CBSE</option><option>ICSE</option><option>State Board</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Passing year</label><input type="text" placeholder="e.g. 2020" value={form.twelfthPassingYear} onChange={e => set('twelfthPassingYear', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Percentage / CGPA</label><input type="text" placeholder="e.g. 88%" value={form.twelfthPercentage} onChange={e => set('twelfthPercentage', e.target.value)} className={inputClass} /></div>
                </div>
              </div>

              <div>
                <p className={sectionTitle}>🎓 Graduation</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>College / University</label>
                    <select value={form.collegeId} onChange={e => {
                      const selected = colleges.find(c => String(c.id) === e.target.value)
                      set('collegeId', e.target.value)
                      set('collegeName', selected ? selected.collegeName : form.collegeName)
                    }} className={inputClass}>
                      <option value="">Select your college</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.collegeName}{c.city ? ` — ${c.city}` : ''}</option>
                      ))}
                      <option value="other">Other / Not Listed</option>
                    </select>
                    {(form.collegeId === 'other' || (!form.collegeId && form.collegeName)) && (
                      <input type="text" placeholder="Type your college name" value={form.collegeName}
                        onChange={e => set('collegeName', e.target.value)} className={`${inputClass} mt-2`} />
                    )}
                    <p className="text-xs text-gray-400 mt-1">Selecting your college links your verified profile to their placement portal</p>
                  </div>
                  <div><label className={labelClass}>Degree</label>
                    <select value={form.degree} onChange={e => set('degree', e.target.value)} className={inputClass}>
                      <option value="">Select degree</option>
                      <option>B.Tech</option><option>BCA</option><option>B.Sc</option><option>B.Com</option><option>BBA</option><option>BA</option><option>B.E</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Branch / Specialization</label><input type="text" placeholder="e.g. Computer Science" value={form.branch} onChange={e => set('branch', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Passing year</label><input type="text" placeholder="e.g. 2024" value={form.collegePassingYear} onChange={e => set('collegePassingYear', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>CGPA / Percentage</label><input type="text" placeholder="e.g. 8.5 / 85%" value={form.collegeCGPA} onChange={e => set('collegeCGPA', e.target.value)} className={inputClass} /></div>
                </div>
              </div>

              <div>
                <p className={sectionTitle}>🎖️ Post graduation (optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>College / University</label><input type="text" placeholder="e.g. IIM Bangalore" value={form.pgCollegeName} onChange={e => set('pgCollegeName', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Degree</label>
                    <select value={form.pgDegree} onChange={e => set('pgDegree', e.target.value)} className={inputClass}>
                      <option value="">Select degree</option>
                      <option>MBA</option><option>M.Tech</option><option>MCA</option><option>M.Sc</option><option>M.Com</option><option>MA</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Branch / Specialization</label><input type="text" placeholder="e.g. Data Science" value={form.pgBranch} onChange={e => set('pgBranch', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Passing year</label><input type="text" placeholder="e.g. 2026" value={form.pgPassingYear} onChange={e => set('pgPassingYear', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>CGPA / Percentage</label><input type="text" placeholder="e.g. 9.0 / 90%" value={form.pgCGPA} onChange={e => set('pgCGPA', e.target.value)} className={inputClass} /></div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setActiveTab(0)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">← Personal</button>
                <button onClick={() => setActiveTab(2)} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">Next: Profession →</button>
              </div>
            </div>
          )}

          {/* PROFESSION */}
          {activeTab === 2 && (
            <div className="flex flex-col gap-4">
              <p className={sectionTitle}>💼 Profession details</p>

              <div>
                <label className={labelClass}>Work status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Student', 'Fresher', 'Experienced'].map(s => (
                    <button key={s} onClick={() => set('workStatus', s)} className={`border-2 rounded-xl p-3 text-sm font-bold transition-all ${form.workStatus === s ? 'border-[#0D7377] bg-[#0D7377]/5 text-[#1A3C6E]' : 'border-gray-200 text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {form.workStatus === 'Experienced' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Current company</label><input type="text" placeholder="e.g. Infosys" value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Job title</label><input type="text" placeholder="e.g. Software Engineer" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} className={inputClass} /></div>
                </div>
              )}

              <div><label className={labelClass}>Work experience / description</label><textarea placeholder="Describe your work experience, internships, projects..." value={form.workExperience} onChange={e => set('workExperience', e.target.value)} className={`${inputClass} h-24`} /></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Preferred job type</label>
                  <select value={form.preferredJobType} onChange={e => set('preferredJobType', e.target.value)} className={inputClass}>
                    <option value="">Select type</option>
                    <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Remote</option><option>Freelance</option>
                  </select>
                </div>
                <div><label className={labelClass}>Preferred work location</label><input type="text" placeholder="e.g. Bangalore, Remote" value={form.preferredWorkLocation} onChange={e => set('preferredWorkLocation', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Notice period</label>
                  <select value={form.noticePeriod} onChange={e => set('noticePeriod', e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option>Immediate</option><option>15 days</option><option>1 month</option><option>2 months</option><option>3 months</option>
                  </select>
                </div>
                <div><label className={labelClass}>Expected salary (LPA)</label><input type="text" placeholder="e.g. 5-8 LPA" value={form.expectedSalary} onChange={e => set('expectedSalary', e.target.value)} className={inputClass} /></div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setActiveTab(1)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">← Education</button>
                <button onClick={() => setActiveTab(3)} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">Next: Skills →</button>
              </div>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 3 && (
            <div className="flex flex-col gap-4">
              <p className={sectionTitle}>⚡ Skills and expertise</p>
              <div><label className={labelClass}>Technical skills</label><input type="text" placeholder="e.g. React, Node.js, Python, SQL" value={form.technicalSkills} onChange={e => set('technicalSkills', e.target.value)} className={inputClass} /><p className="text-xs text-gray-400 mt-1">Separate with commas</p></div>
              {form.technicalSkills && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Skill verification status</p>
                    <button onClick={() => navigate('/exams')} className="text-xs text-[#0D7377] font-bold hover:underline">Go to Skill Exams →</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.technicalSkills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => {
                      const match = verifiedSkills.find(v => v.skill.toLowerCase() === skill.toLowerCase())
                      const isVerified = match && match.status === 'verified'
                      const isExpired = match && match.status === 'expired'
                      const isCooldown = match && match.status === 'cooldown'
                      return (
                        <span key={i} onClick={() => navigate('/exams')}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1.5 transition-all ${isVerified ? 'bg-[#E1F5EE] text-[#085041] border border-[#0D7377]' : isExpired ? 'bg-red-50 text-red-600 border border-red-200' : isCooldown ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white text-gray-400 border border-gray-200 opacity-60 hover:opacity-100'}`}>
                          {isVerified && <span>✓</span>}
                          {isExpired && <span>⚠️</span>}
                          {skill}
                          {!isVerified && !isExpired && !isCooldown && <span className="text-[10px] underline ml-1">Verify</span>}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Faded skills are not shown on your GRID profile until verified. Click any skill to take its verification exam.</p>
                </div>
              )}
              <div><label className={labelClass}>Soft skills</label><input type="text" placeholder="e.g. Leadership, Communication, Teamwork" value={form.softSkills} onChange={e => set('softSkills', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Tools and software</label><input type="text" placeholder="e.g. VS Code, Figma, Git, Postman" value={form.toolsAndSoftware} onChange={e => set('toolsAndSoftware', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Languages known</label><input type="text" placeholder="e.g. English, Hindi, Telugu" value={form.languagesKnown} onChange={e => set('languagesKnown', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Certifications</label><textarea placeholder="e.g. AWS Certified Developer - 2024, Google Analytics - 2023" value={form.certifications} onChange={e => set('certifications', e.target.value)} className={`${inputClass} h-20`} /></div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setActiveTab(2)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">← Profession</button>
                <button onClick={() => setActiveTab(4)} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">Next: Others →</button>
              </div>
            </div>
          )}

          {/* OTHERS */}
          {activeTab === 4 && (
            <div className="flex flex-col gap-4">
              <p className={sectionTitle}>📌 Other details</p>
              <div><label className={labelClass}>Bio / Summary</label><textarea placeholder="Write 2-3 lines about yourself, your goals and what you bring to the table..." value={form.bio} onChange={e => set('bio', e.target.value)} className={`${inputClass} h-24`} /></div>
              <div><label className={labelClass}>Hobbies</label><input type="text" placeholder="e.g. Chess, Photography, Reading" value={form.hobbies} onChange={e => set('hobbies', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>PF account number</label><input type="text" placeholder="e.g. KA/BNG/1234567/000/0000000" value={form.pfAccountNumber} onChange={e => set('pfAccountNumber', e.target.value)} className={inputClass} /></div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Government ID details</p>
                <p className="text-xs text-gray-400 mb-4">These details are stored securely and used only for verification purposes.</p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Aadhaar number</label>
                    <input type="text" placeholder="XXXX XXXX XXXX" maxLength={14} value={form.aadhaarNumber} onChange={e => set('aadhaarNumber', e.target.value)} className={inputClass} />
                    <p className="text-xs text-gray-400 mt-1">Real eKYC verification coming soon</p>
                  </div>
                  <div>
                    <label className={labelClass}>PAN number</label>
                    <input type="text" placeholder="e.g. ABCDE1234F" maxLength={10} value={form.panNumber} onChange={e => set('panNumber', e.target.value.toUpperCase())} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Passport number (optional)</label>
                    <input type="text" placeholder="e.g. A1234567" value={form.passportNumber} onChange={e => set('passportNumber', e.target.value.toUpperCase())} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Verification status</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Email</p>
                      <p className="text-xs text-gray-400">{emailVerified ? 'Your email is verified' : 'Check your inbox for the verification link'}</p>
                      {!emailVerified && (
                        <button onClick={handleResendVerification} className="text-xs text-[#0D7377] font-bold underline mt-1">Resend verification email</button>
                      )}
                      {resendMsg && <p className="text-xs text-[#0D7377] mt-1">{resendMsg}</p>}
                    </div>
                    {emailVerified ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">✓ Verified</span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-bold text-gray-700">Aadhaar eKYC</p><p className="text-xs text-gray-400">Real integration coming soon</p></div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-bold text-gray-700">DigiLocker</p><p className="text-xs text-gray-400">Document verification coming soon</p></div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">Pending</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setActiveTab(3)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">← Skills</button>
              </div>

              
            </div>
          )}
          {activeTab === 5 && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-bold text-[#1A3C6E] mb-1">Documents</p>
                <p className="text-xs text-gray-400 mb-3">Upload your certificates for verification. PDF, JPG or PNG, max 5MB each. Your documents are private and only shared when you apply to a company.</p>
              </div>
              {docMsg && <p className="text-xs font-bold text-[#0D7377]">{docMsg}</p>}
              <div className="space-y-3">
                {DOC_TYPES.map(dt => {
                  const uploaded = documents.filter(d => d.docType === dt.key)
                  const canUpload = dt.multiple || uploaded.length === 0
                  return (
                    <div key={dt.key} className="border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-700">{dt.label}{dt.multiple && <span className="text-[10px] font-normal text-gray-400 ml-1">(you can add more than one)</span>}</p>
                        {canUpload ? (
                          <label className="text-xs font-bold text-[#0D7377] cursor-pointer hover:underline whitespace-nowrap">
                            {docUploading === dt.key ? 'Uploading...' : (uploaded.length > 0 && dt.multiple ? '+ Add another' : '+ Upload')}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={docUploading === dt.key}
                              onChange={e => { if (e.target.files[0]) handleDocUpload(dt.key, e.target.files[0], docLabels[dt.key]); e.target.value = ''; setDocLabels(p => ({ ...p, [dt.key]: '' })) }} />
                          </label>
                        ) : null}
                      </div>
                      {dt.multiple && canUpload && (
                        <input value={docLabels[dt.key] || ''} onChange={e => setDocLabels(p => ({ ...p, [dt.key]: e.target.value }))}
                          placeholder="Optional label (e.g. TCS 2020-22)"
                          className="w-full mb-2 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0D7377]" />
                      )}
                      {docErrors[dt.key] && <p className="text-xs font-bold text-red-500 mb-2">{docErrors[dt.key]}</p>}
                      {uploaded.length === 0 ? (
                        <p className="text-xs text-gray-300">No document uploaded</p>
                      ) : (
                        <div className="space-y-2">
                          {uploaded.map(d => (
                            <div key={d.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs text-gray-600 truncate">{d.label ? d.label + ' — ' : ''}{d.fileName}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${d.trustStatus === 'verified' || d.trustStatus === 'college_verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {d.trustStatus === 'verified' || d.trustStatus === 'college_verified' ? 'Verified' : 'Self-uploaded'}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => handleDocView(d.id)} className="text-xs font-bold text-[#1A3C6E] hover:underline">View</button>
                                <button onClick={() => handleDocDelete(d.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setActiveTab(4)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">← Others</button>
              </div>
            </div>
          )}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex gap-3 items-center">
              <button onClick={handleSave} disabled={saving || uploadingPhoto} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">
                {saving || uploadingPhoto ? 'Saving...' : 'Save Profile'}
              </button>
              {activeTab === 5 && (
                <div className="relative flex-1 group">
                  <button onClick={handleMoveToGrid} disabled={saving || updatesRemaining === 0} className={`w-full py-3 rounded-xl font-bold transition-colors ${updatesRemaining === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0D7377] text-white hover:bg-[#0a5f63]'}`}>
                    Move to GRID
                  </button>
                  <div className="absolute bottom-14 right-0 w-64 bg-[#1A3C6E] text-white text-xs rounded-xl p-3 z-50 hidden group-hover:block shadow-lg">
                    <p className="font-bold mb-1">What is Move to GRID?</p>
                    <p className="text-white/80 leading-relaxed">Publishing makes your profile visible to companies globally. You can only do this <span className="font-bold text-[#5DCAA5]">3 times per month</span> — make sure your profile is complete before publishing.</p>
                    <p className="text-[#5DCAA5] font-bold mt-2">{updatesRemaining} update{updatesRemaining !== 1 ? 's' : ''} remaining this month</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfileDetails
