// src/pages/student/ExamAttemptPage.jsx
// Full-screen interface for taking an exam.

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { startExam, saveAnswer, submitExam, clearAttempt } from '../../store/slices/attemptSlice'

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
  
  const hasAutoSubmitted = useRef(false)

  useEffect(() => {
    dispatch(startExam(parseInt(examId)))
    return () => {
      dispatch(clearAttempt())
    }
  }, [dispatch, examId])

  const calculateTime = useCallback(() => {
    if (!endTime || status !== 'in_progress') return

    const now = new Date().getTime()
    const target = new Date(endTime).getTime()
    const diff = target - now

    if (diff <= 0) {
      setTimeLeftStr('00:00:00')
      if (!hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true
        dispatch(submitExam({ attemptId, autoSubmit: true }))
      }
    } else {
      setTimeLeftStr(formatTimeLeft(diff))
    }
  }, [endTime, status, attemptId, dispatch])

  useEffect(() => {
    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [calculateTime])

  const handleOptionSelect = (questionId, option) => {
    dispatch(saveAnswer({ attemptId, questionId, selectedOption: option }))
  }

  const handleManualSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam? You cannot change your answers after submitting.')) {
      hasAutoSubmitted.current = true
      dispatch(submitExam({ attemptId, autoSubmit: false }))
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans">Loading your exam session...</div>
  }

  if (status === 'error' && !questions.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-700 rounded flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Session Blocked</h1>
        <p className="text-slate-600 text-sm max-w-sm mb-6">{error}</p>
        <button onClick={() => navigate('/student/exams')} className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded">Return to Dashboard</button>
      </div>
    )
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-700 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Exam Attempt Completed</h1>
        <p className="text-slate-500 text-sm mb-8">Your session answers have been securely graded and locked.</p>
        
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 w-full max-w-sm shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Final Evaluation</p>
          <p className="text-4xl font-bold text-slate-900">
            {result?.score} <span className="text-lg text-slate-400 font-normal">/ {result?.totalMarks} Marks</span>
          </p>
        </div>

        <button onClick={() => navigate('/student/dashboard')} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-blue-500/20">
          Return to Dashboard
        </button>
      </div>
    )
  }

  if (!questions || questions.length === 0) return null

  const currentQ = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">{examInfo?.title}</h1>
          <p className="text-xs text-slate-500 mt-1">Question {currentIndex + 1} of {questions.length}</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer Display */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining:</span>
            <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">{timeLeftStr}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={status === 'submitting'}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-all focus:ring-2 focus:ring-red-500/20"
          >
            {status === 'submitting' ? 'Submitting...' : 'Finish Attempt'}
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Area: The Question */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            
            <div className="mb-8">
              <span className="inline-block px-2.5 py-0.5 border border-slate-200 bg-slate-100 rounded text-slate-600 text-xs font-bold mb-4 uppercase tracking-wider">
                Question {currentIndex + 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const isSelected = answers[currentQ.id] === opt
                return (
                  <label
                    key={opt}
                    className={`flex items-start gap-4 p-5 rounded border cursor-pointer transition-all duration-150
                      ${isSelected 
                        ? 'border-blue-600 bg-blue-50/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="pt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                        ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name={`q-${currentQ.id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(currentQ.id, opt)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <span className="text-slate-800 text-base font-semibold">{currentQ[`option${opt}`]}</span>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Next / Prev Navigation */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                disabled={isFirst}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 text-xs font-bold uppercase tracking-wider rounded transition-all"
              >
                ← Previous
              </button>
              
              {!isLast ? (
                <button
                  onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-none"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleManualSubmit}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-none"
                >
                  Finalize Submit
                </button>
              )}
            </div>

          </div>
        </main>

        {/* Right Area: Question Map Sidebar */}
        <aside className="w-70 border-l border-slate-200 bg-white flex flex-col hidden md:flex">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Navigator Map</h3>
            <p className="text-xs text-slate-400 mt-1">{answeredCount} of {questions.length} answered</p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-200">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id]
                const isCurrent = idx === currentIndex
                
                let btnCls = 'h-9 rounded text-xs font-bold border transition-all duration-150 flex items-center justify-center '
                
                if (isCurrent) {
                  btnCls += 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-500/10'
                } else if (isAnswered) {
                  btnCls += 'border-slate-200 bg-slate-100 text-slate-700'
                } else {
                  btnCls += 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700'
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
