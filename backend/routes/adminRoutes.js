const express = require('express')
const router = express.Router()
const { adminLogin, getAdminStats, getAdminColleges, addCollege, toggleCollegeVetted, getAdminUsers, getAdminCompanies, toggleCompanyVerified, getAdminApplications, changeAdminPassword, getAdminDocuments, toggleDocumentVerified, viewAdminDocument, getFraudFlags, resolveFraudFlag, getAskQuestions, updateAskQuestion } = require('../controllers/adminController')
const { protect } = require('../middleware/authMiddleware')
const { adminOnly } = require('../middleware/adminMiddleware')

// Public - admin login
router.post('/login', adminLogin)

// Protected - admin only
router.get('/stats', protect, adminOnly, getAdminStats)
router.get('/colleges', protect, adminOnly, getAdminColleges)
router.post('/colleges', protect, adminOnly, addCollege)
router.patch('/colleges/:collegeId/vetted', protect, adminOnly, toggleCollegeVetted)
router.get('/users', protect, adminOnly, getAdminUsers)
router.get('/companies', protect, adminOnly, getAdminCompanies)
router.get('/applications', protect, adminOnly, getAdminApplications)
router.post('/change-password', protect, adminOnly, changeAdminPassword)
router.patch('/companies/:companyId/verify', protect, adminOnly, toggleCompanyVerified)
router.get('/documents', protect, adminOnly, getAdminDocuments)
router.patch('/documents/:documentId/verify', protect, adminOnly, toggleDocumentVerified)
router.get('/documents/:documentId/view', protect, adminOnly, viewAdminDocument)
router.get('/fraud-flags', protect, adminOnly, getFraudFlags)
router.patch('/fraud-flags/:flagId', protect, adminOnly, resolveFraudFlag)
router.get('/ask-questions', protect, adminOnly, getAskQuestions)
router.patch('/ask-questions/:questionId', protect, adminOnly, updateAskQuestion)

module.exports = router
