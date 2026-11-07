import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../../components/events/EventCard'
import useAuth from '../../hooks/useAuth'
import { deleteEvent, getOrganizerEvents } from '../../services/eventService'

function OrganizerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadEvents() {
      try {
        const organizerEvents = await getOrganizerEvents(user.uid)
        if (!isCancelled) {
          setEvents(organizerEvents)
        }
      } catch (err) {
        console.error('Failed to load events:', err)
        if (!isCancelled) {
          if (err?.code === 'permission-denied') {
            setError(
              'Permission denied: You do not have permission to view these events. Please verify your Firestore rules.',
            )
          } else if (
            err?.code === 'unavailable' ||
            err?.message?.toLowerCase().includes('network')
          ) {
            setError(
              'Network error: Unable to reach Firestore. Please check your internet connection and try again.',
            )
          } else {
            setError(err?.message || 'Unable to load your events. Please try again.')
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    if (user) {
      loadEvents()
    }

    return () => {
      isCancelled = true
    }
  }, [user, reloadKey])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadKey((prevKey) => prevKey + 1)
  }

  function handleEdit(eventId) {
    navigate(`/organizer/events/${eventId}/edit`)
  }

  async function handleDelete(eventId) {
    const shouldDelete = window.confirm('Delete this event? This action cannot be undone.')

    if (!shouldDelete) {
      return
    }

    setError('')
    setMessage('')
    setDeletingId(eventId)

    try {
      await deleteEvent(eventId)
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId))
      setMessage('Event deleted successfully.')
    } catch (err) {
      console.error('Failed to delete event:', err)
      setError(err?.message || 'Unable to delete the event. Please try again.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="mx-auto max-w-6xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizer Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage the events you have created.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="rounded-md bg-indigo-600 px-4 py-2 text-center font-medium text-white"
        >
          Create Event
        </Link>
      </div>

      {message && <p className="mt-6 rounded-md bg-green-50 p-3 text-green-700">{message}</p>}

      {loading && (
        <p className="mt-6 text-slate-600">Loading your events...</p>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-md bg-red-50 p-4 text-red-700">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="mt-6 text-slate-600">You have not created any events yet.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === event.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default OrganizerDashboard
