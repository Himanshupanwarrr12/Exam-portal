import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadUserFromStorage } from './store/slices/authSlice'

// Guards
import AdminRoute from './routes/AdminRoute'
import StudentRoute from './routes/StudentRoute'

// ── Phase 2: Auth Pages ───────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// ── Phase 3: Admin Pages ──────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard'
import ExamsListPage from './pages/admin/ExamsListPage'
import ExamFormPage from './pages/admin/ExamFormPage'
import QuestionsPage from './pages/admin/QuestionsPage'
import StudentsPage from './pages/admin/StudentsPage'
import ResultsPage from './pages/admin/ResultsPage'

// ── Phase 4: Student Pages ────────────────────────────────────────────────────
import StudentDashboard from './pages/student/StudentDashboard'
import AvailableExamsPage from './pages/student/AvailableExamsPage'

// ── Phase 5: Student Exam Engine ──────────────────────────────────────────────
import ExamAttemptPage from './pages/student/ExamAttemptPage'

// Phase 6: Will be replaced in next phases
const NotFound = () => <div className="p-8 text-2xl font-bold text-white bg-slate-900 min-h-screen">404 — Page Not Found</div>

// App.jsx — sets up React Router with all application routes.
function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Admin Protected Routes ───────────────────────────────────────── */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/exams" element={<AdminRoute><ExamsListPage /></AdminRoute>} />
        <Route path="/admin/exams/new" element={<AdminRoute><ExamFormPage /></AdminRoute>} />
        <Route path="/admin/exams/:examId/edit" element={<AdminRoute><ExamFormPage /></AdminRoute>} />
        <Route path="/admin/exams/:examId/questions" element={<AdminRoute><QuestionsPage /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><StudentsPage /></AdminRoute>} />
        <Route path="/admin/results" element={<AdminRoute><ResultsPage /></AdminRoute>} />

        {/* ── Student Protected Routes ─────────────────────────────────────── */}
        <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/exams" element={<StudentRoute><AvailableExamsPage /></StudentRoute>} />
        <Route path="/student/exam/:examId" element={<StudentRoute><ExamAttemptPage /></StudentRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
