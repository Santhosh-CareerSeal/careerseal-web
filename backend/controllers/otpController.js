const { PrismaClient } = require('@prisma/client')
const { sendOTPEmail } = require('../services/emailService')
const prisma = new PrismaClient()

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' })

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry }
    })

    const sent = await sendOTPEmail(email, user.name, otp)
    if (!sent) return res.status(500).json({ message: 'Failed to send email. Please try again.' })

    res.json({ message: 'Verification code sent to your email' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' })
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ message: 'No verification code found. Request a new one.' })
    if (new Date() > new Date(user.otpExpiry)) return res.status(400).json({ message: 'Code expired. Request a new one.' })
    if (user.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid code. Please try again.' })

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, otp: null, otpExpiry: null }
    })

    res.json({ message: 'Email verified successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { sendVerificationOTP, verifyOTP }
