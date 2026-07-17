// src/pages/student/ExamAttemptPage.jsx
// Full-screen interface for taking an exam. 
// Features: one-question-at-a-time, auto-save, live countdown timer, auto-submit on timeout.

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { startExam, saveAnswer, submitExam, clearAttempt } from '../../store/slices/attemptSlice'

// ── Helper: Format Time ───────────────────────────────────────────────────────
const formatTimeLeft = (ms) => {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function ExamAttemptPage() {
  const { examId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    attemptId,
    examInfo,
    questions,
    answers,
    endTime,
    status,
    error,
    result
  } = useSelector((state) => state.attempt)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeftStr, setTimeLeftStr] = useState('--:--:--')
  
  // We use a ref to track if we've already triggered auto-submit so we don't spam the API
  const hasAutoSubmitted = useRef(false)

  // 1. Start Exam on Mount
  useEffect(() => {
    dispatch(startExam(parseInt(examId)))
    return () => {
      dispatch(clearAttempt())
    }
  }, [dispatch, examId])

  // 2. Timer Logic
  // We use useCallback to avoid dependency issues in the interval
  const calculateTime = useCallback(() => {
    if (!endTime || status !== 'in_progress') return

    const now = new Date().getTime()
    const target = new Date(endTime).getTime()
    const diff = target - now

    if (diff <= 0) {
      setTimeLeftStr('00:00:00')
      // AUTO SUBMIT
      if (!hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true
        dispatch(submitExam({ attemptId, autoSubmit: true }))
      }
    } else {
      setTimeLeftStr(formatTimeLeft(diff))
    }
  }, [endTime, status, attemptId, dispatch])

  useEffect(() => {
    // Run immediately once, then every 1 second
    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [calculateTime])


  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleOptionSelect = (questionId, option) => {
    // Optimistically update the UI, then dispatch the API call
    dispatch(saveAnswer({ attemptId, questionId, selectedOption: option }))
  }

  const handleManualSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam? You cannot change your answers after submitting.')) {
      hasAutoSubmitted.current = true
      dispatch(submitExam({ attemptId, autoSubmit: false }))
    }
  }


  // ── Render States ───────────────────────────────────────────────────────────

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading your exam...</div>
  }

  if (status === 'error' && !questions.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Cannot Start Exam</h1>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={() => navigate('/student/exams')} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg">Return to Dashboard</button>
      </div>
    )
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_-12px] shadow-emerald-500/50">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Exam Submitted Successfully!</h1>
        <p className="text-slate-400 mb-8">Your answers have been recorded.</p>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 w-full max-w-sm">
          <p className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Your Score</p>
          <p className="text-5xl font-bold text-white">
            {result?.score} <span className="text-2xl text-slate-500">/ {result?.totalMarks}</span>
          </p>
        </div>

        <button onClick={() => navigate('/student/dashboard')} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-500/20 transition-all">
          Back to Dashboard
        </button>
      </div>
    )
  }

  // ── Main Attempt UI (in_progress or submitting) ─────────────────────────────
  
  if (!questions || questions.length === 0) return null

  const currentQ = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{examInfo?.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Question {currentIndex + 1} of {questions.length}</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer Display */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-mono text-lg font-bold text-white tracking-wider">{timeLeftStr}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={status === 'submitting'}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Area: The Question */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            
            <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded bg-violet-500/15 text-violet-400 text-xs font-bold mb-4 uppercase tracking-wider">
                Question {currentIndex + 1}
              </span>
              <h2 className="text-2xl font-medium text-white leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const isSelected = answers[currentQ.id] === opt
                return (
                  <label
                    key={opt}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-violet-500 bg-violet-500/10' 
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800'}`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isSelected ? 'border-violet-400' : 'border-slate-500'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />}
                      </div>
                    </div>
                    {/* Hidden radio input for accessibility */}
                    <input
                      type="radio"
                      name={`q-${currentQ.id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(currentQ.id, opt)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <span className="text-white text-lg">{currentQ[`option${opt}`]}</span>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Next / Prev Navigation */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-800">
              <button
                onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                disabled={isFirst}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              
              {!isLast ? (
                <button
                  onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={handleManualSubmit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  Finish Exam
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
            </div>

          </div>
        </main>

        {/* Right Area: Question Map Sidebar */}
        <aside className="w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">Question Navigator</h3>
            <p className="text-xs text-slate-400 mt-1">{answeredCount} of {questions.length} answered</p>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-violet-500 h-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id]
                const isCurrent = idx === currentIndex
                
                let btnCls = 'h-10 rounded-lg text-sm font-bold border transition-all duration-200 flex items-center justify-center '
                
                if (isCurrent) {
                  btnCls += 'border-violet-400 bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/30'
                } else if (isAnswered) {
                  btnCls += 'border-slate-700 bg-slate-800 text-white hover:border-slate-500'
                } else {
                  btnCls += 'border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={btnCls}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}

export default ExamAttemptPage
