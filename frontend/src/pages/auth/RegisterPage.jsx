// src/pages/auth/RegisterPage.jsx
// Student self-registration page. Role is always STUDENT.

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
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    const result = await dispatch(
      registerUser({ name: formData.name.trim(), email: formData.email, password: formData.password })
    )

    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  const renderField = (id, name, label, type, placeholder, autocomplete) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
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
        className={`w-full px-3 py-2 border rounded text-slate-900 bg-white text-sm placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all
          ${validationErrors[name] ? 'border-red-500' : 'border-slate-200'}`}
      />
      {validationErrors[name] && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          {validationErrors[name]}
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-blue-50 border border-blue-200 mb-3">
            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-0.5">Register as a Student</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          {successMessage && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded p-3 mb-5">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-700 text-sm">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded p-3">
                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {renderField('reg-name',     'name',            'Full Name',        'text',     'Jane Doe',            'name')}
            {renderField('reg-email',    'email',           'Email Address',    'email',    'email@institution.edu',     'email')}
            {renderField('reg-password', 'password',        'Password',         'password', '••••••••',            'new-password')}
            {renderField('reg-confirm',  'confirmPassword', 'Confirm Password', 'password', '••••••••',            'new-password')}

            {/* Role Info */}
            <div className="py-1">
              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded">
                Student Account
              </span>
              <span className="text-slate-500 text-xs ml-2">Admins are added via server seeding</span>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full py-2.5 px-4 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm
                disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        {/* Footer Link */}
        <p className="text-center text-slate-600 text-sm mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-700 hover:underline font-bold transition-all"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage
