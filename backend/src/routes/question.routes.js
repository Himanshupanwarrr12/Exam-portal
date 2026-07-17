// src/routes/question.routes.js

import { Router } from 'express'
import {
  getQuestionsByExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = Router()

// All question routes are admin-only
// GET /api/questions?examId=X
router.get('/',     verifyToken, requireAdmin, getQuestionsByExam)
router.post('/',    verifyToken, requireAdmin, addQuestion)
router.put('/:id',  verifyToken, requireAdmin, updateQuestion)
router.delete('/:id', verifyToken, requireAdmin, deleteQuestion)

export default router
