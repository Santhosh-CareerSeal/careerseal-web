const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const COURSES = [
  { id: 'react-basics', title: 'React JS Full Course for Beginners', skill: 'React', category: 'Tech', provider: 'YouTube', duration: '11 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=react+js+full+course+for+beginners', thumbnail: '⚛️' },
  { id: 'react-advanced', title: 'Advanced React Patterns', skill: 'React', category: 'Tech', provider: 'YouTube', duration: '6 hrs', free: true, level: 'Advanced', url: 'https://www.youtube.com/results?search_query=advanced+react+patterns', thumbnail: '⚛️' },
  { id: 'node-basics', title: 'Node.js and Express Crash Course', skill: 'Node.js', category: 'Tech', provider: 'YouTube', duration: '8 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=node+js+express+crash+course', thumbnail: '🟢' },
  { id: 'python-basics', title: 'Python for Beginners — Full Course', skill: 'Python', category: 'Tech', provider: 'YouTube', duration: '12 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=python+for+beginners+full+course', thumbnail: '🐍' },
  { id: 'sql-basics', title: 'SQL Full Course for Beginners', skill: 'SQL', category: 'Tech', provider: 'YouTube', duration: '4 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=sql+full+course+for+beginners', thumbnail: '🗃️' },
  { id: 'js-basics', title: 'JavaScript Full Course 2025', skill: 'JavaScript', category: 'Tech', provider: 'YouTube', duration: '10 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=javascript+full+course', thumbnail: '🟨' },
  { id: 'dsa-basics', title: 'DSA Complete Course in Java/C++', skill: 'DSA', category: 'Tech', provider: 'YouTube', duration: '20 hrs', free: true, level: 'Advanced', url: 'https://www.youtube.com/results?search_query=dsa+complete+course', thumbnail: '🧮' },
  { id: 'git-basics', title: 'Git and GitHub for Beginners', skill: 'Git', category: 'Tech', provider: 'YouTube', duration: '2 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=git+and+github+for+beginners', thumbnail: '🐙' },
  { id: 'system-design', title: 'System Design Basics for Interviews', skill: 'System design', category: 'Tech', provider: 'YouTube', duration: '5 hrs', free: true, level: 'Advanced', url: 'https://www.youtube.com/results?search_query=system+design+basics+for+interviews', thumbnail: '🏗️' },
  { id: 'html-css', title: 'HTML CSS Full Course', skill: 'HTML CSS basics', category: 'Tech', provider: 'YouTube', duration: '6 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=html+css+full+course', thumbnail: '🎨' },
  { id: 'interview-prep', title: 'Top Interview Questions and Answers', skill: 'Interview prep', category: 'Career', provider: 'YouTube', duration: '3 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=top+interview+questions+and+answers', thumbnail: '🎤' },
  { id: 'cloud-aws', title: 'AWS Cloud Practitioner Full Course', skill: 'Cloud', category: 'Tech', provider: 'YouTube', duration: '14 hrs', free: true, level: 'Intermediate', url: 'https://www.youtube.com/results?search_query=aws+cloud+practitioner+full+course', thumbnail: '☁️' },
  { id: 'negotiation', title: 'Salary Negotiation Tips', skill: 'Negotiation', category: 'Career', provider: 'YouTube', duration: '1 hr', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=salary+negotiation+tips', thumbnail: '💰' },
  { id: 'digital-marketing', title: 'Digital Marketing Full Course', skill: 'Digital Marketing', category: 'Business', provider: 'YouTube', duration: '8 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=digital+marketing+full+course', thumbnail: '📱' },
  { id: 'excel-basics', title: 'Excel for Beginners to Advanced', skill: 'Excel', category: 'Business', provider: 'YouTube', duration: '5 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=excel+for+beginners+to+advanced', thumbnail: '📊' },
  { id: 'communication', title: 'Communication Skills for Professionals', skill: 'Communication', category: 'Career', provider: 'YouTube', duration: '2 hrs', free: true, level: 'Beginner', url: 'https://www.youtube.com/results?search_query=communication+skills+for+professionals', thumbnail: '💬' },
]

const getCourses = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { courseProgress: true, roadmap: true }
    })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const studentSkills = (student.technicalSkills || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

    let roadmapSkills = []
    if (student.roadmap?.roadmapContent) {
      try {
        const content = JSON.parse(student.roadmap.roadmapContent)
        roadmapSkills = (content.phases || []).flatMap(p => p.skills || []).map(s => s.toLowerCase())
      } catch (e) {}
    }

    const allRelevantSkills = [...new Set([...studentSkills, ...roadmapSkills])]

    const coursesWithStatus = COURSES.map(course => {
      const progress = student.courseProgress.find(p => p.courseId === course.id)
      const isRecommended = allRelevantSkills.some(s => course.skill.toLowerCase().includes(s) || s.includes(course.skill.toLowerCase()))
      return { ...course, status: progress?.status || 'not_started', recommended: isRecommended }
    })

    res.json({ courses: coursesWithStatus })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateCourseProgress = async (req, res) => {
  try {
    const userId = req.user.userId
    const { courseId } = req.params
    const { status } = req.body
    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const existing = await prisma.courseProgress.findFirst({ where: { studentId: student.id, courseId } })
    if (existing) {
      await prisma.courseProgress.update({
        where: { id: existing.id },
        data: { status, completedAt: status === 'completed' ? new Date() : null }
      })
    } else {
      await prisma.courseProgress.create({
        data: { studentId: student.id, courseId, status, completedAt: status === 'completed' ? new Date() : null }
      })
    }
    res.json({ message: 'Progress updated' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getCourses, updateCourseProgress }
