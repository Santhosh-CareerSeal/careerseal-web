const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } }
    })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    res.json({ company })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const { companyName, description, industry, companySize, website, location, foundedYear, linkedIn, twitter } = req.body
    const company = await prisma.company.update({
      where: { userId },
      data: { companyName, description, industry, companySize, website, location, foundedYear, linkedIn, twitter }
    })
    res.json({ message: 'Profile updated', company })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const jobs = await prisma.job.findMany({ where: { companyId: company.id }, include: { applications: true } })
    const activeJobs = jobs.filter(j => j.status === 'active' || !j.status).length
    const totalApplications = jobs.reduce((sum, j) => sum + j.applications.length, 0)
    const shortlisted = await prisma.application.count({ where: { job: { companyId: company.id }, status: 'shortlisted' } })
    const hired = await prisma.application.count({ where: { job: { companyId: company.id }, status: 'hired' } })
    const recentApplications = await prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        job: { select: { title: true, requiredSkills: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    res.json({ activeJobs, totalApplications, shortlisted, hired, recentApplications, company })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const postJob = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const { title, description, requiredSkills, jobType, experienceLevel, location, salaryRange, openings, deadline } = req.body
    if (!title) return res.status(400).json({ message: 'Job title is required' })
    const job = await prisma.job.create({
      data: { title, description, requiredSkills, jobType, experienceLevel, location, salaryRange, openings: parseInt(openings) || 1, deadline, companyId: company.id, status: 'active' }
    })
    res.status(201).json({ message: 'Job posted successfully', job })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: { applications: { include: { student: { include: { user: { select: { name: true, email: true } } } } } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateJob = async (req, res) => {
  try {
    const userId = req.user.userId
    const { jobId } = req.params
    const company = await prisma.company.findUnique({ where: { userId } })
    const job = await prisma.job.findFirst({ where: { id: parseInt(jobId), companyId: company.id } })
    if (!job) return res.status(404).json({ message: 'Job not found' })
    const updated = await prisma.job.update({ where: { id: parseInt(jobId) }, data: req.body })
    res.json({ message: 'Job updated', job: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteJob = async (req, res) => {
  try {
    const userId = req.user.userId
    const { jobId } = req.params
    const company = await prisma.company.findUnique({ where: { userId } })
    const job = await prisma.job.findFirst({ where: { id: parseInt(jobId), companyId: company.id } })
    if (!job) return res.status(404).json({ message: 'Job not found' })
    await prisma.application.deleteMany({ where: { jobId: parseInt(jobId) } })
    await prisma.job.delete({ where: { id: parseInt(jobId) } })
    res.json({ message: 'Job deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCandidates = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const applications = await prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        job: { select: { title: true, requiredSkills: true, jobType: true, location: true, experienceLevel: true } }
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
    const userId = req.user.userId
    const { applicationId } = req.params
    const { status } = req.body
    const company = await prisma.company.findUnique({ where: { userId } })
    const application = await prisma.application.findFirst({
      where: { id: parseInt(applicationId), job: { companyId: company.id } }
    })
    if (!application) return res.status(404).json({ message: 'Application not found' })
    const updated = await prisma.application.update({ where: { id: parseInt(applicationId) }, data: { status } })
    res.json({ message: 'Status updated', application: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const searchTalent = async (req, res) => {
  try {
    const { skills, location, workStatus, minSalary } = req.query
    const students = await prisma.student.findMany({
      where: {
        gridPublished: true,
        ...(workStatus && { workStatus }),
        ...(skills && { OR: [
          { technicalSkills: { contains: skills, mode: 'insensitive' } },
          { skills: { contains: skills, mode: 'insensitive' } }
        ]}),
        ...(location && { OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { preferredWorkLocation: { contains: location, mode: 'insensitive' } }
        ]})
      },
      include: { user: { select: { name: true, email: true } } },
      take: 20
    })
    res.json({ students })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId
    const company = await prisma.company.findUnique({ where: { userId } })
    if (!company) return res.status(404).json({ message: 'Company not found' })
    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: { applications: true }
    })
    const applications = await prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: { student: true, job: { select: { title: true } } }
    })
    const pipeline = {
      applied: applications.length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interview: applications.filter(a => a.status === 'interview').length,
      hired: applications.filter(a => a.status === 'hired').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    }
    const topJobs = jobs.map(j => ({ title: j.title, applications: j.applications.length }))
      .sort((a, b) => b.applications - a.applications).slice(0, 5)
    const skillsCount = {}
    applications.forEach(a => {
      const skills = (a.student?.technicalSkills || '').split(',').map(s => s.trim()).filter(Boolean)
      skills.forEach(s => { skillsCount[s] = (skillsCount[s] || 0) + 1 })
    })
    const topSkills = Object.entries(skillsCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([skill, count]) => ({ skill, count }))
    res.json({ pipeline, topJobs, topSkills, totalJobs: jobs.length, totalApplications: applications.length })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getCompanyProfile, updateCompanyProfile, getDashboardStats, postJob, getMyJobs, updateJob, deleteJob, getCandidates, updateApplicationStatus, searchTalent, getAnalytics }
