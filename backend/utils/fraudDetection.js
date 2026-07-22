const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Verhoeff checksum — the real Aadhaar validation algorithm
const d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]]
const perm = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]]

function isValidAadhaar(num) {
  if (!num) return false
  const clean = num.toString().replace(/\s/g, '')
  if (!/^[2-9]\d{11}$/.test(clean)) return false
  let c = 0
  const digits = clean.split('').reverse().map(Number)
  for (let i = 0; i < digits.length; i++) c = d[c][perm[i % 8][digits[i]]]
  return c === 0
}

async function raiseFlag(studentId, flagType, severity, details) {
  const existing = await prisma.fraudFlag.findFirst({
    where: { studentId, flagType, status: 'open' }
  })
  if (existing) return
  await prisma.fraudFlag.create({ data: { studentId, flagType, severity, details } })
}

async function checkStudentProfile(student) {
  const flags = []
  const currentYear = new Date().getFullYear()

  // 1. Aadhaar format
  if (student.aadhaarNumber && student.aadhaarNumber.trim() !== '') {
    if (!isValidAadhaar(student.aadhaarNumber)) {
      flags.push(['invalid_aadhaar', 'high', 'Aadhaar number failed format/checksum validation'])
    } else {
      // 2. Duplicate Aadhaar
      const dupe = await prisma.student.findFirst({
        where: { aadhaarNumber: student.aadhaarNumber, id: { not: student.id } },
        select: { id: true }
      })
      if (dupe) flags.push(['duplicate_aadhaar', 'high', `Same Aadhaar also used by student ID ${dupe.id}`])
    }
  }

  // 3. Duplicate phone
  if (student.contactNumber && student.contactNumber.trim().length >= 10) {
    const dupePhone = await prisma.student.findFirst({
      where: { contactNumber: student.contactNumber, id: { not: student.id } },
      select: { id: true }
    })
    if (dupePhone) flags.push(['duplicate_phone', 'medium', `Same phone number also used by student ID ${dupePhone.id}`])
  }

  // 4. Suspicious dates / impossible data
  const yr = (v) => { const n = parseInt(v); return isNaN(n) ? null : n }
  const tenth = yr(student.schoolPassingYear)
  const twelfth = yr(student.twelfthPassingYear)
  const grad = yr(student.collegePassingYear)

  if (tenth && (tenth < 1970 || tenth > currentYear + 1)) flags.push(['impossible_year', 'medium', `10th passing year is ${tenth}`])
  if (twelfth && (twelfth < 1970 || twelfth > currentYear + 1)) flags.push(['impossible_year', 'medium', `12th passing year is ${twelfth}`])
  if (grad && (grad < 1970 || grad > currentYear + 6)) flags.push(['impossible_year', 'medium', `Graduation year is ${grad}`])
  if (tenth && twelfth && twelfth < tenth) flags.push(['illogical_education', 'high', `12th (${twelfth}) before 10th (${tenth})`])
  if (twelfth && grad && grad < twelfth) flags.push(['illogical_education', 'high', `Graduation (${grad}) before 12th (${twelfth})`])

  // 5. Age vs education
  if (student.dateOfBirth) {
    const dob = new Date(student.dateOfBirth)
    if (!isNaN(dob.getTime())) {
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
      if (age < 13 || age > 75) flags.push(['suspicious_age', 'medium', `Calculated age is ${age}`])
      if (grad && age > 0 && (grad - dob.getFullYear()) < 19) flags.push(['illogical_education', 'high', `Graduated at age ${grad - dob.getFullYear()}`])
    }
  }

  // 6. CGPA / percentage sanity
  const cg = parseFloat(student.collegeCGPA)
  if (!isNaN(cg) && (cg < 0 || cg > 10)) flags.push(['impossible_score', 'medium', `College CGPA is ${cg}`])
  const p10 = parseFloat(student.schoolPercentage)
  if (!isNaN(p10) && (p10 < 0 || p10 > 100)) flags.push(['impossible_score', 'medium', `10th percentage is ${p10}`])
  const p12 = parseFloat(student.twelfthPercentage)
  if (!isNaN(p12) && (p12 < 0 || p12 > 100)) flags.push(['impossible_score', 'medium', `12th percentage is ${p12}`])

  for (const [type, sev, det] of flags) {
    await raiseFlag(student.id, type, sev, det)
  }
  return flags.length
}

module.exports = { checkStudentProfile, isValidAadhaar }
