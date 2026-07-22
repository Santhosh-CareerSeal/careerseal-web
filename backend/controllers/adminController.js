const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' })
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      message: 'Admin login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Platform stats
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, totalStudents, totalCompanies, totalColleges, totalAdmins,
      publishedGrids, totalJobs, totalApplications,
      verifiedEmails, unverifiedEmails,
      verifiedCompanies, pendingCompanies,
      vettedColleges, pendingColleges,
      profileComplete
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'company' } }),
      prisma.user.count({ where: { role: 'college' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.student.count({ where: { gridPublished: true } }),
      prisma.job.count(),
      prisma.application.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { emailVerified: false } }),
      prisma.company.count({ where: { mcaStatus: 'verified' } }),
      prisma.company.count({ where: { OR: [{ mcaStatus: { not: 'verified' } }, { mcaStatus: null }] } }),
      prisma.college.count({ where: { vetted: true } }),
      prisma.college.count({ where: { vetted: false } }),
      prisma.student.count({ where: { profileComplete: true } })
    ])
    res.json({
      totalUsers, totalStudents, totalCompanies, totalColleges, totalAdmins,
      publishedGrids, totalJobs, totalApplications,
      verifiedEmails, unverifiedEmails,
      verifiedCompanies, pendingCompanies,
      vettedColleges, pendingColleges,
      profileComplete,
      unpublishedGrids: totalStudents - publishedGrids
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// List all colleges
const getAdminColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: { students: { select: { id: true } }, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    })
    const formatted = colleges.map(c => ({
      id: c.id,
      collegeName: c.collegeName,
      slug: c.slug,
      city: c.city,
      state: c.state,
      collegeType: c.collegeType,
      vetted: c.vetted,
      tpoName: c.tpoName,
      tpoEmail: c.tpoEmail,
      tpoPhone: c.tpoPhone,
      studentCount: c.students.length,
      createdAt: c.createdAt
    }))
    res.json({ colleges: formatted })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Add a new college (replaces the terminal script)
const addCollege = async (req, res) => {
  try {
    const { collegeName, city, state, collegeType, streams, careerFields, vetted, tpoName, tpoEmail, tpoPhone, password } = req.body
    if (!collegeName || !tpoEmail || !password) {
      return res.status(400).json({ message: 'College name, TPO email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const existing = await prisma.user.findUnique({ where: { email: tpoEmail } })
    if (existing) return res.status(400).json({ message: 'A user with this email already exists' })

    const slug = collegeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const slugExists = await prisma.college.findUnique({ where: { slug } })
    if (slugExists) return res.status(400).json({ message: 'A college with a similar name already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const created = await prisma.user.create({
      data: {
        name: tpoName || collegeName,
        email: tpoEmail,
        passwordHash,
        role: 'college',
        emailVerified: true,
        college: {
          create: {
            collegeName, slug,
            city: city || null,
            state: state || null,
            collegeType: collegeType || 'Degree',
            streams: streams || '',
            careerFields: careerFields || '',
            vetted: vetted === true || vetted === 'true',
            tpoName: tpoName || null,
            tpoEmail,
            tpoPhone: tpoPhone || null
          }
        }
      },
      include: { college: true }
    })
    res.status(201).json({ message: 'College created successfully', college: created.college })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Toggle college vetted status
const toggleCollegeVetted = async (req, res) => {
  try {
    const { collegeId } = req.params
    const college = await prisma.college.findUnique({ where: { id: parseInt(collegeId) } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const updated = await prisma.college.update({
      where: { id: parseInt(collegeId) },
      data: { vetted: !college.vetted }
    })
    res.json({ message: 'College updated', college: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// List users (students + companies)
const getAdminUsers = async (req, res) => {
  try {
    const { role, search } = req.query
    const where = {}
    if (role && role !== 'all') where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true,
        student: { select: { gridNumber: true, gridPublished: true, profileComplete: true, collegeName: true } },
        company: { select: { companyName: true, mcaStatus: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    })
    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// List all companies
const getAdminCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        user: { select: { name: true, email: true, emailVerified: true, createdAt: true } },
        jobs: { select: { id: true } }
      },
      orderBy: { id: 'desc' }
    })
    const formatted = companies.map(c => ({
      id: c.id,
      companyName: c.companyName,
      mcaStatus: c.mcaStatus,
      industry: c.industry,
      companySize: c.companySize,
      website: c.website,
      location: c.location,
      recruiterName: c.user?.name,
      recruiterEmail: c.user?.email,
      emailVerified: c.user?.emailVerified,
      jobCount: c.jobs.length,
      createdAt: c.user?.createdAt
    }))
    res.json({ companies: formatted })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Verify / unverify a company
const toggleCompanyVerified = async (req, res) => {
  try {
    const { companyId } = req.params
    const company = await prisma.company.findUnique({ where: { id: parseInt(companyId) } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const newStatus = company.mcaStatus === 'verified' ? 'pending' : 'verified'
    const updated = await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: { mcaStatus: newStatus }
    })
    res.json({ message: 'Company ' + newStatus, company: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// List all student documents (for verification)
const getAdminDocuments = async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { student: { include: { user: { select: { name: true, email: true } } } } }
    })
    const out = docs.map(d => ({
      id: d.id,
      docType: d.docType,
      label: d.label,
      fileName: d.fileName,
      trustStatus: d.trustStatus,
      verifiedBy: d.verifiedBy,
      verifiedAt: d.verifiedAt,
      createdAt: d.createdAt,
      studentName: d.student?.user?.name || 'Unknown',
      studentEmail: d.student?.user?.email || '',
      studentId: d.studentId
    }))
    res.json({ documents: out })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Admin verifies / unverifies a document
const toggleDocumentVerified = async (req, res) => {
  try {
    const { documentId } = req.params
    const doc = await prisma.document.findUnique({ where: { id: parseInt(documentId) } })
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    const isVerified = doc.trustStatus === 'verified'
    const updated = await prisma.document.update({
      where: { id: parseInt(documentId) },
      data: isVerified
        ? { trustStatus: 'self_uploaded', verifiedBy: null, verifiedById: null, verifiedAt: null }
        : { trustStatus: 'verified', verifiedBy: 'GRID Admin', verifiedById: req.user.userId, verifiedAt: new Date() }
    })
    res.json({ message: isVerified ? 'Verification removed' : 'Document verified', document: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Admin views a document (secure temporary link)
const viewAdminDocument = async (req, res) => {
  try {
    const { getSignedUrl } = require('../utils/supabaseStorage')
    const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.documentId) } })
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    const url = await getSignedUrl(doc.filePath)
    res.json({ url })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Fraud flags for review
const getFraudFlags = async (req, res) => {
  try {
    const { status } = req.query
    const where = status && status !== 'all' ? { status } : {}
    const flags = await prisma.fraudFlag.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 })
    const studentIds = [...new Set(flags.map(f => f.studentId).filter(Boolean))]
    const students = studentIds.length ? await prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: { user: { select: { name: true, email: true } } }
    }) : []
    const map = {}
    students.forEach(st => { map[st.id] = { name: st.user?.name || 'Unknown', email: st.user?.email || '' } })
    const out = flags.map(f => ({
      id: f.id, studentId: f.studentId, flagType: f.flagType, severity: f.severity,
      details: f.details, status: f.status, reviewedBy: f.reviewedBy, reviewedAt: f.reviewedAt,
      createdAt: f.createdAt,
      studentName: map[f.studentId]?.name || (f.studentId ? 'Student #' + f.studentId : '-'),
      studentEmail: map[f.studentId]?.email || ''
    }))
    res.json({ flags: out })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Admin resolves or dismisses a flag
const resolveFraudFlag = async (req, res) => {
  try {
    const { flagId } = req.params
    const { action } = req.body
    const newStatus = action === 'dismiss' ? 'dismissed' : 'resolved'
    const updated = await prisma.fraudFlag.update({
      where: { id: parseInt(flagId) },
      data: { status: newStatus, reviewedBy: 'GRID Admin', reviewedAt: new Date() }
    })
    res.json({ message: 'Flag ' + newStatus, flag: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// List all applications
const getAdminApplications = async (req, res) => {
  try {
    const { status } = req.query
    const where = {}
    if (status && status !== 'all') where.status = status

    const applications = await prisma.application.findMany({
      where,
      include: {
        student: {
          select: {
            gridNumber: true, collegeName: true,
            user: { select: { name: true, email: true } }
          }
        },
        job: {
          select: {
            title: true, location: true,
            company: { select: { companyName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    })

    const formatted = applications.map(a => ({
      id: a.id,
      status: a.status || 'applied',
      createdAt: a.createdAt,
      studentName: a.student?.user?.name || 'Unknown',
      studentEmail: a.student?.user?.email || '',
      gridNumber: a.student?.gridNumber || '',
      collegeName: a.student?.collegeName || '',
      jobTitle: a.job?.title || 'Deleted job',
      jobLocation: a.job?.location || '',
      companyName: a.job?.company?.companyName || 'Unknown'
    }))

    // Status counts for the filter buttons
    const counts = {}
    const all = await prisma.application.groupBy({ by: ['status'], _count: true })
    all.forEach(g => { counts[g.status || 'applied'] = g._count })

    res.json({ applications: formatted, counts })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Admin changes their own password
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.userId
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Admin password must be at least 8 characters' })
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' })
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' })
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current one' })
    }
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    res.json({ message: 'Password updated successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { adminLogin, getAdminStats, getAdminColleges, addCollege, toggleCollegeVetted, getAdminUsers, getAdminCompanies, toggleCompanyVerified, getAdminApplications, changeAdminPassword, getAdminDocuments, toggleDocumentVerified, viewAdminDocument, getFraudFlags, resolveFraudFlag }
