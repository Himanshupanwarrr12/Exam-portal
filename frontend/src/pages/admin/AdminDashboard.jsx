// src/pages/admin/AdminDashboard.jsx
// Landing page for admins — shows stat cards and a list of recent exams.

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchStats } from '../../store/slices/adminSlice'
import { fetchAllExams } from '../../store/slices/examSlice'

// ── Stat Card Component ───────────────────────────────────────────────────────
// A simple reusable card for displaying a number stat with a label and color accent.
function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const dispatch = useDispatch()
  const { stats, loading: statsLoading } = useSelector((state) => state.admin)
  const { exams, loading: examsLoading } = useSelector((state) => state.exams)

  // Fetch stats and exams on mount
  useEffect(() => {
    dispatch(fetchStats())
    dispatch(fetchAllExams())
  }, [dispatch])

  // Format a date string for display in the table
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })

  return (
    <AdminLayout>
      <div className="p-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back! Here&apos;s an overview of your portal.</p>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Exams"
            value={statsLoading ? '...' : stats.totalExams}
            color="bg-indigo-500/15"
            icon={<svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            label="Registered Students"
            value={statsLoading ? '...' : stats.totalStudents}
            color="bg-violet-500/15"
            icon={<svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <StatCard
            label="Exams Submitted"
            value={statsLoading ? '...' : stats.submittedAttempts}
            color="bg-emerald-500/15"
            icon={<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
          />
        </div>

        {/* ── Recent Exams Table ───────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Recent Exams</h2>
            <Link
              to="/admin/exams"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          {examsLoading ? (
            <div className="px-6 py-12 text-center text-slate-500">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400">No exams created yet.</p>
              <Link to="/admin/exams/new" className="mt-3 inline-block text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                Create your first exam →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr>
                    {['Title', 'Start Date', 'Duration', 'Questions', 'Attempts'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {exams.slice(0, 5).map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/admin/exams/${exam.id}/questions`} className="text-white hover:text-indigo-400 font-medium transition-colors">
                          {exam.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(exam.startTime)}</td>
                      <td className="px-6 py-4 text-slate-400">{exam.durationMinutes} min</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/15 text-indigo-400">
                          {exam._count?.questions ?? 0} Qs
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{exam._count?.attempts ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-3">
          <Link
            to="/admin/exams/new"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            + Create Exam
          </Link>
          <Link
            to="/admin/students"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-slate-700"
          >
            View Students
          </Link>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
