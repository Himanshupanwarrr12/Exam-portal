import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, clearError } from '../../store/slices/authSlice'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', {
        replace: true,
      })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    dispatch(loginUser(formData))
  }



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
            alt="Online Examination System"
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
            <p className="text-slate-500 text-sm mt-0.5">Online Examination System</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">Sign in to your account</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded p-3">
                  <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@institution.edu"
                  autoComplete="email"
                  className={`w-full px-3 py-2 border rounded text-slate-900 bg-white text-sm placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all
                    ${validationErrors.email ? 'border-red-500' : 'border-slate-200'}`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
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
                  className={`w-full px-3 py-2 border rounded text-slate-900 bg-white text-sm placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all
                    ${validationErrors.password ? 'border-red-500' : 'border-slate-200'}`}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded md:rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

          {/* Footer Link */}
          <p className="text-center text-slate-600 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-blue-700 hover:underline font-bold transition-all"
            >
              Register as a student
            </Link>
          </p>



        </div>
      </div>
    </div>
  )
}

export default LoginPage
