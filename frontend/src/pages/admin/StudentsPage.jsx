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
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Registered Students</h1>
          <p className="text-slate-400 text-sm mt-1">View all students and their exam participation.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No students registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60">
                  <tr>
                    {['Name', 'Email', 'Joined', 'Exams Attempted'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/20">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{student.email}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(student.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/15 text-indigo-400">
                          {student._count?.attempts ?? 0}
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
