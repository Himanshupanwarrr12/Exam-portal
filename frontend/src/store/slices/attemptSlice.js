// src/store/slices/attemptSlice.js
// Manages the state of an active exam attempt.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../../api/axiosClient'

// ── startExam ─────────────────────────────────────────────────────────────────
// POST /api/attempts/start
export const startExam = createAsyncThunk('attempt/startExam', async (examId, thunkAPI) => {
  try {
    const res = await axiosClient.post('/attempts/start', { examId })
    return res.data 
    // Returns: { attemptId, startedAt, durationMinutes, examInfo: {...}, questions: [...], savedAnswers: [...] }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to start exam.')
  }
})

// ── saveAnswer ────────────────────────────────────────────────────────────────
// POST /api/attempts/answer
export const saveAnswer = createAsyncThunk('attempt/saveAnswer', async ({ attemptId, questionId, selectedOption }, thunkAPI) => {
  try {
    await axiosClient.post('/attempts/answer', { attemptId, questionId, selectedOption })
    // We also return the payload so the reducer can update the local state immediately
    return { questionId, selectedOption }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to save answer.')
  }
})

// ── submitExam ────────────────────────────────────────────────────────────────
// POST /api/attempts/submit
export const submitExam = createAsyncThunk('attempt/submitExam', async ({ attemptId, autoSubmit = false }, thunkAPI) => {
  try {
    const res = await axiosClient.post('/attempts/submit', { attemptId, autoSubmit })
    return res.data // { message, score, totalMarks }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to submit exam.')
  }
})

const initialState = {
  attemptId: null,
  examInfo: null,
  questions: [],
  answers: {}, // map of { questionId: "A" }
  endTime: null, // derived from startedAt + duration
  status: 'idle', // 'idle' | 'loading' | 'in_progress' | 'submitting' | 'submitted' | 'error'
  error: null,
  result: null, // holds score/totalMarks after submission
}

const attemptSlice = createSlice({
  name: 'attempt',
  initialState,
  reducers: {
    // Allows us to clear the active attempt when the student leaves the page
    clearAttempt: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── startExam ──
      .addCase(startExam.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(startExam.fulfilled, (state, action) => {
        state.status = 'in_progress'
        state.attemptId = action.payload.attemptId
        state.examInfo = action.payload.examInfo
        state.questions = action.payload.questions
        
        // Populate previously saved answers (if resuming)
        const initialAnswers = {}
        action.payload.savedAnswers.forEach((a) => {
          initialAnswers[a.questionId] = a.selectedOption
        })
        state.answers = initialAnswers

        // Calculate absolute end time for the timer
        // startedAt is when this specific student started
        const started = new Date(action.payload.startedAt)
        const durationMs = action.payload.durationMinutes * 60 * 1000
        const attemptEndTime = new Date(started.getTime() + durationMs)
        
        // However, the exam itself has a hard cutoff time (examInfo.endTime)
        const hardCutoff = new Date(action.payload.examInfo.endTime)
        
        // The student must finish by whichever is sooner
        state.endTime = attemptEndTime < hardCutoff ? attemptEndTime.toISOString() : hardCutoff.toISOString()
      })
      .addCase(startExam.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })

      // ── saveAnswer ──
      .addCase(saveAnswer.fulfilled, (state, action) => {
        // Update local state optimistic-style
        state.answers[action.payload.questionId] = action.payload.selectedOption
      })

      // ── submitExam ──
      .addCase(submitExam.pending, (state) => {
        state.status = 'submitting'
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.status = 'submitted'
        state.result = {
          score: action.payload.score,
          totalMarks: action.payload.totalMarks
        }
      })
      .addCase(submitExam.rejected, (state, action) => {
        // Even if the network call failed, we don't want to throw them out of the exam yet.
        // We'll set an error that the UI can display, but leave status as 'in_progress'.
        state.status = 'in_progress'
        state.error = action.payload
      })
  }
})

export const { clearAttempt } = attemptSlice.actions
export default attemptSlice.reducer
