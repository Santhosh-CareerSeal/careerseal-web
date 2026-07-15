const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const { PrismaClient } = require('@prisma/client')
const { sendOTPEmail, sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService')
const { validateEmail, validateIndianMobile } = require('../utils/emailValidator')
const prisma = new PrismaClient()

// SIGNUP — direct account creation (email verification parked until domain verified)
const initiateSignup = async (req, res) => {
  try {
    const { name, email, password, role, mobile, workStatus, companyName, industry, companySize, website, designation } = req.body

    // Validate email format and block disposable domains
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) return res.status(400).json({ message: emailCheck.message })

    // Validate mobile if provided
    if (mobile) {
      const mobileCheck = validateIndianMobile(mobile)
      if (!mobileCheck.valid) return res.status(400).json({ message: mobileCheck.message })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ message: 'An account with this email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const crypto = require('crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        name, email, passwordHash,
        role: role || 'student',
        emailVerified: false,
        verificationToken,
        student: (role === 'student' || !role) ? {
          create: { contactNumber: mobile || null, workStatus: workStatus || null, profileComplete: false }
        } : undefined,
        company: role === 'company' ? {
          create: { companyName: companyName || name, mcaStatus: 'pending' }
        } : undefined
      }
    })

    // Send verification link email (non-blocking - account already created)
    await sendVerificationEmail(email, name, verificationToken)

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({
      message: 'Account created! Please check your email to verify.',
      token,
      email: user.email,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: false }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// STEP 2: Verify OTP and create real account
const verifyAndCreateAccount = async (req, res) => {
  try {
    const { email, otp } = req.body

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } })
    if (!pending) return res.status(400).json({ message: 'No pending registration found. Please register again.' })
    if (new Date() > new Date(pending.otpExpiry)) return res.status(400).json({ message: 'Code expired. Please register again.', expired: true })
    if (pending.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid code. Please try again.' })

    const extra = JSON.parse(pending.extraData || '{}')

    // Create real user account
    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        role: pending.role,
        student: (pending.role === 'student' || !pending.role) ? {
          create: { contactNumber: extra.mobile || null, workStatus: extra.workStatus || null, profileComplete: false }
        } : undefined,
        company: pending.role === 'company' ? {
          create: { companyName: extra.companyName || pending.name, mcaStatus: 'pending' }
        } : undefined
      }
    })

    // Delete pending registration
    await prisma.pendingRegistration.delete({ where: { email } })

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) return res.status(400).json({ message: emailCheck.message })

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

// FORGOT PASSWORD — send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) return res.status(400).json({ message: emailCheck.message })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(200).json({ message: 'If this email exists, a reset code has been sent.' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({ where: { email }, data: { otp, otpExpiry } })
    await sendPasswordResetEmail(email, user.name, otp)

    res.json({ message: 'If this email exists, a reset code has been sent.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// RESET PASSWORD — verify OTP + set new password
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ message: 'No reset code found. Please request a new one.' })
    if (new Date() > new Date(user.otpExpiry)) return res.status(400).json({ message: 'Code expired. Please request a new one.' })
    if (user.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid code. Please try again.' })
    res.json({ message: 'Code verified', valid: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ message: 'No reset code found. Please request a new one.' })
    if (new Date() > new Date(user.otpExpiry)) return res.status(400).json({ message: 'Code expired. Please request a new one.' })
    if (user.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid code. Please try again.' })
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { email }, data: { passwordHash, otp: null, otpExpiry: null } })

    res.json({ message: 'Password reset successfully! Please sign in.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// CHANGE PASSWORD (logged in)
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId
    const { currentPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' })
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId
    await prisma.user.delete({ where: { id: userId } })
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      await prisma.blacklistedToken.create({ data: { token } })
    }
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const verifyEmailLink = async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ message: 'Verification token is missing' })
    const user = await prisma.user.findFirst({ where: { verificationToken: token } })
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' })
    if (user.emailVerified) return res.json({ message: 'Email already verified!', alreadyVerified: true })
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    })
    res.json({ message: 'Email verified successfully!', verified: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Resend verification link
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' })
    const crypto = require('crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken } })
    await sendVerificationEmail(email, user.name, verificationToken)
    res.json({ message: 'Verification email sent!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const googleAuth = async (req, res) => {
  try {
    const { credential, googleUser, role } = req.body
    if (!credential) return res.status(400).json({ message: 'No Google credential provided' })

    // Verify the access token by calling Google's userinfo endpoint
    let email, name
    try {
      const https = require('https')
      const verifyRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + credential }
      })
      const gUser = await verifyRes.json()
      if (!gUser || !gUser.email) return res.status(400).json({ message: 'Could not verify Google account' })
      email = gUser.email
      name = gUser.name || email.split('@')[0]
    } catch (verifyErr) {
      return res.status(400).json({ message: 'Google verification failed' })
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create new account (Google users are auto-verified since Google verified their email)
      const crypto = require('crypto')
      const randomPassword = crypto.randomBytes(32).toString('hex')
      const passwordHash = await bcrypt.hash(randomPassword, 10)
      user = await prisma.user.create({
        data: {
          name, email, passwordHash,
          role: role || 'student',
          emailVerified: true,
          student: (role === 'student' || !role) ? {
            create: { profileComplete: false }
          } : undefined,
          company: role === 'company' ? {
            create: { companyName: name, mcaStatus: 'pending' }
          } : undefined
        }
      })
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      message: 'Google sign-in successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified }
    })
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed', error: error.message })
  }
}

module.exports = { initiateSignup, verifyAndCreateAccount, login, forgotPassword, verifyResetOtp, resetPassword, changePassword, deleteAccount, logout, verifyEmailLink, resendVerification , googleAuth }
