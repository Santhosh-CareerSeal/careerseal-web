const express = require('express')
const router = express.Router()
const { getRoadmap, saveAnswers, getLocationAdvice, getCareers, selectCareer, generateRoadmap, saveRoadmap } = require('../controllers/roadmapController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getRoadmap)
router.post('/answers', protect, saveAnswers)
router.post('/location-advice', protect, getLocationAdvice)
router.post('/careers', protect, getCareers)
router.post('/select', protect, selectCareer)
router.post('/generate', protect, generateRoadmap)
router.post('/save', protect, saveRoadmap)

module.exports = router
