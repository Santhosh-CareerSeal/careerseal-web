import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import { supabase } from '../supabaseClient'

const TABS = ['Personal', 'Education', 'Profession', 'Skills', 'Others']

function ProfileDetails() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showGridInfo, setShowGridInfo] = useState(false)
  const [gridMsg, setGridMsg] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [updatesRemaining, setUpdatesRemaining] = useState(3)

  const [form, setForm] = useState({
    legalFullName: '',
    photoUrl: '', dateOfBirth: '', gender: '', contactNumber: '',
    address: '', city: '', state: '', pincode: '',
    schoolName: '', schoolBoard: '', schoolPassingYear: '', schoolPercentage: '',
    twelfthSchoolName: '', twelfthBoard: '', twelfthPassingYear: '', twelfthPercentage: '',
    collegeName: '', degree: '', branch: '', collegePassingYear: '', collegeCGPA: '',
    pgCollegeName: '', pgDegree: '', pgBranch: '', pgPassingYear: '', pgCGPA: '',
    workStatus: '', currentCompany: '', jobTitle: '', workExperience: '',
    preferredJobType: '', preferredWorkLocation: '', noticePeriod: '', expectedSalary: '',
    technicalSkills: '', softSkills: '', languagesKnown: '', certifications: '', toolsAndSoftware: '',
    hobbies: '', pfAccountNumber: '', aadhaarNumber: '', panNumber: '', passportNumber: '',
    digiLockerStatus: '', bio: ''
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const res = await axios.get(`${API_URL}/api/profile/details`, { headers: { Authorization: `Bearer ${token}` } })
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
            collegeName: s.collegeName || '', degree: s.degree || '',
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
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)) }
  }

  const uploadPhoto = async () => {
    if (!photoFile) return form.photoUrl
    setUploadingPhoto(true)
    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('profile-photos').upload(fileName, photoFile)
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
      setTimeout(() => setGridMsg(''), 4000)
    } finally { setSaving(false) }
  }

  const inputClass = "border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0D7377] text-sm w-full"
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block"
  const sectionTitle = "text-sm font-bold text-[#1A3C6E] mb-4 pb-2 border-b border-gray-100"

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-[#1A3C6E] font-bold">Loading profile...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1A3C6E] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <h1 className="text-white font-bold text-lg">CareerSeal</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white/60 text-sm hover:text-white">← Dashboard</button>
          <button onClick={() => navigate('/roadmap')} className="text-[#5DCAA5] text-sm font-bold hover:text-white transition-colors">AI Roadmap →</button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-[#1A3C6E] mb-1">My Profile</h2>
        <p className="text-gray-400 text-sm mb-6">Complete all sections and publish to your GRID card</p>

        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 mb-6 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === i ? 'bg-[#1A3C6E] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
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
              <p className={sectionTitle}>Personal details</p>

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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
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
                <p className={sectionTitle}>10th standard</p>
                <div className="grid grid-cols-2 gap-4">
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
                <p className={sectionTitle}>12th standard</p>
                <div className="grid grid-cols-2 gap-4">
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
                <p className={sectionTitle}>Graduation</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>College / University</label><input type="text" placeholder="e.g. MIT" value={form.collegeName} onChange={e => set('collegeName', e.target.value)} className={inputClass} /></div>
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
                <p className={sectionTitle}>Post graduation (optional)</p>
                <div className="grid grid-cols-2 gap-4">
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
              <p className={sectionTitle}>Profession details</p>

              <div>
                <label className={labelClass}>Work status</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Student', 'Fresher', 'Experienced'].map(s => (
                    <button key={s} onClick={() => set('workStatus', s)} className={`border-2 rounded-xl p-3 text-sm font-bold transition-all ${form.workStatus === s ? 'border-[#0D7377] bg-[#0D7377]/5 text-[#1A3C6E]' : 'border-gray-200 text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {form.workStatus === 'Experienced' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Current company</label><input type="text" placeholder="e.g. Infosys" value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Job title</label><input type="text" placeholder="e.g. Software Engineer" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} className={inputClass} /></div>
                </div>
              )}

              <div><label className={labelClass}>Work experience / description</label><textarea placeholder="Describe your work experience, internships, projects..." value={form.workExperience} onChange={e => set('workExperience', e.target.value)} className={`${inputClass} h-24`} /></div>

              <div className="grid grid-cols-2 gap-4">
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
              <p className={sectionTitle}>Skills and expertise</p>
              <div><label className={labelClass}>Technical skills</label><input type="text" placeholder="e.g. React, Node.js, Python, SQL" value={form.technicalSkills} onChange={e => set('technicalSkills', e.target.value)} className={inputClass} /><p className="text-xs text-gray-400 mt-1">Separate with commas</p></div>
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
              <p className={sectionTitle}>Other details</p>
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
                    <div><p className="text-sm font-bold text-gray-700">Email</p><p className="text-xs text-gray-400">Verified at registration</p></div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">✓ Done</span>
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

              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex gap-3 items-center">
                  <button onClick={handleSave} disabled={saving || uploadingPhoto} className="flex-1 bg-[#1A3C6E] text-white py-3 rounded-xl font-bold hover:bg-[#0D7377] transition-colors">
                    {saving || uploadingPhoto ? 'Saving...' : 'Save Profile'}
                  </button>
                  <div className="relative flex-1 group">
                    <button onClick={handleMoveToGrid} disabled={saving || updatesRemaining === 0} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${updatesRemaining === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0D7377] text-white hover:bg-[#0a5f63]'}`}>
                      Move to GRID
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowGridInfo(!showGridInfo)} className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 text-sm font-bold hover:border-[#0D7377] hover:text-[#0D7377] transition-colors flex items-center justify-center">i</button>
                      {showGridInfo && (
                        <div className="absolute bottom-10 right-0 w-60 bg-[#1A3C6E] text-white text-xs rounded-xl p-3 z-10">
                          <p className="font-bold mb-1">Move to GRID</p>
                          <p className="text-white/80 leading-relaxed">Publishing makes your profile visible to companies globally. You can only do this <span className="font-bold text-[#5DCAA5]">3 times per month</span> — make sure your profile is complete before publishing.</p>
                          <p className="text-[#5DCAA5] font-bold mt-2">{updatesRemaining} update{updatesRemaining !== 1 ? 's' : ''} remaining this month</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ProfileDetails
