import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const eventsCollection = collection(db, 'events')

function getEditableEventFields(eventData) {
  return {
    title: eventData.title?.trim() ?? '',
    description: eventData.description?.trim() ?? '',
    category: eventData.category?.trim() ?? '',
    venue: eventData.venue?.trim() ?? '',
    date: eventData.date ?? '',
    time: eventData.time ?? '',
    registrationDeadline: eventData.registrationDeadline ?? '',
    maxParticipants: Number(eventData.maxParticipants) || 0,
  }
}

export async function createEvent(eventData) {
  if (!eventData.organizerId) {
    throw new Error('Organizer ID is required to create an event.')
  }

  return addDoc(eventsCollection, {
    ...getEditableEventFields(eventData),
    organizerId: eventData.organizerId,
    organizerName: eventData.organizerName || 'Organizer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getOrganizerEvents(organizerId) {
  const organizerEventsQuery = query(
    eventsCollection,
    where('organizerId', '==', organizerId),
  )
  const snapshot = await getDocs(organizerEventsQuery)

  return snapshot.docs
    .map((eventDocument) => ({ id: eventDocument.id, ...eventDocument.data() }))
    .sort((firstEvent, secondEvent) => {
      const firstCreatedAt = firstEvent.createdAt?.toMillis?.() ?? 0
      const secondCreatedAt = secondEvent.createdAt?.toMillis?.() ?? 0

      return secondCreatedAt - firstCreatedAt
    })
}

export async function getEventById(eventId, organizerId) {
  const eventSnapshot = await getDoc(doc(db, 'events', eventId))

  if (!eventSnapshot.exists()) {
    return null
  }

  const event = { id: eventSnapshot.id, ...eventSnapshot.data() }

  return event.organizerId === organizerId ? event : null
}

export async function updateEvent(eventId, eventData) {
  return updateDoc(doc(db, 'events', eventId), {
    ...getEditableEventFields(eventData),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteEvent(eventId) {
  return deleteDoc(doc(db, 'events', eventId))
}
