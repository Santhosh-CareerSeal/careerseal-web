const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/profile/:gridNumber', async (req, res) => {
  try {
    const { gridNumber } = req.params
    const student = await prisma.student.findUnique({
      where: { gridNumber },
      include: { user: { select: { name: true, email: true } } }
    })
    if (!student) return res.status(404).json({ message: 'Profile not found' })
    if (!student.gridPublished) return res.status(403).json({ message: 'Profile not yet published to GRID' })

    // Serve the PUBLISHED snapshot, never the live draft. Legacy published
    // accounts with no snapshot yet fall back to the live record once.
    const p = student.publishedProfile || student

    const verifiedSkillRecords = await prisma.verifiedSkill.findMany({ where: { studentId: student.id } })
    const allSkillsArr = (p.technicalSkills || '').split(',').map(s => s.trim()).filter(Boolean)
    const verifiedOnly = allSkillsArr.filter(skill => {
      const match = verifiedSkillRecords.find(v => v.skill.toLowerCase() === skill.toLowerCase())
      return match && new Date(match.expiresAt) > new Date()
    })

    res.json({
      name: student.user?.name,
      email: student.user?.email,
      gridNumber: student.gridNumber,
      photoUrl: p.photoUrl,
      bio: p.bio,
      contactNumber: p.contactNumber,
      city: p.city,
      state: p.state,
      workStatus: p.workStatus,
      jobTitle: p.jobTitle,
      currentCompany: p.currentCompany,
      preferredWorkLocation: p.preferredWorkLocation,
      preferredJobType: p.preferredJobType,
      expectedSalary: p.expectedSalary,
      noticePeriod: p.noticePeriod,
      education: p.education,
      degree: p.degree,
      branch: p.branch,
      collegeName: p.collegeName,
      collegePassingYear: p.collegePassingYear,
      collegeCGPA: p.collegeCGPA,
      pgDegree: p.pgDegree,
      pgBranch: p.pgBranch,
      pgCollegeName: p.pgCollegeName,
      pgPassingYear: p.pgPassingYear,
      pgCGPA: p.pgCGPA,
      twelfthSchoolName: p.twelfthSchoolName,
      twelfthBoard: p.twelfthBoard,
      twelfthPassingYear: p.twelfthPassingYear,
      twelfthPercentage: p.twelfthPercentage,
      schoolName: p.schoolName,
      schoolBoard: p.schoolBoard,
      schoolPassingYear: p.schoolPassingYear,
      schoolPercentage: p.schoolPercentage,
      technicalSkills: verifiedOnly.join(', '),
      softSkills: p.softSkills,
      toolsAndSoftware: p.toolsAndSoftware,
      languagesKnown: p.languagesKnown,
      certifications: p.certifications,
      hobbies: p.hobbies,
      workExperience: p.workExperience,
      projects: p.projects,
      employmentHistory: p.employmentHistory,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})


// AI candidate summary — generated on demand, cached until profile republished
router.get('/profile/:gridNumber/ai-summary', async (req, res) => {
  try {
    // Gate: only logged-in company/recruiter accounts can generate AI summaries
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Log in as a company to view AI summaries.', needsRecruiterLogin: true })
    let decoded
    try { decoded = jwt.verify(token, process.env.JWT_SECRET) } catch (e) { return res.status(401).json({ message: 'Log in as a company to view AI summaries.', needsRecruiterLogin: true }) }
    if (decoded.role !== 'company') return res.status(403).json({ message: 'AI summaries are available to company/recruiter accounts only.', needsRecruiterLogin: true })
    const { gridNumber } = req.params
    const student = await prisma.student.findUnique({ where: { gridNumber } })
    if (!student) return res.status(404).json({ message: 'Profile not found' })
    if (!student.gridPublished) return res.status(403).json({ message: 'Profile not published' })

    // return cached summary if present
    if (student.aiSummary) {
      return res.json({ summary: student.aiSummary, cached: true })
    }

    const { generateSummary } = require('../utils/summaryGenerator')
    let summary
    try {
      // summarise the PUBLISHED snapshot, not the live draft
      summary = await generateSummary(student.publishedProfile || student)
    } catch (e) {
      console.error('AI summary generation failed:', e.message)
      return res.status(503).json({ message: 'Could not generate summary right now. Please try again shortly.' })
    }

    // cache it
    await prisma.student.update({ where: { id: student.id }, data: { aiSummary: summary } })
    res.json({ summary, cached: false })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})


// Contact form — sends the message to support inbox
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in your name, email, and message.' })
    }
    // basic email sanity + length caps to prevent abuse
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }
    if (name.length > 100 || (subject || '').length > 150 || message.length > 3000) {
      return res.status(400).json({ message: 'One or more fields are too long.' })
    }
    const { sendContactEmail } = require('../services/emailService')
    const sent = await sendContactEmail(name.trim(), email.trim(), (subject || '').trim(), message.trim())
    if (!sent) return res.status(503).json({ message: 'Could not send your message right now. Please email support@thegridcard.com directly.' })
    res.json({ message: 'Thanks! Your message has been sent. We\'ll get back to you soon.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router
