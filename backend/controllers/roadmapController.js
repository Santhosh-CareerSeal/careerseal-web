const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId }, include: { roadmap: true } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    res.json({ roadmap: student.roadmap, workStatus: student.workStatus })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveAnswers = async (req, res) => {
  try {
    const userId = req.user.userId
    const { answers, workStatus } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const roadmap = await prisma.roadmap.upsert({
      where: { studentId: student.id },
      update: { answers: JSON.stringify(answers), workStatus, careerOptions: '', selectedCareer: null, roadmapContent: null },
      create: { studentId: student.id, answers: JSON.stringify(answers), workStatus, careerOptions: '' }
    })
    res.json({ message: 'Answers saved', roadmap })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const selectCareer = async (req, res) => {
  try {
    const userId = req.user.userId
    const { selectedCareer, careerOptions } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    await prisma.roadmap.update({
      where: { studentId: student.id },
      data: { selectedCareer, careerOptions: JSON.stringify(careerOptions) }
    })
    res.json({ message: 'Career selected' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId
    const { roadmapContent } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const existing = await prisma.roadmap.findUnique({ where: { studentId: student.id } })
    const currentMonth = new Date().getMonth()
    const regens = existing?.lastRegeneratedMonth === currentMonth ? existing.regeneratesThisMonth : 0
    if (regens >= 3) return res.status(400).json({ message: 'You have used all 3 regenerations this month. Commit to your current roadmap!' })
    await prisma.roadmap.update({
      where: { studentId: student.id },
      data: { roadmapContent, regeneratesThisMonth: regens + 1, lastRegeneratedMonth: currentMonth, updatedAt: new Date() }
    })
    res.json({ message: 'Roadmap saved', regeneratesRemaining: 3 - (regens + 1) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getRoadmap, saveAnswers, selectCareer, saveRoadmap }
