import prisma from '../lib/prismaClient.js'

export const startAttempt = async (req, res) => {
  try {
    const { examId } = req.body
    const studentId = req.user.userId

    if (!examId) return res.status(400).json({ message: 'examId is required.' })

    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: {
        questions: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            text: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
          }
        }
      }
    })

    if (!exam) return res.status(404).json({ message: 'Exam not found.' })

    const now = new Date()
    if (now < new Date(exam.startTime)) {
      return res.status(403).json({ message: 'This exam has not started yet.' })
    }
    if (now > new Date(exam.endTime)) {
      return res.status(403).json({ message: 'This exam has already ended.' })
    }

    if (exam.questions.length === 0) {
      return res.status(400).json({ message: 'This exam has no questions and cannot be attempted.' })
    }

    let attempt = await prisma.attempt.findUnique({
      where: {
        examId_studentId: { examId: exam.id, studentId }
      },
      include: {
        answers: { select: { questionId: true, selectedOption: true } }
      }
    })

    if (attempt) {
      if (attempt.status !== 'IN_PROGRESS') {
        return res.status(403).json({ message: 'You have already submitted this exam.' })
      }
    } else {
      attempt = await prisma.attempt.create({
        data: {
          examId: exam.id,
          studentId,
          status: 'IN_PROGRESS',
        },
        include: { answers: true }
      })
    }

    return res.status(200).json({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      durationMinutes: exam.durationMinutes,
      examInfo: {
        title: exam.title,
        endTime: exam.endTime
      },
      questions: exam.questions,
      savedAnswers: attempt.answers
    })

  } catch (error) {
    console.error('startAttempt error:', error)
    return res.status(500).json({ message: 'Failed to start exam.' })
  }
}

export const saveAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body
    const studentId = req.user.userId

    if (!attemptId || !questionId || !selectedOption) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    const attempt = await prisma.attempt.findUnique({ where: { id: parseInt(attemptId) } })
    
    if (!attempt || attempt.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Exam is already submitted. Cannot change answers.' })
    }

    await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: parseInt(attemptId),
          questionId: parseInt(questionId)
        }
      },
      update: { selectedOption },
      create: {
        attemptId: parseInt(attemptId),
        questionId: parseInt(questionId),
        selectedOption
      }
    })

    return res.status(200).json({ message: 'Saved.' })

  } catch (error) {
    console.error('saveAnswer error:', error)
    return res.status(500).json({ message: 'Failed to save answer.' })
  }
}

export const submitAttempt = async (req, res) => {
  try {
    const { attemptId, autoSubmit } = req.body
    const studentId = req.user.userId

    if (!attemptId) return res.status(400).json({ message: 'attemptId is required.' })

    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: {
        exam: { include: { questions: true } },
        answers: true
      }
    })

    if (!attempt || attempt.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Exam is already submitted.' })
    }

    let earnedMarks = 0
    let totalMarks = 0

    const studentAnswers = {}
    attempt.answers.forEach(a => {
      studentAnswers[a.questionId] = a.selectedOption
    })

    attempt.exam.questions.forEach(q => {
      totalMarks += q.marks
      const studentOpt = studentAnswers[q.id]
      if (studentOpt && studentOpt === q.correctOption) {
        earnedMarks += q.marks
      }
    })

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: autoSubmit ? 'AUTO_SUBMITTED' : 'SUBMITTED',
        submittedAt: new Date(),
        score: earnedMarks,
        totalMarks: totalMarks
      }
    })

    return res.status(200).json({
      message: 'Exam submitted successfully.',
      score: updatedAttempt.score,
      totalMarks: updatedAttempt.totalMarks
    })

  } catch (error) {
    console.error('submitAttempt error:', error)
    return res.status(500).json({ message: 'Failed to submit exam.' })
  }
}
