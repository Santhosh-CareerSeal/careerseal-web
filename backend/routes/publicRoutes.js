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

    const verifiedSkillRecords = await prisma.verifiedSkill.findMany({ where: { studentId: student.id } })
    const allSkillsArr = (student.technicalSkills || '').split(',').map(s => s.trim()).filter(Boolean)
    const verifiedOnly = allSkillsArr.filter(skill => {
      const match = verifiedSkillRecords.find(v => v.skill.toLowerCase() === skill.toLowerCase())
      return match && new Date(match.expiresAt) > new Date()
    })

    res.json({
      name: student.user?.name,
      email: student.user?.email,
      gridNumber: student.gridNumber,
      photoUrl: student.photoUrl,
      bio: student.bio,
      contactNumber: student.contactNumber,
      city: student.city,
      state: student.state,
      workStatus: student.workStatus,
      jobTitle: student.jobTitle,
      currentCompany: student.currentCompany,
      preferredWorkLocation: student.preferredWorkLocation,
      preferredJobType: student.preferredJobType,
      expectedSalary: student.expectedSalary,
      noticePeriod: student.noticePeriod,
      education: student.education,
      degree: student.degree,
      branch: student.branch,
      collegeName: student.collegeName,
      collegePassingYear: student.collegePassingYear,
      collegeCGPA: student.collegeCGPA,
      pgDegree: student.pgDegree,
      pgBranch: student.pgBranch,
      pgCollegeName: student.pgCollegeName,
      pgPassingYear: student.pgPassingYear,
      pgCGPA: student.pgCGPA,
      twelfthSchoolName: student.twelfthSchoolName,
      twelfthBoard: student.twelfthBoard,
      twelfthPassingYear: student.twelfthPassingYear,
      twelfthPercentage: student.twelfthPercentage,
      schoolName: student.schoolName,
      schoolBoard: student.schoolBoard,
      schoolPassingYear: student.schoolPassingYear,
      schoolPercentage: student.schoolPercentage,
      technicalSkills: verifiedOnly.join(', '),
      softSkills: student.softSkills,
      toolsAndSoftware: student.toolsAndSoftware,
      languagesKnown: student.languagesKnown,
      certifications: student.certifications,
      hobbies: student.hobbies,
      workExperience: student.workExperience,
      projects: student.projects,
      employmentHistory: student.employmentHistory,
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
      summary = await generateSummary(student)
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
