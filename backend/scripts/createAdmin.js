require('dotenv').config({ path: require('path').join(__dirname, '../', '.env') })
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const readline = require('readline')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

const run = async () => {
  console.log('\n=== Create GRID Admin Account ===\n')
  const name = await ask('Admin name: ')
  const email = await ask('Admin email: ')
  const password = await ask('Admin password (min 6 chars): ')

  if (!email || !password || password.length < 6) {
    console.log('\nEmail required and password must be at least 6 characters. Aborting.')
    rl.close()
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('\nA user with this email already exists. Aborting.')
    rl.close()
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { name: name || 'Admin', email, passwordHash, role: 'admin', emailVerified: true }
  })

  console.log('\n=== Admin created successfully ===')
  console.log('Email:', email)
  console.log('Login at: /admin-login\n')
  rl.close()
  process.exit(0)
}
run().catch(e => { console.error(e); rl.close(); process.exit(1) })
