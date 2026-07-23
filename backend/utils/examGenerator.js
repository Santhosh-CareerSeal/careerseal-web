const GEMINI_MODEL = 'gemini-flash-lite-latest'

async function generateOnce(skill, level = 'intermediate', count = 10) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')

  const prompt = `You are writing a skill verification exam for a platform called GRID that issues verified skill badges to Indian students.

Create exactly ${count} multiple-choice questions testing real, practical knowledge of "${skill}" at ${level} level.

STRICT RULES:
- Each question must have exactly ONE unambiguously correct answer. No "best answer" judgement calls, no trick wording.
- Test practical understanding, not trivia or memorised version numbers.
- All 4 options must be plausible to someone who half-knows the topic.
- Keep each question under 25 words and each option under 12 words.
- Do not repeat the same concept twice.
- If "${skill}" is not a real, testable professional or technical skill, respond with exactly: INVALID_SKILL

Respond ONLY with valid JSON (no markdown, no backticks) in exactly this shape:
{"questions":[{"q":"question text","options":["a","b","c","d"],"answer":0}]}

"answer" is the 0-based index of the correct option. Vary which index is correct across questions.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              questions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    q: { type: 'STRING' },
                    options: { type: 'ARRAY', items: { type: 'STRING' } },
                    answer: { type: 'INTEGER' }
                  },
                  required: ['q', 'options', 'answer']
                }
              }
            },
            required: ['questions']
          }
        }
      }),
      signal: controller.signal
    })
    if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status)
    const data = await resp.json()
    let text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()

    if (text.startsWith('INVALID_SKILL')) throw new Error('INVALID_SKILL')

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(text)
    const qs = parsed.questions

    if (!Array.isArray(qs) || qs.length === 0) throw new Error('Bad AI shape')

    // validate every question before trusting it
    const clean = qs.filter(q =>
      q && typeof q.q === 'string' && q.q.trim().length > 5 &&
      Array.isArray(q.options) && q.options.length === 4 &&
      q.options.every(o => typeof o === 'string' && o.trim().length > 0) &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    )
    if (clean.length < Math.min(5, count)) throw new Error('Too few valid questions generated')

    return clean.slice(0, count)
  } finally { clearTimeout(timeout) }
}

async function generateExam(skill, level = 'intermediate', count = 10) {
  try {
    return await generateOnce(skill, level, count)
  } catch (e) {
    if (e.message === 'INVALID_SKILL') throw e
    console.error('Exam generation attempt 1 failed (' + e.message + '), retrying once')
    return await generateOnce(skill, level, count)
  }
}

module.exports = { generateExam }
