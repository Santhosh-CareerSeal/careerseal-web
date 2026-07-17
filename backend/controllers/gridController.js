const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const generateGridNumber = () => {
  const year = new Date().getFullYear()
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `GRID-IN-${year}-${random}`
}

const getGridCard = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true }
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    let student = user.student
    if (!student) {
      student = await prisma.student.create({ data: { userId } })
    }

    if (!student.gridNumber) {
      student = await prisma.student.update({
        where: { userId },
        data: { gridNumber: generateGridNumber() }
      })
    }

    res.json({
      gridCard: {
        gridNumber: student.gridNumber,
        name: user.name,
        email: user.email,
        education: student.education || 'Not verified yet',
        skills: student.skills || 'Not added yet',
        aadhaarVerified: false,
        digiLockerVerified: false,
        mcaVerified: false
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateGridProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const { education, skills } = req.body

    const student = await prisma.student.upsert({
      where: { userId },
      update: { education, skills },
      create: { userId, education, skills }
    })

    res.json({ message: 'Profile updated successfully', student })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getGridCard, updateGridProfile }
