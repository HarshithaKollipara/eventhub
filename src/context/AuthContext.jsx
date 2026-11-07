import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import AuthContext from './authContext'

async function findUserProfile(uid) {
  const studentQuery = query(
    collection(db, 'students'),
    where('uid', '==', uid),
    limit(1),
  )
  const studentSnapshot = await getDocs(studentQuery)

  if (!studentSnapshot.empty) {
    return { ...studentSnapshot.docs[0].data(), role: 'student' }
  }

  const organizerQuery = query(
    collection(db, 'organizers'),
    where('uid', '==', uid),
    limit(1),
  )
  const organizerSnapshot = await getDocs(organizerQuery)

  if (!organizerSnapshot.empty) {
    return { ...organizerSnapshot.docs[0].data(), role: 'organizer' }
  }

  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        const userProfile = await findUserProfile(currentUser.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userProfile = await findUserProfile(userCredential.user.uid)

    if (!userProfile) {
      await signOut(auth)
      throw new Error('No student or organizer profile was found for this account.')
    }

    return userProfile
  }

  async function createStudentAccount(studentData) {
    let createdUser = null

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        studentData.email,
        studentData.password,
      )
      createdUser = userCredential.user

      const studentProfile = {
        uid: createdUser.uid,
        name: studentData.name,
        email: studentData.email,
        rollNumber: studentData.rollNumber,
        branch: studentData.branch,
        year: studentData.year,
        section: studentData.section,
        phone: studentData.phone,
        role: 'student',
      }

      await setDoc(doc(db, 'students', createdUser.uid), studentProfile)
      setUser(createdUser)
      setProfile(studentProfile)

      return studentProfile
    } catch (signupError) {
      if (signupError.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please log in instead.', {
          cause: signupError,
        })
      }

      if (createdUser) {
        try {
          await signOut(auth)
        } catch {
          // The profile write error is more useful to the student than a sign-out error.
        }
        throw new Error(
          'Your account was created, but we could not save your student profile. You have been signed out. Please contact support before trying again.',
          { cause: signupError },
        )
      }

      throw signupError
    }
  }

  async function logout() {
    await signOut(auth)
  }

  const value = { user, profile, loading, login, createStudentAccount, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
