import { useEffect, useMemo, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import {
  getParticipantCount,
  getParticipantsByEvent,
} from '../../services/participantService'
import { getOrganizerEvents } from '../../services/eventService'

function Participants() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [participants, setParticipants] = useState([])
  const [participantCount, setParticipantCount] = useState(0)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [error, setError] = useState('')

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  )

  useEffect(() => {
    async function loadEvents() {
      try {
        const organizerEvents = await getOrganizerEvents(user.uid)
        setEvents(organizerEvents)
      } catch {
        setError('Unable to load your events. Please try again.')
      } finally {
        setLoadingEvents(false)
      }
    }

    if (user) {
      loadEvents()
    }
  }, [user])

  useEffect(() => {
    async function loadParticipants() {
      if (!selectedEventId) {
        setParticipants([])
        setParticipantCount(0)
        return
      }

      setError('')
      setLoadingParticipants(true)

      try {
        const [eventParticipants, totalParticipants] = await Promise.all([
          getParticipantsByEvent(selectedEventId),
          getParticipantCount(selectedEventId),
        ])
        setParticipants(eventParticipants)
        setParticipantCount(totalParticipants)
      } catch {
        setError('Unable to load participants. Please try again.')
      } finally {
        setLoadingParticipants(false)
      }
    }

    loadParticipants()
  }, [selectedEventId])

  function formatRegistrationTime(timestamp) {
    return timestamp?.toDate?.().toLocaleString() || 'Just now'
  }

  return (
    <section className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold text-slate-900">Participants</h1>
      <p className="mt-2 text-slate-600">View students registered for your events.</p>

      {loadingEvents ? (
        <p className="mt-6 text-slate-600">Loading your events...</p>
      ) : events.length === 0 ? (
        <p className="mt-6 text-slate-600">You have not created any events yet.</p>
      ) : (
        <label className="mt-6 block max-w-xl text-sm font-medium text-slate-700">
          Select Event
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Choose an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-700">{error}</p>}

      {selectedEvent && !loadingParticipants && !error && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{selectedEvent.title}</h2>
          <p className="mt-1 text-slate-600">Total Participants: {participantCount}</p>
        </div>
      )}

      {selectedEventId && loadingParticipants ? (
        <p className="mt-6 text-slate-600">Loading participants...</p>
      ) : selectedEvent && !error && participants.length === 0 ? (
        <p className="mt-6 text-slate-600">No participants registered yet.</p>
      ) : selectedEvent && !error ? (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-5 py-3 font-semibold">Student Name</th>
                <th className="px-5 py-3 font-semibold">Roll Number</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Registration Time</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-t border-slate-200 text-slate-600">
                  <td className="px-5 py-3">{participant.studentName}</td>
                  <td className="px-5 py-3">{participant.studentRollNumber}</td>
                  <td className="px-5 py-3">{participant.studentEmail}</td>
                  <td className="px-5 py-3">{formatRegistrationTime(participant.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

export default Participants
