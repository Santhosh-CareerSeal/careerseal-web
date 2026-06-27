const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getProfileDetails = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    res.json({ student })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const completeProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const {
      photoUrl, dateOfBirth, gender, contactNumber, address, city, state, pincode,
      schoolName, schoolBoard, schoolPassingYear, schoolPercentage,
      twelfthSchoolName, twelfthBoard, twelfthPassingYear, twelfthPercentage,
      collegeName, degree, branch, collegePassingYear, collegeCGPA,
      pgCollegeName, pgDegree, pgBranch, pgPassingYear, pgCGPA,
      workStatus, currentCompany, jobTitle, workExperience,
      preferredJobType, preferredWorkLocation, noticePeriod, expectedSalary,
      technicalSkills, softSkills, languagesKnown, certifications, toolsAndSoftware,
      hobbies, pfAccountNumber, aadhaarNumber, digiLockerStatus, bio
    } = req.body

    const education = `${degree || ''} ${branch || ''} ${collegeName || ''}`.trim()
    const schoolCollege = collegeName || schoolName || ''
    const skills = technicalSkills || ''

    const student = await prisma.student.upsert({
      where: { userId },
      update: {
        photoUrl, dateOfBirth, gender, contactNumber, address, city, state, pincode,
        schoolName, schoolBoard, schoolPassingYear, schoolPercentage,
        twelfthSchoolName, twelfthBoard, twelfthPassingYear, twelfthPercentage,
        collegeName, degree, branch, collegePassingYear, collegeCGPA,
        pgCollegeName, pgDegree, pgBranch, pgPassingYear, pgCGPA,
        workStatus, currentCompany, jobTitle, workExperience,
        preferredJobType, preferredWorkLocation, noticePeriod, expectedSalary,
        technicalSkills, softSkills, languagesKnown, certifications, toolsAndSoftware,
        hobbies, pfAccountNumber, aadhaarNumber, digiLockerStatus, bio,
        education, schoolCollege, skills, profileComplete: true
      },
      create: {
        userId, photoUrl, dateOfBirth, gender, contactNumber, address, city, state, pincode,
        schoolName, schoolBoard, schoolPassingYear, schoolPercentage,
        twelfthSchoolName, twelfthBoard, twelfthPassingYear, twelfthPercentage,
        collegeName, degree, branch, collegePassingYear, collegeCGPA,
        pgCollegeName, pgDegree, pgBranch, pgPassingYear, pgCGPA,
        workStatus, currentCompany, jobTitle, workExperience,
        preferredJobType, preferredWorkLocation, noticePeriod, expectedSalary,
        technicalSkills, softSkills, languagesKnown, certifications, toolsAndSoftware,
        hobbies, pfAccountNumber, aadhaarNumber, digiLockerStatus, bio,
        education, schoolCollege, skills, profileComplete: true
      }
    })
    res.json({ message: 'Profile saved successfully', student })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const moveToGrid = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Profile not found' })

    const currentMonth = new Date().getMonth()
    const updatesThisMonth = student.gridLastUpdatedMonth === currentMonth
      ? student.gridUpdatesThisMonth
      : 0

    if (updatesThisMonth >= 3) {
      return res.status(400).json({ message: 'You can only update your GRID card 3 times per month.' })
    }

    await prisma.student.update({
      where: { userId },
      data: {
        gridPublished: true,
        gridUpdatesThisMonth: updatesThisMonth + 1,
        gridLastUpdatedMonth: currentMonth
      }
    })

    res.json({ message: 'Profile published to GRID successfully', updatesRemaining: 3 - (updatesThisMonth + 1) })
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

module.exports = { getProfileDetails, completeProfile, moveToGrid, getProfileStatus }
