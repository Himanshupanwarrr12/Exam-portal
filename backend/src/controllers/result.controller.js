import prisma from '../lib/prismaClient.js'

export const getMyResults = async (req, res) => {
  try {
    const studentId = req.user.userId

    const results = await prisma.attempt.findMany({
      where: {
        studentId,
        status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
      },
      include: {
        exam: {
          select: { id: true, title: true, durationMinutes: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return res.status(200).json(results)
  } catch (error) {
    console.error('getMyResults error:', error)
    return res.status(500).json({ message: 'Failed to fetch your results.' })
  }
}

export const getResultDetail = async (req, res) => {
  try {
    const attemptId = parseInt(req.params.attemptId)
    const studentId = req.user.userId

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { select: { id: true, title: true } },
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!attempt) {
      return res.status(404).json({ message: 'Result not found.' })
    }

    if (attempt.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    return res.status(200).json(attempt)
  } catch (error) {
    console.error('getResultDetail error:', error)
    return res.status(500).json({ message: 'Failed to fetch result detail.' })
  }
}
