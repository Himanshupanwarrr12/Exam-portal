import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  fetchQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../store/slices/questionSlice'
import axiosClient from '../../api/axiosClient'

const emptyForm = {
  text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: '1',
}

const optionBadgeClass = "w-6 h-6 flex items-center justify-center font-bold text-xs rounded border bg-slate-100 border-slate-200 text-slate-700"

function QuestionsPage() {
  const { examId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { questions, loading, error } = useSelector((state) => state.questions)

  const [examTitle, setExamTitle] = useState('')

  // Banner shown when arriving immediately after creating a new exam
  const [showCreatedBanner, setShowCreatedBanner] = useState(
    Boolean(location.state?.fromCreate)
  )
  const createdExamTitle = location.state?.examTitle || examTitle

  // Auto-dismiss the banner once the first question is successfully added
  useEffect(() => {
    if (showCreatedBanner && questions.length > 0) {
      setShowCreatedBanner(false)
    }
  }, [questions.length, showCreatedBanner])

  // Form state (inline editing workspace)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    dispatch(fetchQuestions(parseInt(examId)))
    axiosClient.get(`/exams/${examId}`).then((res) => setExamTitle(res.data.title)).catch(() => {})
  }, [dispatch, examId])

  const handleStartEdit = (q) => {
    setEditingQuestion(q)
    setForm({
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      marks: String(q.marks),
    })
    setFormErrors({})
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setForm(emptyForm)
    setFormErrors({})
  }

  const validate = () => {
    const e = {}
    if (!form.text.trim())    e.text    = 'Question text is required.'
    if (!form.optionA.trim()) e.optionA = 'Option A is required.'
    if (!form.optionB.trim()) e.optionB = 'Option B is required.'
    if (!form.optionC.trim()) e.optionC = 'Option C is required.'
    if (!form.optionD.trim()) e.optionD = 'Option D is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSubmitting(true)
    if (editingQuestion) {
      const result = await dispatch(updateQuestion({ id: editingQuestion.id, questionData: form }))
      if (!result.error) {
        dispatch(fetchQuestions(parseInt(examId)))
        handleCancelEdit()
      }
    } else {
      const result = await dispatch(addQuestion({ ...form, examId: parseInt(examId), marks: parseInt(form.marks) || 1 }))
      if (!result.error) {
        setForm(emptyForm)
        setFormErrors({})
      }
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteQuestion(id))
    if (editingQuestion && editingQuestion.id === id) {
      handleCancelEdit()
    }
    setDeletingId(null)
  }

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded bg-white text-slate-900 text-sm placeholder-slate-400
     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all
     ${formErrors[field] ? 'border-red-500' : 'border-slate-200'}`

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">

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
          <h1 className="text-2xl font-bold text-slate-900">Manage Questions</h1>
          <p className="text-slate-500 text-sm mt-1">
            {examTitle ? <span>Exam: <span className="font-semibold text-slate-800">{examTitle}</span></span> : 'Loading...'}
            {' · '}<span className="text-slate-600 font-medium">{questions.length} question{questions.length !== 1 ? 's' : ''} configured</span>
          </p>
        </div>

        {/* "Exam created" contextual onboarding banner */}
        {showCreatedBanner && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-500 text-lg mt-0.5" aria-hidden>🎉</span>
            <div className="flex-1">
              <p className="text-amber-900 font-bold text-sm">
                Exam &ldquo;{createdExamTitle}&rdquo; created!
              </p>
              <p className="text-amber-800 text-xs mt-0.5">
                Students can&apos;t see or attempt this exam until you add at least one question.
                Create your first question using the workspace panel below.
              </p>
            </div>
            <button
              onClick={() => setShowCreatedBanner(false)}
              className="text-amber-400 hover:text-amber-700 transition-colors flex-shrink-0 mt-0.5"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Form Card (Sticky on Large Screens) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 shadow-sm lg:sticky lg:top-6">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-sm uppercase tracking-wider">
                {editingQuestion ? 'Edit Question' : 'Create Question'}
              </h2>
              {editingQuestion && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Prompt *
                </label>
                <textarea
                  name="text"
                  value={form.text}
                  onChange={(e) => {
                    setForm(p => ({ ...p, text: e.target.value }));
                    if (formErrors.text) setFormErrors(p => ({ ...p, text: '' }));
                  }}
                  rows={4}
                  placeholder="Enter the question statement here..."
                  className={`${inputCls('text')} resize-none`}
                />
                {formErrors.text && <p className="mt-1 text-xs text-red-600">{formErrors.text}</p>}
              </div>

              {/* Options Grid with Integrated Radio Buttons */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Options & Correct Key *
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Correct Key
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const isCorrect = form.correctOption === opt
                    return (
                      <div
                        key={opt}
                        className={`p-3 rounded-lg border transition-all ${
                          isCorrect
                            ? 'border-green-300 bg-green-50/20'
                            : 'border-slate-200 bg-slate-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
                            isCorrect
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            Option {opt}
                          </span>
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer select-none">
                            <input
                              type="radio"
                              name="correctOption"
                              value={opt}
                              checked={isCorrect}
                              onChange={(e) => setForm(p => ({ ...p, correctOption: e.target.value }))}
                              className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500 focus:ring-offset-0 focus:outline-none"
                            />
                            Correct
                          </label>
                        </div>
                        <input
                          name={`option${opt}`}
                          value={form[`option${opt}`]}
                          onChange={(e) => {
                            setForm(p => ({ ...p, [`option${opt}`]: e.target.value }));
                            if (formErrors[`option${opt}`]) setFormErrors(p => ({ ...p, [`option${opt}`]: '' }));
                          }}
                          placeholder={`Enter choice ${opt}`}
                          className="w-full px-3 py-2 border border-slate-200 rounded text-slate-900 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                        {formErrors[`option${opt}`] && (
                          <p className="mt-1 text-xs text-red-600">{formErrors[`option${opt}`]}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Marks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Marks Assigned
                </label>
                <input
                  type="number"
                  min="1"
                  name="marks"
                  value={form.marks}
                  onChange={(e) => setForm(p => ({ ...p, marks: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  id="question-form-submit"
                  className="flex-1 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all"
                >
                  {submitting ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Save Question')}
                </button>
                {editingQuestion && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Panel: List of Questions */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/75 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-slate-800 font-bold text-xs uppercase tracking-wider">
                  Questions Pool ({questions.length})
                </h3>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="py-16 px-6 text-center text-slate-500 text-sm">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  No questions created for this exam yet. Use the left panel to add one.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                        editingQuestion?.id === q.id ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {q.marks} Mark{q.marks !== 1 ? 's' : ''}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 border border-green-200 text-green-700">
                            Key: {q.correctOption}
                          </span>
                        </div>
                        <h4 className="text-slate-900 font-semibold text-sm truncate pr-2" title={q.text}>
                          {q.text}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(q)}
                          className={`p-2 border rounded transition-all ${
                            editingQuestion?.id === q.id
                              ? 'bg-blue-700 border-blue-700 text-white'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600 bg-white'
                          }`}
                          title="Edit Question"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {deletingId === q.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(q.id)}
                              className="text-[10px] px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold transition-all"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="text-[10px] px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded font-bold hover:bg-slate-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingId(q.id)}
                            className="p-2 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded transition-all"
                            title="Delete Question"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  )
}

export default QuestionsPage
