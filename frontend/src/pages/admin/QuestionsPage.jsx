// src/pages/admin/QuestionsPage.jsx
// Manage MCQ questions for a specific exam.
// Add, edit, and delete questions — uses a modal overlay for the question form.

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  fetchQuestionsByExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../store/slices/questionSlice'
import axiosClient from '../../api/axiosClient'

// ── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = {
  text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: '1',
}

// ── Option badge colors for A/B/C/D ──────────────────────────────────────────
const optionColors = { A: 'text-indigo-400 bg-indigo-500/15', B: 'text-violet-400 bg-violet-500/15', C: 'text-cyan-400 bg-cyan-500/15', D: 'text-emerald-400 bg-emerald-500/15' }

function QuestionsPage() {
  const { examId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { questions, loading, error } = useSelector((state) => state.questions)

  // Exam info (title) — we fetch it once to show in the header
  const [examTitle, setExamTitle] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null) // null = add mode
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    dispatch(fetchQuestionsByExam(parseInt(examId)))
    // Fetch exam name for the header
    axiosClient.get(`/exams/${examId}`).then((res) => setExamTitle(res.data.title)).catch(() => {})
  }, [dispatch, examId])

  // ── Open modal for Add ────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingQuestion(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalOpen(true)
  }

  // ── Open modal for Edit ───────────────────────────────────────────────────
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

  // ── Validate modal form ───────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.text.trim())    e.text    = 'Question text is required.'
    if (!form.optionA.trim()) e.optionA = 'Option A is required.'
    if (!form.optionB.trim()) e.optionB = 'Option B is required.'
    if (!form.optionC.trim()) e.optionC = 'Option C is required.'
    if (!form.optionD.trim()) e.optionD = 'Option D is required.'
    return e
  }

  // ── Modal submit ──────────────────────────────────────────────────────────
  const handleModalSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSubmitting(true)
    if (editingQuestion) {
      await dispatch(updateQuestion({ id: editingQuestion.id, data: form }))
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
    `w-full px-3 py-2.5 rounded-lg bg-slate-700/80 border text-white text-sm placeholder-slate-500
     focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
     ${formErrors[field] ? 'border-red-500/70' : 'border-slate-600/70'}`

  return (
    <AdminLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/exams')} className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1 mb-3 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Questions</h1>
              <p className="text-slate-400 text-sm mt-1">
                {examTitle ? <span>Exam: <span className="text-indigo-400">{examTitle}</span></span> : 'Loading...'}
                {' · '}<span className="text-slate-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
            <button
              id="add-question-btn"
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{error}</div>}

        {/* Question List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center">
            <p className="text-slate-400 mb-3">No questions yet.</p>
            <button onClick={openAddModal} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
              Add your first question →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group">
                {/* Question header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 text-sm font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-white font-medium leading-relaxed">{q.text}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <span className="text-xs text-slate-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                    <button onClick={() => openEditModal(q)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    {deletingId === q.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(q.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Confirm</button>
                        <button onClick={() => setDeletingId(null)} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(q.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Options grid */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div
                      key={opt}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                        ${q.correctOption === opt
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-slate-700/50 bg-slate-800/40'}`}
                    >
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${optionColors[opt]}`}>{opt}</span>
                      <span className={`text-sm ${q.correctOption === opt ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {q[`option${opt}`]}
                      </span>
                      {q.correctOption === opt && (
                        <span className="ml-auto">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        // Backdrop — clicking it closes the modal
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-white font-semibold">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleModalSubmit} noValidate className="px-6 py-5 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Question Text *</label>
                <textarea name="text" value={form.text}
                  onChange={(e) => { setForm(p => ({ ...p, text: e.target.value })); if (formErrors.text) setFormErrors(p => ({ ...p, text: '' })) }}
                  rows={3} placeholder="Type your question here..." className={`${inputCls('text')} resize-none`} />
                {formErrors.text && <p className="mt-1 text-xs text-red-400">{formErrors.text}</p>}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt}>
                    <label className={`block text-sm font-medium mb-1.5 ${optionColors[opt].split(' ')[0]}`}>
                      Option {opt} *
                    </label>
                    <input
                      name={`option${opt}`}
                      value={form[`option${opt}`]}
                      onChange={(e) => { setForm(p => ({ ...p, [`option${opt}`]: e.target.value })); if (formErrors[`option${opt}`]) setFormErrors(p => ({ ...p, [`option${opt}`]: '' })) }}
                      placeholder={`Option ${opt}`}
                      className={inputCls(`option${opt}`)}
                    />
                    {formErrors[`option${opt}`] && <p className="mt-0.5 text-xs text-red-400">{formErrors[`option${opt}`]}</p>}
                  </div>
                ))}
              </div>

              {/* Correct Option + Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Correct Answer *</label>
                  <select
                    name="correctOption"
                    value={form.correctOption}
                    onChange={(e) => setForm(p => ({ ...p, correctOption: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-700/80 border border-slate-600/70 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>Option {o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Marks</label>
                  <input type="number" min="1" name="marks" value={form.marks}
                    onChange={(e) => setForm(p => ({ ...p, marks: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-700/80 border border-slate-600/70 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} id="question-modal-submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                  {submitting ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                </button>
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg border border-slate-700 transition-colors">
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
