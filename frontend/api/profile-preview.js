// Vercel serverless function - generates OG meta tags for shared profile links
export default async function handler(req, res) {
  const { gridNumber } = req.query
  const BACKEND = process.env.VITE_API_URL || 'https://careerseal-web.onrender.com'
  const SITE = 'https://thegridcard.com'

  // Default fallback tags
  let title = 'GRID — Verified Career Identity'
  let description = 'View this verified GRID profile. Skill-tested, QR-verified, recruiter-ready.'
  let image = `${SITE}/og-image.svg`

  try {
    const r = await fetch(`${BACKEND}/api/public/profile/${gridNumber}`)
    if (r.ok) {
      const p = await r.json()
      const role = p.jobTitle || (p.workStatus === 'student' ? 'Student' : 'Professional')
      const college = p.collegeName ? ` · ${p.collegeName}` : ''
      title = `${p.name} — Verified GRID Profile`
      description = `${role}${college}. Verified skills on GRID. ${p.bio || 'View the full verified profile.'}`.slice(0, 200)
      if (p.photoUrl) image = p.photoUrl
    }
  } catch (e) {
    // fall through to defaults
  }

  const profileUrl = `${SITE}/profile/${gridNumber}`
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:type" content="profile" />
<meta property="og:url" content="${profileUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="GRID" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<meta http-equiv="refresh" content="0; url=${profileUrl}" />
</head>
<body>
<p>Redirecting to <a href="${profileUrl}">${title}</a>...</p>
<script>window.location.href = "${profileUrl}";</script>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(html)
}
