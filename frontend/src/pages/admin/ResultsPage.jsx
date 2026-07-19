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

  useEffect(() => {
    if (examId) {
      dispatch(fetchAdminResults(parseInt(examId)))
    } else {
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
        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-8 border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-bold text-slate-900">Exam Results</h1>
            <p className="text-slate-500 text-sm mt-1">Select an examination schedule to view grading reports.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {examsLoading ? (
              <div className="py-16 text-center text-slate-400">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="py-16 text-center text-slate-500">No scheduled exams found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Exam Title</th>
                      <th className="px-6 py-3 text-left">Completed Submissions</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 font-bold">{exam.title}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{exam._count?.attempts ?? 0} submissions</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/admin/results?examId=${exam.id}`}
                            className="text-blue-700 hover:underline font-bold text-xs uppercase tracking-wider transition-all"
                          >
                            View Analytics →
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

  // Calculate statistics from the results list
  let totalAttempts = 0
  let avgScore = 0
  let highestScore = 0
  let lowestScore = 0
  let passCount = 0
  let failCount = 0

  if (!adminLoading && attempts && attempts.length > 0) {
    totalAttempts = attempts.length
    const scores = attempts.map(a => a.score || 0)
    
    // Average
    const sum = scores.reduce((a, b) => a + b, 0)
    avgScore = Math.round((sum / totalAttempts) * 10) / 10

    highestScore = Math.max(...scores)
    lowestScore = Math.min(...scores)

    // Pass count is based on a standard 50% passing threshold per exam attempt
    attempts.forEach(a => {
      const max = a.totalMarks || 1
      const pct = (a.score / max) * 100
      if (pct >= 50) {
        passCount++
      } else {
        failCount++
      }
    })
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Back navigation */}
        <div className="mb-6">
          <button onClick={() => navigate('/admin/results')} className="text-slate-500 hover:text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Results List
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          {adminLoading ? (
            <div><h1 className="text-2xl font-bold text-slate-900">Loading Report...</h1></div>
          ) : exam ? (
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics: {exam.title}</h1>
              <p className="text-slate-500 text-sm mt-1">Full evaluation audit details and grading sheets.</p>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-slate-900">Exam Record Not Found</h1>
          )}
        </div>

        {adminError && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {adminError}
          </div>
        )}

        {!adminLoading && exam && (
          <>
            {/* ── Basic Stats Display ────────────────────────────────────────── */}
            {attempts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                
                <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Score</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{avgScore}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">High / Low Score</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {highestScore} <span className="text-sm font-medium text-slate-400">/ {lowestScore}</span>
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pass Rate</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {Math.round((passCount / totalAttempts) * 100)}%
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pass / Fail Count</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {passCount} <span className="text-sm font-medium text-slate-400">/ {failCount}</span>
                  </p>
                </div>

              </div>
            )}

            {/* Results Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {attempts.length === 0 ? (
                <div className="py-16 text-center text-slate-500">No attempts registered for this exam yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 text-left">Student Name</th>
                        <th className="px-6 py-3 text-left">Email Address</th>
                        <th className="px-6 py-3 text-left">Submission Date</th>
                        <th className="px-6 py-3 text-left">Marks Earned</th>
                        <th className="px-6 py-3 text-left">Percentage</th>
                        <th className="px-6 py-3 text-right">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attempts.map((attempt) => {
                        const total = attempt.totalMarks || 1
                        const pct = attempt.totalMarks ? Math.round((attempt.score / total) * 100) : null
                        const isPass = pct !== null && pct >= 50

                        return (
                          <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-900 font-bold">{attempt.student?.name}</td>
                            <td className="px-6 py-4 text-slate-600">{attempt.student?.email}</td>
                            <td className="px-6 py-4 text-slate-500">{formatDate(attempt.submittedAt)}</td>
                            <td className="px-6 py-4 text-slate-900 font-semibold">
                              {attempt.score} <span className="text-slate-400 font-normal">/ {attempt.totalMarks || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-900 font-medium">
                              {pct !== null ? `${pct}%` : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {/* WCAG compliant status: textual status + icon so color is not the sole conveyor */}
                              {isPass ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-green-50 border border-green-200 text-green-700">
                                  <span>✓</span>
                                  <span>Pass</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-red-50 border border-red-200 text-red-700">
                                  <span>✗</span>
                                  <span>Fail</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default ResultsPage
