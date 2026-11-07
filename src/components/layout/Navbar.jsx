import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function Navbar() {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (!confirmed) return
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            to={profile?.role === 'organizer' ? '/organizer/dashboard' : profile?.role === 'student' ? '/student/dashboard' : '/'}
            className="text-xl font-bold text-indigo-600"
          >
            EventHub
          </Link>

          {profile && (
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              {profile.role === 'organizer' ? (
                <>
                  <Link
                    to="/organizer/dashboard"
                    className="hover:text-indigo-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/organizer/create-event"
                    className="hover:text-indigo-600"
                  >
                    Create Event
                  </Link>
                  <Link
                    to="/organizer/participants"
                    className="hover:text-indigo-600"
                  >
                    Participants
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/dashboard"
                    className="hover:text-indigo-600"
                  >
                    Events
                  </Link>
                  <Link
                    to="/student/profile"
                    className="hover:text-indigo-600"
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {profile && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              <strong className="text-slate-900">{profile.name || profile.email}</strong>
              <span className="ml-1.5 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">
                {profile.role}
              </span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              title="Logout"
            >
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
