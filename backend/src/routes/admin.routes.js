// src/routes/admin.routes.js

import { Router } from 'express'
import { getStats, getStudents, getExamResults } from '../controllers/admin.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = Router()

// All admin routes require a valid token AND admin role
router.get('/stats',            verifyToken, requireAdmin, getStats)
router.get('/students',         verifyToken, requireAdmin, getStudents)
router.get('/results/:examId',  verifyToken, requireAdmin, getExamResults)

export default router
