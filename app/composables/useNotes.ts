import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'

export type NoteType = 'note' | 'update' | 'insight' | 'decision' | 'risk'

export interface Note {
  id: string
  projectId: string
  content: string
  type: NoteType
  pinned: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}

export function useNotes(projectId: Ref<string> | string) {
  const { db } = useFirebase()
  const { currentUser } = useAuth()
  const notes = ref<Note[]>([])
  const error = ref<string | null>(null)
  let unsubscribe: Unsubscribe | null = null
  let subscribed = false

  function subscribe() {
    if (unsubscribe) unsubscribe()
    subscribed = true
    error.value = null

    if (!currentUser.value) {
      notes.value = []
      return
    }

    const pid = unref(projectId)
    const q = query(
      collection(db, 'notes'),
      where('projectId', '==', pid),
      where('userId', '==', currentUser.value.uid),
      orderBy('createdAt', 'desc')
    )

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        notes.value = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Note
        })
      },
      (err) => {
        console.error('Notes subscription error:', err)
        error.value = err.message
      }
    )
  }

  watch(currentUser, () => {
    if (subscribed) subscribe()
  })

  async function addNote(data: Pick<Note, 'content' | 'type'>) {
    if (!currentUser.value) throw new Error('Not authenticated')
    const pid = unref(projectId)
    return addDoc(collection(db, 'notes'), {
      ...data,
      projectId: pid,
      pinned: false,
      userId: currentUser.value.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateNote(id: string, data: Partial<Note>) {
    return updateDoc(doc(db, 'notes', id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteNote(id: string) {
    return deleteDoc(doc(db, 'notes', id))
  }

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    subscribed = false
  }

  return { notes, error, subscribe, addNote, updateNote, deleteNote, cleanup }
}
