// src/routes/attempt.routes.js

import { Router } from 'express'
import { startAttempt, saveAnswer, submitAttempt } from '../controllers/attempt.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireStudent } from '../middleware/role.middleware.js'

const router = Router()

// All attempt routes are student-only
router.post('/start',  verifyToken, requireStudent, startAttempt)
router.post('/answer', verifyToken, requireStudent, saveAnswer)
router.post('/submit', verifyToken, requireStudent, submitAttempt)

export default router
