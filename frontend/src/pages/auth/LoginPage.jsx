// src/pages/auth/LoginPage.jsx
//
// The login page for both Admins and Students (same form, same endpoint).
// After successful login, the JWT and user object are stored in Redux + localStorage.
// The useEffect below then redirects based on the user's role.

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, clearError } from '../../store/slices/authSlice'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Pull auth state from Redux store
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  // Local form state — only lives in this component, not in Redux
  // (form inputs don't need global state — they're temporary UI state)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState({})

  // ── Redirect if already authenticated ─────────────────────────────────────
  // Runs every time isAuthenticated or user changes.
  // This handles the case where a logged-in user navigates to /login.
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', {
        replace: true, // replace prevents going "back" to the login page
      })
    }
  }, [isAuthenticated, user, navigate])

  // Clear any previous API error when the component first mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // ── Client-side validation ─────────────────────────────────────────────────
  // Validates the form BEFORE sending anything to the server.
  // This gives instant feedback and avoids unnecessary API calls.
  const validate = () => {
    const errors = {}
    if (!formData.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (!formData.password) {
      errors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }
    return errors
  }

  // ── onChange handler ───────────────────────────────────────────────────────
  // Updates formData and clears the validation error for the field being edited.
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear the error for this field as soon as the user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault() // prevent page reload (default form behavior)
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors) // show errors inline, don't call API
      return
    }
    // Dispatch the loginUser thunk — it calls POST /api/auth/login
    // and updates the Redux store on success/failure
    dispatch(loginUser(formData))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* ── Brand Header ──────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-indigo-600 shadow-lg shadow-indigo-500/40">
            {/* Clipboard / exam icon */}
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ExamPortal</h1>
          <p className="text-slate-400 text-sm mt-1">Online Examination System</p>
        </div>

        {/* ── Form Card ─────────────────────────────────────────────────── */}
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* API Error Banner — shows backend error (e.g., wrong password) */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-lg bg-slate-700/80 border text-white text-sm
                  placeholder-slate-500 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  ${validationErrors.email ? 'border-red-500/70' : 'border-slate-600/70 hover:border-slate-500/70'}`}
              />
              {validationErrors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-lg bg-slate-700/80 border text-white text-sm
                  placeholder-slate-500 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  ${validationErrors.password ? 'border-red-500/70' : 'border-slate-600/70 hover:border-slate-500/70'}`}
              />
              {validationErrors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white
                bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800
                shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

          </form>
        </div>

        {/* ── Footer Link ───────────────────────────────────────────────── */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150"
          >
            Register as a student
          </Link>
        </p>

        {/* Quick credential hint (remove before submission if needed) */}
        <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-center">
          <p className="text-slate-500 text-xs">
            <span className="text-slate-400 font-medium">Admin:</span> admin@examportal.com / Admin@1234
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            <span className="text-slate-400 font-medium">Student:</span> student@examportal.com / Student@1234
          </p>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
