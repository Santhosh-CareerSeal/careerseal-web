const express = require('express')
const router = express.Router()
const { collegeLogin, changeCollegePassword } = require('../controllers/collegeAuthController')
const { getActiveCollegesList, getCollegeProfile, getCollegeDashboard, getCollegeStudents, getCollegeAnalytics, getCollegeSuggestions, getCollegeJobs } = require('../controllers/collegeController')
const { protect } = require('../middleware/authMiddleware')

router.post('/login', collegeLogin)
router.post('/change-password', protect, changeCollegePassword)
router.get('/list', getActiveCollegesList)
router.get('/suggestions', getCollegeSuggestions)
router.get('/profile', protect, getCollegeProfile)
router.get('/dashboard', protect, getCollegeDashboard)
router.get('/students', protect, getCollegeStudents)
router.get('/analytics', protect, getCollegeAnalytics)
router.get('/jobs', protect, getCollegeJobs)

module.exports = router
