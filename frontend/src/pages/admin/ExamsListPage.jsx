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

  // Local state for delete confirmation — stores the exam id to delete
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    dispatch(fetchAllExams())
  }, [dispatch])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  // Determine if an exam is currently active/upcoming/ended
  const getStatus = (exam) => {
    const now = new Date()
    const start = new Date(exam.startTime)
    const end = new Date(exam.endTime)
    if (now < start) return { label: 'Upcoming', cls: 'bg-blue-500/15 text-blue-400' }
    if (now >= start && now <= end) return { label: 'Active', cls: 'bg-emerald-500/15 text-emerald-400' }
    return { label: 'Ended', cls: 'bg-slate-600/40 text-slate-500' }
  }

  const handleDelete = async (id) => {
    await dispatch(deleteExam(id))
    setDeletingId(null)
  }

  return (
    <AdminLayout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Exams</h1>
            <p className="text-slate-400 text-sm mt-1">Create and manage all examinations.</p>
          </div>
          <Link
            to="/admin/exams/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Exam
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{error}</div>
        )}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400 mb-3">No exams yet.</p>
              <Link to="/admin/exams/new" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                Create your first exam →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60">
                  <tr>
                    {['Title', 'Date & Time', 'Duration', 'Questions', 'Attempts', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {exams.map((exam) => {
                    const status = getStatus(exam)
                    return (
                      <tr key={exam.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium">{exam.title}</p>
                          {exam.description && (
                            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{exam.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                          <p>{formatDate(exam.startTime)}</p>
                          <p className="text-xs text-slate-500">{formatTime(exam.startTime)} – {formatTime(exam.endTime)}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{exam.durationMinutes} min</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/15 text-indigo-400">
                            {exam._count?.questions ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{exam._count?.attempts ?? 0}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}/edit`)}
                              title="Edit exam"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Questions */}
                            <button
                              onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                              title="Manage questions"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            {/* Results */}
                            <button
                              onClick={() => navigate(`/admin/results?examId=${exam.id}`)}
                              title="View results"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>
                            {/* Delete */}
                            {deletingId === exam.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(exam.id)}
                                  className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                                >Confirm</button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded transition-colors"
                                >Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingId(exam.id)}
                                title="Delete exam"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
