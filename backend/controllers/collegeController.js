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

// Public: resolve a college by its slug for the /join/:slug invite flow.
const getCollegeBySlug = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, collegeName: true, city: true, state: true, slug: true, logoUrl: true }
    })
    if (!college) return res.status(404).json({ message: 'College not found' })
    res.json({ college })
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

// College updates its own profile (logo + a few editable fields).
const updateCollegeProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const college = await prisma.college.findUnique({ where: { userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const { logoUrl, tpoPhone, city, state } = req.body
    const data = {}
    if (logoUrl !== undefined) data.logoUrl = logoUrl
    if (tpoPhone !== undefined) data.tpoPhone = tpoPhone
    if (city !== undefined) data.city = city
    if (state !== undefined) data.state = state
    const updated = await prisma.college.update({ where: { userId }, data })
    res.json({ message: 'Profile updated', college: updated })
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
      include: { user: { select: { name: true, email: true } }, verifiedSkills: true, applications: true, placement: true }
    })

    const totalStudents = students.length
    const profileCompleteCount = students.filter(s => s.profileComplete).length
    const gridPublishedCount = students.filter(s => s.gridPublished).length
    const placedCount = students.filter(s => !!s.placement || s.applications.some(a => a.status === 'hired')).length
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

    const acct = await prisma.user.findUnique({ where: { id: userId }, select: { mustChangePassword: true } })

    res.json({
      college,
      stats: { totalStudents, profileCompleteCount, gridPublishedCount, placedCount, totalApplications },
      recentStudents,
      mustChangePassword: acct?.mustChangePassword === true
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
      include: { user: { select: { name: true, email: true } }, verifiedSkills: true, applications: true, placement: true }
    })

    const formatted = students.map(s => ({
      id: s.id,
      name: s.user?.name,
      email: s.user?.email,
      gridNumber: s.gridNumber,
      placement: s.placement ? { companyName: s.placement.companyName, role: s.placement.role, ctc: s.placement.ctc } : null,
      gridPublished: s.gridPublished,
      profileComplete: s.profileComplete,
      branch: s.branch,
      degree: s.degree,
      collegePassingYear: s.collegePassingYear,
      workStatus: s.workStatus,
      technicalSkills: s.technicalSkills,
      verifiedSkillsCount: s.verifiedSkills.filter(v => new Date(v.expiresAt) > new Date()).length,
      applicationsCount: s.applications.length,
      placed: !!s.placement || s.applications.some(a => a.status === 'hired')
    }))

    res.json({ students: formatted })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// College records / updates a student's placement outcome (company, role, CTC).
const recordPlacement = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const studentId = parseInt(req.params.studentId)
    const student = await prisma.student.findFirst({ where: { id: studentId, collegeId: college.id } })
    if (!student) return res.status(404).json({ message: 'Student not found in your college' })

    const { companyName, role, ctc } = req.body
    if (!companyName || !companyName.trim()) return res.status(400).json({ message: 'Company name is required' })
    const ctcNum = ctc === '' || ctc == null ? null : parseFloat(ctc)
    if (ctc != null && ctc !== '' && (isNaN(ctcNum) || ctcNum < 0)) return res.status(400).json({ message: 'Enter a valid CTC in LPA' })

    const placement = await prisma.placement.upsert({
      where: { studentId },
      update: { companyName: companyName.trim(), role: role || null, ctc: ctcNum, collegeId: college.id, recordedBy: 'college' },
      create: { studentId, collegeId: college.id, companyName: companyName.trim(), role: role || null, ctc: ctcNum, recordedBy: 'college' }
    })
    res.json({ message: 'Placement recorded', placement })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const removePlacement = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const studentId = parseInt(req.params.studentId)
    const student = await prisma.student.findFirst({ where: { id: studentId, collegeId: college.id } })
    if (!student) return res.status(404).json({ message: 'Student not found in your college' })
    await prisma.placement.deleteMany({ where: { studentId } })
    res.json({ message: 'Placement removed' })
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
      include: { applications: { include: { job: { include: { company: true } } } }, placement: true }
    })

    const isPlaced = (s) => !!s.placement || s.applications.some(a => a.status === 'hired')

    const branchCounts = {}
    const branchMap = {}
    students.forEach(s => {
      const branch = s.branch || 'Not specified'
      branchCounts[branch] = (branchCounts[branch] || 0) + 1
      if (!branchMap[branch]) branchMap[branch] = { branch, total: 0, placed: 0 }
      branchMap[branch].total++
      if (isPlaced(s)) branchMap[branch].placed++
    })
    const branchPlacement = Object.values(branchMap).map(b => ({ ...b, rate: b.total ? Math.round((b.placed / b.total) * 100) : 0 }))

    const placedStudents = students.filter(isPlaced)
    const placementRate = students.length > 0 ? Math.round((placedStudents.length / students.length) * 100) : 0

    // CTC stats come from recorded Placement records (real salary data).
    const ctcs = students.map(s => s.placement?.ctc).filter(v => typeof v === 'number' && v > 0).sort((a, b) => a - b)
    const ctcStats = ctcs.length ? {
      highest: ctcs[ctcs.length - 1],
      average: Math.round((ctcs.reduce((a, b) => a + b, 0) / ctcs.length) * 100) / 100,
      median: ctcs.length % 2 ? ctcs[(ctcs.length - 1) / 2] : Math.round(((ctcs[ctcs.length / 2 - 1] + ctcs[ctcs.length / 2]) / 2) * 100) / 100,
      offers: ctcs.length
    } : null

    // Top companies: prefer recorded placements, fall back to hired applications.
    const companyCounts = {}
    students.forEach(s => {
      if (s.placement?.companyName) {
        const n = s.placement.companyName
        companyCounts[n] = (companyCounts[n] || 0) + 1
      } else {
        s.applications.filter(a => a.status === 'hired').forEach(a => {
          const n = a.job?.company?.companyName || a.job?.driveCompany || 'Unknown'
          companyCounts[n] = (companyCounts[n] || 0) + 1
        })
      }
    })
    const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))

    res.json({
      totalStudents: students.length,
      placedStudents: placedStudents.length,
      placementRate,
      branchBreakdown: Object.entries(branchCounts).map(([branch, count]) => ({ branch, count })),
      branchPlacement,
      ctcStats,
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
      where: { targetCollegeId: college.id, OR: [{ isDrive: false }, { isDrive: null }] },
      include: { company: { select: { companyName: true, industry: true } }, applications: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


const getCollegeDrives = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const drives = await prisma.job.findMany({
      where: { targetCollegeId: college.id, isDrive: true },
      include: { applications: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ drives })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createCollegeDrive = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const b = req.body
    if (!b.title) return res.status(400).json({ message: 'Drive title is required' })
    const drive = await prisma.job.create({
      data: {
        title: b.title,
        description: b.description || null,
        salaryRange: b.salaryRange || null,
        location: b.driveLocation || null,
        status: b.status || 'active',
        targetCollegeId: college.id,
        isDrive: true,
        driveCompany: b.driveCompany || null,
        driveDate: b.driveDate || null,
        driveMode: b.driveMode || null,
        driveLocation: b.driveLocation || null,
        eligBranches: b.eligBranches || null,
        eligMinCGPA: b.eligMinCGPA || null,
        eligBatchYear: b.eligBatchYear || null,
        allowBacklogs: b.allowBacklogs !== undefined ? b.allowBacklogs : true
      }
    })
    res.status(201).json({ message: 'Drive created', drive })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateCollegeDrive = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const drive = await prisma.job.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!drive || drive.targetCollegeId !== college.id || !drive.isDrive) {
      return res.status(404).json({ message: 'Drive not found' })
    }
    const b = req.body
    const updated = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title: b.title ?? drive.title,
        description: b.description ?? drive.description,
        salaryRange: b.salaryRange ?? drive.salaryRange,
        status: b.status ?? drive.status,
        driveCompany: b.driveCompany ?? drive.driveCompany,
        driveDate: b.driveDate ?? drive.driveDate,
        driveMode: b.driveMode ?? drive.driveMode,
        driveLocation: b.driveLocation ?? drive.driveLocation,
        eligBranches: b.eligBranches ?? drive.eligBranches,
        eligMinCGPA: b.eligMinCGPA ?? drive.eligMinCGPA,
        eligBatchYear: b.eligBatchYear ?? drive.eligBatchYear,
        allowBacklogs: b.allowBacklogs ?? drive.allowBacklogs
      }
    })
    res.json({ message: 'Drive updated', drive: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteCollegeDrive = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const drive = await prisma.job.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!drive || drive.targetCollegeId !== college.id || !drive.isDrive) {
      return res.status(404).json({ message: 'Drive not found' })
    }
    await prisma.application.deleteMany({ where: { jobId: drive.id } })
    await prisma.job.delete({ where: { id: drive.id } })
    res.json({ message: 'Drive deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getDriveEligibleStudents = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })
    const drive = await prisma.job.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!drive || drive.targetCollegeId !== college.id || !drive.isDrive) {
      return res.status(404).json({ message: 'Drive not found' })
    }
    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: { user: { select: { name: true, email: true } } }
    })
    const branches = drive.eligBranches ? drive.eligBranches.toLowerCase().split(',').map(x => x.trim()).filter(Boolean) : []
    const minCGPA = drive.eligMinCGPA ? parseFloat(drive.eligMinCGPA) : null
    const batch = drive.eligBatchYear ? drive.eligBatchYear.trim() : null
    const eligible = students.filter(s => {
      if (branches.length && !branches.includes((s.branch || '').toLowerCase().trim())) return false
      if (minCGPA !== null) { const c = parseFloat(s.collegeCGPA); if (isNaN(c) || c < minCGPA) return false }
      if (batch && (s.collegePassingYear || '').trim() !== batch) return false
      return true
    }).map(s => ({ id: s.id, name: s.user?.name, email: s.user?.email, branch: s.branch, collegeCGPA: s.collegeCGPA, collegePassingYear: s.collegePassingYear }))
    res.json({ eligible, total: eligible.length })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


