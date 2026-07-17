import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import StudentLayout from '../../components/student/StudentLayout'
import { fetchAvailableExams } from '../../store/slices/examSlice'

function ExamCard({ exam, isActive }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white leading-tight">{exam.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
          }`}>
            {isActive ? 'Active Now' : 'Upcoming'}
          </span>
        </div>
        
        {exam.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{exam.description}</p>
        )}
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatDate(exam.startTime)}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {exam._count?.questions ?? 0} Questions • {exam.durationMinutes} mins
          </div>
        </div>
      </div>

      {isActive ? (
        <Link
          to={`/student/exam/${exam.id}`}
          className="w-full block text-center py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-violet-500/20"
        >
          Start Exam
        </Link>
      ) : (
        <button
          disabled
          className="w-full py-2.5 bg-slate-800 text-slate-500 text-sm font-semibold rounded-lg cursor-not-allowed border border-slate-700"
        >
          Not Yet Available
        </button>
      )}
    </div>
  )
}

function AvailableExamsPage() {
  const dispatch = useDispatch()
  const { exams, loading, error } = useSelector((state) => state.exams) // exams is an object { active: [], upcoming: [] }

  useEffect(() => {
    dispatch(fetchAvailableExams())
  }, [dispatch])

  const activeExams = exams?.active || []
  const upcomingExams = exams?.upcoming || []

  return (
    <StudentLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Available Exams</h1>
          <p className="text-slate-400 text-sm mt-1">Browse active and upcoming exams.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading exams...</div>
        ) : (
          <div className="space-y-12">
            
            {/* Active Exams Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Now
              </h2>
              {activeExams.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl py-12 text-center">
                  <p className="text-slate-400">No exams are currently active.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} isActive={true} />
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Exams Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Upcoming Exams</h2>
              {upcomingExams.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl py-12 text-center">
                  <p className="text-slate-400">No upcoming exams scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {upcomingExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} isActive={false} />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default AvailableExamsPage
