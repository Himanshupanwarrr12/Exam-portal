// src/pages/admin/ExamFormPage.jsx
// Dual-purpose page: create a new exam OR edit an existing one.

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { createExam, updateExam } from '../../store/slices/examSlice'
import axiosClient from '../../api/axiosClient'

const toDatetimeLocal = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d - offset).toISOString().slice(0, 16)
}

function ExamFormPage() {
  const { examId } = useParams()
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

    if (!result.error) {
      if (isEditMode) {
        navigate('/admin/exams')
      } else {
        // Redirect straight to questions so the admin is guided to add questions immediately.
        // Pass a state flag so QuestionsPage can show a contextual "now add questions" banner.
        navigate(`/admin/exams/${result.payload.id}/questions`, {
          state: { fromCreate: true, examTitle: result.payload.title },
        })
      }
    } else {
      setApiError(result.payload || 'Something went wrong.')
    }
  }

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded bg-white text-slate-900 text-sm placeholder-slate-400
     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all
     ${errors[field] ? 'border-red-500' : 'border-slate-200'}`

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl mx-auto">

        {/* Back navigation */}
        <div className="mb-6">
          <button onClick={() => navigate('/admin/exams')} className="text-slate-500 hover:text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Exam Schedule' : 'Schedule New Exam'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure examination timing, guidelines, and metadata constraints.
          </p>
        </div>

        {loadingExam ? (
          <div className="text-slate-400 py-12 text-center">Loading exam parameters...</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
            {apiError && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input id="exam-title" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Semester III - Data Structures" className={inputCls('title')} />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Instructions / Description</label>
                <textarea id="exam-description" name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Provide instructions regarding grading, constraints, etc."
                  className={`${inputCls('description')} resize-none`} />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Allowed Duration (minutes) *</label>
                <input id="exam-duration" name="durationMinutes" type="number" min="1"
                  value={form.durationMinutes} onChange={handleChange}
                  placeholder="e.g. 60" className={inputCls('durationMinutes')} />
                {errors.durationMinutes && <p className="mt-1 text-xs text-red-600">{errors.durationMinutes}</p>}
              </div>

              {/* Start and End Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Access Start *</label>
                  <input id="exam-start" name="startTime" type="datetime-local"
                    value={form.startTime} onChange={handleChange} className={inputCls('startTime')} />
                  {errors.startTime && <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Access End *</label>
                  <input id="exam-end" name="endTime" type="datetime-local"
                    value={form.endTime} onChange={handleChange} className={inputCls('endTime')} />
                  {errors.endTime && <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  id="exam-form-submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-blue-500/20"
                >
                  {submitting ? 'Saving Configuration...' : (isEditMode ? 'Save Changes' : 'Publish Schedule')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/exams')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded transition-all focus:ring-2 focus:ring-slate-500/20"
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
