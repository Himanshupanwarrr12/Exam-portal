// src/controllers/result.controller.js
// Student-facing result endpoints.
// NOTE: Admin per-exam results live in admin.controller.js → GET /api/admin/results/:examId

import prisma from '../lib/prismaClient.js'

// ── GET MY RESULTS ────────────────────────────────────────────────────────────
// GET /api/results/my   (Student only)
// Returns all submitted attempts for the currently logged-in student,
// along with the exam title and max marks information.
export const getMyResults = async (req, res) => {
  try {
    // req.user.userId is set by verifyToken middleware
    const studentId = req.user.userId

    const results = await prisma.attempt.findMany({
      where: {
        studentId,
        status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
      },
      include: {
        // Include exam info so the student knows which exam each result is for
        exam: {
          select: { id: true, title: true, durationMinutes: true },
        },
      },
      orderBy: { submittedAt: 'desc' }, // most recent results first
    })

    return res.status(200).json(results)
  } catch (error) {
    console.error('getMyResults error:', error)
    return res.status(500).json({ message: 'Failed to fetch your results.' })
  }
}

// ── GET SINGLE RESULT DETAIL ──────────────────────────────────────────────────
// GET /api/results/:attemptId   (Student — can only see own results)
// Returns detailed result including each question, selected answer, correct answer.
// Used for the "review" screen after submission (Phase 6).
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
            question: true, // includes correctOption for review display
          },
        },
      },
    })

    if (!attempt) {
      return res.status(404).json({ message: 'Result not found.' })
    }

    // Security: students can only view their own results
    if (attempt.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    return res.status(200).json(attempt)
  } catch (error) {
    console.error('getResultDetail error:', error)
    return res.status(500).json({ message: 'Failed to fetch result detail.' })
  }
}
