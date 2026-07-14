const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getActiveCollegesList = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      select: { id: true, collegeName: true, city: true, state: true },
      orderBy: { collegeName: 'asc' }
    })
    res.json({ colleges })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCollegeProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const college = await prisma.college.findUnique({ where: { userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    res.json({ college })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCollegeDashboard = async (req, res) => {
  try {
    const userId = req.user.userId
    const college = await prisma.college.findUnique({ where: { userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })

    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: { user: { select: { name: true, email: true } }, verifiedSkills: true, applications: true }
    })

    const totalStudents = students.length
    const profileCompleteCount = students.filter(s => s.profileComplete).length
    const gridPublishedCount = students.filter(s => s.gridPublished).length
    const placedCount = students.filter(s => s.applications.some(a => a.status === 'hired')).length
    const totalApplications = students.reduce((sum, s) => sum + s.applications.length, 0)

    const recentStudents = students
      .slice()
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map(s => ({
        name: s.user?.name,
        email: s.user?.email,
        gridNumber: s.gridNumber,
        gridPublished: s.gridPublished,
        verifiedSkillsCount: s.verifiedSkills.filter(v => new Date(v.expiresAt) > new Date()).length,
        branch: s.branch
      }))

    res.json({
      college,
      stats: { totalStudents, profileCompleteCount, gridPublishedCount, placedCount, totalApplications },
      recentStudents
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCollegeStudents = async (req, res) => {
  try {
    const userId = req.user.userId
    const college = await prisma.college.findUnique({ where: { userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })

    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: { user: { select: { name: true, email: true } }, verifiedSkills: true, applications: true }
    })

    const formatted = students.map(s => ({
      id: s.id,
      name: s.user?.name,
      email: s.user?.email,
      gridNumber: s.gridNumber,
      gridPublished: s.gridPublished,
      profileComplete: s.profileComplete,
      branch: s.branch,
      degree: s.degree,
      collegePassingYear: s.collegePassingYear,
      workStatus: s.workStatus,
      technicalSkills: s.technicalSkills,
      verifiedSkillsCount: s.verifiedSkills.filter(v => new Date(v.expiresAt) > new Date()).length,
      applicationsCount: s.applications.length,
      placed: s.applications.some(a => a.status === 'hired')
    }))

    res.json({ students: formatted })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCollegeAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId
    const college = await prisma.college.findUnique({ where: { userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })

    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: { applications: { include: { job: { include: { company: true } } } } }
    })

    const branchCounts = {}
    students.forEach(s => {
      const branch = s.branch || 'Not specified'
      branchCounts[branch] = (branchCounts[branch] || 0) + 1
    })

    const placedStudents = students.filter(s => s.applications.some(a => a.status === 'hired'))
    const placementRate = students.length > 0 ? Math.round((placedStudents.length / students.length) * 100) : 0

    const companyCounts = {}
    students.forEach(s => {
      s.applications.filter(a => a.status === 'hired').forEach(a => {
        const companyName = a.job?.company?.companyName || 'Unknown'
        companyCounts[companyName] = (companyCounts[companyName] || 0) + 1
      })
    })
    const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))

    res.json({
      totalStudents: students.length,
      placedStudents: placedStudents.length,
      placementRate,
      branchBreakdown: Object.entries(branchCounts).map(([branch, count]) => ({ branch, count })),
      topCompanies
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


const getCollegeSuggestions = async (req, res) => {
  try {
    const { stream, careerField } = req.query
    if (!stream && !careerField) return res.json({ colleges: [] })

    let colleges = []
    if (stream) {
      const all = await prisma.college.findMany({ where: { vetted: true, collegeType: 'Intermediate' } })
      colleges = all.filter(c => (c.streams || '').toLowerCase().split(',').map(s => s.trim()).includes(stream.toLowerCase()))
    } else if (careerField) {
      const all = await prisma.college.findMany({ where: { vetted: true, collegeType: 'Degree' } })
      colleges = all.filter(c => (c.careerFields || '').toLowerCase().split(',').map(s => s.trim()).includes(careerField.toLowerCase()))
    }

    res.json({
      colleges: colleges.map(c => ({
        id: c.id,
        collegeName: c.collegeName,
        city: c.city,
        state: c.state,
        logoUrl: c.logoUrl
      }))
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCollegeJobs = async (req, res) => {
  try {
    const userId = req.user.userId
    const college = await prisma.college.findUnique({ where: { userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const jobs = await prisma.job.findMany({
      where: { targetCollegeId: college.id },
      include: { company: { select: { companyName: true, industry: true } }, applications: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getActiveCollegesList, getCollegeProfile, getCollegeDashboard, getCollegeStudents, getCollegeAnalytics, getCollegeSuggestions, getCollegeJobs }
