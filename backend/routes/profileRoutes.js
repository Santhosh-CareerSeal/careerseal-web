const express = require('express')
const router = express.Router()
const { getProfileDetails, completeProfile, moveToGrid, getProfileStatus } = require('../controllers/profileController')
const { protect } = require('../middleware/authMiddleware')

router.get('/details', protect, getProfileDetails)
router.post('/complete', protect, completeProfile)
router.post('/move-to-grid', protect, moveToGrid)
router.get('/status', protect, getProfileStatus)

module.exports = router
