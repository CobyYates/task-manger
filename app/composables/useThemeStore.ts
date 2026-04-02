import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const STORAGE_KEY = 'tm-theme'
const DEFAULT_THEME = 'midnight'

const currentThemeId = ref<string>(
  import.meta.client ? (localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME) : DEFAULT_THEME
)

let firestoreLoaded = false
let firestoreReadFailed = false

export function useThemeStore() {
  const { db } = useFirebase()
  const { currentUser } = useAuth()

  function applyTheme(themeId: string) {
    currentThemeId.value = themeId
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, themeId)
    }
  }

  async function loadFromFirestore() {
    if (!currentUser.value || firestoreLoaded || firestoreReadFailed) return
    try {
      const snap = await getDoc(doc(db, 'userSettings', currentUser.value.uid))
      firestoreLoaded = true
      if (snap.exists() && snap.data().theme) {
        applyTheme(snap.data().theme)
      } else {
        // No saved theme for this user — reset to default
        applyTheme(DEFAULT_THEME)
      }
    } catch (e) {
      console.warn('Failed to load theme from Firestore:', e)
      firestoreReadFailed = true
    }
  }

  async function saveTheme(themeId: string) {
    applyTheme(themeId)
    if (!currentUser.value) return
    try {
      const user = currentUser.value
      const settingsRef = doc(db, 'userSettings', user.uid)

      // Always use merge: true — creates the doc if it doesn't exist,
      // updates it if it does. No need to read first.
      await setDoc(settingsRef, {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        theme: themeId,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    } catch (e) {
      console.error('Failed to save theme to Firestore:', e)
    }
  }

  function clearTheme() {
    currentThemeId.value = DEFAULT_THEME
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
    firestoreLoaded = false
    firestoreReadFailed = false
  }

  // Load from Firestore when user logs in, clear when they log out
  watch(currentUser, (user, oldUser) => {
    if (user) {
      firestoreLoaded = false
      firestoreReadFailed = false
      loadFromFirestore()
    } else if (oldUser) {
      // User logged out — clear the previous user's theme
      clearTheme()
    }
  }, { immediate: true })

  return {
    currentThemeId: readonly(currentThemeId),
    saveTheme,
    loadFromFirestore,
    clearTheme,
  }
}
