import prisma from '../lib/prismaClient.js'

export const getStats = async (req, res) => {
  try {
    const [totalExams, totalStudents, submittedAttempts] = await Promise.all([
      prisma.exam.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.attempt.count({
        where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
      }),
    ])

    return res.status(200).json({ totalExams, totalStudents, submittedAttempts })
  } catch (error) {
    console.error('getStats error:', error)
    return res.status(500).json({ message: 'Failed to fetch stats.' })
  }
}

export const getStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(students)
  } catch (error) {
    console.error('getStudents error:', error)
    return res.status(500).json({ message: 'Failed to fetch students.' })
  }
}

export const getExamResults = async (req, res) => {
  try {
    const examId = parseInt(req.params.examId)

    const [exam, attempts] = await Promise.all([
      prisma.exam.findUnique({ where: { id: examId } }),
      prisma.attempt.findMany({
        where: {
          examId,
          status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { submittedAt: 'desc' },
      }),
    ])

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    return res.status(200).json({ exam, attempts })
  } catch (error) {
    console.error('getExamResults error:', error)
    return res.status(500).json({ message: 'Failed to fetch results.' })
  }
}
