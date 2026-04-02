<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">All Tasks</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddTask = true">New Task</v-btn>
    </div>

    <!-- Filters -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search tasks..."
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="6" sm="4">
        <v-select
          v-model="filterProject"
          :items="projectOptions"
          label="Project"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="6" sm="4">
        <v-select
          v-model="filterPriority"
          :items="priorityOptions"
          label="Priority"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <!-- Status tabs -->
    <v-tabs v-model="statusFilter" color="primary" class="mb-4">
      <v-tab value="open">Open ({{ filteredOpen.length }})</v-tab>
      <v-tab value="done">Completed ({{ filteredDone.length }})</v-tab>
    </v-tabs>

    <v-card v-if="displayedTasks.length" color="surface">
      <TransitionGroup name="task-list" tag="div" class="v-list bg-transparent">
        <div v-for="task in displayedTasks" :key="task.id" class="task-item">
          <v-list-item>
            <template #prepend>
              <v-checkbox
                :model-value="task.status === 'done'"
                :color="task.status === 'done' ? 'success' : getPriorityColor(task.priority)"
                @click.prevent.stop="toggleDone(task)"
              />
            </template>
            <v-list-item-title
              class="font-weight-medium d-flex align-center ga-2"
              :class="{ 'text-decoration-line-through text-medium-emphasis': task.status === 'done' }"
            >
              {{ task.title }}
              <v-chip
                v-if="task.description"
                size="x-small"
                variant="tonal"
                :prepend-icon="expandedTask === task.id ? 'mdi-chevron-up' : 'mdi-text-box-outline'"
                class="cursor-pointer"
                @click.prevent.stop="expandedTask = expandedTask === task.id ? null : task.id"
              >
                {{ expandedTask === task.id ? 'Hide' : 'Details' }}
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-chip size="x-small" :color="getPriorityColor(task.priority)" variant="tonal" class="mr-2">
                {{ task.priority }}
              </v-chip>
              <v-chip size="x-small" variant="tonal" class="mr-2" @click.prevent.stop="navigateTo(`/projects/${task.projectId}`)">
                {{ getProjectName(task.projectId) }}
              </v-chip>
              <span class="text-medium-emphasis">{{ formatDate(task.createdAt) }}</span>
            </v-list-item-subtitle>
            <template #append>
              <div class="d-flex ga-1">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  title="Edit"
                  @click.prevent.stop="openEdit(task)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="tonal"
                  color="error"
                  title="Delete"
                  @click.prevent.stop="handleDelete(task.id)"
                />
              </div>
            </template>
          </v-list-item>
          <v-expand-transition>
            <div v-if="expandedTask === task.id && task.description" class="px-4 pb-3 ml-10">
              <div class="rich-content text-body-2" v-html="task.description" />
            </div>
          </v-expand-transition>
          <v-divider />
        </div>
      </TransitionGroup>
    </v-card>
    <v-card v-else color="surface" class="pa-8 text-center">
      <v-icon size="48" color="primary" class="mb-4">mdi-check-all</v-icon>
      <p class="text-body-2 text-medium-emphasis">
        {{ statusFilter === 'open' ? 'No open tasks. Nice work!' : 'No completed tasks yet.' }}
      </p>
    </v-card>

    <!-- Add Task Dialog -->
    <v-dialog v-model="showAddTask" max-width="640">
      <v-card class="pa-6" color="surface">
        <v-card-title class="text-h6 font-weight-bold pa-0 mb-4">New Task</v-card-title>
        <v-form @submit.prevent="handleAddTask">
          <v-text-field v-model="taskForm.title" label="Task" placeholder="What needs to be done?" autofocus class="mb-2" />
          <v-select v-model="taskForm.projectId" :items="projectOptions.filter(p => p.value)" label="Project" class="mb-2" />
          <v-select v-model="taskForm.priority" :items="priorityOptions" label="Priority" class="mb-3" />
          <label class="text-body-2 text-medium-emphasis d-block mb-2">Description</label>
          <RichTextEditor v-model="taskForm.description" placeholder="Add details, images, formatting..." compact class="mb-4" />
          <div class="d-flex ga-2 justify-end">
            <v-btn variant="text" @click="showAddTask = false">Cancel</v-btn>
            <v-btn type="submit" color="primary" :disabled="!taskForm.title.trim() || !taskForm.projectId">Add Task</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Edit Task Dialog -->
    <v-dialog v-model="showEditTask" max-width="640">
      <v-card class="pa-6" color="surface">
        <v-card-title class="text-h6 font-weight-bold pa-0 mb-4">Edit Task</v-card-title>
        <v-text-field v-model="editForm.title" label="Title" class="mb-2" />
        <v-select v-model="editForm.priority" :items="priorityOptions" label="Priority" class="mb-3" />
        <label class="text-body-2 text-medium-emphasis d-block mb-2">Description</label>
        <RichTextEditor v-model="editForm.description" placeholder="Add details, images, formatting..." />
        <div class="d-flex ga-2 justify-end mt-4">
          <v-btn variant="text" @click="showEditTask = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!editForm.title.trim()" @click="saveEditTask">Save</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

