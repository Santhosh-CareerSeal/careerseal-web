const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const prisma = new PrismaClient()

const randomGridNumber = () => {
  const year = new Date().getFullYear()
  const random = 10000000 + crypto.randomInt(0, 90000000) // 8 digits, CSPRNG
  return `GRID-IN-${year}-${random}`
}

// Produce a GRID number that isn't already taken. The @unique column is the hard
// guarantee; this pre-check just keeps a collision from ever surfacing as a 500.
const generateUniqueGridNumber = async () => {
  for (let i = 0; i < 6; i++) {
    const candidate = randomGridNumber()
    const existing = await prisma.student.findUnique({ where: { gridNumber: candidate } })
    if (!existing) return candidate
  }
  // Astronomically unlikely fallback: widen entropy with a time-based suffix.
  return `GRID-IN-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`
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
      // Race-safe: retry if two concurrent requests pick the same number.
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          student = await prisma.student.update({
            where: { userId },
            data: { gridNumber: await generateUniqueGridNumber() }
          })
          break
        } catch (e) {
          if (e.code === 'P2002' && attempt < 4) continue // unique violation → try again
          throw e
        }
      }
    }

    // The card shows the PUBLISHED snapshot, not the live draft. Back-fill the
    // snapshot once for accounts that were published before this feature existed.
    if (!student.publishedProfile && student.gridPublished) {
      const { publishedProfile: _old, ...snap } = student
      await prisma.student.update({ where: { userId }, data: { publishedProfile: snap } })
      student.publishedProfile = snap
    }
    const pub = student.publishedProfile || null

    res.json({
      gridCard: {
        gridNumber: student.gridNumber,
        name: user.name,
        email: user.email,
        education: (pub?.education) || 'Not verified yet',
        skills: (pub?.skills) || 'Not added yet',
        aadhaarVerified: false,
        digiLockerVerified: false,
        mcaVerified: false
      },
      published: pub,
      gridPublished: student.gridPublished,
      hasUnpublishedChanges: student.hasUnpublishedChanges
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
