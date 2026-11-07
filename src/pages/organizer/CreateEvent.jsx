import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EventForm from '../../components/events/EventForm'
import useAuth from '../../hooks/useAuth'
import { createEvent, getEventById, updateEvent } from '../../services/eventService'

function CreateEvent() {
  const { eventId } = useParams()
  const { user, profile } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(Boolean(eventId))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const isEditing = Boolean(eventId)

  useEffect(() => {
    async function loadEvent() {
      if (!eventId || !user) {
        return
      }

      try {
        const selectedEvent = await getEventById(eventId, user.uid)

        if (!selectedEvent) {
          setError('This event could not be found.')
          return
        }

        setEvent(selectedEvent)
      } catch (err) {
        console.error('Failed to load event:', err)
        setError(err.message || 'Unable to load this event. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId, user])

  async function handleSubmit(eventData) {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (isEditing) {
        await updateEvent(eventId, eventData)
        setEvent((currentEvent) => ({ ...currentEvent, ...eventData }))
        setMessage('Event updated successfully.')
      } else {
        const organizerName =
          profile?.name || profile?.organizerName || profile?.email || 'Organizer'

        await createEvent({
          ...eventData,
          organizerId: user.uid,
          organizerName,
        })
        setMessage('Event created successfully.')
      }

      return true
    } catch (err) {
      console.error('Failed to save event:', err)
      if (err?.code === 'permission-denied') {
        setError('Permission denied: You do not have permission to save events. Please verify your organizer account and Firestore rules.')
      } else {
        setError(err.message || 'Unable to save the event. Please try again.')
      }
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <p className="p-6 text-slate-600">Loading event...</p>
  }

  return (
    <section className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-slate-900">
        {isEditing ? 'Edit Event' : 'Create Event'}
      </h1>
      <p className="mt-2 text-slate-600">Enter the details for your college event.</p>
      {message && <p className="mt-4 rounded-md bg-green-50 p-3 text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      {!error && (
        <div className="mt-6">
          <EventForm
            initialValues={event}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Update Event' : 'Create Event'}
            isSubmitting={isSubmitting}
            resetOnSuccess={!isEditing}
          />
        </div>
      )}
    </section>
  )
}

export default CreateEvent
