import prisma from '../lib/prismaClient.js'

export const getQuestionsByExam = async (req, res) => {
  try {
    const examId = parseInt(req.query.examId)

    if (!examId || isNaN(examId)) {
      return res.status(400).json({ message: 'A valid examId query parameter is required.' })
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

export const addQuestion = async (req, res) => {
  try {
    const { examId, text, optionA, optionB, optionC, optionD, correctOption, marks } = req.body

    if (!examId || !text || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return res.status(400).json({
        message: 'examId, question text, all four options, and correct option are required.',
      })
    }

    if (!['A', 'B', 'C', 'D'].includes(correctOption.toUpperCase())) {
      return res.status(400).json({ message: 'correctOption must be "A", "B", "C", or "D".' })
    }

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
        marks: parseInt(marks) || 1,
      },
    })

    return res.status(201).json(question)
  } catch (error) {
    console.error('addQuestion error:', error)
    return res.status(500).json({ message: 'Failed to add question.' })
  }
}

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
