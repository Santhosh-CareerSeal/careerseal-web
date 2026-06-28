const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { PrismaClient } = require('@prisma/client')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const jobRoutes = require('./routes/jobRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const gridRoutes = require('./routes/gridRoutes')
const publicRoutes = require('./routes/publicRoutes')

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000
const profileRoutes = require('./routes/profileRoutes')

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    await prisma.$connect()
    res.json({ message: 'CareerSeal API is running!', database: 'Connected ✅' })
  } catch (error) {
    res.json({ message: 'CareerSeal API is running!', database: 'Failed ❌', error: error.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/grid', gridRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/public', publicRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})