const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()
const { signup, login, changePassword, deleteAccount } = require('../controllers/authController')

router.post('/signup', signup)
router.post('/login', login)

router.put('/change-password', protect, changePassword)
router.delete('/delete-account', protect, deleteAccount)
module.exports = router
