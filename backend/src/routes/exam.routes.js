// src/routes/exam.routes.js
// IMPORTANT: The static route '/available' must be declared BEFORE '/:id'
// Otherwise Express treats the string "available" as the :id parameter!

import { Router } from 'express'
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getAvailableExams,
} from '../controllers/exam.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin, requireStudent } from '../middleware/role.middleware.js'

const router = Router()

// ── Student routes (Phase 4) ──────────────────────────────────────────────────
// GET /api/exams/available — MUST come before /:id
router.get('/available', verifyToken, requireStudent, getAvailableExams)

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/',     verifyToken, requireAdmin, getAllExams)
router.get('/:id',  verifyToken, requireAdmin, getExamById)
router.post('/',    verifyToken, requireAdmin, createExam)
router.put('/:id',  verifyToken, requireAdmin, updateExam)
router.delete('/:id', verifyToken, requireAdmin, deleteExam)

export default router
