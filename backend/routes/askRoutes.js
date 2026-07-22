const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { askGrid } = require('../controllers/askController')

// optional auth: attach user if a valid token exists, otherwise continue as guest
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET) } catch (e) { }
  }
  next()
}

router.post('/', optionalAuth, askGrid)

module.exports = router
