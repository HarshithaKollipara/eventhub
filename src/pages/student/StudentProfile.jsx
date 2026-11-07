import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getStudentProfile, updateStudentPhone } from '../../services/studentService'

function StudentProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const studentProfile = await getStudentProfile(user.uid)
        setProfile(studentProfile)
        setPhone(studentProfile.phone || '')
      } catch (profileError) {
        setError(profileError.message || 'Unable to load your profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  async function handlePhoneUpdate(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!phone) {
      setError('Phone number is required.')
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must contain exactly 10 digits.')
      return
    }

    setIsSaving(true)

    try {
      await updateStudentPhone(user.uid, phone)
      setProfile((currentProfile) => ({ ...currentProfile, phone }))
      setMessage('Phone number updated successfully.')
    } catch (updateError) {
      setError(updateError.message || 'Unable to update your phone number. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLogout() {
    setMessage('')
    setError('')
    setIsLoggingOut(true)

    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      setError('Unable to log out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  const profileDetails = [
    ['Name', profile?.name],
    ['Roll Number', profile?.rollNumber],
    ['Branch', profile?.branch],
    ['Year', profile?.year],
    ['Section', profile?.section],
    ['Email', profile?.email],
  ]

  if (loading) {
    return <p className="p-6 text-slate-600">Loading profile...</p>
  }

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Profile</h1>
          <p className="mt-2 text-slate-600">View and update your contact information.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-md bg-slate-800 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {message && <p className="mt-6 rounded-md bg-green-50 p-3 text-green-700">{message}</p>}
      {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-700">{error}</p>}

      {profile && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <dl className="grid gap-5 sm:grid-cols-2">
            {profileDetails.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 text-slate-900">{value || 'Not provided'}</dd>
              </div>
            ))}
          </dl>

          <form onSubmit={handlePhoneUpdate} className="mt-6 border-t border-slate-200 pt-6">
            <label className="block text-sm font-medium text-slate-700">
              Phone Number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                maxLength="10"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Update Phone Number'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

export default StudentProfile
