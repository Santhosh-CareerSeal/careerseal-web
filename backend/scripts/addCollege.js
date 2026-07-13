require('dotenv').config({ path: require('path').join(__dirname, '../', '.env') })
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

const run = async () => {
  console.log('\n=== Add a new College to GRID ===\n')
  const collegeName = await ask('College name: ')
  const city = await ask('City: ')
  const state = await ask('State: ')
  const collegeType = await ask('Type (Intermediate / Degree): ')
  const streams = collegeType.toLowerCase() === 'intermediate'
    ? await ask('Streams offered, comma separated (e.g. MPC, BiPC): ')
    : ''
  const careerFields = collegeType.toLowerCase() === 'degree'
    ? await ask('Career fields strong in, comma separated (e.g. Software Engineer, Data Scientist): ')
    : ''
  const vettedInput = await ask('Mark as vetted/approved right now? (yes/no): ')
  const vetted = vettedInput.trim().toLowerCase() === 'yes'
  const tpoName = await ask('TPO contact name: ')
  const tpoEmail = await ask('TPO login email: ')
  const tpoPhone = await ask('TPO phone (optional, press enter to skip): ')
  const password = await ask('Set a login password for this TPO: ')
  const slug = collegeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const existing = await prisma.user.findUnique({ where: { email: tpoEmail } })
  if (existing) {
    console.log('\nA user with this email already exists. Aborting.')
    rl.close()
    process.exit(1)
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name: tpoName || collegeName,
      email: tpoEmail,
      passwordHash,
      role: 'college',
      college: {
        create: {
          collegeName, slug, city, state,
          collegeType: collegeType.trim() || 'Degree',
          streams: streams.trim(),
          careerFields: careerFields.trim(),
          vetted, tpoName, tpoEmail,
          tpoPhone: tpoPhone.trim() || null
        }
      }
    }
  })
  console.log('\n=== College created successfully ===')
  console.log('College:', collegeName)
  console.log('Login email:', tpoEmail)
  console.log('Login password:', password)
  console.log('Vetted:', vetted)
  console.log('Login URL: careerseal-web.vercel.app/college-login\n')
  rl.close()
  process.exit(0)
}

run().catch(e => { console.error(e); rl.close(); process.exit(1) })
