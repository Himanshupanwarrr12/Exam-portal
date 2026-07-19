import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'

// ── Icons (Heroicons Outlines) ───────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  exams: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  students: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  results: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
}

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { to: '/admin/exams',     label: 'Exams',     icon: icons.exams },
  { to: '/admin/students',  label: 'Students',  icon: icons.students },
  { to: '/admin/results',   label: 'Results',   icon: icons.results },
]

function AdminLayout({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-[#f0f7ff] overflow-hidden text-slate-900 font-sans">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">

        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-blue-900 font-extrabold text-lg tracking-tight">Exam Portal</p>
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Institution</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <span className="flex-shrink-0">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-slate-200 space-y-3">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Signed in as</p>
            <p className="text-sm text-slate-800 font-semibold truncate mt-0.5">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium
              text-red-700 hover:bg-red-50 hover:text-red-800 border border-transparent hover:border-red-200 transition-all duration-150"
          >
            {icons.logout}
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#f0f7ff]">
        {children}
      </main>

    </div>
  )
}

export default AdminLayout
