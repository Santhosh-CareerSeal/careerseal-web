import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Legal() {
  const [activeTab, setActiveTab] = useState('privacy')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A3C6E] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#0D7377"/><path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <span className="text-white font-bold text-lg">CareerSeal</span>
          </div>
          <button onClick={() => navigate(-1)} className="text-white/60 text-sm hover:text-white">← Back</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100">
          <button onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-[#1A3C6E] text-white' : 'text-gray-500 hover:text-[#1A3C6E]'}`}>
            Privacy Policy
          </button>
          <button onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'terms' ? 'bg-[#1A3C6E] text-white' : 'text-gray-500 hover:text-[#1A3C6E]'}`}>
            Terms of Service
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          {activeTab === 'privacy' ? (
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold text-[#1A3C6E] mb-1">Privacy Policy</h1>
              <p className="text-gray-400 text-sm mb-6">Last updated: July 2026</p>

              <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">1. Who we are</h2>
                  <p>CareerSeal is a verified career identity platform for Indian students. We help students prove their skills through exams and build a trusted career profile called a GRID card. Our platform is operated from Hyderabad, India.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">2. What data we collect</h2>
                  <p className="mb-2">We collect only the data needed to provide our services:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Account data:</strong> Name, email address, password (hashed, never stored in plain text)</li>
                    <li><strong>Profile data:</strong> Education details, work experience, skills, career goals, profile photo</li>
                    <li><strong>Identity data:</strong> Aadhaar number, PAN number, passport number (stored encrypted using AES-256-CBC)</li>
                    <li><strong>Contact data:</strong> Mobile number (stored encrypted)</li>
                    <li><strong>Exam data:</strong> Skill exam attempts, scores, verified skills, badge validity</li>
                    <li><strong>Documents:</strong> Marksheets, degree certificates uploaded for verification</li>
                    <li><strong>Usage data:</strong> Login timestamps, request logs (IP address, endpoint accessed)</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">3. Why we collect it (purpose limitation)</h2>
                  <p className="mb-2">We collect data only for these specific purposes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>To create and maintain your verified GRID card</li>
                    <li>To verify your skills through proctored exams</li>
                    <li>To match you with relevant job opportunities</li>
                    <li>To provide your college's placement office with placement analytics</li>
                    <li>To detect and prevent fraud and fake profiles</li>
                    <li>To send you important account notifications</li>
                  </ul>
                  <p className="mt-2">We do not use your data for advertising. We do not sell your data to any third party.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">4. How we protect your data</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All data is transmitted over HTTPS (TLS encryption)</li>
                    <li>Passwords are hashed using bcrypt — we cannot recover your password</li>
                    <li>Sensitive fields (Aadhaar, PAN, passport, phone) are encrypted at rest using AES-256-CBC</li>
                    <li>Database access is restricted by role-based authentication</li>
                    <li>Login attempts are rate-limited to prevent brute force attacks</li>
                    <li>All API requests are logged for security monitoring</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">5. Who we share your data with</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Companies:</strong> When you apply for a job, your public GRID profile is shared with that company. Only verified skills are shown.</li>
                    <li><strong>Your college:</strong> If your college is a CareerSeal partner, your placement status and verified skills may be visible to your college's TPO dashboard.</li>
                    <li><strong>Infrastructure providers:</strong> Supabase (database + storage), Render (backend hosting), Vercel (frontend hosting). All are GDPR-compliant providers.</li>
                    <li>We do not share your Aadhaar, PAN, passport, or phone number with companies or colleges.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">6. Your rights (DPDP Act 2023)</h2>
                  <p className="mb-2">Under India's Digital Personal Data Protection Act 2023, you have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                    <li><strong>Correct:</strong> Update incorrect data via your Profile Details page</li>
                    <li><strong>Delete:</strong> Delete your account and all associated data via Settings → Delete Account</li>
                    <li><strong>Withdraw consent:</strong> Stop using our services at any time</li>
                    <li><strong>Grievance:</strong> Contact our Grievance Officer at privacy@careerseal.in</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">7. Data retention</h2>
                  <p>We retain your data for as long as your account is active. When you delete your account, all your personal data is permanently deleted within 30 days. Request logs are retained for 90 days for security purposes.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">8. Data breach notification</h2>
                  <p>In the event of a data breach affecting your personal data, we will notify you via email within 72 hours of becoming aware of the breach, as required under the DPDP Act 2023.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">9. Contact us</h2>
                  <p>For any privacy-related queries or to exercise your rights, contact us at:<br/>
                  Email: <span className="text-[#0D7377]">privacy@careerseal.in</span><br/>
                  Address: Hyderabad, Telangana, India</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold text-[#1A3C6E] mb-1">Terms of Service</h1>
              <p className="text-gray-400 text-sm mb-6">Last updated: July 2026</p>

              <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">1. Acceptance of terms</h2>
                  <p>By creating an account on CareerSeal, you agree to these Terms of Service. If you do not agree, do not use our platform.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">2. Eligibility</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You must be at least 16 years old to use CareerSeal</li>
                    <li>You must be a student, fresher, or working professional in India</li>
                    <li>You must provide accurate information during registration</li>
                    <li>One person may have only one account</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">3. Your responsibilities</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You must provide truthful information on your profile</li>
                    <li>You must not upload fake or forged documents</li>
                    <li>You must not attempt to cheat during skill exams</li>
                    <li>You must not share your account credentials with others</li>
                    <li>You must not use CareerSeal to spam companies with applications</li>
                    <li>You must not attempt to access other users' data</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">4. GRID card and verified badges</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Skill badges are valid for 3 months from the date of passing the exam</li>
                    <li>CareerSeal reserves the right to revoke badges if fraud is detected</li>
                    <li>Only verified skills are shown on your public GRID profile</li>
                    <li>You may update your GRID card up to 3 times per month</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">5. Prohibited activities</h2>
                  <p className="mb-2">The following are strictly prohibited and may result in immediate account termination:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Uploading forged marksheets, degree certificates, or any other documents</li>
                    <li>Using automated bots or scripts during skill exams</li>
                    <li>Creating fake company accounts to harvest student data</li>
                    <li>Attempting to reverse-engineer or hack CareerSeal's systems</li>
                    <li>Using disposable or fake email addresses for registration</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">6. Intellectual property</h2>
                  <p>The CareerSeal name, GRID card design, and platform technology are the intellectual property of CareerSeal. You may not copy, reproduce, or distribute any part of our platform without written permission.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">7. Limitation of liability</h2>
                  <p>CareerSeal provides a platform to connect students with employers. We do not guarantee employment outcomes. We are not liable for any hiring decisions made by companies based on your GRID profile.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">8. Termination</h2>
                  <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time via Settings → Delete Account.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">9. Changes to terms</h2>
                  <p>We may update these terms from time to time. We will notify you via email when significant changes are made. Continued use of CareerSeal after changes constitutes acceptance of the new terms.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">10. Governing law</h2>
                  <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.</p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#1A3C6E] mb-2">11. Contact</h2>
                  <p>For any queries regarding these terms:<br/>
                  Email: <span className="text-[#0D7377]">legal@careerseal.in</span><br/>
                  Address: Hyderabad, Telangana, India</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Legal
