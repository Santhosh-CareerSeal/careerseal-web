const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body
    const userId = req.user.userId

    // Gate: email must be verified before applying (companies need a reachable contact)
    const applicant = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } })
    if (!applicant || !applicant.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before applying. Companies need to be able to reach you.',
        needsVerification: true
      })
    }

    let student = await prisma.student.findUnique({ where: { userId } })
    if (!student) {
      student = await prisma.student.create({ data: { userId } })
    }

    const existing = await prisma.application.findFirst({
      where: { studentId: student.id, jobId: parseInt(jobId) }
    })
    if (existing) {
      return res.status(400).json({ message: 'Already applied to this job' })
    }

    const application = await prisma.application.create({
      data: { studentId: student.id, jobId: parseInt(jobId), status: 'pending' }
    })

    res.status(201).json({ message: 'Application submitted successfully', application })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId

    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.json({ applications: [] })

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ applications })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


const getCompanyApplications = async (req, res) => {
  try {
    const userId = req.user.userId

    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.json({ applications: [] })

    const applications = await prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        job: true,
        student: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ applications })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const application = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    res.json({ message: 'Status updated', application })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { applyToJob, getMyApplications, getCompanyApplications, updateApplicationStatus }
