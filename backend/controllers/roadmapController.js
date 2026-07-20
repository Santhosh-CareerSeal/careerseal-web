const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const GEMINI_MODEL = 'gemini-flash-lite-latest'
async function callGemini(career, workStatus) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`
  const prompt = `You are a career mentor for Indian students on a platform called GRID.
Create a practical, honest career roadmap for someone whose goal is "${career}" and whose current stage is "${workStatus || 'Student'}".
Respond ONLY with valid JSON (no markdown, no backticks) in exactly this shape:
{
  "totalDuration": "e.g. 4-6 Years",
  "targetSalary": "e.g. 6-15 LPA",
  "milestones": [
    { "phase": "short title", "duration": "e.g. 2 Years", "emoji": "one emoji", "status": "current or upcoming", "description": "2-3 sentences, specific to India", "actions": ["action 1", "action 2", "action 3"], "skills": ["skill 1", "skill 2"] }
  ],
  "aiInsight": "one motivating, specific paragraph"
}
Give 4-5 milestones. First milestone status must be "current", rest "upcoming". Keep it India-focused and realistic.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    })
    if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status)
    const data = await resp.json()
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    text = text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim()
    const parsed = JSON.parse(text)
    if (!parsed.milestones || !Array.isArray(parsed.milestones) || !parsed.milestones.length) throw new Error('Bad AI shape')
    return parsed
  } finally {
    clearTimeout(timeout)
  }
}

async function callGeminiCareers(answers, workStatus) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`
  const prompt = `You are a career counsellor for Indian students on a platform called GRID.
A ${workStatus || 'Student'} answered a career quiz. Their answers (as JSON): ${JSON.stringify(answers)}.
Based ONLY on these answers, suggest the 5 best-matching careers for the Indian job market.
Respond ONLY with valid JSON (no markdown, no backticks) as an array of exactly 5 objects, best match first:
[
  { "career": "role name", "emoji": "one emoji", "match": 92, "indiaSalary": "e.g. 6-15 LPA", "abroadSalary": "e.g. $80k-150k", "demand": "Very High | High | Steady | Growing", "demandReason": "short reason", "description": "one honest sentence" }
]
Make match scores realistic (55-97), decreasing down the list. Base every suggestion on their actual answers.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    })
    if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status)
    const data = await resp.json()
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    text = text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim()
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed) || !parsed.length) throw new Error('Bad AI careers shape')
    return parsed.slice(0, 5)
  } finally {
    clearTimeout(timeout)
  }
}

const USE_AI = true // Gemini live; falls back to hardcoded ROADMAPS on any failure

