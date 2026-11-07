import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function LoginPage() {
  const [roleMode, setRoleMode] = useState('student')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    branch: '',
    year: '',
    section: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile, loading, login, createStudentAccount } = useAuth()
  const navigate = useNavigate()

  if (!loading && user && profile) {
    const dashboardPath =
      profile.role === 'student' ? '/student/dashboard' : '/organizer/dashboard'

    return <Navigate to={dashboardPath} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const userProfile = await login(email, password)
      const dashboardPath =
        userProfile.role === 'student'
          ? '/student/dashboard'
          : '/organizer/dashboard'

      navigate(dashboardPath, { replace: true })
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleModeChange(mode) {
    setRoleMode(mode)
    setIsSigningUp(false)
    setError('')
  }

  function handleSignupChange(event) {
    const { name, value } = event.target
    setSignupData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSignup(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await createStudentAccount(signupData)
      navigate('/student/dashboard', { replace: true })
    } catch (signupError) {
      setError(signupError.message || 'Unable to create your student account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const signupFields = [
    ['name', 'Name', 'text'],
    ['email', 'Email', 'email'],
    ['password', 'Password', 'password'],
    ['rollNumber', 'Roll Number', 'text'],
    ['branch', 'Branch', 'text'],
    ['year', 'Year', 'text'],
    ['section', 'Section', 'text'],
    ['phone', 'Phone', 'tel'],
  ]

  return (
    <section className="mx-auto max-w-md p-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          {['student', 'organizer'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={`rounded-md px-3 py-2 font-medium capitalize ${
                roleMode === mode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {roleMode === 'student' && isSigningUp ? 'Create Student Account' : `${roleMode === 'student' ? 'Student' : 'Organizer'} Login`}
        </h1>

        {isSigningUp ? (
          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            {signupFields.map(([name, label, type]) => (
              <label key={name} className="block text-sm font-medium text-slate-700">
                {label}
                <input
                  name={name}
                  type={type}
                  value={signupData[name]}
                  onChange={handleSignupChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
            ))}
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create Student Account'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSigningUp(false)
                setError('')
              }}
              className="w-full text-sm font-medium text-indigo-700"
            >
              Back to Student Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {roleMode === 'student' && !isSigningUp && (
          <button
            type="button"
            onClick={() => {
              setIsSigningUp(true)
              setError('')
            }}
            className="mt-4 w-full text-sm font-medium text-indigo-700"
          >
            Create Student Account
          </button>
        )}
      </div>
    </section>
  )
}

export default LoginPage
