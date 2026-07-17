// src/pages/admin/ExamFormPage.jsx
// Dual-purpose page: create a new exam OR edit an existing one.
// If :examId is in the URL → edit mode (pre-fetches and pre-fills the form).
// If no :examId → create mode (empty form).

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { createExam, updateExam } from '../../store/slices/examSlice'
import axiosClient from '../../api/axiosClient'

// Utility: converts a JS Date (or ISO string) to the value needed by datetime-local input
// HTML datetime-local format: "YYYY-MM-DDTHH:mm"
const toDatetimeLocal = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  // getTimezoneOffset returns offset in minutes; we adjust to show local time in the input
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d - offset).toISOString().slice(0, 16)
}

function ExamFormPage() {
  const { examId } = useParams() // undefined for create, a number string for edit
  const isEditMode = Boolean(examId)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMinutes: '',
    startTime: '',
    endTime: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loadingExam, setLoadingExam] = useState(isEditMode)

  // ── Pre-fill form in edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return

    const fetchExam = async () => {
      try {
        const res = await axiosClient.get(`/exams/${examId}`)
        const exam = res.data
        setForm({
          title:           exam.title,
          description:     exam.description || '',
          durationMinutes: String(exam.durationMinutes),
          startTime:       toDatetimeLocal(exam.startTime),
          endTime:         toDatetimeLocal(exam.endTime),
        })
      } catch {
        setApiError('Failed to load exam data.')
      } finally {
        setLoadingExam(false)
      }
    }
    fetchExam()
  }, [examId, isEditMode])

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.title.trim())              e.title           = 'Title is required.'
    if (!form.durationMinutes)           e.durationMinutes = 'Duration is required.'
    else if (parseInt(form.durationMinutes) <= 0) e.durationMinutes = 'Must be a positive number.'
    if (!form.startTime)                 e.startTime       = 'Start time is required.'
    if (!form.endTime)                   e.endTime         = 'End time is required.'
    else if (form.startTime && new Date(form.endTime) <= new Date(form.startTime))
      e.endTime = 'End time must be after start time.'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    setApiError('')

    const payload = {
      title:           form.title.trim(),
      description:     form.description.trim() || null,
      durationMinutes: parseInt(form.durationMinutes),
      // datetime-local value is already an ISO-compatible string — new Date() parses it correctly
      startTime:       new Date(form.startTime).toISOString(),
      endTime:         new Date(form.endTime).toISOString(),
    }

    let result
    if (isEditMode) {
      result = await dispatch(updateExam({ id: parseInt(examId), examData: payload }))
    } else {
      result = await dispatch(createExam(payload))
    }

    setSubmitting(false)

    // If the thunk succeeded (not rejected), navigate to exams list
    if (!result.error) {
      navigate('/admin/exams')
    } else {
      setApiError(result.payload || 'Something went wrong.')
    }
  }

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-lg bg-slate-700/80 border text-white text-sm placeholder-slate-500
     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
     ${errors[field] ? 'border-red-500/70' : 'border-slate-600/70 hover:border-slate-500/70'}`

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/exams')} className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Exam' : 'Create New Exam'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isEditMode ? 'Update the exam details below.' : 'Fill in the details to schedule a new exam.'}
          </p>
        </div>

        {loadingExam ? (
          <div className="text-slate-500 py-12 text-center">Loading exam details...</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            {apiError && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{apiError}</div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Exam Title *</label>
                <input id="exam-title" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. BCA Semester 3 – DBMS" className={inputCls('title')} />
                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description <span className="text-slate-500">(optional)</span></label>
                <textarea id="exam-description" name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Brief instructions for students..."
                  className={`${inputCls('description')} resize-none`} />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration (minutes) *</label>
                <input id="exam-duration" name="durationMinutes" type="number" min="1"
                  value={form.durationMinutes} onChange={handleChange}
                  placeholder="e.g. 60" className={inputCls('durationMinutes')} />
                {errors.durationMinutes && <p className="mt-1 text-xs text-red-400">{errors.durationMinutes}</p>}
              </div>

              {/* Start and End Times — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Time *</label>
                  <input id="exam-start" name="startTime" type="datetime-local"
                    value={form.startTime} onChange={handleChange} className={inputCls('startTime')} />
                  {errors.startTime && <p className="mt-1 text-xs text-red-400">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">End Time *</label>
                  <input id="exam-end" name="endTime" type="datetime-local"
                    value={form.endTime} onChange={handleChange} className={inputCls('endTime')} />
                  {errors.endTime && <p className="mt-1 text-xs text-red-400">{errors.endTime}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  id="exam-form-submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {submitting ? 'Saving...' : (isEditMode ? 'Update Exam' : 'Create Exam')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/exams')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ExamFormPage
