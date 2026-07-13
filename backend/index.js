const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const { PrismaClient } = require('@prisma/client')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const jobRoutes = require('./routes/jobRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const gridRoutes = require('./routes/gridRoutes')
const publicRoutes = require('./routes/publicRoutes')
const companyRoutes = require('./routes/companyRoutes')
const examRoutes = require('./routes/examRoutes')
const courseRoutes = require('./routes/courseRoutes')
const collegeRoutes = require('./routes/collegeRoutes')
const otpRoutes = require('./routes/otpRoutes')
const roadmapRoutes = require('./routes/roadmapRoutes')

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000
const profileRoutes = require('./routes/profileRoutes')

app.use(helmet())
app.use(cors({
  origin: ['https://thegridcard.com', 'https://www.thegridcard.com', 'https://gridcard.in', 'https://www.gridcard.in', 'https://careerseal-web.vercel.app', 'http://localhost:5173'],
  credentials: true
}))
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please slow down.' }
})
app.use('/api/', generalLimiter)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${req.ip}`)
  next()
})
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${req.ip}`)
  next()
})
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    await prisma.$connect()
    res.json({ message: 'GRID API is running!', database: 'Connected ✅' })
  } catch (error) {
    res.json({ message: 'GRID API is running!', database: 'Failed ❌', error: error.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/grid', gridRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/college', collegeRoutes)
app.use('/api/otp', otpRoutes)
app.use('/api/roadmap', roadmapRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})