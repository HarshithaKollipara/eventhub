import { collection, getDocs, limit, query, updateDoc, where } from 'firebase/firestore'
import { db } from './firebase'

async function getStudentDocument(studentId) {
  const studentQuery = query(
    collection(db, 'students'),
    where('uid', '==', studentId),
    limit(1),
  )
  const snapshot = await getDocs(studentQuery)

  if (snapshot.empty) {
    throw new Error('Student profile not found.')
  }

  return snapshot.docs[0]
}

export async function getStudentProfile(studentId) {
  const studentDocument = await getStudentDocument(studentId)

  return { id: studentDocument.id, ...studentDocument.data() }
}

export async function updateStudentPhone(studentId, phoneNumber) {
  const studentDocument = await getStudentDocument(studentId)

  await updateDoc(studentDocument.ref, { phone: phoneNumber })
}
