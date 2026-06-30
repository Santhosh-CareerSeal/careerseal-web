const express = require('express')
const router = express.Router()
const { getCourses, updateCourseProgress } = require('../controllers/courseController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getCourses)
router.put('/:courseId/progress', protect, updateCourseProgress)

module.exports = router
