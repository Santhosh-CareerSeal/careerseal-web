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
    const jobs = await prisma.job.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createJob, getAllJobs }
