import prisma from '../lib/prismaClient.js'

export const getAllExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    })
    return res.status(200).json(exams)
  } catch (error) {
    console.error('getAllExams error:', error)
    return res.status(500).json({ message: 'Failed to fetch exams.' })
  }
}

export const getExamById = async (req, res) => {
  try {
    const examId = parseInt(req.params.id)

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: { orderBy: { id: 'asc' } },
        _count: { select: { attempts: true } },
      },
    })

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    return res.status(200).json(exam)
  } catch (error) {
    console.error('getExamById error:', error)
    return res.status(500).json({ message: 'Failed to fetch exam.' })
  }
}

export const createExam = async (req, res) => {
  try {
    const { title, description, durationMinutes, startTime, endTime } = req.body

    if (!title || !durationMinutes || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, duration, start time, and end time are required.' })
    }

    if (parseInt(durationMinutes) <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number.' })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format for start or end time.' })
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time.' })
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        durationMinutes: parseInt(durationMinutes),
        startTime: start,
        endTime: end,
        createdBy: req.user.userId,
      },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
    })

    return res.status(201).json(exam)
  } catch (error) {
    console.error('createExam error:', error)
    return res.status(500).json({ message: 'Failed to create exam.' })
  }
}

export const updateExam = async (req, res) => {
  try {
    const examId = parseInt(req.params.id)
    const { title, description, durationMinutes, startTime, endTime } = req.body

    const existing = await prisma.exam.findUnique({ where: { id: examId } })
    if (!existing) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    const start = startTime ? new Date(startTime) : existing.startTime
    const end = endTime ? new Date(endTime) : existing.endTime

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time.' })
    }

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: title?.trim() || existing.title,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : existing.durationMinutes,
        startTime: start,
        endTime: end,
      },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error('updateExam error:', error)
    return res.status(500).json({ message: 'Failed to update exam.' })
  }
}

export const deleteExam = async (req, res) => {
  try {
    const examId = parseInt(req.params.id)

    const existing = await prisma.exam.findUnique({ where: { id: examId } })
    if (!existing) {
      return res.status(404).json({ message: 'Exam not found.' })
    }

    await prisma.exam.delete({ where: { id: examId } })

    return res.status(200).json({ message: 'Exam deleted successfully.', id: examId })
  } catch (error) {
    console.error('deleteExam error:', error)
    return res.status(500).json({ message: 'Failed to delete exam.' })
  }
}

export const getAvailableExams = async (req, res) => {
  try {
    const now = new Date()

    const exams = await prisma.exam.findMany({
      where: {
        endTime: { gt: now },
        questions: { some: {} },
      },
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    const active   = exams.filter((e) => new Date(e.startTime) <= now)
    const upcoming = exams.filter((e) => new Date(e.startTime) > now)

    return res.status(200).json({ active, upcoming })
  } catch (error) {
    console.error('getAvailableExams error:', error)
    return res.status(500).json({ message: 'Failed to fetch available exams.' })
  }
}
