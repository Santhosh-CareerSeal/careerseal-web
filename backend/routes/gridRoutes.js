const express = require('express')
const router = express.Router()
const { getGridCard, updateGridProfile, mockVerifyAadhaar, mockVerifyDigiLocker } = require('../controllers/gridController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getGridCard)
router.put('/profile', protect, updateGridProfile)
router.post('/verify/aadhaar', protect, mockVerifyAadhaar)
router.post('/verify/digilocker', protect, mockVerifyDigiLocker)

module.exports = router
