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

export interface Project {
  id: string
  name: string
  description: string
  category: 'vendor' | 'contract' | 'project' | 'other'
  status: 'active' | 'on-hold' | 'completed' | 'archived'
  color: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

const projects = ref<Project[]>([])
const error = ref<string | null>(null)
let unsubscribe: Unsubscribe | null = null
let subscribed = false

export function useProjects() {
  const { db } = useFirebase()
  const { currentUser } = useAuth()

  function subscribe() {
    if (unsubscribe) unsubscribe()
    subscribed = true
    error.value = null

    if (!currentUser.value) {
      projects.value = []
      return
    }

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.value.uid),
      orderBy('updatedAt', 'desc')
    )

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        projects.value = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Project
        })
      },
      (err) => {
        console.error('Projects subscription error:', err)
        error.value = err.message

        // Firestore index errors include a URL to create the index
        if (err.message.includes('index')) {
          console.error('You may need to create a Firestore composite index. Check the URL in the error above.')
        }
      }
    )
  }

  // Auto-reconnect when auth changes
  watch(currentUser, () => {
    if (subscribed) subscribe()
  })

  async function addProject(data: Pick<Project, 'name' | 'description' | 'category' | 'color'>) {
    if (!currentUser.value) throw new Error('Not authenticated')
    return addDoc(collection(db, 'projects'), {
      ...data,
      status: 'active',
      userId: currentUser.value.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateProject(id: string, data: Partial<Project>) {
    return updateDoc(doc(db, 'projects', id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteProject(id: string) {
    return deleteDoc(doc(db, 'projects', id))
  }

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    subscribed = false
  }

  return {
    projects,
    error,
    subscribe,
    addProject,
    updateProject,
    deleteProject,
    cleanup,
  }
}
