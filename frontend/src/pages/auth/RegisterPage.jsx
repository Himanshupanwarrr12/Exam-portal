// src/pages/auth/RegisterPage.jsx
//
// Student self-registration page. Role is always STUDENT — Admins can only be
// created via the seed script. After successful registration, the user is
// redirected to the login page (we don't auto-login on register for simplicity).

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, clearError } from '../../store/slices/authSlice'

function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('') // shown after successful registration

  // If already logged in, redirect away from register page
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Clear any previous API errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Dispatch registerUser thunk — sends { name, email, password } to the API.
    // We don't send confirmPassword to the backend (it's a frontend-only check).
    const result = await dispatch(
      registerUser({ name: formData.name.trim(), email: formData.email, password: formData.password })
    )

    // registerUser.fulfilled → registration succeeded
    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  // ── Helper: reusable input field renderer ─────────────────────────────────
  // Extracts the repeated input JSX into a small helper to keep the form DRY.
  const renderField = (id, name, label, type, placeholder, autocomplete) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autocomplete}
        className={`w-full px-4 py-3 rounded-lg bg-slate-700/80 border text-white text-sm
          placeholder-slate-500 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          ${validationErrors[name] ? 'border-red-500/70' : 'border-slate-600/70 hover:border-slate-500/70'}`}
      />
      {validationErrors[name] && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validationErrors[name]}
        </p>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* ── Brand Header ──────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-violet-600 shadow-lg shadow-violet-500/40">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join ExamPortal as a Student</p>
        </div>

        {/* ── Form Card ─────────────────────────────────────────────────── */}
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 mb-5">
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-400 text-sm">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* API Error Banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {renderField('reg-name',     'name',            'Full Name',        'text',     'John Doe',            'name')}
            {renderField('reg-email',    'email',           'Email address',    'email',    'you@example.com',     'email')}
            {renderField('reg-password', 'password',        'Password',         'password', '••••••••',            'new-password')}
            {renderField('reg-confirm',  'confirmPassword', 'Confirm Password', 'password', '••••••••',            'new-password')}

            {/* Role badge — students only via self-registration */}
            <div className="flex items-center gap-2 py-2">
              <span className="inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Registering as Student
              </span>
              <span className="text-slate-500 text-xs">· Admins are added separately</span>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white
                bg-violet-600 hover:bg-violet-500 active:bg-violet-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800
                shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>

          </form>
        </div>

        {/* ── Footer Link ───────────────────────────────────────────────── */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage
