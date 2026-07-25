const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const RATEABLE_STAGES = ['shortlisted', 'interview', 'hired', 'rejected']
const PUBLIC_THRESHOLD = 5

// Student submits or updates a rating for a company
const rateCompany = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const { companyId, stars, comment } = req.body
    const s = parseInt(stars)
    if (!companyId || !s || s < 1 || s > 5) return res.status(400).json({ message: 'A star rating from 1 to 5 is required' })

    // eligibility: must have an application to this company that reached a real stage
    const app = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: { in: RATEABLE_STAGES },
        job: { companyId: parseInt(companyId) }
      }
    })
    if (!app) return res.status(403).json({ message: 'You can only rate companies you have interviewed with or heard back from.' })

    const rating = await prisma.companyRating.upsert({
      where: { companyId_studentId: { companyId: parseInt(companyId), studentId: student.id } },
      update: { stars: s, comment: (comment || '').toString().slice(0, 500) || null },
      create: { companyId: parseInt(companyId), studentId: student.id, stars: s, comment: (comment || '').toString().slice(0, 500) || null }
    })
    res.json({ message: 'Thanks for your rating!', rating })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Public: average score for a company (hidden until threshold met)
const getCompanyRating = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId)
    const ratings = await prisma.companyRating.findMany({ where: { companyId } })
    const count = ratings.length
    if (count < PUBLIC_THRESHOLD) {
      return res.json({ public: false, count, threshold: PUBLIC_THRESHOLD, average: null })
    }
    const average = Math.round((ratings.reduce((a, r) => a + r.stars, 0) / count) * 10) / 10
    res.json({ public: true, count, average })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Can the current student rate this company, and have they already?
const getMyRatingStatus = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.json({ canRate: false })
    const companyId = parseInt(req.params.companyId)

    const app = await prisma.application.findFirst({
      where: { studentId: student.id, status: { in: RATEABLE_STAGES }, job: { companyId } }
    })
    const existing = await prisma.companyRating.findUnique({
      where: { companyId_studentId: { companyId, studentId: student.id } }
    })
    res.json({ canRate: !!app, existing: existing ? { stars: existing.stars, comment: existing.comment } : null })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Company sees its own score anytime (even below threshold)
const getOwnRating = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const ratings = await prisma.companyRating.findMany({
      where: { companyId: company.id }, orderBy: { createdAt: 'desc' }
    })
    const count = ratings.length
    const average = count ? Math.round((ratings.reduce((a, r) => a + r.stars, 0) / count) * 10) / 10 : null
    res.json({ count, average, public: count >= PUBLIC_THRESHOLD, threshold: PUBLIC_THRESHOLD, recent: ratings.slice(0, 20).map(r => ({ stars: r.stars, comment: r.comment, createdAt: r.createdAt })) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { rateCompany, getCompanyRating, getMyRatingStatus, getOwnRating }
