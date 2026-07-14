const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createJob = async (req, res) => {
  try {
    const { title, description, salaryRange } = req.body
    const userId = req.user.userId

    let company = await prisma.company.findUnique({ where: { userId } })
    if (!company) {
      company = await prisma.company.create({
        data: { userId, companyName: 'My Company' }
      })
    }

    const job = await prisma.job.create({
      data: { title, description, salaryRange, companyId: company.id }
    })

    res.status(201).json({ message: 'Job created successfully', job })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllJobs = async (req, res) => {
  try {
    // Find the student's college (if logged in as student)
    let studentCollegeId = null
    if (req.user && req.user.userId) {
      const student = await prisma.student.findUnique({ where: { userId: req.user.userId }, select: { collegeId: true } })
      studentCollegeId = student ? student.collegeId : null
    }
    // Show jobs that are open to all (targetCollegeId null) OR target the student's college
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { targetCollegeId: null },
          ...(studentCollegeId ? [{ targetCollegeId: studentCollegeId }] : [])
        ]
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createJob, getAllJobs }
