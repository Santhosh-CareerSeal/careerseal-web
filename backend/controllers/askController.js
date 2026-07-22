const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const GEMINI_MODEL = 'gemini-flash-lite-latest'
let KB_CACHE = null

function loadKnowledge() {
  if (KB_CACHE) return KB_CACHE
  try {
    KB_CACHE = fs.readFileSync(path.join(__dirname, '..', 'knowledge', 'grid-knowledge.md'), 'utf8')
  } catch (e) {
    KB_CACHE = ''
  }
  return KB_CACHE
}

const askGrid = async (req, res) => {
  const { question } = req.body
  if (!question || question.trim().length < 2) {
    return res.status(400).json({ message: 'Please type a question' })
  }
  const q = question.toString().slice(0, 500).trim()
  const userId = req.user?.userId || null
  const userRole = req.user?.role || 'guest'

  let answer = ''
  let answered = true
  let offTopic = false

  try {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('No GEMINI_API_KEY')
    const kb = loadKnowledge()
    if (!kb) throw new Error('Knowledge base missing')

    const prompt = `You are "Ask GRID", the help assistant for a platform called GRID (The GRID Card).

STRICT RULES — follow exactly:
1. Answer ONLY using the GRID knowledge below. Never use outside knowledge.
2. If the answer is not in the knowledge, reply EXACTLY: NOT_IN_KB
3. If the question is not about GRID at all (general chat, other websites, homework, coding help, personal advice), reply EXACTLY: OFF_TOPIC
4. Never invent features, prices, dates or policies.
5. Be friendly, short (2-4 sentences), and easy for a student to understand.
6. Never give legal, financial or medical advice.

=== GRID KNOWLEDGE ===
${kb}
=== END KNOWLEDGE ===

User question: "${q}"

Answer:`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      })
      if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status)
      const data = await resp.json()
      answer = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
    } finally { clearTimeout(timeout) }

    if (answer === 'OFF_TOPIC' || answer.startsWith('OFF_TOPIC')) {
      offTopic = true
      answered = false
      answer = "I can only help with questions about GRID — your profile, jobs, skill exams, documents, or how the platform works. What would you like to know about GRID?"
    } else if (answer === 'NOT_IN_KB' || answer.startsWith('NOT_IN_KB') || !answer) {
      answered = false
      answer = "I'm not sure about that one yet. The GRID team has been notified and will add an answer soon. Meanwhile, please use the contact options on thegridcard.com."
    }
  } catch (e) {
    answered = false
    answer = "I couldn't reach the assistant just now. Please try again in a moment."
  }

  try {
    await prisma.askQuestion.create({
      data: { question: q, answer, answered, offTopic, userId, userRole }
    })
  } catch (e) { console.error('Question log failed:', e.message) }

  res.json({ answer, answered })
}

module.exports = { askGrid }
