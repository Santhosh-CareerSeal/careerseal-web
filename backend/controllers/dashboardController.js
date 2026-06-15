const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            applications: {
              include: { job: true }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const applications = user.student?.applications || []
    const stats = {
      totalApplications: applications.length,
      interviews: applications.filter(a => a.status === 'interview').length,
      savedJobs: 0,
      profileViews: 0
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      stats,
      applications
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getStudentDashboard }
