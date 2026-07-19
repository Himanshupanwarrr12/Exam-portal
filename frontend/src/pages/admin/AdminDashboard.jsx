import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchStats } from '../../store/slices/adminSlice'
import { fetchAllExams } from '../../store/slices/examSlice'

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
        {icon}
      </div>
      <div>
        <p className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight">{value ?? '—'}</p>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1.5">{label}</p>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const dispatch = useDispatch()
  const { stats, loading: statsLoading } = useSelector((state) => state.admin)
  const { exams, loading: examsLoading } = useSelector((state) => state.exams)

  useEffect(() => {
    dispatch(fetchStats())
    dispatch(fetchAllExams())
  }, [dispatch])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-base mt-1.5">Institutional overview of exams, students, and submissions.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total Exams"
            value={statsLoading ? '...' : stats.totalExams}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            label="Active Students"
            value={statsLoading ? '...' : stats.totalStudents}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <StatCard
            label="Submissions"
            value={statsLoading ? '...' : stats.submittedAttempts}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
        </div>

        {/* Recent Exams Section */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-slate-800 font-bold text-sm uppercase tracking-wider">Recent Examinations</h2>
            <Link
              to="/admin/exams"
              className="text-blue-700 hover:underline text-sm font-semibold transition-all"
            >
              Manage all →
            </Link>
          </div>

          {examsLoading ? (
            <div className="px-6 py-12 text-center text-slate-400">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500 text-sm">No scheduled exams found.</p>
              <Link to="/admin/exams/new" className="mt-2 inline-block text-blue-700 hover:underline text-sm font-bold">
                Create new exam schedule →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-widest">
                    <th className="px-6 py-4.5 text-left">Exam Title</th>
                    <th className="px-6 py-4.5 text-left">Scheduled Date</th>
                    <th className="px-6 py-4.5 text-left">Duration</th>
                    <th className="px-6 py-4.5 text-left">Questions</th>
                    <th className="px-6 py-4.5 text-left">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.slice(0, 5).map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5">
                        <Link to={`/admin/exams/${exam.id}/questions`} className="text-blue-700 hover:underline font-bold">
                          {exam.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4.5 text-slate-700">{formatDate(exam.startTime)}</td>
                      <td className="px-6 py-4.5 text-slate-700">{exam.durationMinutes} minutes</td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-semibold bg-slate-100 border border-slate-200 text-slate-600">
                          {exam._count?.questions ?? 0} Qs
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-700 font-semibold">{exam._count?.attempts ?? 0}</td>
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
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-blue-500/20"
          >
            + Create Exam Schedule
          </Link>
          <Link
            to="/admin/students"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded border border-slate-200 transition-all focus:ring-2 focus:ring-slate-500/20"
          >
            View Student Roster
          </Link>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
