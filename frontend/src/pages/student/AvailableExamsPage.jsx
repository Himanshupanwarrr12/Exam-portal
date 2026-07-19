// src/pages/student/AvailableExamsPage.jsx
// Displays a list of active and upcoming exams for the student.

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import StudentLayout from '../../components/student/StudentLayout'
import { fetchAvailableExams } from '../../store/slices/examSlice'

function ExamCard({ exam, isActive }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col shadow-sm">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 leading-tight">{exam.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${
            isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {isActive ? 'Active' : 'Upcoming'}
          </span>
        </div>
        
        {exam.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{exam.description}</p>
        )}
        
        <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Date: {formatDate(exam.startTime)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Window: {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Specs: {exam._count?.questions ?? 0} Questions • {exam.durationMinutes} mins
          </div>
        </div>
      </div>

      {isActive ? (
        <Link
          to={`/student/exam/${exam.id}`}
          className="w-full block text-center py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-blue-500/20"
        >
          Start Examination
        </Link>
      ) : (
        <button
          disabled
          className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider rounded border border-slate-200 cursor-not-allowed text-center"
        >
          Scheduled / Locked
        </button>
      )}
    </div>
  )
}

function AvailableExamsPage() {
  const dispatch = useDispatch()
  const { exams, loading, error } = useSelector((state) => state.exams)

  useEffect(() => {
    dispatch(fetchAvailableExams())
  }, [dispatch])

  const activeExams = exams?.active || []
  const upcomingExams = exams?.upcoming || []

  return (
    <StudentLayout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900">Available Exams</h1>
          <p className="text-slate-500 text-sm mt-1">Review active schedules to begin your test session.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium">Querying available schedules...</div>
        ) : (
          <div className="space-y-12">
            
            {/* Active Exams Section */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                Active Now
              </h2>
              {activeExams.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg py-12 text-center shadow-sm">
                  <p className="text-slate-500 text-sm">No exam sessions are currently active.</p>
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
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Upcoming Schedules
              </h2>
              {upcomingExams.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg py-12 text-center shadow-sm">
                  <p className="text-slate-500 text-sm">No upcoming exams scheduled.</p>
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
