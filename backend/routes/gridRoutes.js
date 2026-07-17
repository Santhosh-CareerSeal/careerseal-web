const express = require('express')
const router = express.Router()
const { getGridCard, updateGridProfile } = require('../controllers/gridController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getGridCard)
router.put('/profile', protect, updateGridProfile)

module.exports = router
