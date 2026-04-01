<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Daily Summary</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          {{ formattedDate }}
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-btn icon="mdi-chevron-left" variant="tonal" @click="prevDay" />
        <v-btn variant="tonal" @click="selectedDate = new Date()" class="h-auto">Today</v-btn>
        <v-btn icon="mdi-chevron-right" variant="tonal" :disabled="isToday" @click="nextDay" />
      </div>
    </div>

    <!-- Daily Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card color="surface" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-warning">{{ dayOpenTasks.length }}</div>
          <div class="text-caption text-medium-emphasis">Tasks Still Open</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="surface" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-success">{{ dayCompletedTasks.length }}</div>
          <div class="text-caption text-medium-emphasis">Completed Today</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="surface" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ dayNotes.length }}</div>
          <div class="text-caption text-medium-emphasis">Notes Added</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Open Tasks (End of Day List) -->
    <h2 class="text-h6 font-weight-bold mb-4">
      <v-icon start color="warning">mdi-alert-circle</v-icon>
      Tasks Still To Do
    </h2>
    <v-card v-if="dayOpenTasks.length" color="surface" class="mb-6">
      <v-list lines="two" class="bg-transparent">
        <template v-for="(task, i) in dayOpenTasks" :key="task.id">
          <v-list-item :to="`/projects/${task.projectId}`">
            <template #prepend>
              <v-checkbox
                :model-value="false"
                :color="getPriorityColor(task.priority)"
                @click.prevent.stop="markDone(task)"
              />
            </template>
            <v-list-item-title class="font-weight-medium">{{ task.title }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip size="x-small" :color="getPriorityColor(task.priority)" variant="tonal" class="mr-2">
                {{ task.priority }}
              </v-chip>
              <span>{{ getProjectName(task.projectId) }}</span>
              <span class="text-medium-emphasis ml-1">· Created {{ formatDate(task.createdAt) }}</span>
            </v-list-item-subtitle>
          </v-list-item>
          <v-divider v-if="i < dayOpenTasks.length - 1" />
        </template>
      </v-list>
    </v-card>
    <v-card v-else color="surface" class="pa-6 text-center mb-6">
      <v-icon size="36" color="success" class="mb-2">mdi-party-popper</v-icon>
      <p class="text-body-2 text-medium-emphasis">All tasks are done! Great work.</p>
    </v-card>

    <!-- Completed Today -->
    <h2 v-if="dayCompletedTasks.length" class="text-h6 font-weight-bold mb-4">
      <v-icon start color="success">mdi-check-circle</v-icon>
      Completed Today
    </h2>
    <v-card v-if="dayCompletedTasks.length" color="surface" class="mb-6">
      <v-list class="bg-transparent">
        <template v-for="(task, i) in dayCompletedTasks" :key="task.id">
          <v-list-item>
            <template #prepend>
              <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-decoration-line-through text-medium-emphasis">
              {{ task.title }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ getProjectName(task.projectId) }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider v-if="i < dayCompletedTasks.length - 1" />
        </template>
      </v-list>
    </v-card>

    <!-- Project Summaries -->
    <h2 class="text-h6 font-weight-bold mb-4">
      <v-icon start color="primary">mdi-folder-multiple</v-icon>
      Project Summaries
    </h2>
    <v-row>
      <v-col v-for="summary in projectSummaries" :key="summary.project.id" cols="12" md="6">
        <v-card
          color="surface"
          class="pa-5 h-100 cursor-pointer"
          @click="navigateTo(`/projects/${summary.project.id}`)"
        >
          <div class="d-flex align-center mb-3">
            <v-avatar :color="summary.project.color" size="36" rounded="lg" class="mr-3">
              <v-icon size="20" color="white">{{ getCategoryIcon(summary.project.category) }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ summary.project.name }}</div>
              <v-chip size="x-small" :color="summary.project.color" variant="tonal">{{ summary.project.category }}</v-chip>
            </div>
          </div>

          <div class="d-flex ga-4 mb-3">
            <div class="text-center">
              <div class="text-h6 font-weight-bold text-warning">{{ summary.openTasks }}</div>
              <div class="text-caption text-medium-emphasis">Open</div>
            </div>
            <div class="text-center">
              <div class="text-h6 font-weight-bold text-success">{{ summary.completedToday }}</div>
              <div class="text-caption text-medium-emphasis">Done Today</div>
            </div>
            <div class="text-center">
              <div class="text-h6 font-weight-bold text-primary">{{ summary.notesToday }}</div>
              <div class="text-caption text-medium-emphasis">Notes Today</div>
            </div>
          </div>

          <div v-if="summary.recentNotes.length" class="mt-2">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-1">Today's Notes:</div>
            <div v-for="note in summary.recentNotes.slice(0, 3)" :key="note.id" class="text-body-2 mb-1">
              <v-chip size="x-small" :color="getNoteColor(note.type)" variant="tonal" class="mr-1">{{ note.type }}</v-chip>
              <span class="text-medium-emphasis">{{ truncate(note.content, 80) }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="!projectSummaries.length" color="surface" class="pa-8 text-center">
      <v-icon size="48" color="primary" class="mb-4">mdi-calendar-blank</v-icon>
      <p class="text-body-2 text-medium-emphasis">No activity for this day.</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import type { Note } from '~/composables/useNotes'

definePageMeta({})

const { currentUser } = useAuth()
const { db } = useFirebase()
const { projects, subscribe: subProjects } = useProjects()
const { tasks, openTasks, subscribe: subTasks, updateTask } = useTasks()

const selectedDate = ref(new Date())
const allNotes = ref<Note[]>([])

const isToday = computed(() => {
  const today = new Date()
  return selectedDate.value.toDateString() === today.toDateString()
})

const formattedDate = computed(() =>
  selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

function prevDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  selectedDate.value = d
}

function nextDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  selectedDate.value = d
}

function startOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function endOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(23, 59, 59, 999)
  return r
}

const dayOpenTasks = computed(() =>
  openTasks.value.sort((a, b) => {
    const pOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2)
  })
)

const dayCompletedTasks = computed(() => {
  const start = startOfDay(selectedDate.value)
  const end = endOfDay(selectedDate.value)
  return tasks.value.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= start && t.completedAt <= end)
})

const dayNotes = computed(() => {
  const start = startOfDay(selectedDate.value)
  const end = endOfDay(selectedDate.value)
  return allNotes.value.filter((n) => n.createdAt >= start && n.createdAt <= end)
})

const projectSummaries = computed(() => {
  return projects.value
    .filter((p) => p.status === 'active')
    .map((project) => {
      const projTasks = tasks.value.filter((t) => t.projectId === project.id)
      const start = startOfDay(selectedDate.value)
      const end = endOfDay(selectedDate.value)
      return {
        project,
        openTasks: projTasks.filter((t) => t.status !== 'done').length,
        completedToday: projTasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= start && t.completedAt <= end).length,
        notesToday: dayNotes.value.filter((n) => n.projectId === project.id).length,
        recentNotes: dayNotes.value.filter((n) => n.projectId === project.id),
      }
    })
    .filter((s) => s.openTasks > 0 || s.completedToday > 0 || s.notesToday > 0)
})

function getPriorityColor(p: string) {
  const colors: Record<string, string> = { urgent: 'error', high: 'warning', medium: 'info', low: 'success' }
  return colors[p] || 'info'
}

function getProjectName(id: string) {
  return projects.value.find((p) => p.id === id)?.name || 'Unknown'
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = { vendor: 'mdi-handshake', contract: 'mdi-file-sign', project: 'mdi-clipboard-text', other: 'mdi-folder' }
  return icons[cat] || icons.other
}

function getNoteColor(type: string) {
  const colors: Record<string, string> = { note: 'info', update: 'primary', insight: 'warning', decision: 'success', risk: 'error' }
  return colors[type] || 'info'
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s
}

async function markDone(task: any) {
  await updateTask(task.id, { status: 'done' })
}

async function fetchAllNotes() {
  if (!currentUser.value) return
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', currentUser.value.uid),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  allNotes.value = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Note
  })
}

onMounted(() => {
  subProjects()
  subTasks()
  fetchAllNotes()
})
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
