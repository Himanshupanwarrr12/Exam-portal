import axios from 'axios'

// axiosClient.js — a pre-configured axios instance used by ALL Redux thunks.
// Instead of writing the base URL and auth header on every fetch call,
// we configure it once here and reuse it everywhere.

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // reads from .env → /api
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor — runs before every request is sent.
// It reads the JWT from localStorage and attaches it as a Bearer token.
// This way, every API call is automatically authenticated.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor — runs when a response (or error) comes back.
// If the server returns 401 (Unauthorized / token expired),
// we clear localStorage and redirect to login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login' // force redirect to login
    }
    return Promise.reject(error)
  }
)

export default axiosClient
