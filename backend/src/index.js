// src/index.js — Express application entry point.
import 'dotenv/config'

import express from 'express'
import cors from 'cors'

// ── Route Imports ─────────────────────────────────────────────────────────────
import authRouter     from './routes/auth.routes.js'
import examRouter     from './routes/exam.routes.js'      // Phase 3 + 4
import questionRouter from './routes/question.routes.js'  // Phase 3
import adminRouter    from './routes/admin.routes.js'     // Phase 3
import resultRouter   from './routes/result.routes.js'   // Phase 4

// ── App Init ──────────────────────────────────────────────────────────────────
const app = express()
const PORT = process.env.PORT || 5000

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Exam Portal API is running!' })
})

// ── Route Mounting ────────────────────────────────────────────────────────────
// Each router handles all routes that start with the given prefix.
app.use('/api/auth',      authRouter)      // /api/auth/login, /register, /me
app.use('/api/exams',     examRouter)      // /api/exams, /api/exams/available, /api/exams/:id
app.use('/api/questions', questionRouter)  // /api/questions?examId=X
app.use('/api/admin',     adminRouter)     // /api/admin/stats, /students, /results/:examId
app.use('/api/results',   resultRouter)   // /api/results/my, /api/results/:attemptId

// Phase 5 — attempt routes will be mounted here
import attemptRouter from './routes/attempt.routes.js'
app.use('/api/attempts', attemptRouter)

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`)
  console.log(`   Phase 3 routes: /api/exams | /api/questions | /api/admin`)
  console.log(`   Phase 4 routes: /api/exams/available | /api/results/my`)
  console.log(`   Phase 5 routes: /api/attempts`)
})
