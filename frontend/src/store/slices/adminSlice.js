// src/store/slices/adminSlice.js
// Handles admin-only data: dashboard stats and the student roster.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../../api/axiosClient'

// fetchStats — GET /api/admin/stats
export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, thunkAPI) => {
  try {
    const res = await axiosClient.get('/admin/stats')
    return res.data // { totalExams, totalStudents, submittedAttempts }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch stats')
  }
})

// fetchStudents — GET /api/admin/students
export const fetchStudents = createAsyncThunk('admin/fetchStudents', async (_, thunkAPI) => {
  try {
    const res = await axiosClient.get('/admin/students')
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch students')
  }
})

// fetchAdminResults — GET /api/admin/results/:examId
export const fetchAdminResults = createAsyncThunk('admin/fetchResults', async (examId, thunkAPI) => {
  try {
    const res = await axiosClient.get(`/admin/results/${examId}`)
    return res.data // { exam, attempts[] }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch results')
  }
})

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: { totalExams: 0, totalStudents: 0, submittedAttempts: 0 },
    students: [],
    examResults: { exam: null, attempts: [] },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending,    (state) => { state.loading = true })
      .addCase(fetchStats.fulfilled,  (state, action) => { state.loading = false; state.stats = action.payload })
      .addCase(fetchStats.rejected,   (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchStudents.pending,    (state) => { state.loading = true })
      .addCase(fetchStudents.fulfilled,  (state, action) => { state.loading = false; state.students = action.payload })
      .addCase(fetchStudents.rejected,   (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchAdminResults.pending,    (state) => { state.loading = true })
      .addCase(fetchAdminResults.fulfilled,  (state, action) => { state.loading = false; state.examResults = action.payload })
      .addCase(fetchAdminResults.rejected,   (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export default adminSlice.reducer