// ── CAREER DATABASE ──
const CAREERS = {
  'Software Engineer': {
    emoji: '💻', indiaSalary: '6-25 LPA', abroadSalary: '$80k-$150k', demand: 'Very High',
    demandReason: 'Global tech demand continues to grow rapidly',
    description: 'Build apps, websites and systems. Highest paying field globally with remote work options.',
    matchSubjects: ['Maths & Science', 'Computer Science'],
    matchWork: ['Building things with technology', 'Analysing data and numbers'],
    matchLifestyle: ['High salary, even if work is demanding', 'Travel and work from anywhere']
  },
  'Civil Engineer': {
    emoji: '🏗️', indiaSalary: '4-15 LPA', abroadSalary: '$60k-$120k', demand: 'High',
    demandReason: 'India infrastructure boom + Middle East construction growth',
    description: 'Design roads, bridges and buildings. India and Middle East have massive demand.',
    matchSubjects: ['Maths & Science'],
    matchWork: ['Designing and constructing structures'],
    matchLifestyle: ['High salary, even if work is demanding', 'Work-life balance with decent salary']
  },
  'Doctor / MBBS': {
    emoji: '🩺', indiaSalary: '8-30 LPA', abroadSalary: '$120k-$300k', demand: 'Very High',
    demandReason: 'Healthcare demand growing post-pandemic globally',
    description: 'Heal and help people. One of the most respected and high paying professions globally.',
    matchSubjects: ['Biology & Chemistry'],
    matchWork: ['Healing and helping people'],
    matchLifestyle: ['High salary, even if work is demanding', 'Help society and make a difference']
  },
  'Chartered Accountant': {
    emoji: '📊', indiaSalary: '6-20 LPA', abroadSalary: '$70k-$130k', demand: 'High',
    demandReason: 'Every business needs finance and tax experts',
    description: 'Manage finances, audit companies and provide tax guidance. Always in demand.',
    matchSubjects: ['Business & Economics'],
    matchWork: ['Analysing data and numbers', 'Business, finance and management'],
    matchLifestyle: ['High salary, even if work is demanding', 'Work-life balance with decent salary']
  },
  'Teacher / Professor': {
    emoji: '🎓', indiaSalary: '3-12 LPA', abroadSalary: '$40k-$80k', demand: 'Steady',
    demandReason: 'Education sector always needs qualified passionate teachers',
    description: 'Shape future generations. Government teaching offers great stability and benefits.',
    matchSubjects: ['History & Literature', 'Arts & Creativity'],
    matchWork: ['Teaching and guiding others'],
    matchLifestyle: ['Government job with stability and pension', 'Help society and make a difference']
  },
  'Chemical Engineer': {
    emoji: '⚗️', indiaSalary: '4-12 LPA', abroadSalary: '$70k-$120k', demand: 'High',
    demandReason: 'India manufacturing push in pharma, oil and materials industries',
    description: 'Work in pharma, oil, food and materials industries. Growing with Make in India.',
    matchSubjects: ['Biology & Chemistry', 'Maths & Science'],
    matchWork: ['Research and discovering new things', 'Designing and constructing structures'],
    matchLifestyle: ['High salary, even if work is demanding']
  },
  'Food Technology Engineer': {
    emoji: '🍔', indiaSalary: '3-10 LPA', abroadSalary: '$50k-$90k', demand: 'Growing',
    demandReason: 'India food processing sector growing at 11% annually',
    description: 'Work with Nestle, ITC, Amul. India food processing is a booming sector.',
    matchSubjects: ['Biology & Chemistry'],
    matchWork: ['Cooking, food and nutrition', 'Research and discovering new things'],
    matchLifestyle: ['Work-life balance with decent salary']
  },
  'Lawyer / Advocate': {
    emoji: '⚖️', indiaSalary: '4-25 LPA', abroadSalary: '$80k-$180k', demand: 'High',
    demandReason: 'Growing legal needs in corporate, tech and IP sectors',
    description: 'Fight for justice or advise corporations. Corporate law pays exceptionally well.',
    matchSubjects: ['History & Literature', 'Business & Economics'],
    matchWork: ['Business, finance and management'],
    matchLifestyle: ['High salary, even if work is demanding', 'Help society and make a difference']
  },
  'Data Scientist': {
    emoji: '📈', indiaSalary: '8-30 LPA', abroadSalary: '$90k-$160k', demand: 'Very High',
    demandReason: 'AI and data revolution driving massive global demand',
    description: 'Analyse data to help companies make better decisions. AI era makes this gold.',
    matchSubjects: ['Maths & Science', 'Computer Science'],
    matchWork: ['Analysing data and numbers', 'Research and discovering new things'],
    matchLifestyle: ['High salary, even if work is demanding', 'Travel and work from anywhere']
  },
  'Mechanical Engineer': {
    emoji: '⚙️', indiaSalary: '3-12 LPA', abroadSalary: '$60k-$110k', demand: 'Steady',
    demandReason: 'Core manufacturing and automotive sector demand',
    description: 'Design machines, engines and mechanical systems. Always needed in manufacturing.',
    matchSubjects: ['Maths & Science'],
    matchWork: ['Designing and constructing structures', 'Research and discovering new things'],
    matchLifestyle: ['Work-life balance with decent salary', 'High salary, even if work is demanding']
  },
  'Graphic Designer': {
    emoji: '🎨', indiaSalary: '3-12 LPA', abroadSalary: '$45k-$90k', demand: 'High',
    demandReason: 'Digital marketing boom driving massive design demand',
    description: 'Create visual content for brands, apps and media. Freelancing options are global.',
    matchSubjects: ['Arts & Creativity'],
    matchWork: ['Creative arts, music and design'],
    matchLifestyle: ['Work-life balance with decent salary', 'Travel and work from anywhere', 'Run my own business or startup']
  },
  'Entrepreneur / Startup Founder': {
    emoji: '🚀', indiaSalary: 'Variable', abroadSalary: 'Variable', demand: 'High',
    demandReason: 'India startup ecosystem is one of top 3 globally',
    description: 'Build your own company and solve real problems. High risk, very high reward.',
    matchSubjects: ['Business & Economics'],
    matchWork: ['Business, finance and management'],
    matchLifestyle: ['Run my own business or startup']
  },
  'Government Officer / IAS / IPS': {
    emoji: '🏛️', indiaSalary: '6-15 LPA + perks', abroadSalary: 'N/A', demand: 'Steady',
    demandReason: 'Government jobs always available with excellent job security',
    description: 'Serve the nation through IAS, IPS, IFS or PSU jobs. Power, prestige and stability.',
    matchSubjects: ['History & Literature', 'Business & Economics'],
    matchWork: ['Teaching and guiding others', 'Help society and make a difference'],
    matchLifestyle: ['Government job with stability and pension', 'Help society and make a difference']
  },
  'Pharmacist': {
    emoji: '💊', indiaSalary: '3-10 LPA', abroadSalary: '$60k-$120k', demand: 'High',
    demandReason: 'India pharma export boom + healthcare expansion',
    description: 'Dispense medicines and advise patients. India is pharmacy of the world.',
    matchSubjects: ['Biology & Chemistry'],
    matchWork: ['Healing and helping people', 'Research and discovering new things'],
    matchLifestyle: ['Work-life balance with decent salary']
  },
  'Content Creator / Digital Marketer': {
    emoji: '📱', indiaSalary: '3-15 LPA', abroadSalary: '$40k-$100k', demand: 'Very High',
    demandReason: 'Every brand needs digital presence — massive demand',
    description: 'Create content, run social media and grow brands online. Very flexible career.',
    matchSubjects: ['Arts & Creativity', 'Business & Economics'],
    matchWork: ['Creative arts, music and design', 'Business, finance and management'],
    matchLifestyle: ['Travel and work from anywhere', 'Run my own business or startup']
  }
}