definePageMeta({})

const { projects, subscribe: subProjects } = useProjects()
const { tasks, openTasks, completedTasks, subscribe: subTasks, addTask, updateTask, deleteTask } = useTasks()

const route = useRoute()

const search = ref('')
const filterProject = ref<string | null>(null)
const filterPriority = ref<string | null>(route.query.priority === 'urgent' ? 'urgent' : null)
const statusFilter = ref('open')
const showAddTask = ref(false)
const taskForm = ref({ title: '', projectId: '', priority: 'medium' as string, description: '' })
const expandedTask = ref<string | null>(null)
const showEditTask = ref(false)
const editingTaskId = ref<string | null>(null)
const editForm = ref({ title: '', description: '', priority: 'medium' as string })

const projectOptions = computed(() => [
  ...projects.value.map((p) => ({ title: p.name, value: p.id })),
])

const priorityOptions = [
  { title: 'Urgent', value: 'urgent' },
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' },
]

function applyFilters(list: Task[]) {
  return list.filter((t) => {
    if (search.value && !t.title.toLowerCase().includes(search.value.toLowerCase())) return false
    if (filterProject.value && t.projectId !== filterProject.value) return false
    if (filterPriority.value && t.priority !== filterPriority.value) return false
    return true
  })
}

const filteredOpen = computed(() => applyFilters(openTasks.value))
const filteredDone = computed(() => applyFilters(completedTasks.value))
const displayedTasks = computed(() => statusFilter.value === 'open' ? filteredOpen.value : filteredDone.value)

function getPriorityColor(p: string) {
  const colors: Record<string, string> = { urgent: 'error', high: 'warning', medium: 'info', low: 'success' }
  return colors[p] || 'info'
}

function getProjectName(id: string) {
  return projects.value.find((p) => p.id === id)?.name || 'Unknown'
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function toggleDone(task: Task) {
  await updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
}

async function handleDelete(id: string) {
  await deleteTask(id)
}

async function handleAddTask() {
  if (!taskForm.value.title.trim() || !taskForm.value.projectId) return
  await addTask({
    title: taskForm.value.title.trim(),
    description: taskForm.value.description,
    priority: taskForm.value.priority as any,
    projectId: taskForm.value.projectId,
  })
  taskForm.value = { title: '', projectId: '', priority: 'medium', description: '' }
  showAddTask.value = false
}

function openEdit(task: Task) {
  editingTaskId.value = task.id
  editForm.value = {
    title: task.title,
    description: task.description,
    priority: task.priority,
  }
  showEditTask.value = true
}

async function saveEditTask() {
  if (!editingTaskId.value || !editForm.value.title.trim()) return
  await updateTask(editingTaskId.value, {
    title: editForm.value.title.trim(),
    description: editForm.value.description,
    priority: editForm.value.priority as any,
  })
  showEditTask.value = false
  editingTaskId.value = null
}

onMounted(() => {
  subProjects()
  subTasks()
})
</script>
