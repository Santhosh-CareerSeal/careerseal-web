const express = require('express')
const router = express.Router()
const { getRoadmap, saveAnswers, selectCareer, saveRoadmap } = require('../controllers/roadmapController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getRoadmap)
router.post('/answers', protect, saveAnswers)
router.post('/select', protect, selectCareer)
router.post('/save', protect, saveRoadmap)

module.exports = router
