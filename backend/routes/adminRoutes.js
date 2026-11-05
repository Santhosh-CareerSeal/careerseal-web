const express = require('express')
const router = express.Router()
const { adminLogin, getAdminStats, getAdminColleges, addCollege, toggleCollegeVetted, getAdminUsers, getAdminCompanies, toggleCompanyVerified, getAdminApplications, changeAdminPassword, getAdminDocuments, toggleDocumentVerified, viewAdminDocument, getFraudFlags, resolveFraudFlag, getAskQuestions, updateAskQuestion, grantExamRetake } = require('../controllers/adminController')
const { protect } = require('../middleware/authMiddleware')
const { adminOnly, superOnly } = require('../middleware/adminMiddleware')

// Public - admin login
router.post('/login', adminLogin)

// --- Reads: both super and staff ---
router.get('/stats', protect, adminOnly, getAdminStats)
router.get('/colleges', protect, adminOnly, getAdminColleges)
router.get('/users', protect, adminOnly, getAdminUsers)
router.get('/companies', protect, adminOnly, getAdminCompanies)
router.get('/applications', protect, adminOnly, getAdminApplications)
router.get('/documents', protect, adminOnly, getAdminDocuments)
router.get('/documents/:documentId/view', protect, adminOnly, viewAdminDocument)
router.get('/fraud-flags', protect, adminOnly, getFraudFlags)
router.get('/ask-questions', protect, adminOnly, getAskQuestions)

// --- Staff-permitted writes (super also allowed) ---
router.post('/change-password', protect, adminOnly, changeAdminPassword) // each admin changes their own
router.patch('/documents/:documentId/verify', protect, adminOnly, toggleDocumentVerified) // document verification

// --- Super admin only (trust decisions, platform management) ---
router.post('/colleges', protect, superOnly, addCollege)
router.patch('/colleges/:collegeId/vetted', protect, superOnly, toggleCollegeVetted)
router.patch('/companies/:companyId/verify', protect, superOnly, toggleCompanyVerified)
router.patch('/fraud-flags/:flagId', protect, superOnly, resolveFraudFlag)
router.patch('/ask-questions/:questionId', protect, superOnly, updateAskQuestion)
router.post('/grant-retake', protect, superOnly, grantExamRetake)

module.exports = router
