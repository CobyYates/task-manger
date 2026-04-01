import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from 'firebase/auth'

const currentUser = ref<User | null>(null)
const loading = ref(true)
const initialized = ref(false)
let authReady: Promise<void> | null = null

export function useAuth() {
  const { auth } = useFirebase()

  if (!initialized.value) {
    initialized.value = true
    authReady = new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (user) => {
        currentUser.value = user
        loading.value = false
        resolve()
      })
    })
  }

  async function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function signUp(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    currentUser.value = cred.user
    return cred
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  async function signOut() {
    await firebaseSignOut(auth)
    currentUser.value = null
    navigateTo('/login')
  }

  async function waitForAuth() {
    if (authReady) await authReady
  }

  return {
    currentUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    waitForAuth,
  }
}
