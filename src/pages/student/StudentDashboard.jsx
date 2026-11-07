import { useEffect, useState } from 'react'
import EventCard from '../../components/events/EventCard'
import useAuth from '../../hooks/useAuth'
import {
  getRegisteredEvents,
  isAlreadyRegistered,
  registerForEvent,
} from '../../services/registrationService'
import { getAllUpcomingEvents } from '../../services/studentEventService'

function StudentDashboard() {
  const { user, profile } = useAuth()
  const [events, setEvents] = useState([])
  const [registeredEventIds, setRegisteredEventIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [registeringEventId, setRegisteringEventId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUpcomingEvents() {
      try {
        const [upcomingEvents, registrations] = await Promise.all([
          getAllUpcomingEvents(),
          getRegisteredEvents(user.uid),
        ])
        setEvents(upcomingEvents)
        setRegisteredEventIds(registrations.map((registration) => registration.eventId))
      } catch {
        setError('Unable to load upcoming events. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadUpcomingEvents()
    }
  }, [user])

  async function handleRegister(event) {
    setMessage('')
    setError('')
    setRegisteringEventId(event.id)

    try {
      const alreadyRegistered = await isAlreadyRegistered(user.uid, event.id)

      if (alreadyRegistered) {
        setRegisteredEventIds((currentIds) => [...new Set([...currentIds, event.id])])
        setMessage('You are already registered for this event.')
        return
      }

      await registerForEvent(user.uid, event.id, profile, event.title)
      setRegisteredEventIds((currentIds) => [...currentIds, event.id])
      setMessage('You have registered for this event successfully.')
    } catch (registrationError) {
      setError(registrationError.message || 'Unable to register for this event. Please try again.')
    } finally {
      setRegisteringEventId('')
    }
  }

  return (
    <section className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold text-slate-900">Upcoming Events</h1>
      <p className="mt-2 text-slate-600">Explore upcoming college events.</p>
      {message && <p className="mt-6 rounded-md bg-green-50 p-3 text-green-700">{message}</p>}

      {loading ? (
        <p className="mt-6 text-slate-600">Loading events...</p>
      ) : error ? (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-red-700">{error}</p>
      ) : events.length === 0 ? (
        <p className="mt-6 text-slate-600">No upcoming events.</p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              variant="student"
              onRegister={handleRegister}
              isRegistered={registeredEventIds.includes(event.id)}
              isRegistering={registeringEventId === event.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default StudentDashboard
