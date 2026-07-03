const { sendOTPEmail } = require('../services/emailService')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const signup = async (req, res) => {
  try {
    const { name, email, password, role, mobile, workStatus, companyName, industry, companySize, website, designation } = req.body
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ message: 'Email already exists' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name, email, passwordHash,
        role: role || 'student',
        student: (role === 'student' || !role) ? {
          create: { contactNumber: mobile || null, workStatus: workStatus || null, profileComplete: false }
        } : undefined,
        company: role === 'company' ? {
          create: { companyName: companyName || name, mcaStatus: 'pending' }
        } : undefined
      }
    })
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpiry } })
    await sendOTPEmail(email, name, otp)
    res.status(201).json({
      message: 'Account created! Please verify your email.',
      requiresVerification: true,
      email: user.email
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, company: true }
    })
    if (!user) return res.status(400).json({ message: 'Invalid email or password' })
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' })
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const profileComplete = user.student?.profileComplete || false
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      profileComplete,
      role: user.role
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId
    const { newPassword } = req.body
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId } })
    if (student) {
      await prisma.application.deleteMany({ where: { studentId: student.id } })
      await prisma.roadmap.deleteMany({ where: { studentId: student.id } })
      await prisma.student.delete({ where: { userId } })
    }
    await prisma.user.delete({ where: { id: userId } })
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { signup, login, changePassword, deleteAccount }
