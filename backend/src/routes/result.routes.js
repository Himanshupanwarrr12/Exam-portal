// src/routes/result.routes.js

import { Router } from 'express'
import { getMyResults, getResultDetail } from '../controllers/result.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireStudent } from '../middleware/role.middleware.js'

const router = Router()

// GET /api/results/my — student's own submitted results (static, before /:id)
router.get('/my',         verifyToken, requireStudent, getMyResults)
// GET /api/results/:attemptId — detailed review of one attempt
router.get('/:attemptId', verifyToken, requireStudent, getResultDetail)

export default router
