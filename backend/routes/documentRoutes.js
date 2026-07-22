const express = require('express')
const router = express.Router()
const multer = require('multer')
const { protect } = require('../middleware/authMiddleware')
const {
  uploadStudentDocument,
  getMyDocuments,
  deleteMyDocument,
  viewMyDocument
} = require('../controllers/documentController')

// store the file in memory (not on disk) so we can stream it to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.post('/upload', protect, upload.single('file'), uploadStudentDocument)
router.get('/my', protect, getMyDocuments)
router.get('/:id/view', protect, viewMyDocument)
router.delete('/:id', protect, deleteMyDocument)

module.exports = router
