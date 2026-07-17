require('dotenv').config({ path: require('path').join(__dirname, '../', '.env') })
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const readline = require('readline')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

const run = async () => {
  console.log('\n=== Reset GRID Admin Password ===\n')

  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { email: true } })
  if (admins.length === 0) {
    console.log('No admin accounts found. Use createAdmin.js first.')
    rl.close(); process.exit(1)
  }
  console.log('Admin accounts:')
  admins.forEach(a => console.log('  -', a.email))
  console.log('')

  const email = await ask('Which admin email: ')
  const password = await ask('New password (min 10 chars recommended): ')

  if (!password || password.length < 8) {
    console.log('\nPassword must be at least 8 characters. Aborting.')
    rl.close(); process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'admin') {
    console.log('\nNo admin found with that email. Aborting.')
    rl.close(); process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { email }, data: { passwordHash } })

  console.log('\n=== Password updated successfully ===')
  console.log('Admin:', email)
  console.log('Log in at: /admin-login\n')
  rl.close(); process.exit(0)
}
run().catch(e => { console.error(e); rl.close(); process.exit(1) })
