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

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

// Shared state for global (all tasks) subscription
const allTasks = ref<Task[]>([])
const allError = ref<string | null>(null)
let allUnsubscribe: Unsubscribe | null = null
let allSubscribed = false

export function useTasks(projectId?: Ref<string> | string) {
  const { db } = useFirebase()
  const { currentUser } = useAuth()

  const isScoped = !!projectId
  const tasks = isScoped ? ref<Task[]>([]) : allTasks
  const error = isScoped ? ref<string | null>(null) : allError
  let unsubscribe: Unsubscribe | null = isScoped ? null : allUnsubscribe
  let subscribed = isScoped ? false : allSubscribed

  function parseTask(d: any): Task {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      dueDate: data.dueDate?.toDate?.() || null,
      completedAt: data.completedAt?.toDate?.() || null,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Task
  }

  function subscribe() {
    if (unsubscribe) unsubscribe()
    subscribed = true
    error.value = null
    if (!isScoped) allSubscribed = true

    if (!currentUser.value) {
      tasks.value = []
      return
    }

    const constraints = [
      where('userId', '==', currentUser.value.uid),
      orderBy('createdAt', 'desc'),
    ]

    const pid = projectId ? unref(projectId) : null
    if (pid) {
      constraints.splice(1, 0, where('projectId', '==', pid))
    }

    const q = query(collection(db, 'tasks'), ...constraints)

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        tasks.value = snapshot.docs.map(parseTask)
      },
      (err) => {
        console.error('Tasks subscription error:', err)
        error.value = err.message
      }
    )

    unsubscribe = unsub
    if (!isScoped) allUnsubscribe = unsub
  }

  watch(currentUser, () => {
    if (subscribed) subscribe()
  })

  async function addTask(data: Pick<Task, 'title' | 'description' | 'priority'> & { projectId?: string, dueDate?: Date | null }) {
    if (!currentUser.value) throw new Error('Not authenticated')
    const pid = data.projectId || (projectId ? unref(projectId) : '')
    return addDoc(collection(db, 'tasks'), {
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      projectId: pid,
      status: 'todo',
      dueDate: data.dueDate || null,
      completedAt: null,
      userId: currentUser.value.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const update: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() }
    if (data.status === 'done' && !data.completedAt) {
      update.completedAt = serverTimestamp()
    }
    if (data.status && data.status !== 'done') {
      update.completedAt = null
    }
    return updateDoc(doc(db, 'tasks', id), update)
  }

  async function deleteTask(id: string) {
    return deleteDoc(doc(db, 'tasks', id))
  }

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    subscribed = false
    if (!isScoped) {
      allUnsubscribe = null
      allSubscribed = false
    }
  }

  const openTasks = computed(() => tasks.value.filter((t) => t.status !== 'done'))
  const completedTasks = computed(() => tasks.value.filter((t) => t.status === 'done'))

  return { tasks, openTasks, completedTasks, error, subscribe, addTask, updateTask, deleteTask, cleanup }
}
