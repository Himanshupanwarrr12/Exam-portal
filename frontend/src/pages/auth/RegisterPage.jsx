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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center lg:grid lg:grid-cols-12 text-slate-900 font-sans">
      
      {/* Left Column: Calm, professional illustration (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#f0f7ff] min-h-screen flex-col justify-between p-12 text-slate-800 border-r border-slate-200 select-none relative overflow-hidden">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Brand */}
        <div className="relative z-10 pt-2">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-800 to-slate-900 bg-clip-text text-transparent">
            Exam Portal
          </h1>
        </div>

        {/* Dynamic Image Illustration (Student taking exam) */}
        <div className="flex-1 flex items-center justify-center my-8 relative z-10">
          <img
            src="/online_exam_illustration.png"
            alt="Student Learning Progress"
            className="w-full max-w-[440px] object-contain drop-shadow-sm"
          />
        </div>

        {/* Removed Caption bottom left completely */}
        <div className="h-4 relative z-10"></div>
      </div>

      {/* Right Column: Form Panel (Centered on all screen sizes) */}
      <div className="lg:col-span-6 w-full min-h-screen flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Logo - only visible on Mobile/Tablet */}
          <div className="text-center lg:hidden mb-8">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-800 to-slate-900 bg-clip-text text-transparent">
              Exam Portal
            </h1>
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
    </div>
  )
}

export default RegisterPage
