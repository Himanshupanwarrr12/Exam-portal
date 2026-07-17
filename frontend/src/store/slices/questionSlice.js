import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../../api/axiosClient'

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// fetchQuestions — GET /api/questions?examId=:examId
export const fetchQuestions = createAsyncThunk('questions/fetchByExam', async (examId, thunkAPI) => {
  try {
    const response = await axiosClient.get(`/questions?examId=${examId}`)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch questions')
  }
})

// addQuestion — Admin: POST /api/questions
export const addQuestion = createAsyncThunk('questions/add', async (questionData, thunkAPI) => {
  try {
    const response = await axiosClient.post('/questions', questionData)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add question')
  }
})

// updateQuestion — Admin: PUT /api/questions/:id
export const updateQuestion = createAsyncThunk('questions/update', async ({ id, questionData }, thunkAPI) => {
  try {
    const response = await axiosClient.put(`/questions/${id}`, questionData)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update question')
  }
})

// deleteQuestion — Admin: DELETE /api/questions/:id
export const deleteQuestion = createAsyncThunk('questions/delete', async (id, thunkAPI) => {
  try {
    await axiosClient.delete(`/questions/${id}`)
    return id
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete question')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────
const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    questions: [], // array of question objects for the currently selected exam
    loading: false,
    error: null,
  },
  reducers: {
    clearQuestions(state) {
      state.questions = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => { state.loading = true })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.questions = action.payload
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload)
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex((q) => q.id === action.payload.id)
        if (index !== -1) state.questions[index] = action.payload
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter((q) => q.id !== action.payload)
      })
  },
})

export const { clearQuestions } = questionSlice.actions
export default questionSlice.reducer
