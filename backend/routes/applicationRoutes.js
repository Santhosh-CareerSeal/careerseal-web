const express = require('express')
const router = express.Router()
const { applyToJob, getMyApplications } = require('../controllers/applicationController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, applyToJob)
router.get('/my', protect, getMyApplications)

module.exports = router
