import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRouter     from './routes/auth.routes.js'
import examRouter     from './routes/exam.routes.js'
import questionRouter from './routes/question.routes.js'
import adminRouter    from './routes/admin.routes.js'
import resultRouter   from './routes/result.routes.js'
import attemptRouter from './routes/attempt.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Exam Portal API is running!' })
})

app.use('/api/auth',      authRouter)
app.use('/api/exams',     examRouter)
app.use('/api/questions', questionRouter)
app.use('/api/admin',     adminRouter)
app.use('/api/results',   resultRouter)
app.use('/api/attempts',  attemptRouter)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
