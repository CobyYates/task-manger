import { doc, getDoc, setDoc } from 'firebase/firestore'

const STORAGE_KEY = 'tm-theme'
const DEFAULT_THEME = 'midnight'

const currentThemeId = ref<string>(
  import.meta.client ? (localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME) : DEFAULT_THEME
)

let firestoreLoaded = false
let firestoreFailed = false

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
    if (!currentUser.value || firestoreLoaded || firestoreFailed) return
    try {
      const snap = await getDoc(doc(db, 'userSettings', currentUser.value.uid))
      firestoreLoaded = true
      if (snap.exists() && snap.data().theme) {
        applyTheme(snap.data().theme)
      }
    } catch {
      // Firestore rules likely not configured for userSettings — fall back to localStorage silently
      firestoreFailed = true
    }
  }

  async function saveTheme(themeId: string) {
    applyTheme(themeId)
    if (!currentUser.value || firestoreFailed) return
    try {
      await setDoc(
        doc(db, 'userSettings', currentUser.value.uid),
        { theme: themeId },
        { merge: true }
      )
    } catch {
      // Firestore save failed — theme still persists via localStorage
      firestoreFailed = true
    }
  }

  // Load from Firestore once when user logs in
  watch(currentUser, (user) => {
    if (user) {
      firestoreLoaded = false
      firestoreFailed = false
      loadFromFirestore()
    }
  }, { immediate: true })

  return {
    currentThemeId: readonly(currentThemeId),
    saveTheme,
    loadFromFirestore,
  }
}
