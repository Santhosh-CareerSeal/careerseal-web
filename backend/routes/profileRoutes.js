const express = require('express')
const router = express.Router()
const { getProfileDetails, completeProfile, getProfileStatus } = require('../controllers/profileController')
const { protect } = require('../middleware/authMiddleware')

router.get('/details', protect, getProfileDetails)
router.post('/complete', protect, completeProfile)
router.get('/status', protect, getProfileStatus)

module.exports = router
