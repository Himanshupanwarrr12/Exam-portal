// src/controllers/question.controller.js
// CRUD for MCQ questions — all operations are admin-only.

import prisma from '../lib/prismaClient.js'

// ── GET QUESTIONS BY EXAM ─────────────────────────────────────────────────────
// GET /api/questions?examId=:id
// Returns all questions for a given exam, in insertion order.
// Used by: Admin → QuestionsPage, and later by the exam engine (Phase 5).
export const getQuestionsByExam = async (req, res) => {
  try {
    const examId = parseInt(req.query.examId)

    if (!examId || isNaN(examId)) {
      return res.status(400).json({ message: 'A valid examId query parameter is required.' })
    }

    // Verify the exam exists first
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    const questions = await prisma.question.findMany({
      where: { examId },
      orderBy: { id: 'asc' },
    })

    return res.status(200).json(questions)
  } catch (error) {
    console.error('getQuestionsByExam error:', error)
    return res.status(500).json({ message: 'Failed to fetch questions.' })
  }
}

// ── ADD QUESTION ──────────────────────────────────────────────────────────────
// POST /api/questions   (Admin only)
// Body: { examId, text, optionA, optionB, optionC, optionD, correctOption, marks }
export const addQuestion = async (req, res) => {
  try {
    const { examId, text, optionA, optionB, optionC, optionD, correctOption, marks } = req.body

    // ── Validate all required fields
    if (!examId || !text || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return res.status(400).json({
        message: 'examId, question text, all four options, and correct option are required.',
      })
    }

    // correctOption must be exactly one of the allowed letters
    if (!['A', 'B', 'C', 'D'].includes(correctOption.toUpperCase())) {
      return res.status(400).json({ message: 'correctOption must be "A", "B", "C", or "D".' })
    }

    // Confirm the exam exists before adding a question to it
    const exam = await prisma.exam.findUnique({ where: { id: parseInt(examId) } })
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    const question = await prisma.question.create({
      data: {
        examId: parseInt(examId),
        text: text.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption: correctOption.toUpperCase(),
        marks: parseInt(marks) || 1, // default 1 mark per question
      },
    })

    return res.status(201).json(question)
  } catch (error) {
    console.error('addQuestion error:', error)
    return res.status(500).json({ message: 'Failed to add question.' })
  }
}

// ── UPDATE QUESTION ───────────────────────────────────────────────────────────
// PUT /api/questions/:id   (Admin only)
// Only updates fields that are actually sent in the body (partial update).
export const updateQuestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { text, optionA, optionB, optionC, optionD, correctOption, marks } = req.body

    const existing = await prisma.question.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Question not found.' })
    }

    if (correctOption && !['A', 'B', 'C', 'D'].includes(correctOption.toUpperCase())) {
      return res.status(400).json({ message: 'correctOption must be "A", "B", "C", or "D".' })
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        text:          text          ? text.trim()                   : existing.text,
        optionA:       optionA       ? optionA.trim()                : existing.optionA,
        optionB:       optionB       ? optionB.trim()                : existing.optionB,
        optionC:       optionC       ? optionC.trim()                : existing.optionC,
        optionD:       optionD       ? optionD.trim()                : existing.optionD,
        correctOption: correctOption ? correctOption.toUpperCase()   : existing.correctOption,
        marks:         marks         ? parseInt(marks)               : existing.marks,
      },
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error('updateQuestion error:', error)
    return res.status(500).json({ message: 'Failed to update question.' })
  }
}

// ── DELETE QUESTION ───────────────────────────────────────────────────────────
// DELETE /api/questions/:id   (Admin only)
export const deleteQuestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const existing = await prisma.question.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Question not found.' })
    }

    await prisma.question.delete({ where: { id } })

    return res.status(200).json({ message: 'Question deleted successfully.', id })
  } catch (error) {
    console.error('deleteQuestion error:', error)
    return res.status(500).json({ message: 'Failed to delete question.' })
  }
}
