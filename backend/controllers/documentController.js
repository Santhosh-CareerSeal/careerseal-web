const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { uploadDocument, getSignedUrl, deleteDocument } = require('../utils/supabaseStorage')

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const ALLOWED_DOCTYPES = ['tenth', 'twelfth', 'degree', 'pg', 'experience', 'epfo', 'id_proof', 'other']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

// Student uploads a document
const uploadStudentDocument = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student profile not found' })

    if (!req.file) return res.status(400).json({ message: 'No file provided' })
    const { docType } = req.body
    if (!ALLOWED_DOCTYPES.includes(docType)) {
      return res.status(400).json({ message: 'Invalid document type' })
    }
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PDF, JPG, and PNG files are allowed' })
    }
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({ message: 'File must be under 5 MB' })
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase()
    const path = `student_${student.id}/${docType}_${Date.now()}.${ext}`
    await uploadDocument(path, req.file.buffer, req.file.mimetype)

    const doc = await prisma.document.create({
      data: {
        studentId: student.id,
        docType,
        label: req.body.label || null,
        filePath: path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        trustStatus: 'self_uploaded'
      }
    })
    res.status(201).json({ message: 'Document uploaded', document: { id: doc.id, docType: doc.docType, label: doc.label, fileName: doc.fileName, trustStatus: doc.trustStatus, createdAt: doc.createdAt } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Student lists their own documents
const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.json({ documents: [] })
    const docs = await prisma.document.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, docType: true, label: true, fileName: true, trustStatus: true, verifiedBy: true, verifiedAt: true, createdAt: true }
    })
    res.json({ documents: docs })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Student deletes their own document
const deleteMyDocument = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!doc || doc.studentId !== student.id) return res.status(404).json({ message: 'Document not found' })
    await deleteDocument(doc.filePath)
    await prisma.document.delete({ where: { id: doc.id } })
    res.json({ message: 'Document deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Student views their own document (secure temporary link)
const viewMyDocument = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!doc || doc.studentId !== student.id) return res.status(404).json({ message: 'Document not found' })
    const url = await getSignedUrl(doc.filePath)
    res.json({ url })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { uploadStudentDocument, getMyDocuments, deleteMyDocument, viewMyDocument }
