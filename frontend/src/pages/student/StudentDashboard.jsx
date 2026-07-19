// src/pages/student/StudentDashboard.jsx
// Student landing page: shows their recent results and quick stats.

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import StudentLayout from '../../components/student/StudentLayout'
import { fetchMyResults } from '../../store/slices/resultSlice'

function StudentDashboard() {
  const dispatch = useDispatch()
  const { auth: { user } } = useSelector((state) => state)
  const { myResults: results, loading, error } = useSelector((state) => state.results)

  useEffect(() => {
    dispatch(fetchMyResults())
  }, [dispatch])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })

  const totalExams = results.length
  let avgScore = 0
  if (totalExams > 0) {
    const totalPcts = results.reduce((acc, curr) => {
      const total = curr.totalMarks || 1
      return acc + (curr.score / total)
    }, 0)
    avgScore = Math.round((totalPcts / totalExams) * 100)
  }

  return (
    <StudentLayout>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Review your overall assessment statistics and past evaluations.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '...' : totalExams}</p>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Exams Attempted</p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '...' : `${avgScore}%`}</p>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Average Grade Percentage</p>
            </div>
          </div>

        </div>

        {/* Recent Results Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-slate-800 font-bold text-sm uppercase tracking-wider">Your Attempt Records</h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400 font-medium">Loading records...</div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500 text-sm">No exam submissions found in your account history.</p>
              <Link to="/student/exams" className="mt-3 inline-block text-blue-700 hover:underline text-sm font-bold">
                Browse scheduled exams →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Exam Title</th>
                    <th className="px-6 py-3 text-left">Submission Date</th>
                    <th className="px-6 py-3 text-left">Score Card</th>
                    <th className="px-6 py-3 text-right">Result Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.slice(0, 5).map((res) => {
                    const total = res.totalMarks || 1
                    const pct = res.totalMarks ? Math.round((res.score / total) * 100) : null
                    const isPass = pct !== null && pct >= 50

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 font-bold">{res.exam?.title}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(res.submittedAt)}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {res.score} <span className="text-slate-400">/ {res.totalMarks || '-'}</span>
                          {pct !== null && <span className="ml-2.5 text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">({pct}%)</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPass ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-green-50 border border-green-200 text-green-700">
                              <span>✓</span>
                              <span>Pass</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-red-50 border border-red-200 text-red-700">
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

      </div>
    </StudentLayout>
  )
}

export default StudentDashboard
