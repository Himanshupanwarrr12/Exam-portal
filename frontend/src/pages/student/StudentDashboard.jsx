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
  const { results, loading, error } = useSelector((state) => state.results)

  useEffect(() => {
    dispatch(fetchMyResults())
  }, [dispatch])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })

  // Quick stats derived from results
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
      <div className="p-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here is an overview of your academic progress.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{loading ? '...' : totalExams}</p>
              <p className="text-slate-400 text-sm mt-0.5">Exams Attempted</p>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{loading ? '...' : `${avgScore}%`}</p>
              <p className="text-slate-400 text-sm mt-0.5">Average Score</p>
            </div>
          </div>
        </div>

        {/* Recent Results Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Your Recent Results</h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500">Loading results...</div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400">You haven't attempted any exams yet.</p>
              <Link to="/student/exams" className="mt-3 inline-block text-violet-400 hover:text-violet-300 text-sm font-medium">
                Browse available exams →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Exam Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.slice(0, 5).map((res) => {
                    const total = res.totalMarks || 1
                    const pct = res.totalMarks ? Math.round((res.score / total) * 100) : null
                    return (
                      <tr key={res.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{res.exam?.title}</td>
                        <td className="px-6 py-4 text-slate-400">{formatDate(res.submittedAt)}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {res.score} <span className="text-slate-500">/ {res.totalMarks || '-'}</span>
                          {pct !== null && <span className="ml-2 text-xs font-medium bg-slate-800 px-2 py-1 rounded">({pct}%)</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400">
                            Completed
                          </span>
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
