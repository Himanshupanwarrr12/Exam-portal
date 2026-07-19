// src/pages/admin/ExamsListPage.jsx
// Shows all exams in a table. Admin can create, edit, manage questions, or delete.

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchAllExams, deleteExam } from '../../store/slices/examSlice'

function ExamsListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { exams, loading, error } = useSelector((state) => state.exams)

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    dispatch(fetchAllExams())
  }, [dispatch])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const getStatus = (exam) => {
    const now = new Date()
    const start = new Date(exam.startTime)
    const end = new Date(exam.endTime)
    if (now < start) return { label: 'Upcoming', cls: 'bg-slate-100 border-slate-200 text-slate-700' }
    if (now >= start && now <= end) return { label: 'Active', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' }
    return { label: 'Ended', cls: 'bg-red-50 border-red-200 text-red-700' }
  }

  const handleDelete = async (id) => {
    await dispatch(deleteExam(id))
    setDeletingId(null)
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exams</h1>
            <p className="text-slate-500 text-sm mt-1">Manage scheduled examinations and questions.</p>
          </div>
          <Link
            to="/admin/exams/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-blue-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Exam
          </Link>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Exams Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No exams found. Click &quot;Create Exam&quot; to schedule one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Exam Details</th>
                    <th className="px-6 py-3 text-left">Scheduled Period</th>
                    <th className="px-6 py-3 text-left">Duration</th>
                    <th className="px-6 py-3 text-left">Questions</th>
                    <th className="px-6 py-3 text-left">Attempts</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((exam) => {
                    const status = getStatus(exam)
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-slate-900 font-bold">{exam.title}</p>
                          {exam.description && (
                            <p className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{exam.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                          <p className="font-medium">{formatDate(exam.startTime)}</p>
                          <p className="text-xs text-slate-500">{formatTime(exam.startTime)} – {formatTime(exam.endTime)}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{exam.durationMinutes} mins</td>
                        <td className="px-6 py-4">
                          {(exam._count?.questions ?? 0) === 0 ? (
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                              title="No questions — click to add some"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              </svg>
                              No questions
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600">
                              {exam._count.questions} question{exam._count.questions !== 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{exam._count?.attempts ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs border ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Manage Questions */}
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                              title="Manage Questions"
                              className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition-all font-semibold"
                            >
                              Questions
                            </button>
                            {/* View Results */}
                            <button
                              onClick={() => navigate(`/admin/results?examId=${exam.id}`)}
                              title="View Results"
                              className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition-all font-semibold"
                            >
                              Results
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}/edit`)}
                              title="Edit exam"
                              className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            {/* Delete */}
                            {deletingId === exam.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(exam.id)}
                                  className="text-xs px-2 py-1 bg-red-700 text-white rounded font-bold transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="text-xs px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingId(exam.id)}
                                title="Delete exam"
                                className="p-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}

export default ExamsListPage
