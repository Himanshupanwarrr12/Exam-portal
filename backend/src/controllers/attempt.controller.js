// src/controllers/attempt.controller.js
// Handles the exam engine lifecycle: starting an exam, saving answers, submitting.

import prisma from '../lib/prismaClient.js'

// ── START EXAM ATTEMPT ────────────────────────────────────────────────────────
// POST /api/attempts/start
// Body: { examId }
// Returns: attempt details + sanitized questions (NO correctOption)
export const startAttempt = async (req, res) => {
  try {
    const { examId } = req.body
    const studentId = req.user.userId

    if (!examId) return res.status(400).json({ message: 'examId is required.' })

    // 1. Check if exam exists and is active
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: {
        questions: {
          orderBy: { id: 'asc' },
          // CRITICAL: We explicitly select only the safe fields.
          // We DO NOT select correctOption or marks here.
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

    // 2. Find existing attempt or create a new one
    // We use a transaction or just a simple find-first-then-create pattern.
    let attempt = await prisma.attempt.findUnique({
      where: {
        examId_studentId: { examId: exam.id, studentId }
      },
      // Include any previously saved answers so the frontend can resume state
      include: {
        answers: { select: { questionId: true, selectedOption: true } }
      }
    })

    if (attempt) {
      // If it exists but is already submitted, block access
      if (attempt.status !== 'IN_PROGRESS') {
        return res.status(403).json({ message: 'You have already submitted this exam.' })
      }
    } else {
      // Create new attempt
      attempt = await prisma.attempt.create({
        data: {
          examId: exam.id,
          studentId,
          status: 'IN_PROGRESS',
        },
        include: { answers: true }
      })
    }

    // 3. Return payload
    return res.status(200).json({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      durationMinutes: exam.durationMinutes,
      examInfo: {
        title: exam.title,
        endTime: exam.endTime // Hard cutoff time for the exam overall
      },
      questions: exam.questions, // Sanitized
      savedAnswers: attempt.answers // [{ questionId, selectedOption }, ...]
    })

  } catch (error) {
    console.error('startAttempt error:', error)
    return res.status(500).json({ message: 'Failed to start exam.' })
  }
}

// ── SAVE ANSWER (AUTO-SAVE) ───────────────────────────────────────────────────
// POST /api/attempts/answer
// Body: { attemptId, questionId, selectedOption }
// Called every time the student clicks a radio button.
export const saveAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body
    const studentId = req.user.userId

    if (!attemptId || !questionId || !selectedOption) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    // 1. Verify the attempt belongs to this student and is IN_PROGRESS
    const attempt = await prisma.attempt.findUnique({ where: { id: parseInt(attemptId) } })
    
    if (!attempt || attempt.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Exam is already submitted. Cannot change answers.' })
    }

    // 2. Upsert the answer (insert if new, update if exists)
    // Prisma's upsert requires a unique identifier, which we defined as @@unique([attemptId, questionId])
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

// ── SUBMIT EXAM ───────────────────────────────────────────────────────────────
// POST /api/attempts/submit
// Body: { attemptId, autoSubmit: boolean }
export const submitAttempt = async (req, res) => {
  try {
    const { attemptId, autoSubmit } = req.body
    const studentId = req.user.userId

    if (!attemptId) return res.status(400).json({ message: 'attemptId is required.' })

    // 1. Verify attempt
    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: {
        exam: { include: { questions: true } }, // We need full questions (with correctOption) for grading
        answers: true // All answers the student saved
      }
    })

    if (!attempt || attempt.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Exam is already submitted.' })
    }

    // 2. Grade the exam
    let earnedMarks = 0
    let totalMarks = 0

    // Create a map of questionId -> student's answer for fast lookup
    const studentAnswers = {}
    attempt.answers.forEach(a => {
      studentAnswers[a.questionId] = a.selectedOption
    })

    // Loop through all questions in the exam to calculate scores
    attempt.exam.questions.forEach(q => {
      totalMarks += q.marks
      const studentOpt = studentAnswers[q.id]
      if (studentOpt && studentOpt === q.correctOption) {
        earnedMarks += q.marks
      }
    })

    // 3. Update the Attempt record
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
