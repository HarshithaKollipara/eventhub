import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

function getEventDateTime(event) {
  return new Date(`${event.date}T${event.time || '23:59'}`)
}

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export async function getAllUpcomingEvents() {
  const today = getTodayDate()
  const upcomingEventsQuery = query(
    collection(db, 'events'),
    where('date', '>=', today),
  )
  const snapshot = await getDocs(upcomingEventsQuery)
  const now = new Date()

  return snapshot.docs
    .map((eventDocument) => ({ id: eventDocument.id, ...eventDocument.data() }))
    .filter((event) => getEventDateTime(event) >= now)
    .sort((firstEvent, secondEvent) => getEventDateTime(firstEvent) - getEventDateTime(secondEvent))
}
