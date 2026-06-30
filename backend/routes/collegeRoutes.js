const express = require('express')
const router = express.Router()
const { collegeLogin } = require('../controllers/collegeAuthController')
const { getActiveCollegesList, getCollegeProfile, getCollegeDashboard, getCollegeStudents, getCollegeAnalytics } = require('../controllers/collegeController')
const { protect } = require('../middleware/authMiddleware')

router.post('/login', collegeLogin)
router.get('/list', getActiveCollegesList)
router.get('/profile', protect, getCollegeProfile)
router.get('/dashboard', protect, getCollegeDashboard)
router.get('/students', protect, getCollegeStudents)
router.get('/analytics', protect, getCollegeAnalytics)

module.exports = router
