const express = require('express')
const router = express.Router()
const { completeProfile, getProfileStatus } = require('../controllers/profileController')
const { protect } = require('../middleware/authMiddleware')

router.post('/complete', protect, completeProfile)
router.get('/status', protect, getProfileStatus)

module.exports = router
