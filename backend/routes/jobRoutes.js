const express = require('express')
const router = express.Router()
const { createJob, getAllJobs } = require('../controllers/jobController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, createJob)
router.get('/', getAllJobs)

module.exports = router
