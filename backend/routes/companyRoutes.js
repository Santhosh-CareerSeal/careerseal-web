const express = require('express')
const router = express.Router()
const { getCompanyProfile, updateCompanyProfile, getDashboardStats, postJob, getMyJobs, updateJob, deleteJob, getCandidates, updateApplicationStatus, searchTalent, getAnalytics } = require('../controllers/companyController')
const { protect } = require('../middleware/authMiddleware')

router.get('/profile', protect, getCompanyProfile)
router.put('/profile', protect, updateCompanyProfile)
router.get('/dashboard', protect, getDashboardStats)
router.post('/jobs', protect, postJob)
router.get('/jobs', protect, getMyJobs)
router.put('/jobs/:jobId', protect, updateJob)
router.delete('/jobs/:jobId', protect, deleteJob)
router.get('/candidates', protect, getCandidates)
router.put('/applications/:applicationId', protect, updateApplicationStatus)
router.get('/talent', protect, searchTalent)
router.get('/analytics', protect, getAnalytics)

module.exports = router
