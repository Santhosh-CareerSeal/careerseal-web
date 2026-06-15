const express = require('express')
const router = express.Router()
const { applyToJob, getMyApplications, getCompanyApplications, updateApplicationStatus } = require('../controllers/applicationController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, applyToJob)
router.get('/my', protect, getMyApplications)
router.get('/company', protect, getCompanyApplications)
router.patch('/:id', protect, updateApplicationStatus)

module.exports = router