// ── ROADMAP DATABASE ──
const ROADMAPS = {
  'Software Engineer': {
    student: {
      totalDuration: '6-8 Years', targetSalary: '6-15 LPA',
      milestones: [
        { phase: 'Right Now — Choose Science + CS stream', duration: 'Immediate', emoji: '🎯', status: 'current', description: 'Pick Science with Maths and Computer Science in 11th. This is the most important decision. Avoid pressure from others — follow your interest.', actions: ['Choose PCM + Computer Science in 11th', 'Start learning Python basics (free on YouTube)', 'Practice basic problem solving daily — 30 mins'], skills: ['Python basics', 'Logical thinking'] },
        { phase: '11th & 12th — Build foundation', duration: '2 Years', emoji: '📚', status: 'upcoming', description: 'Score well in boards (75%+) and start learning programming seriously alongside studies.', actions: ['Complete Class 11 & 12 with 75%+ marks', 'Finish one Python or Java course online (free)', 'Build 2-3 small projects like calculator, quiz app'], skills: ['Python / Java', 'HTML CSS basics', 'Problem solving'] },
        { phase: 'Entrance Exams — JEE / EAMCET', duration: '1 Year prep', emoji: '✍️', status: 'upcoming', description: 'Prepare for engineering entrance. JEE for IITs/NITs, EAMCET for state colleges. Target B.Tech CSE.', actions: ['Join JEE/EAMCET coaching or self-study', 'Focus on Maths and Physics', 'Target top engineering college in your state'], skills: ['JEE Maths', 'Physics', 'Problem solving'] },
        { phase: 'B.Tech — Skills + Internships', duration: '4 Years', emoji: '🎓', status: 'upcoming', description: 'Learn full stack development, DSA and get internships. College is just 20% — skills are 80%.', actions: ['Learn React, Node.js and databases', 'Apply for internships from 2nd year', 'Build 3-4 real projects for portfolio', 'Solve 200+ LeetCode problems'], skills: ['React', 'Node.js', 'DSA', 'Git', 'SQL'] },
        { phase: 'Final Year — Campus Placement', duration: '6 Months', emoji: '🏆', status: 'upcoming', description: 'Crack campus placements or apply on GRID. Target service companies first then product.', actions: ['Apply on GRID 6 months before graduation', 'Practice mock interviews', 'Complete your GRID profile'], skills: ['Interview prep', 'System design basics', 'GRID profile'] }
      ],
      aiInsight: 'You are starting at the perfect time! Students who start coding in school consistently land jobs 2x faster than those who start in college. Even 30 minutes of Python daily will put you years ahead of your batchmates.'
    },
    fresher: {
      totalDuration: '6 Months', targetSalary: '6-12 LPA',
      milestones: [
        { phase: 'Month 1-2 — Skill gap assessment', duration: '2 Months', emoji: '🎯', status: 'current', description: 'Identify what skills top companies want vs what you have. Focus on the gap.', actions: ['Check job descriptions on GRID for required skills', 'Learn React or Node.js if not already known', 'Start solving DSA problems on LeetCode daily'], skills: ['React / Node.js', 'DSA basics', 'Git'] },
        { phase: 'Month 3 — Build a strong project', duration: '1 Month', emoji: '💻', status: 'upcoming', description: 'Build one full stack project that solves a real problem. Deploy it online.', actions: ['Build a full stack project (not a todo app)', 'Deploy on Vercel + Render (free)', 'Add it to your GRID profile'], skills: ['Full stack', 'Deployment', 'Portfolio'] },
        { phase: 'Month 4-5 — Apply aggressively', duration: '2 Months', emoji: '📨', status: 'upcoming', description: 'Apply to 5-10 jobs daily on GRID and other platforms. Track everything.', actions: ['Apply to 5 jobs daily on GRID', 'Follow up after 5 business days', 'Update GRID card and publish to GRID'], skills: ['Job search', 'GRID profile', 'Follow-up'] },
        { phase: 'Month 6 — Interview prep and offer', duration: '1 Month', emoji: '🏆', status: 'upcoming', description: 'Practice mock interviews and negotiate your first offer confidently.', actions: ['Practice 3 mock interviews per week', 'Learn system design basics', 'Negotiate salary using market data from GRID'], skills: ['Interview skills', 'Negotiation', 'System design'] }
      ],
      aiInsight: 'Freshers who have ONE strong deployed project consistently beat candidates with better grades. Companies want to see you can build — not just study. Build something real this week.'
    },
    experienced: {
      totalDuration: '3 Months', targetSalary: '15-30 LPA',
      milestones: [
        { phase: 'Week 1-2 — Identify skill gaps', duration: '2 Weeks', emoji: '🎯', status: 'current', description: 'Check what senior roles require vs your current skills. Focus on system design and leadership.', actions: ['Research target companies and their job requirements', 'Identify top 3 skills you need to add', 'Update your GRID profile'], skills: ['Self assessment', 'Market research'] },
        { phase: 'Month 1 — Upskill fast', duration: '1 Month', emoji: '📚', status: 'upcoming', description: 'Get certified in missing skills. Cloud, AI or system design are most valued right now.', actions: ['Complete one cloud certification (AWS/GCP/Azure)', 'Learn system design concepts', 'Contribute to open source for visibility'], skills: ['Cloud', 'System design', 'Open source'] },
        { phase: 'Month 2-3 — Apply for senior roles', duration: '2 Months', emoji: '🏆', status: 'upcoming', description: 'Apply for senior/lead roles. Negotiate aggressively — your experience has real value.', actions: ['Apply to product companies not just service companies', 'Target 30-50% salary hike minimum', 'Use your GRID card in interviews for credibility'], skills: ['Senior interview prep', 'Salary negotiation'] }
      ],
      aiInsight: 'Experienced engineers often undersell themselves. Your 3-5 years of experience is worth much more than you think. Target product companies — they pay 2-3x compared to service companies for the same role.'
    }
  },
  'Doctor / MBBS': {
    student: {
      totalDuration: '10-12 Years', targetSalary: '8-30 LPA',
      milestones: [
        { phase: 'Right Now — Choose Science + Biology', duration: 'Immediate', emoji: '🎯', status: 'current', description: 'Choose PCB (Physics, Chemistry, Biology) in 11th. This is mandatory for MBBS. Score 85%+ in boards.', actions: ['Choose PCB stream in 11th class', 'Start NEET preparation early', 'Focus on Biology and Chemistry deeply'], skills: ['Biology', 'Chemistry', 'Physics'] },
        { phase: 'NEET Preparation', duration: '2 Years', emoji: '📚', status: 'upcoming', description: 'NEET is the gateway to MBBS. Start early, be consistent. Top 10,000 rank gets government medical college.', actions: ['Join NEET coaching or self study with NCERT', 'Solve previous year NEET papers daily', 'Target 650+ score for government medical college'], skills: ['Biology mastery', 'Chemistry', 'Physics', 'NEET prep'] },
        { phase: 'MBBS — 5.5 Years', duration: '5.5 Years', emoji: '🏥', status: 'upcoming', description: 'Complete MBBS including 1 year internship. Choose a specialization direction early.', actions: ['Focus on clinical skills during internship', 'Decide on specialization (Surgery, Paediatrics, Cardiology etc)', 'Build your GRID profile'], skills: ['Clinical skills', 'Patient care', 'Medical knowledge'] },
        { phase: 'MD / MS — Specialization', duration: '3 Years', emoji: '🎓', status: 'upcoming', description: 'Specialize through PG entrance (NEET-PG). Specialists earn 3-5x more than general practitioners.', actions: ['Prepare for NEET-PG exam', 'Choose high demand specialty', 'Consider super-specialization for top earnings'], skills: ['Specialization', 'Research', 'Advanced clinical skills'] },
        { phase: 'Career — Practice or Abroad', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Start practice in India or clear USMLE/PLAB for USA/UK. Doctors abroad earn $200k+.', actions: ['Start own clinic or join hospital', 'Clear USMLE for USA or PLAB for UK if interested', 'Build reputation through GRID verified profile'], skills: ['Medical practice', 'USMLE/PLAB', 'Patient management'] }
      ],
      aiInsight: 'Medicine is one of the most respected and financially rewarding careers globally. The journey is long (10+ years) but the impact you make on human lives is priceless. Start NEET prep today — every day counts.'
    },
    fresher: {
      totalDuration: '1-2 Years', targetSalary: '8-15 LPA',
      milestones: [
        { phase: 'Internship completion', duration: '1 Year', emoji: '🎯', status: 'current', description: 'Complete your mandatory MBBS internship. This is where real learning happens.', actions: ['Rotate through all departments seriously', 'Network with senior doctors and consultants', 'Decide on specialization based on interest'], skills: ['Clinical skills', 'Patient care', 'Emergency medicine'] },
        { phase: 'NEET-PG Preparation', duration: '6-12 Months', emoji: '📚', status: 'upcoming', description: 'Prepare for NEET-PG for MD/MS admission. This determines your specialization and career trajectory.', actions: ['Start NEET-PG coaching immediately after internship', 'Target top medical colleges for PG', 'Join a study group for accountability'], skills: ['NEET-PG prep', 'Clinical knowledge revision'] },
        { phase: 'MD / MS Admission', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Crack NEET-PG and get into a good government medical college for specialization.', actions: ['Apply to multiple medical colleges', 'Choose specialty based on demand and interest', 'Update GRID with qualifications'], skills: ['Specialization', 'Research', 'Advanced practice'] }
      ],
      aiInsight: 'The MBBS degree is just the beginning. Specialization is where real earning power comes from. A General Surgeon earns 3-5x more than a General Practitioner. Choose your specialty wisely.'
    },
    experienced: {
      totalDuration: '6 Months to 1 Year', targetSalary: '20-50 LPA',
      milestones: [
        { phase: 'Super-specialization or Abroad', duration: '3-6 Months', emoji: '🎯', status: 'current', description: 'Consider DM/MCh super-specialization or clearing USMLE/PLAB for international practice.', actions: ['Research USMLE steps for USA practice', 'Consider fellowship programs', 'Explore Middle East — UAE and Saudi pay very well for specialists'], skills: ['USMLE / PLAB', 'Super-specialization', 'International practice'] },
        { phase: 'Own Practice or Senior Role', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Start own clinic or join as senior consultant in a top hospital.', actions: ['Build patient base through reputation', 'List your practice on GRID', 'Join hospital as senior consultant for stable income'], skills: ['Practice management', 'Team leadership', 'Business skills'] }
      ],
      aiInsight: 'Experienced doctors who go abroad (USA, UK, Australia, Middle East) earn 5-10x more than in India for the same work. If you are open to relocation, it is worth exploring seriously.'
    }
  },
  'Civil Engineer': {
    student: {
      totalDuration: '7-8 Years', targetSalary: '4-15 LPA',
      milestones: [
        { phase: 'Choose PCM Stream', duration: 'Immediate', emoji: '🎯', status: 'current', description: 'Physics, Chemistry and Maths are mandatory for Civil Engineering. Focus on Maths deeply.', actions: ['Choose PCM in 11th class', 'Start basic drawing and design skills', 'Visit construction sites to understand real work'], skills: ['Maths', 'Physics', 'Basic design'] },
        { phase: 'JEE / EAMCET Preparation', duration: '2 Years', emoji: '📚', status: 'upcoming', description: 'Clear engineering entrance for B.Tech Civil Engineering admission.', actions: ['Prepare for JEE/EAMCET', 'Target NIT or good state engineering college', 'Learn AutoCAD basics online for head start'], skills: ['JEE Maths', 'Physics', 'AutoCAD basics'] },
        { phase: 'B.Tech Civil — 4 Years', duration: '4 Years', emoji: '🎓', status: 'upcoming', description: 'Learn structural design, construction management and project planning. Get site exposure.', actions: ['Learn AutoCAD, STAAD Pro and Revit software', 'Do internship at construction company every summer', 'Apply for GATE exam in final year'], skills: ['AutoCAD', 'STAAD Pro', 'Construction management', 'Surveying'] },
        { phase: 'GATE / Job / Govt', duration: '6 Months', emoji: '🏆', status: 'upcoming', description: 'Clear GATE for PSU jobs (NTPC, ONGC, NHAI pay very well) or join private construction firms.', actions: ['Appear for GATE Civil Engineering', 'Apply to PSUs — NTPC, ONGC, NHAI, CPWD', 'Apply on GRID for private sector jobs'], skills: ['GATE prep', 'PSU interview', 'Site management'] }
      ],
      aiInsight: 'India is in the middle of the largest infrastructure boom in history — highways, metros, airports, smart cities. Civil Engineers are in massive demand for the next 20 years. You are choosing at the perfect time.'
    },
    fresher: {
      totalDuration: '6 Months', targetSalary: '4-8 LPA',
      milestones: [
        { phase: 'Software skills + certifications', duration: '2 Months', emoji: '🎯', status: 'current', description: 'Most freshers lack software skills. Master AutoCAD and STAAD Pro to stand out.', actions: ['Get certified in AutoCAD and STAAD Pro', 'Learn BIM (Building Information Modelling)', 'Update GRID with certifications'], skills: ['AutoCAD', 'STAAD Pro', 'BIM', 'Revit'] },
        { phase: 'Apply — Government + Private', duration: '2 Months', emoji: '📨', status: 'upcoming', description: 'Apply to PSUs, government departments and private construction companies simultaneously.', actions: ['Apply to CPWD, PWD, NHAI for government roles', 'Apply to L&T, Shapoorji, Tata Projects for private', 'Apply on GRID for site engineer roles'], skills: ['Government exam prep', 'Site supervision'] },
        { phase: 'First job and grow', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Get your first site experience. Field experience is gold in Civil Engineering.', actions: ['Accept any good site engineer role to start', 'Learn project management on the job', 'Work towards becoming Project Manager in 3-5 years'], skills: ['Site management', 'Project management', 'Team supervision'] }
      ],
      aiInsight: 'Civil Engineering freshers who know AutoCAD + STAAD Pro get hired 3x faster than those who only have theory knowledge. Get certified this month — it is free or low cost online.'
    },
    experienced: {
      totalDuration: '3-6 Months', targetSalary: '12-25 LPA',
      milestones: [
        { phase: 'Project Manager transition', duration: '3 Months', emoji: '🎯', status: 'current', description: 'Move from site engineer to project manager. This doubles your salary and opens global opportunities.', actions: ['Get PMP certification (Project Management Professional)', 'Target Middle East — UAE, Qatar, Saudi pay 3-4x Indian salaries', 'Apply to international construction companies'], skills: ['PMP certification', 'Project management', 'International standards'] },
        { phase: 'Senior / International roles', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Senior Civil Engineers in Middle East earn AED 15,000-30,000/month ($4000-8000). Very attractive.', actions: ['Apply to Aramco, ADNOC, Bechtel for Middle East roles', 'Get your documents attested for abroad work', 'Update GRID for global visibility'], skills: ['International project management', 'Stakeholder management'] }
      ],
      aiInsight: 'Experienced Civil Engineers are one of the most sought after professionals in the Middle East. UAE and Saudi Arabia are spending billions on infrastructure. Your Indian experience is valued highly there.'
    }
  },
  'Teacher / Professor': {
    student: {
      totalDuration: '5-6 Years', targetSalary: '3-10 LPA',
      milestones: [
        { phase: 'Choose your subject passion', duration: 'Immediate', emoji: '🎯', status: 'current', description: 'Teaching requires deep passion for a subject. Identify which subject excites you most to teach others.', actions: ['Identify your strongest and most loved subject', 'Start tutoring younger students — even informally', 'Check if you enjoy explaining concepts to others'], skills: ['Subject knowledge', 'Communication', 'Patience'] },
        { phase: 'Bachelor degree in chosen subject', duration: '3 Years', emoji: '🎓', status: 'upcoming', description: 'Complete B.Ed or subject-specific degree. B.Ed is mandatory for school teaching in India.', actions: ['Complete graduation in chosen subject (BA/B.Sc/B.Com)', 'Join B.Ed program for school teaching certification', 'Start teaching tuition classes alongside studies'], skills: ['Subject expertise', 'Pedagogy', 'Classroom management'] },
        { phase: 'TET / CTET Exam', duration: '6 Months prep', emoji: '✍️', status: 'upcoming', description: 'Clear Teacher Eligibility Test for government school jobs. CTET for central schools, state TET for state.', actions: ['Prepare for CTET or state TET exam', 'Join coaching or self-study with official syllabus', 'Apply for Navodaya Vidyalaya and KV schools'], skills: ['TET/CTET prep', 'Teaching methodology'] },
        { phase: 'NET / SET for College Teaching', duration: '1 Year', emoji: '🏛️', status: 'upcoming', description: 'UGC NET is required for college/university teaching. Professors earn significantly more than school teachers.', actions: ['Complete Masters degree (mandatory for NET)', 'Appear for UGC NET exam', 'Apply for assistant professor positions'], skills: ['Research', 'UGC NET', 'Academic writing'] },
        { phase: 'Career — School or College', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Government school and college positions offer excellent job security, pension and social respect.', actions: ['Apply to government schools and colleges', 'Consider international school teaching for higher pay', 'Build online presence to teach globally'], skills: ['Teaching excellence', 'Student mentorship', 'Online teaching'] }
      ],
      aiInsight: 'Teaching is one of the most impactful careers you can choose. Every successful person has a teacher behind them. Government teaching positions offer excellent job security, pension and the respect of the entire community.'
    },
    fresher: {
      totalDuration: '6 Months', targetSalary: '3-8 LPA',
      milestones: [
        { phase: 'Get certified and apply', duration: '3 Months', emoji: '���', status: 'current', description: 'Complete B.Ed or TET/CTET if not done. Then apply widely to government and private schools.', actions: ['Complete B.Ed if not already done', 'Clear CTET for central government schools', 'Apply to private international schools for better pay'], skills: ['B.Ed', 'CTET', 'Lesson planning'] },
        { phase: 'Build online teaching presence', duration: '2 Months', emoji: '💻', status: 'upcoming', description: 'Online teaching on YouTube or Unacademy can multiply your income significantly.', actions: ['Start a YouTube channel for your subject', 'Join Unacademy, Vedantu or BYJU\'s as educator', 'Create your own online course on Teachable or Udemy'], skills: ['Online teaching', 'Content creation', 'Digital tools'] },
        { phase: 'First teaching job', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Land your first teaching role. Experience grows salary rapidly in teaching.', actions: ['Apply to government schools for stability', 'Join international schools for higher pay', 'Consider teaching abroad — Middle East pays very well for teachers'], skills: ['Classroom management', 'Student engagement', 'Assessment'] }
      ],
      aiInsight: 'Teachers who combine offline teaching with online platforms (YouTube, Unacademy) earn 3-5x more than those who only teach in schools. Build your online presence from day one.'
    },
    experienced: {
      totalDuration: '3-6 Months', targetSalary: '8-20 LPA',
      milestones: [
        { phase: 'Move to college or international', duration: '3 Months', emoji: '🎯', status: 'current', description: 'Experienced teachers can move to college teaching (requires NET) or international schools (much higher pay).', actions: ['Clear UGC NET for college professor position', 'Apply to international schools in Dubai, Singapore', 'Build your online brand to reach global students'], skills: ['UGC NET', 'International curriculum', 'Online brand'] },
        { phase: 'Senior position or EdTech', duration: 'Ongoing', emoji: '🏆', status: 'upcoming', description: 'Senior teachers in international schools earn 15-25 LPA. EdTech companies also pay very well.', actions: ['Apply to BYJU\'s, Unacademy, Vedantu for senior educator roles', 'Consider principal or academic head positions', 'Launch your own EdTech course'], skills: ['Educational leadership', 'Curriculum design', 'EdTech'] }
      ],
      aiInsight: 'Experienced teachers are in massive demand in international schools across UAE, Qatar, Singapore and the UK. With 5+ years experience you can earn 3-4x your Indian salary abroad.'
    }
  }
}

const getDefaultRoadmap = (career, workStatus) => {
  const careerData = ROADMAPS[career]
  if (!careerData) {
    return {
      totalDuration: '4-6 Years', targetSalary: '5-15 LPA',
      milestones: [
        { phase: 'Phase 1 — Foundation', duration: '1-2 Years', emoji: '🎯', status: 'current', description: `Start building your foundation for ${career}. Research the field deeply and understand what skills are needed.`, actions: ['Research top professionals in this field', 'Identify required qualifications and certifications', 'Start learning core skills through online resources'], skills: ['Research', 'Core subject knowledge'] },
        { phase: 'Phase 2 — Education & Skills', duration: '2-3 Years', emoji: '📚', status: 'upcoming', description: 'Complete required education and build practical skills through projects and internships.', actions: ['Complete required degree or certification', 'Build a portfolio of real work', 'Network with professionals in the field'], skills: ['Technical skills', 'Portfolio building', 'Networking'] },
        { phase: 'Phase 3 — First Job', duration: '6 Months', emoji: '🏆', status: 'upcoming', description: 'Apply for entry level positions. Use your GRID profile to stand out.', actions: ['Apply to 5 jobs daily on GRID', 'Complete your GRID profile and publish', 'Prepare for interviews with mock practice'], skills: ['Interview prep', 'GRID profile', 'Job search'] }
      ],
      aiInsight: `${career} is a great career choice. Stay consistent, keep learning and use your GRID profile to get discovered by the right employers.`
    }
  }
  const statusKey = workStatus === 'Student' ? 'student' : workStatus === 'Fresher' ? 'fresher' : 'experienced'
  return careerData[statusKey] || careerData.student
}

const getCareerMatches = (answers, workStatus) => {
  const scores = {}
  Object.entries(CAREERS).forEach(([name, career]) => {
    let score = 40 // base score
    if (answers.subjects && career.matchSubjects?.some(s => answers.subjects?.includes(s.split(' ')[0]))) score += 20
    if (answers.work && career.matchWork?.some(w => answers.work?.includes(w.split(' ')[0]))) score += 20
    if (answers.lifestyle && career.matchLifestyle?.some(l => answers.lifestyle?.includes(l.split(',')[0]))) score += 15
    if (answers.interest && name.toLowerCase().includes(answers.interest?.toLowerCase()?.split(' ')[0])) score += 20
    if (answers.target && name.toLowerCase().includes(answers.target?.toLowerCase()?.split(' ')[0])) score += 25
    score = Math.min(score + Math.floor(Math.random() * 5), 99)
    scores[name] = score
  })

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, score]) => ({
      career: name,
      emoji: CAREERS[name].emoji,
      match: score,
      indiaSalary: CAREERS[name].indiaSalary,
      abroadSalary: CAREERS[name].abroadSalary,
      demand: CAREERS[name].demand,
      demandReason: CAREERS[name].demandReason,
      description: CAREERS[name].description
    }))
}

const getLocationInsight = (location, subjects, work) => {
  const insights = {
    'India only': `Great choice! India is currently one of the fastest growing economies with massive opportunities. Here's what you should know:\n\n🇮🇳 Working in India:\n✅ Salaries growing 15-20% annually for skilled professionals\n✅ Close to family, lower cost of living means better savings\n✅ Startup ecosystem is top 3 globally — massive opportunities\n✅ Government job options with great stability\n⚠️ Competition is high — skills and GRID verification help you stand out\n\nWith ${subjects || 'your subjects'} and interest in ${work || 'your chosen field'}, India has excellent opportunities right now. The key is building strong skills early.\n\nKnowing this, would you like to keep India or explore both options?`,
    'Abroad (USA, UK, Canada, Australia etc.)': `Excellent ambition! Here's an honest picture of working abroad:\n\n✈️ Working Abroad:\n✅ Salaries are 3-5x higher than India for same role\n✅ Better work-life balance in countries like Canada, Australia, Germany\n✅ World class infrastructure and quality of life\n⚠️ Requires extra qualifications — IELTS, GRE, professional certifications\n⚠️ Visa processing is getting stricter (Canada reduced immigration targets in 2024)\n⚠️ Far from family, high cost of living\n⚠️ Takes 5-8 years of focused preparation\n\n🇮🇳 Compared to India:\n✅ India salaries for top professionals now reach 20-30 LPA\n✅ Cost of living is much lower so savings can be similar\n✅ Easier to build business and startup here\n\nFor ${subjects || 'your field'}, abroad is achievable but requires serious long-term planning. Many professionals do both — start in India, go abroad at 5-7 years experience.\n\nKnowing this — do you still want to target abroad, stay in India, or keep both options open?`,
    'Middle East (Dubai, Qatar etc.)': `Smart thinking! The Middle East is one of the best kept secrets for Indian professionals:\n\n🌙 Working in Middle East:\n✅ Tax-free salary — what you earn, you keep\n✅ Much closer to India — 3-4 hour flights, easy family visits\n✅ Massive infrastructure projects underway (Saudi Vision 2030, UAE Expo legacy)\n✅ Easier visa process than USA/UK for skilled professionals\n✅ Indian community is huge — food, culture, comfort\n⚠️ Extreme heat in summer months\n⚠️ Less permanent — usually contract based\n⚠️ Fewer startup or entrepreneurship opportunities\n\nFor ${subjects || 'your subjects'} background, Middle East has very strong demand especially in engineering, healthcare and education fields.\n\nKnowing this — does Middle East still interest you or would you like to explore other options?`,
    'Both India and Abroad': `Excellent mindset — keeping options open is the smartest strategy! Here's why Both is actually the best choice:\n\n✅ Start strong in India — build experience, save money, grow fast\n✅ After 3-5 years of experience, you become valuable globally\n✅ Indian experience is respected abroad especially in tech, healthcare, engineering\n✅ You can always return to India if abroad doesn't work out\n✅ Many Indians work abroad for 5-10 years then return with savings and experience\n\nThe typical path:\n📍 India (Years 1-4) → Build skills + experience\n✈️ Abroad (Years 5-10) → Higher salary + global exposure\n🏠 India again (Year 10+) → Senior role or own business\n\nThis is exactly what most successful Indian professionals do. Keeping both options open gives you maximum flexibility.\n\nShall we continue and find the best career options for you?`,
    'Not sure yet': `That's completely okay! Many students your age are not sure. Here's some clarity:\n\n🌍 The good news — most careers today are global:\n✅ Tech jobs are remote-first — work from India, earn like abroad\n✅ Doctors, engineers and teachers are needed everywhere\n✅ You can always decide later once you are established\n\n💡 Our recommendation for now:\n→ Focus on building strong skills in India first\n→ Keep the option to go abroad open\n→ Your GRID profile will make you visible to employers globally\n\nLet's focus on finding the right career for you first — location can be decided later!\n\nShall we continue?`
  }
  return insights[location] || insights['Both India and Abroad']
}

const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId }, include: { roadmap: true } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    res.json({ roadmap: student.roadmap, workStatus: student.workStatus })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveAnswers = async (req, res) => {
  try {
    const userId = req.user.userId
    const { answers, workStatus } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    await prisma.roadmap.upsert({
      where: { studentId: student.id },
      update: { answers: JSON.stringify(answers), workStatus, careerOptions: '', selectedCareer: null, roadmapContent: null },
      create: { studentId: student.id, answers: JSON.stringify(answers), workStatus, careerOptions: '' }
    })
    res.json({ message: 'Answers saved' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getLocationAdvice = async (req, res) => {
  try {
    const { location, subjects, work } = req.body
    const insight = getLocationInsight(location, subjects, work)
    res.json({ insight })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getCareers = async (req, res) => {
  try {
    const { answers, workStatus } = req.body
    let careers, source = 'hardcoded'
    if (USE_AI) {
      try {
        careers = await callGeminiCareers(answers, workStatus)
        source = 'ai'
      } catch (e) {
        console.error('Gemini careers failed, using fallback:', e.message)
        careers = getCareerMatches(answers, workStatus)
      }
    } else {
      careers = getCareerMatches(answers, workStatus)
    }
    res.json({ careers, source })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const selectCareer = async (req, res) => {
  try {
    const userId = req.user.userId
    const { selectedCareer, careerOptions } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    await prisma.roadmap.update({
      where: { studentId: student.id },
      data: { selectedCareer, careerOptions: JSON.stringify(careerOptions) }
    })
    res.json({ message: 'Career selected' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const generateRoadmap = async (req, res) => {
  try {
    const { career, workStatus } = req.body
    let roadmap, source = 'hardcoded'
    if (USE_AI) {
      try {
        roadmap = await callGemini(career, workStatus)
        source = 'ai'
      } catch (e) {
        console.error('Gemini failed, using fallback:', e.message)
        roadmap = getDefaultRoadmap(career, workStatus)
      }
    } else {
      roadmap = getDefaultRoadmap(career, workStatus)
    }
    res.json({ roadmap, source })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const saveRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId
    const { roadmapContent } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const existing = await prisma.roadmap.findUnique({ where: { studentId: student.id } })
    const currentMonth = new Date().getMonth()
    const isFirstSave = !existing?.roadmapContent
    const regens = existing?.lastRegeneratedMonth === currentMonth ? existing.regeneratesThisMonth : 0
    if (!isFirstSave && regens >= 3) return res.status(400).json({ message: 'You have used all 3 regenerations this month. Commit to your current roadmap!' })
    await prisma.roadmap.update({
      where: { studentId: student.id },
      data: { roadmapContent, regeneratesThisMonth: isFirstSave ? regens : regens + 1, lastRegeneratedMonth: currentMonth, updatedAt: new Date() }
    })
    res.json({ message: 'Roadmap saved', regeneratesRemaining: isFirstSave ? 3 : 3 - (regens + 1) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getRoadmap, saveAnswers, getLocationAdvice, getCareers, selectCareer, generateRoadmap, saveRoadmap }