const getCollegeReports = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.userId } })
    if (!college) return res.status(404).json({ message: 'College not found' })

    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: {
        user: { select: { name: true, email: true } },
        applications: { include: { job: { include: { company: true } } } }
      }
    })

    const studentRows = students.map(s => {
      const hiredApp = s.applications.find(a => a.status === 'hired')
      return {
        name: s.user?.name || '',
        email: s.user?.email || '',
        branch: s.branch || '',
        degree: s.degree || '',
        batch: s.collegePassingYear || '',
        cgpa: s.collegeCGPA || '',
        gridPublished: s.gridPublished ? 'Yes' : 'No',
        totalApplications: s.applications.length,
        placed: hiredApp ? 'Yes' : 'No',
        placedCompany: hiredApp ? (hiredApp.job?.driveCompany || hiredApp.job?.company?.companyName || '') : '',
        placedRole: hiredApp ? (hiredApp.job?.title || '') : '',
        package: hiredApp ? (hiredApp.job?.salaryRange || '') : ''
      }
    })

    const totalStudents = students.length
    const placedCount = studentRows.filter(r => r.placed === 'Yes').length
    const placementRate = totalStudents ? Math.round((placedCount / totalStudents) * 100) : 0

    const branchMap = {}
    studentRows.forEach(r => {
      const b = r.branch || 'Not specified'
      if (!branchMap[b]) branchMap[b] = { branch: b, total: 0, placed: 0 }
      branchMap[b].total++
      if (r.placed === 'Yes') branchMap[b].placed++
    })
    const branchRows = Object.values(branchMap).map(b => ({ ...b, rate: b.total ? Math.round((b.placed / b.total) * 100) : 0 }))

    const drives = await prisma.job.findMany({
      where: { targetCollegeId: college.id, isDrive: true },
      include: { applications: true }
    })
    const driveRows = drives.map(d => ({
      title: d.title || '',
      company: d.driveCompany || '',
      date: d.driveDate || '',
      mode: d.driveMode || '',
      package: d.salaryRange || '',
      applied: d.applications.length,
      hired: d.applications.filter(a => a.status === 'hired').length
    }))

    res.json({
      college: { name: college.collegeName, city: college.city, state: college.state },
      summary: { totalStudents, placedCount, placementRate },
      studentRows,
      branchRows,
      driveRows
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getActiveCollegesList, getCollegeBySlug, updateCollegeProfile, recordPlacement, removePlacement, getCollegeProfile, getCollegeDashboard, getCollegeStudents, getCollegeAnalytics, getCollegeSuggestions, getCollegeJobs, getCollegeDrives, createCollegeDrive, updateCollegeDrive, deleteCollegeDrive, getDriveEligibleStudents, getCollegeReports }
