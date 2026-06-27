const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const signup = async (req, res) => {
  try {
    const { name, email, password, role, mobile, workStatus } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'student',
        student: (role === 'student' || !role) ? {
          create: {
            contactNumber: mobile || null,
            profileComplete: false
          }
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
      include: { student: true }
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const profileComplete = user.student?.profileComplete || false

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login successful',
      token,
      profileComplete,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { signup, login }
