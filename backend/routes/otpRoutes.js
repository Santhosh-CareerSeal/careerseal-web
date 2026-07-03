const express = require('express')
const router = express.Router()
const { sendVerificationOTP, verifyOTP } = require('../controllers/otpController')

router.post('/send', sendVerificationOTP)
router.post('/verify', verifyOTP)

module.exports = router
