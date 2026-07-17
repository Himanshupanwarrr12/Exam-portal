// src/controllers/admin.controller.js
// Admin-only read endpoints: dashboard stats, student list, per-exam results.

import prisma from '../lib/prismaClient.js'

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
// GET /api/admin/stats
// Runs 3 database counts in parallel using Promise.all (faster than sequential).
export const getStats = async (req, res) => {
  try {
    // Promise.all fires all three queries at the same time and waits for all to finish
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

// ── GET ALL STUDENTS ──────────────────────────────────────────────────────────
// GET /api/admin/students
// Returns all STUDENT-role users with their attempt count (number of exams taken).
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
          select: { attempts: true }, // how many exam attempts this student has made
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

// ── GET RESULTS FOR ONE EXAM ──────────────────────────────────────────────────
// GET /api/admin/results/:examId
// Returns all SUBMITTED or AUTO_SUBMITTED attempts for a specific exam,
// including the student's name, email, score, and percentage.
export const getExamResults = async (req, res) => {
  try {
    const examId = parseInt(req.params.examId)

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        examId,
        status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return res.status(200).json({ exam, attempts })
  } catch (error) {
    console.error('getExamResults error:', error)
    return res.status(500).json({ message: 'Failed to fetch results.' })
  }
}
