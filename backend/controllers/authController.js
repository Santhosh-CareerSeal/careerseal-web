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
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
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

module.exports = { signup, login }
