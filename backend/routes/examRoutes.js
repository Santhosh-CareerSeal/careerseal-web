const express = require('express')
const router = express.Router()
const { getAvailableExams, getExamQuestions, submitExam, getVerifiedSkills } = require('../controllers/examController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getAvailableExams)
router.get('/verified', protect, getVerifiedSkills)
router.get('/:skill', protect, getExamQuestions)
router.post('/:skill/submit', protect, submitExam)

module.exports = router
