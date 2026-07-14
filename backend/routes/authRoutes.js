const express = require('express')
const rateLimit = require('express-rate-limit')
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' }
})
const router = express.Router()
const { initiateSignup, verifyAndCreateAccount, login, forgotPassword, verifyResetOtp, resetPassword, changePassword, deleteAccount, logout, verifyEmailLink, resendVerification } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

router.post('/signup/initiate', initiateSignup)
router.post('/signup/verify', verifyAndCreateAccount)
router.post('/login', loginLimiter, login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.put('/change-password', protect, changePassword)
router.delete('/delete-account', protect, deleteAccount)
router.post('/logout', protect, logout)

router.post('/verify-reset-otp', verifyResetOtp)
router.get('/verify-email-link', verifyEmailLink)
router.post('/resend-verification', resendVerification)

module.exports = router
