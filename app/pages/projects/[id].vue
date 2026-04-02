<template>
  <div v-if="project">
    <!-- Header -->
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" class="mr-2" @click="navigateTo('/projects')" />
      <v-avatar :color="project.color" size="40" rounded="lg" class="mr-3">
        <v-icon color="white">{{ getCategoryIcon(project.category) }}</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <h1 class="text-h5 font-weight-bold">{{ project.name }}</h1>
        <div class="d-flex ga-2 align-center mt-1">
          <v-chip size="x-small" :color="project.color" variant="tonal">{{ project.category }}</v-chip>
          <v-chip size="x-small" :color="getStatusColor(project.status)" variant="tonal">{{ project.status }}</v-chip>
          <span class="text-caption text-medium-emphasis">· Updated {{ formatRelative(project.updatedAt) }}</span>
        </div>
      </div>
      <v-btn-group variant="tonal" density="comfortable" divided>
        <v-btn icon="mdi-pencil" @click="showEditProject = true" />
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" v-bind="menuProps" />
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="s in statuses"
              :key="s.value"
              :prepend-icon="s.icon"
              :title="s.label"
              @click="changeStatus(s.value)"
            />
          </v-list>
        </v-menu>
      </v-btn-group>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6">
      <v-tab value="notes">
        <v-icon start>mdi-note-text-outline</v-icon>
        Notes ({{ notes.length }})
      </v-tab>
      <v-tab value="tasks">
        <v-icon start>mdi-checkbox-marked-circle-outline</v-icon>
        Tasks ({{ openTasks.length }} open)
      </v-tab>
    </v-tabs>

    <!-- Notes Tab -->
    <div v-if="activeTab === 'notes'">
      <!-- Quick Add Note -->
      <v-card color="surface" class="pa-4 mb-4">
        <v-form @submit.prevent="handleAddNote">
          <RichTextEditor
            v-model="newNote"
            placeholder="Add a note, update, insight, or decision..."
            compact
            class="mb-3"
          />
          <div class="d-flex align-center ga-2">
            <v-chip-group v-model="newNoteType" mandatory selected-class="text-primary">
              <v-chip v-for="t in noteTypes" :key="t.value" :value="t.value" size="small" variant="tonal" filter>
                <v-icon start size="16">{{ t.icon }}</v-icon>
                {{ t.label }}
              </v-chip>
            </v-chip-group>
            <v-spacer />
            <v-btn type="submit" color="primary" size="small" :disabled="isNoteEmpty(newNote)">
              <v-icon start>mdi-plus</v-icon> Add
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <!-- Notes List -->
      <div v-if="notes.length">
        <TransitionGroup name="note-list" tag="div">
          <v-card
            v-for="note in sortedNotes"
            :key="note.id"
            color="surface"
            class="pa-4 mb-3"
            :class="{ 'border-s-lg': true }"
            :style="{ borderLeftColor: getNoteColor(note.type) }"
          >
            <div class="d-flex align-center mb-2">
              <v-chip size="x-small" :color="getNoteColor(note.type)" variant="tonal">
                <v-icon start size="12">{{ getNoteIcon(note.type) }}</v-icon>
                {{ note.type }}
              </v-chip>
              <v-spacer />
              <span class="text-caption text-medium-emphasis">
                {{ formatDateTime(note.createdAt) }}
              </span>
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn icon="mdi-dots-vertical" variant="text" size="x-small" v-bind="menuProps" class="ml-1" />
                </template>
                <v-list density="compact">
                  <v-list-item
                    :prepend-icon="note.pinned ? 'mdi-pin-off' : 'mdi-pin'"
                    :title="note.pinned ? 'Unpin' : 'Pin'"
                    @click="togglePin(note)"
                  />
                  <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="startEditNote(note)" />
                  <v-list-item prepend-icon="mdi-delete" title="Delete" class="text-error" @click="handleDeleteNote(note.id)" />
                </v-list>
              </v-menu>
            </div>
            <div v-if="editingNoteId === note.id">
              <RichTextEditor v-model="editingNoteContent" compact class="mb-2" />
              <div class="d-flex ga-2 justify-end">
                <v-btn size="small" variant="text" @click="editingNoteId = null">Cancel</v-btn>
                <v-btn size="small" color="primary" @click="saveEditNote(note.id)">Save</v-btn>
              </div>
            </div>
            <div v-else class="rich-content text-body-2" v-html="note.content" />
            <v-icon v-if="note.pinned" size="14" color="primary" class="mt-2">mdi-pin</v-icon>
          </v-card>
        </TransitionGroup>
      </div>
      <v-card v-else color="surface" class="pa-8 text-center">
        <v-icon size="48" color="primary" class="mb-4">mdi-note-plus-outline</v-icon>
        <p class="text-body-2 text-medium-emphasis">No notes yet. Add your first note above.</p>
      </v-card>
    </div>

    <!-- Tasks Tab -->
    <div v-if="activeTab === 'tasks'">
      <!-- Quick Add Task -->
      <v-card color="surface" class="pa-4 mb-4">
        <v-form @submit.prevent="handleAddTask">
          <v-row density="comfortable">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="newTaskTitle"
                placeholder="New task..."
                hide-details
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="newTaskPriority"
                :items="priorities"
                hide-details
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-btn type="submit" color="primary" block :disabled="!newTaskTitle.trim()" class="h-100">
                <v-icon start>mdi-plus</v-icon> Add Task
              </v-btn>
            </v-col>
          </v-row>
          <v-expand-transition>
            <div v-if="showNewTaskDesc" class="mt-3">
              <RichTextEditor v-model="newTaskDesc" placeholder="Add details, images, formatting..." compact />
            </div>
          </v-expand-transition>
          <div class="mt-2">
            <v-btn
              variant="text"
              size="x-small"
              :prepend-icon="showNewTaskDesc ? 'mdi-chevron-up' : 'mdi-text-box-plus-outline'"
              @click="showNewTaskDesc = !showNewTaskDesc"
            >
              {{ showNewTaskDesc ? 'Hide details' : 'Add details' }}
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <!-- Open Tasks -->
      <h3 v-if="openTasks.length" class="text-subtitle-1 font-weight-bold mb-3">
        Open ({{ openTasks.length }})
      </h3>
      <v-card v-if="openTasks.length" color="surface" class="mb-6">
        <TransitionGroup name="task-list" tag="div" class="v-list bg-transparent">
          <div v-for="task in openTasks" :key="task.id" class="task-item">
            <v-list-item>
              <template #prepend>
                <v-checkbox
                  :model-value="false"
                  :color="getPriorityColor(task.priority)"
                  @update:model-value="markDone(task)"
                />
              </template>
              <v-list-item-title class="font-weight-medium d-flex align-center ga-2">
                {{ task.title }}
                <v-chip
                  v-if="task.description"
                  size="x-small"
                  variant="tonal"
                  :prepend-icon="expandedTask === task.id ? 'mdi-chevron-up' : 'mdi-text-box-outline'"
                  class="cursor-pointer"
                  @click.stop="expandedTask = expandedTask === task.id ? null : task.id"
                >
                  {{ expandedTask === task.id ? 'Hide' : 'Details' }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" :color="getPriorityColor(task.priority)" variant="tonal" class="mr-1">
                  {{ task.priority }}
                </v-chip>
                <span v-if="task.status === 'in-progress'">
                  <v-chip size="x-small" color="info" variant="tonal">in progress</v-chip>
                </span>
                <span class="text-medium-emphasis ml-1">· {{ formatDateTime(task.createdAt) }}</span>
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex ga-1">
                  <v-btn
                    icon="mdi-pencil-outline"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    title="Edit"
                    @click="openEditTask(task)"
                  />
                  <v-btn
                    v-if="task.status === 'todo'"
                    icon="mdi-play-circle-outline"
                    size="x-small"
                    variant="tonal"
                    color="info"
                    title="Start"
                    @click="startTask(task)"
                  />
                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    variant="tonal"
                    color="error"
                    title="Delete"
                    @click="handleDeleteTask(task.id)"
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

      <!-- Completed Tasks -->
      <h3 v-if="completedTasks.length" class="text-subtitle-1 font-weight-bold mb-3">
        Completed ({{ completedTasks.length }})
      </h3>
      <v-card v-if="completedTasks.length" color="surface">
        <TransitionGroup name="task-list" tag="div" class="v-list bg-transparent">
          <div v-for="task in completedTasks" :key="task.id" class="task-item">
            <v-list-item>
              <template #prepend>
                <v-checkbox
                  :model-value="true"
                  color="success"
                  @update:model-value="reopenTask(task)"
                />
              </template>
              <v-list-item-title class="text-decoration-line-through text-medium-emphasis">
                {{ task.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Completed {{ formatDateTime(task.completedAt!) }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="tonal"
                  color="error"
                  title="Delete"
                  @click="handleDeleteTask(task.id)"
                />
              </template>
            </v-list-item>
            <v-divider />
          </div>
        </TransitionGroup>
      </v-card>

      <v-card v-if="!openTasks.length && !completedTasks.length" color="surface" class="pa-8 text-center">
        <v-icon size="48" color="primary" class="mb-4">mdi-checkbox-marked-circle-plus-outline</v-icon>
        <p class="text-body-2 text-medium-emphasis">No tasks yet. Add your first task above.</p>
      </v-card>
    </div>

    <ProjectDialog v-model="showEditProject" :project="project" @updated="showEditProject = false" />

    <!-- Edit Task Dialog -->
    <v-dialog v-model="showEditTask" max-width="640">
      <v-card class="pa-6" color="surface">
        <v-card-title class="text-h6 font-weight-bold pa-0 mb-4">Edit Task</v-card-title>
        <v-text-field
          v-model="editTaskForm.title"
          label="Title"
          class="mb-3"
        />
        <v-select
          v-model="editTaskForm.priority"
          :items="priorities"
          label="Priority"
          class="mb-3"
        />
        <label class="text-body-2 text-medium-emphasis d-block mb-2">Description</label>
        <RichTextEditor v-model="editTaskForm.description" placeholder="Add details, images, formatting..." />
        <div class="d-flex ga-2 justify-end mt-4">
          <v-btn variant="text" @click="showEditTask = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!editTaskForm.title.trim()" @click="saveEditTask">Save</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
  <div v-else class="text-center pa-12">
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>

<script setup lang="ts">
import type { Note, NoteType } from '~/composables/useNotes'
import type { Task, TaskPriority } from '~/composables/useTasks'

definePageMeta({})

const route = useRoute()
const projectId = computed(() => route.params.id as string)

const { projects, subscribe: subProjects, updateProject } = useProjects()
const { notes, subscribe: subNotes, addNote, updateNote, deleteNote } = useNotes(projectId)
const { openTasks, completedTasks, subscribe: subTasks, addTask, updateTask, deleteTask } = useTasks(projectId)

const project = computed(() => projects.value.find((p) => p.id === projectId.value))

const activeTab = ref('notes')
const showEditProject = ref(false)

// Notes
const newNote = ref('')
const newNoteType = ref<NoteType>('note')
const editingNoteId = ref<string | null>(null)
const editingNoteContent = ref('')

const noteTypes = [
  { label: 'Note', value: 'note', icon: 'mdi-note-text' },
  { label: 'Update', value: 'update', icon: 'mdi-update' },
  { label: 'Insight', value: 'insight', icon: 'mdi-lightbulb' },
  { label: 'Decision', value: 'decision', icon: 'mdi-gavel' },
  { label: 'Risk', value: 'risk', icon: 'mdi-alert' },
]

const sortedNotes = computed(() => {
  const pinned = notes.value.filter((n) => n.pinned)
  const unpinned = notes.value.filter((n) => !n.pinned)
  return [...pinned, ...unpinned]
})

function isNoteEmpty(html: string) {
  const text = html.replace(/<[^>]*>/g, '').trim()
  return text.length === 0
}

async function handleAddNote() {
  if (isNoteEmpty(newNote.value)) return
  await addNote({ content: newNote.value, type: newNoteType.value })
  newNote.value = ''
}

async function togglePin(note: Note) {
  await updateNote(note.id, { pinned: !note.pinned })
}

function startEditNote(note: Note) {
  editingNoteId.value = note.id
  editingNoteContent.value = note.content
}

async function saveEditNote(id: string) {
  await updateNote(id, { content: editingNoteContent.value })
  editingNoteId.value = null
}

async function handleDeleteNote(id: string) {
  await deleteNote(id)
}

// Tasks
const newTaskTitle = ref('')
const newTaskPriority = ref<TaskPriority>('medium')
const newTaskDesc = ref('')
const showNewTaskDesc = ref(false)
const expandedTask = ref<string | null>(null)
const showEditTask = ref(false)
const editingTaskId = ref<string | null>(null)
const editTaskForm = ref({ title: '', description: '', priority: 'medium' as string })

const priorities = [
  { title: 'Urgent', value: 'urgent' },
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' },
]

async function handleAddTask() {
  if (!newTaskTitle.value.trim()) return
  await addTask({ title: newTaskTitle.value.trim(), description: newTaskDesc.value, priority: newTaskPriority.value })
  newTaskTitle.value = ''
  newTaskDesc.value = ''
  showNewTaskDesc.value = false
}

function openEditTask(task: Task) {
  editingTaskId.value = task.id
  editTaskForm.value = {
    title: task.title,
    description: task.description,
    priority: task.priority,
  }
  showEditTask.value = true
}

async function saveEditTask() {
  if (!editingTaskId.value || !editTaskForm.value.title.trim()) return
  await updateTask(editingTaskId.value, {
    title: editTaskForm.value.title.trim(),
    description: editTaskForm.value.description,
    priority: editTaskForm.value.priority as TaskPriority,
  })
  showEditTask.value = false
  editingTaskId.value = null
}

async function markDone(task: Task) {
  await updateTask(task.id, { status: 'done' })
}

async function reopenTask(task: Task) {
  await updateTask(task.id, { status: 'todo' })
}

async function startTask(task: Task) {
  await updateTask(task.id, { status: 'in-progress' })
}

async function handleDeleteTask(id: string) {
  await deleteTask(id)
}

// Project
const statuses = [
  { label: 'Active', value: 'active', icon: 'mdi-play-circle' },
  { label: 'On Hold', value: 'on-hold', icon: 'mdi-pause-circle' },
  { label: 'Completed', value: 'completed', icon: 'mdi-check-circle' },
  { label: 'Archived', value: 'archived', icon: 'mdi-archive' },
]

async function changeStatus(status: string) {
  await updateProject(projectId.value, { status: status as any })
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = { vendor: 'mdi-handshake', contract: 'mdi-file-sign', project: 'mdi-clipboard-text', other: 'mdi-folder' }
  return icons[cat] || icons.other
}

function getStatusColor(s: string) {
  const colors: Record<string, string> = { active: 'success', 'on-hold': 'warning', completed: 'info', archived: 'grey' }
  return colors[s] || 'grey'
}

function getPriorityColor(p: string) {
  const colors: Record<string, string> = { urgent: 'error', high: 'warning', medium: 'info', low: 'success' }
  return colors[p] || 'info'
}

function getNoteColor(type: string) {
  const colors: Record<string, string> = { note: 'primary', update: 'info', insight: 'warning', decision: 'success', risk: 'error' }
  return colors[type] || 'primary'
}

function getNoteIcon(type: string) {
  const icons: Record<string, string> = { note: 'mdi-note-text', update: 'mdi-update', insight: 'mdi-lightbulb', decision: 'mdi-gavel', risk: 'mdi-alert' }
  return icons[type] || 'mdi-note-text'
}

function formatRelative(d: Date) {
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

onMounted(() => {
  subProjects()
  subNotes()
  subTasks()
})
</script>


