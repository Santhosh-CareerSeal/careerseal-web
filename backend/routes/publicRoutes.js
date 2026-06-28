const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/profile/:gridNumber', async (req, res) => {
  try {
    const { gridNumber } = req.params
    const student = await prisma.student.findUnique({
      where: { gridNumber },
      include: { user: { select: { name: true, email: true } } }
    })
    if (!student) return res.status(404).json({ message: 'Profile not found' })
    if (!student.gridPublished) return res.status(403).json({ message: 'Profile not yet published to GRID' })

    res.json({
      name: student.user?.name,
      email: student.user?.email,
      gridNumber: student.gridNumber,
      photoUrl: student.photoUrl,
      bio: student.bio,
      contactNumber: student.contactNumber,
      city: student.city,
      state: student.state,
      workStatus: student.workStatus,
      jobTitle: student.jobTitle,
      currentCompany: student.currentCompany,
      preferredWorkLocation: student.preferredWorkLocation,
      preferredJobType: student.preferredJobType,
      expectedSalary: student.expectedSalary,
      noticePeriod: student.noticePeriod,
      education: student.education,
      degree: student.degree,
      branch: student.branch,
      collegeName: student.collegeName,
      collegePassingYear: student.collegePassingYear,
      collegeCGPA: student.collegeCGPA,
      pgDegree: student.pgDegree,
      pgBranch: student.pgBranch,
      pgCollegeName: student.pgCollegeName,
      pgPassingYear: student.pgPassingYear,
      pgCGPA: student.pgCGPA,
      twelfthSchoolName: student.twelfthSchoolName,
      twelfthBoard: student.twelfthBoard,
      twelfthPassingYear: student.twelfthPassingYear,
      twelfthPercentage: student.twelfthPercentage,
      schoolName: student.schoolName,
      schoolBoard: student.schoolBoard,
      schoolPassingYear: student.schoolPassingYear,
      schoolPercentage: student.schoolPercentage,
      technicalSkills: student.technicalSkills,
      softSkills: student.softSkills,
      toolsAndSoftware: student.toolsAndSoftware,
      languagesKnown: student.languagesKnown,
      certifications: student.certifications,
      hobbies: student.hobbies,
      workExperience: student.workExperience,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router
