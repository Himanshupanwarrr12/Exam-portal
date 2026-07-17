// src/pages/admin/ResultsPage.jsx
// Displays results for a specific exam.
// Expects an examId query parameter (e.g., /admin/results?examId=1).

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchAdminResults } from '../../store/slices/adminSlice'
import { fetchAllExams } from '../../store/slices/examSlice'

function ResultsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const examId = searchParams.get('examId')

  const { examResults, loading: adminLoading, error: adminError } = useSelector((state) => state.admin)
  const { exams, loading: examsLoading } = useSelector((state) => state.exams)

  // Fetch results if examId is provided
  useEffect(() => {
    if (examId) {
      dispatch(fetchAdminResults(parseInt(examId)))
    } else {
      // If no examId, fetch all exams so the user can pick one from a list
      dispatch(fetchAllExams())
    }
  }, [dispatch, examId])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  // ── No Exam ID Provided (Selection View) ──────────────────────────────────
  if (!examId) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Exam Results</h1>
            <p className="text-slate-400 text-sm mt-1">Select an exam to view student results.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {examsLoading ? (
              <div className="py-16 text-center text-slate-500">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No exams available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Attempts</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{exam.title}</td>
                        <td className="px-6 py-4 text-slate-400">{exam._count?.attempts ?? 0}</td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/results?examId=${exam.id}`}
                            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                          >
                            View Results →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    )
  }

  // ── Exam Results View ─────────────────────────────────────────────────────
  const { exam, attempts } = examResults

  return (
    <AdminLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/results')} className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Exams
          </button>
          
          {adminLoading ? (
             <div><h1 className="text-2xl font-bold text-white">Loading...</h1></div>
          ) : exam ? (
            <div>
              <h1 className="text-2xl font-bold text-white">Results: {exam.title}</h1>
              <p className="text-slate-400 text-sm mt-1">{attempts.length} submission{attempts.length !== 1 ? 's' : ''}</p>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-white">Exam Not Found</h1>
          )}
        </div>

        {adminError && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {adminError}
          </div>
        )}

        {/* Table */}
        {!adminLoading && exam && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {attempts.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No attempts submitted for this exam yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/60">
                    <tr>
                      {['Student', 'Email', 'Submitted At', 'Score', 'Percentage'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {attempts.map((attempt) => {
                      // Calculate percentage. (Assumes score and totalMarks exist, handled by Phase 5 Attempt engine)
                      // If totalMarks is missing/0 in this phase, default to N/A.
                      const total = attempt.totalMarks || 1 // avoid div by 0 for now
                      const pct = attempt.totalMarks ? Math.round((attempt.score / total) * 100) : null
                      
                      let pctColor = 'text-slate-400'
                      if (pct !== null) {
                        if (pct >= 80) pctColor = 'text-emerald-400 font-medium'
                        else if (pct >= 50) pctColor = 'text-indigo-400'
                        else pctColor = 'text-red-400'
                      }

                      return (
                        <tr key={attempt.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{attempt.student?.name}</td>
                          <td className="px-6 py-4 text-slate-400">{attempt.student?.email}</td>
                          <td className="px-6 py-4 text-slate-400">{formatDate(attempt.submittedAt)}</td>
                          <td className="px-6 py-4 text-white font-medium">
                            {attempt.score} <span className="text-slate-500 font-normal">/ {attempt.totalMarks || '-'}</span>
                          </td>
                          <td className={`px-6 py-4 ${pctColor}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ResultsPage
