import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../../api/axiosClient'

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// fetchAllExams — Admin: GET /api/exams (all exams)
export const fetchAllExams = createAsyncThunk('exams/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get('/exams')
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch exams')
  }
})

// fetchAvailableExams — Student: GET /api/exams/available
export const fetchAvailableExams = createAsyncThunk('exams/fetchAvailable', async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get('/exams/available')
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch exams')
  }
})

// createExam — Admin: POST /api/exams
export const createExam = createAsyncThunk('exams/create', async (examData, thunkAPI) => {
  try {
    const response = await axiosClient.post('/exams', examData)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create exam')
  }
})

// updateExam — Admin: PUT /api/exams/:id
export const updateExam = createAsyncThunk('exams/update', async ({ id, examData }, thunkAPI) => {
  try {
    const response = await axiosClient.put(`/exams/${id}`, examData)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update exam')
  }
})

// deleteExam — Admin: DELETE /api/exams/:id
export const deleteExam = createAsyncThunk('exams/delete', async (id, thunkAPI) => {
  try {
    await axiosClient.delete(`/exams/${id}`)
    return id // return the id so we can remove it from state
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete exam')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────
const examSlice = createSlice({
  name: 'exams',
  initialState: {
    exams: [],         // array of exam objects
    selectedExam: null, // the exam being edited or viewed
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedExam(state, action) {
      state.selectedExam = action.payload
    },
    clearExamError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllExams
      .addCase(fetchAllExams.pending, (state) => { state.loading = true })
      .addCase(fetchAllExams.fulfilled, (state, action) => {
        state.loading = false
        state.exams = action.payload
      })
      .addCase(fetchAllExams.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // fetchAvailableExams
      .addCase(fetchAvailableExams.pending, (state) => { state.loading = true })
      .addCase(fetchAvailableExams.fulfilled, (state, action) => {
        state.loading = false
        state.exams = action.payload
      })
      .addCase(fetchAvailableExams.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // createExam
      .addCase(createExam.fulfilled, (state, action) => {
        state.exams.push(action.payload) // add new exam to the list
      })
      // updateExam
      .addCase(updateExam.fulfilled, (state, action) => {
        // find and replace the updated exam in the array
        const index = state.exams.findIndex((e) => e.id === action.payload.id)
        if (index !== -1) state.exams[index] = action.payload
      })
      // deleteExam
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.exams = state.exams.filter((e) => e.id !== action.payload)
      })
  },
})

export const { setSelectedExam, clearExamError } = examSlice.actions
export default examSlice.reducer
