import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../../api/axiosClient'

// ─── Async Thunks ─────────────────────────────────────────────────────────────
// createAsyncThunk handles the three states of an API call automatically:
// pending (loading), fulfilled (success), rejected (error).

// loginUser — POST /api/auth/login
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, thunkAPI) => {
  try {
    const response = await axiosClient.post('/auth/login', credentials)
    return response.data // { token, user }
  } catch (error) {
    // rejectWithValue sends the error message to the rejected case below
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

// registerUser — POST /api/auth/register
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, thunkAPI) => {
  try {
    const response = await axiosClient.post('/auth/register', userData)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,            // { id, name, email, role }
    token: null,           // JWT string
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    // logout — clears all auth state and removes token from localStorage
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    // loadUserFromStorage — called on app start to rehydrate auth from localStorage
    loadUserFromStorage(state) {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (token && user) {
        state.token = token
        state.user = user
        state.isAuthenticated = true
      }
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        // Persist to localStorage so auth survives page refresh
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
        // After registration, user must log in — we don't auto-login here
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, loadUserFromStorage, clearError } = authSlice.actions
export default authSlice.reducer
