const GEMINI_MODEL = 'gemini-flash-lite-latest'

// Build a compact text profile from student data for the AI to summarize
function buildProfileText(s) {
  const parts = []
  if (s.workStatus) parts.push(`Status: ${s.workStatus}`)
  if (s.degree || s.branch || s.collegeName) parts.push(`Education: ${[s.degree, s.branch, s.collegeName, s.collegePassingYear].filter(Boolean).join(', ')}`)
  if (s.technicalSkills) parts.push(`Verified skills: ${s.technicalSkills}`)
  if (s.workExperience) parts.push(`Summary: ${s.workExperience}`)

  let employment = []
  try { employment = s.employmentHistory ? JSON.parse(s.employmentHistory) : [] } catch (e) {}
  if (employment.length) {
    parts.push('Work experience:')
    employment.forEach(job => {
      parts.push(`- ${job.role || 'Role'} at ${job.company || 'company'} (${job.duration || ''})`)
      ;(job.projects || []).forEach(pr => {
        parts.push(`  Project: ${pr.title || ''} — ${pr.details || ''} Role: ${pr.role || ''}`)
      })
    })
  }

  let projects = []
  try { projects = s.projects ? JSON.parse(s.projects) : [] } catch (e) {}
  if (projects.length) {
    parts.push('Projects:')
    projects.forEach(pr => parts.push(`- ${pr.title || ''}: ${pr.details || ''} Role: ${pr.role || ''}`))
  }

  return parts.join('\n')
}

async function generateSummary(student) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')

  const isExperienced = student.workStatus === 'Experienced'
  const profileText = buildProfileText(student)

  const prompt = `You are helping a recruiter quickly understand a candidate on GRID, a verified career platform for Indian talent.

Write a DISTILLED highlight summary of this candidate — like a trailer, not the full film. Capture only what matters most: who they are, their strongest skills, their most impressive experience or projects, and what roles they suit. Do NOT reproduce every project or responsibility — pick the highlights.

LENGTH: Scale to the candidate. ${isExperienced ? 'This is an experienced candidate — you may use up to 8-10 short lines, structured with their key strengths and most notable experience.' : 'This is a fresher/student — keep it tight, 3-4 lines: who they are, key skills, standout project, and fit.'}

RULES:
- Be accurate. Only state what the profile supports. Never invent or inflate.
- Lead with the most impressive, relevant point.
- Plain, professional language. No hype words like "rockstar" or "ninja".
- End with a one-line fit signal (what roles they're suited for).
- Write in third person. No headings, just clean short lines or a short paragraph.

CANDIDATE PROFILE:
${profileText}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    })
    if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status)
    const data = await resp.json()
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
    if (!text) throw new Error('Empty summary')
    return text
  } finally { clearTimeout(timeout) }
}

module.exports = { generateSummary }
