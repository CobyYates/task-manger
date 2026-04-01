<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          {{ greeting }}, {{ currentUser?.displayName?.split(' ')[0] || 'there' }}
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showNewProject = true">
        New Project
      </v-btn>
    </div>

    <!-- Error Banner -->
    <v-alert
      v-if="projectsError || tasksError"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      <div class="font-weight-bold">Data sync error</div>
      <div v-if="projectsError" class="text-body-2">Projects: {{ projectsError }}</div>
      <div v-if="tasksError" class="text-body-2">Tasks: {{ tasksError }}</div>
      <div class="text-caption mt-1">Check the browser console for details. You may need to create Firestore indexes.</div>
    </v-alert>

    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="primary" variant="tonal" size="48" rounded="lg" class="mr-4">
              <v-icon>mdi-folder-multiple</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ activeProjects.length }}</div>
              <div class="text-caption text-medium-emphasis">Active Projects</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="warning" variant="tonal" size="48" rounded="lg" class="mr-4">
              <v-icon>mdi-alert-circle</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ openTasks.length }}</div>
              <div class="text-caption text-medium-emphasis">Open Tasks</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="error" variant="tonal" size="48" rounded="lg" class="mr-4">
              <v-icon>mdi-fire</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ urgentTasks.length }}</div>
              <div class="text-caption text-medium-emphasis">Urgent Tasks</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="success" variant="tonal" size="48" rounded="lg" class="mr-4">
              <v-icon>mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ todayCompleted.length }}</div>
              <div class="text-caption text-medium-emphasis">Done Today</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Active Projects Grid -->
    <h2 class="text-h6 font-weight-bold mb-4">Active Projects</h2>
    <v-row v-if="activeProjects.length" class="mb-6">
      <TransitionGroup name="card-stagger">
        <v-col v-for="project in activeProjects" :key="project.id" cols="12" sm="6" md="4" lg="3">
          <v-card
            color="surface"
            class="pa-4 cursor-pointer h-100 project-card"
            @click="navigateTo(`/projects/${project.id}`)"
          >
            <div class="d-flex align-center mb-3">
              <v-avatar :color="project.color" size="36" rounded="lg" class="mr-3">
                <v-icon size="20" color="white">{{ getCategoryIcon(project.category) }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-subtitle-1 font-weight-bold text-truncate">{{ project.name }}</div>
                <v-chip :color="project.color" size="x-small" variant="tonal" class="mt-1">
                  {{ project.category }}
                </v-chip>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-3 two-line-clamp">
              {{ project.description || 'No description' }}
            </p>
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon size="14" class="mr-1">mdi-checkbox-marked-circle-outline</v-icon>
              {{ getProjectTaskCount(project.id) }} tasks
              <v-spacer />
              <v-icon size="14" class="mr-1">mdi-note-text-outline</v-icon>
              {{ getProjectNoteCount(project.id) }} notes
            </div>
          </v-card>
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-card v-else color="surface" class="pa-8 text-center mb-6">
      <v-icon size="48" color="primary" class="mb-4">mdi-folder-plus-outline</v-icon>
      <h3 class="text-h6 mb-2">No projects yet</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">Create your first project to get started</p>
      <v-btn color="primary" @click="showNewProject = true">Create Project</v-btn>
    </v-card>

    <!-- Upcoming Tasks -->
    <h2 class="text-h6 font-weight-bold mb-4">Open Tasks</h2>
    <v-card v-if="openTasks.length" color="surface">
      <TransitionGroup name="task-list" tag="div" class="v-list v-list--two-line bg-transparent">
        <v-list-item
          v-for="task in openTasks.slice(0, 10)"
          :key="task.id"
          :to="`/projects/${task.projectId}`"
          class="task-item"
        >
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
            <span class="text-medium-emphasis">{{ getProjectName(task.projectId) }}</span>
            <span class="text-medium-emphasis ml-2">· {{ formatDate(task.createdAt) }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </TransitionGroup>
      <v-card-actions v-if="openTasks.length > 10" class="justify-center">
        <v-btn variant="text" color="primary" to="/tasks">View all {{ openTasks.length }} tasks</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else color="surface" class="pa-6 text-center">
      <v-icon size="36" color="success" class="mb-2">mdi-check-all</v-icon>
      <p class="text-body-2 text-medium-emphasis">All caught up! No open tasks.</p>
    </v-card>

    <!-- New Project Dialog -->
    <ProjectDialog v-model="showNewProject" @created="onProjectCreated" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({})

const { currentUser } = useAuth()
const { projects, error: projectsError, subscribe: subProjects } = useProjects()
const { tasks, openTasks, error: tasksError, subscribe: subTasks, updateTask } = useTasks()

const showNewProject = ref(false)

const activeProjects = computed(() => projects.value.filter((p) => p.status === 'active'))
const urgentTasks = computed(() => openTasks.value.filter((t) => t.priority === 'urgent' || t.priority === 'high'))
const todayCompleted = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tasks.value.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= today)
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = {
    vendor: 'mdi-handshake',
    contract: 'mdi-file-sign',
    project: 'mdi-clipboard-text',
    other: 'mdi-folder',
  }
  return icons[cat] || icons.other
}

function getPriorityColor(p: string) {
  const colors: Record<string, string> = { urgent: 'error', high: 'warning', medium: 'info', low: 'success' }
  return colors[p] || 'info'
}

function getProjectName(id: string) {
  return projects.value.find((p) => p.id === id)?.name || 'Unknown'
}

function getProjectTaskCount(id: string) {
  return tasks.value.filter((t) => t.projectId === id && t.status !== 'done').length
}

function getProjectNoteCount(_id: string) {
  // Notes are loaded per-project, so we show a placeholder
  return '—'
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function markDone(task: any) {
  await updateTask(task.id, { status: 'done' })
}

function onProjectCreated() {
  showNewProject.value = false
}

onMounted(() => {
  subProjects()
  subTasks()
})
</script>

<style scoped>
.project-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.two-line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
