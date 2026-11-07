import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

function getRegistrationId(studentId, eventId) {
  return `${studentId}_${eventId}`
}

export async function isAlreadyRegistered(studentId, eventId) {
  const registrationReference = doc(
    db,
    'registrations',
    getRegistrationId(studentId, eventId),
  )
  const registrationSnapshot = await getDoc(registrationReference)

  return registrationSnapshot.exists()
}

export async function registerForEvent(studentId, eventId, studentProfile, eventTitle) {
  const registrationReference = doc(
    db,
    'registrations',
    getRegistrationId(studentId, eventId),
  )

  await runTransaction(db, async (transaction) => {
    const existingRegistration = await transaction.get(registrationReference)

    if (existingRegistration.exists()) {
      throw new Error('You are already registered for this event.')
    }

    transaction.set(registrationReference, {
      studentId,
      studentName: studentProfile.name,
      studentEmail: studentProfile.email,
      studentRollNumber: studentProfile.rollNumber,
      eventId,
      eventTitle,
      registeredAt: serverTimestamp(),
    })
  })
}

export async function getRegisteredEvents(studentId) {
  const registrationsQuery = query(
    collection(db, 'registrations'),
    where('studentId', '==', studentId),
  )
  const snapshot = await getDocs(registrationsQuery)

  return snapshot.docs.map((registrationDocument) => ({
    id: registrationDocument.id,
    ...registrationDocument.data(),
  }))
}
