// src/pages/admin/StudentsPage.jsx
// Displays a list of all registered students and how many attempts they've made.

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchStudents } from '../../store/slices/adminSlice'

function StudentsPage() {
  const dispatch = useDispatch()
  const { students, loading, error } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchStudents())
  }, [dispatch])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm mt-1">Review student enrollment and overall participation metrics.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-55 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading student directory...</div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No registered students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Student Profile</th>
                    <th className="px-6 py-3 text-left">Email Address</th>
                    <th className="px-6 py-3 text-left">Date Enrolled</th>
                    <th className="px-6 py-3 text-left">Attempts Made</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-slate-900 font-bold">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{student.email}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(student.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600">
                          {student._count?.attempts ?? 0} exam attempts
                        </span>
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

export default StudentsPage
