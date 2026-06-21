const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const completeProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const {
      contactNumber,
      address,
      schoolCollege,
      education,
      skills,
      hobbies,
      workExperience,
      photoUrl,
      preferredWorkLocation,
      pfAccountNumber
    } = req.body

    const student = await prisma.student.upsert({
      where: { userId },
      update: {
        contactNumber,
        address,
        schoolCollege,
        education,
        skills,
        hobbies,
        workExperience,
        photoUrl,
        preferredWorkLocation,
        pfAccountNumber,
        profileComplete: true
      },
      create: {
        userId,
        contactNumber,
        address,
        schoolCollege,
        education,
        skills,
        hobbies,
        workExperience,
        photoUrl,
        preferredWorkLocation,
        pfAccountNumber,
        profileComplete: true
      }
    })

    res.json({ message: 'Profile completed successfully', student })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getProfileStatus = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    res.json({ profileComplete: student?.profileComplete || false })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { completeProfile, getProfileStatus }
