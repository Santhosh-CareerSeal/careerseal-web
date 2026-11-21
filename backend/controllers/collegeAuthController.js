const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const collegeLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
      where: { email },
      include: { college: true }
    })
    if (!user || user.role !== 'college' || !user.college) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' })

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      college: user.college
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const changeCollegePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.userId
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'college') return res.status(404).json({ message: 'College account not found' })
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' })
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    res.json({ message: 'Password updated successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Public: a college/TPO applies to partner with GRID. Creates a pending
// application for the super admin to review — no login account yet.
const applyCollege = async (req, res) => {
  try {
    const { collegeName, tpoName, tpoEmail, tpoPhone, city, state, collegeType, aisheCode, studentCount, website, message } = req.body
    if (!collegeName || !collegeName.trim()) return res.status(400).json({ message: 'College name is required' })
    if (!tpoEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tpoEmail)) return res.status(400).json({ message: 'A valid contact email is required' })

    // Soft de-dupe: don't let the same email spam pending applications.
    const dup = await prisma.collegeApplication.findFirst({ where: { tpoEmail, status: 'pending' } })
    if (dup) return res.status(200).json({ message: 'We already have your application on file — our team will be in touch.' })

    await prisma.collegeApplication.create({
      data: {
        collegeName: collegeName.trim(), tpoName, tpoEmail, tpoPhone,
        city, state, collegeType, aisheCode, studentCount, website, message
      }
    })
    res.status(201).json({ message: 'Application received! Our team will review it and reach out to you.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { collegeLogin, changeCollegePassword, applyCollege }
