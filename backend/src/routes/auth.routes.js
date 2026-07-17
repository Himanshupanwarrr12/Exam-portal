// src/routes/auth.routes.js
//
// Defines the URL endpoints for authentication.
// The Express Router is a mini-app that handles a group of related routes.
// It's mounted in index.js with:  app.use('/api/auth', authRouter)
// So the full URL for each route is /api/auth/<path>.

import { Router } from 'express'
import { register, login, getMe } from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

// POST /api/auth/register — create a new student account (public)
router.post('/register', register)

// POST /api/auth/login — verify credentials, get a JWT (public)
router.post('/login', login)

// GET /api/auth/me — get current user info (protected — must be logged in)
// verifyToken runs first; if it passes, getMe runs next
router.get('/me', verifyToken, getMe)

export default router
