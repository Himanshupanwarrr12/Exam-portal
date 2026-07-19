// src/pages/admin/QuestionsPage.jsx
// Manage MCQ questions for a specific exam.

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    dispatch(fetchQuestions(parseInt(examId)))
    axiosClient.get(`/exams/${examId}`).then((res) => setExamTitle(res.data.title)).catch(() => {})
  }, [dispatch, examId])

  const openAddModal = () => {
    setEditingQuestion(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEditModal = (q) => {
    setEditingQuestion(q)
    setForm({
      text: q.text, optionA: q.optionA, optionB: q.optionB,
      optionC: q.optionC, optionD: q.optionD,
      correctOption: q.correctOption, marks: String(q.marks),
    })
    setFormErrors({})
    setModalOpen(true)
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

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSubmitting(true)
    if (editingQuestion) {
      await dispatch(updateQuestion({ id: editingQuestion.id, questionData: form }))
      // Re-fetch questions after update to reflect changes immediately
      dispatch(fetchQuestions(parseInt(examId)))
    } else {
      await dispatch(addQuestion({ ...form, examId: parseInt(examId), marks: parseInt(form.marks) || 1 }))
    }
    setSubmitting(false)
    setModalOpen(false)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteQuestion(id))
    setDeletingId(null)
  }

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded bg-white text-slate-900 text-sm placeholder-slate-400
     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all
     ${formErrors[field] ? 'border-red-500' : 'border-slate-200'}`

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">

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
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Questions</h1>
            <p className="text-slate-500 text-sm mt-1">
              {examTitle ? <span>Exam: <span className="font-semibold text-slate-800">{examTitle}</span></span> : 'Loading...'}
              {' · '}<span className="text-slate-600 font-medium">{questions.length} scheduled question{questions.length !== 1 ? 's' : ''}</span>
            </p>
          </div>
          <button
            id="add-question-btn"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-blue-500/20"
          >
            + Add Question
          </button>
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
                Add your first question using the button above.
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

        {/* Questions Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 text-center shadow-sm">
            <p className="text-slate-500 text-sm mb-3">No questions configured for this exam.</p>
            <button onClick={openAddModal} className="text-blue-700 hover:underline text-sm font-bold">
              Add your first question →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 rounded bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                      {idx + 1}
                    </span>
                    <h2 className="text-slate-900 font-bold text-base leading-relaxed">{q.text}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      {q.marks} Mark{q.marks !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => openEditModal(q)}
                        className="p-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded transition-all"
                        title="Edit Question"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {deletingId === q.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(q.id)} className="text-xs px-2 py-1 bg-red-700 text-white rounded font-bold transition-all">Confirm</button>
                          <button onClick={() => setDeletingId(null)} className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded transition-all">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(q.id)}
                          className="p-1 border border-red-200 hover:bg-red-50 text-red-600 rounded transition-all"
                          title="Delete Question"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* MCQ Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const isCorrect = q.correctOption === opt
                    return (
                      <div
                        key={opt}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded border text-sm
                          ${isCorrect
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : 'border-slate-200 bg-white text-slate-700'}`}
                      >
                        <span className={optionBadgeClass}>{opt}</span>
                        <span className="flex-1 font-medium">{q[`option${opt}`]}</span>
                        {isCorrect && (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-700 uppercase tracking-wider pl-2 border-l border-green-200">
                            ✓ Key
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-slate-800 font-bold text-sm uppercase tracking-wider">
                {editingQuestion ? 'Edit Question Configuration' : 'Add New Question'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-950 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleModalSubmit} noValidate className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Question prompt *</label>
                <textarea name="text" value={form.text}
                  onChange={(e) => { setForm(p => ({ ...p, text: e.target.value })); if (formErrors.text) setFormErrors(p => ({ ...p, text: '' })) }}
                  rows={3} placeholder="Provide the core question statement..." className={`${inputCls('text')} resize-none`} />
                {formErrors.text && <p className="mt-1 text-xs text-red-600">{formErrors.text}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt}>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Option {opt} *
                    </label>
                    <input
                      name={`option${opt}`}
                      value={form[`option${opt}`]}
                      onChange={(e) => { setForm(p => ({ ...p, [`option${opt}`]: e.target.value })); if (formErrors[`option${opt}`]) setFormErrors(p => ({ ...p, [`option${opt}`]: '' })) }}
                      placeholder={`Enter option ${opt}`}
                      className={inputCls(`option${opt}`)}
                    />
                    {formErrors[`option${opt}`] && <p className="mt-1 text-xs text-red-600">{formErrors[`option${opt}`]}</p>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer *</label>
                  <select
                    name="correctOption"
                    value={form.correctOption}
                    onChange={(e) => setForm(p => ({ ...p, correctOption: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>Option {o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Marks</label>
                  <input type="number" min="1" name="marks" value={form.marks}
                    onChange={(e) => setForm(p => ({ ...p, marks: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" disabled={submitting} id="question-modal-submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all">
                  {submitting ? 'Saving Question...' : (editingQuestion ? 'Update Question' : 'Save Question')}
                </button>
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default QuestionsPage
