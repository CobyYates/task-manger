import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp
let auth: Auth
let db: Firestore
let initialized = false

export function useFirebase() {
  if (!initialized) {
    const existing = getApps()
    if (existing.length === 0) {
      const config = useRuntimeConfig()
      app = initializeApp({
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId,
      })
    } else {
      app = existing[0]
    }
    auth = getAuth(app)
    db = getFirestore(app)
    initialized = true
  }

  return { app, auth, db }
}
