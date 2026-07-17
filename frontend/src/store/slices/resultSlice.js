import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../../api/axiosClient'

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// fetchMyResults — Student: GET /api/results/my
// Returns all submitted attempts for the logged-in student
export const fetchMyResults = createAsyncThunk('results/fetchMine', async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get('/results/my')
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch results')
  }
})

// fetchExamResults — Admin: GET /api/results/exam/:examId
// Returns all student attempts for a specific exam (for admin analytics)
export const fetchExamResults = createAsyncThunk('results/fetchByExam', async (examId, thunkAPI) => {
  try {
    const response = await axiosClient.get(`/results/exam/${examId}`)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch exam results')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────
const resultSlice = createSlice({
  name: 'results',
  initialState: {
    myResults: [],      // student's own past attempt results
    examResults: [],    // all results for one exam (admin view)
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyResults.pending, (state) => { state.loading = true })
      .addCase(fetchMyResults.fulfilled, (state, action) => {
        state.loading = false
        state.myResults = action.payload
      })
      .addCase(fetchMyResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchExamResults.pending, (state) => { state.loading = true })
      .addCase(fetchExamResults.fulfilled, (state, action) => {
        state.loading = false
        state.examResults = action.payload
      })
      .addCase(fetchExamResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default resultSlice.reducer
