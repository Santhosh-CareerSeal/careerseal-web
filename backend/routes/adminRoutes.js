const express = require('express')
const router = express.Router()
const { adminLogin, getAdminStats, getAdminColleges, addCollege, toggleCollegeVetted, getAdminUsers, getAdminCompanies, toggleCompanyVerified, getAdminApplications } = require('../controllers/adminController')
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
router.patch('/companies/:companyId/verify', protect, adminOnly, toggleCompanyVerified)

module.exports = router
