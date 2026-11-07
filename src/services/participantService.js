import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

function getParticipantsQuery(eventId) {
  return query(collection(db, 'registrations'), where('eventId', '==', eventId))
}

export async function getParticipantsByEvent(eventId) {
  const snapshot = await getDocs(getParticipantsQuery(eventId))

  return snapshot.docs
    .map((registrationDocument) => ({
      id: registrationDocument.id,
      ...registrationDocument.data(),
    }))
    .sort((firstParticipant, secondParticipant) => {
      const firstRegisteredAt = firstParticipant.registeredAt?.toMillis?.() ?? 0
      const secondRegisteredAt = secondParticipant.registeredAt?.toMillis?.() ?? 0

      return firstRegisteredAt - secondRegisteredAt
    })
}

export async function getParticipantCount(eventId) {
  const countSnapshot = await getCountFromServer(getParticipantsQuery(eventId))

  return countSnapshot.data().count
}
