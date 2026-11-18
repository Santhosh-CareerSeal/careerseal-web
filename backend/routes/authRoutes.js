const express = require('express')
const rateLimit = require('express-rate-limit')
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' }
})
// Throttle OTP/reset endpoints to stop brute-forcing the 6-digit reset code.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { message: 'Too many attempts. Please wait 15 minutes and try again.' }
})
const router = express.Router()
const { initiateSignup, verifyAndCreateAccount, login, forgotPassword, verifyResetOtp, resetPassword, changePassword, deleteAccount, logout, verifyEmailLink, resendVerification, googleAuth } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

router.post('/signup/initiate', initiateSignup)
router.post('/signup/verify', otpLimiter, verifyAndCreateAccount)
router.post('/login', loginLimiter, login)
router.post('/forgot-password', otpLimiter, forgotPassword)
router.post('/reset-password', otpLimiter, resetPassword)
router.put('/change-password', protect, changePassword)
router.delete('/delete-account', protect, deleteAccount)
router.post('/logout', protect, logout)

router.post('/verify-reset-otp', otpLimiter, verifyResetOtp)
router.post('/google', googleAuth)
router.get('/verify-email-link', verifyEmailLink)
router.post('/resend-verification', otpLimiter, resendVerification)

module.exports = router
