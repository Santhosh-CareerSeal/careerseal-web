const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { rateCompany, getCompanyRating, getMyRatingStatus, getOwnRating } = require('../controllers/ratingController')

router.post('/', protect, rateCompany)
router.get('/mine/:companyId', protect, getMyRatingStatus)
router.get('/own', protect, getOwnRating)
router.get('/:companyId', getCompanyRating)

module.exports = router
