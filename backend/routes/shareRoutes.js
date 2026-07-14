const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

router.get('/share/:gridNumber', async (req, res) => {
  const { gridNumber } = req.params
  const SITE = 'https://thegridcard.com'
  let title = 'GRID - Verified Career Identity'
  let description = 'View this verified GRID profile. Skill-tested, QR-verified, recruiter-ready.'
  let image = SITE + '/og-image.svg'

  try {
    const student = await prisma.student.findUnique({
      where: { gridNumber },
      include: { user: { select: { name: true } } }
    })
    if (student && student.gridPublished) {
      const role = student.jobTitle || (student.workStatus === 'student' ? 'Student' : 'Professional')
      const college = student.collegeName ? ' - ' + student.collegeName : ''
      title = (student.user && student.user.name ? student.user.name : 'GRID Member') + ' - Verified GRID Profile'
      description = (role + college + '. Verified skills on GRID. ' + (student.bio || 'View the full verified profile.')).slice(0, 200)
      if (student.photoUrl) image = student.photoUrl
    }
  } catch (e) {}

  const profileUrl = SITE + '/profile/' + gridNumber
  const html = [
    '<!doctype html><html lang="en"><head><meta charset="UTF-8" />',
    '<title>' + esc(title) + '</title>',
    '<meta name="description" content="' + esc(description) + '" />',
    '<meta property="og:type" content="profile" />',
    '<meta property="og:url" content="' + profileUrl + '" />',
    '<meta property="og:title" content="' + esc(title) + '" />',
    '<meta property="og:description" content="' + esc(description) + '" />',
    '<meta property="og:image" content="' + esc(image) + '" />',
    '<meta property="og:site_name" content="GRID" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' + esc(title) + '" />',
    '<meta name="twitter:description" content="' + esc(description) + '" />',
    '<meta name="twitter:image" content="' + esc(image) + '" />',
    '<meta http-equiv="refresh" content="0; url=' + profileUrl + '" />',
    '</head><body><p>Redirecting...</p>',
    '<script>window.location.href="' + profileUrl + '";</script></body></html>'
  ].join('')

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(html)
})

module.exports = router
