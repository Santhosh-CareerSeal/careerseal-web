const express = require('express')
const router = express.Router()
const { initiateSignup, verifyAndCreateAccount, login, forgotPassword, resetPassword, changePassword, deleteAccount } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

router.post('/signup/initiate', initiateSignup)
router.post('/signup/verify', verifyAndCreateAccount)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.put('/change-password', protect, changePassword)
router.delete('/delete-account', protect, deleteAccount)

module.exports = router
