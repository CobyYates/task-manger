<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">Projects</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showDialog = true">New Project</v-btn>
    </div>

    <!-- Filter Chips -->
    <div class="d-flex ga-2 flex-wrap mb-6">
      <v-chip
        v-for="f in filters"
        :key="f.value"
        :color="activeFilter === f.value ? 'primary' : undefined"
        :variant="activeFilter === f.value ? 'flat' : 'tonal'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <template #append>
          <span class="ml-1 text-caption">({{ f.count }})</span>
        </template>
      </v-chip>
    </div>

    <v-row v-if="filteredProjects.length">
      <v-col v-for="project in filteredProjects" :key="project.id" cols="12" sm="6" md="4">
        <v-card
          color="surface"
          class="pa-5 h-100 project-card cursor-pointer"
          @click="navigateTo(`/projects/${project.id}`)"
        >
          <div class="d-flex align-center mb-3">
            <v-avatar :color="project.color" size="40" rounded="lg" class="mr-3">
              <v-icon color="white">{{ getCategoryIcon(project.category) }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-subtitle-1 font-weight-bold">{{ project.name }}</div>
              <div class="d-flex ga-2 mt-1">
                <v-chip size="x-small" :color="project.color" variant="tonal">{{ project.category }}</v-chip>
                <v-chip size="x-small" :color="getStatusColor(project.status)" variant="tonal">{{ project.status }}</v-chip>
              </div>
            </div>
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="menuProps" @click.stop />
              </template>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click.stop="editProject(project)" />
                <v-list-item prepend-icon="mdi-archive" title="Archive" @click.stop="archiveProject(project)" />
                <v-list-item prepend-icon="mdi-delete" title="Delete" class="text-error" @click.stop="confirmDelete(project)" />
              </v-list>
            </v-menu>
          </div>
          <p class="text-body-2 text-medium-emphasis two-line-clamp mb-3">
            {{ project.description || 'No description' }}
          </p>
          <div class="text-caption text-medium-emphasis">
            Updated {{ formatRelative(project.updatedAt) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-card v-else color="surface" class="pa-8 text-center">
      <v-icon size="48" color="primary" class="mb-4">mdi-folder-search-outline</v-icon>
      <h3 class="text-h6 mb-2">No projects found</h3>
      <p class="text-body-2 text-medium-emphasis">
        {{ activeFilter === 'all' ? 'Create your first project to get started.' : 'No projects match this filter.' }}
      </p>
    </v-card>

    <ProjectDialog v-model="showDialog" :project="editingProject" @created="showDialog = false" @updated="showDialog = false; editingProject = undefined" />

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card class="pa-6" color="surface">
        <v-card-title class="text-h6 font-weight-bold pa-0 mb-2">Delete Project?</v-card-title>
        <v-card-text class="pa-0 mb-4 text-body-2 text-medium-emphasis">
          This will permanently delete "{{ deletingProject?.name }}" and cannot be undone. Notes and tasks for this project will also be lost.
        </v-card-text>
        <div class="d-flex ga-2 justify-end">
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/composables/useProjects'

definePageMeta({})

const { projects, subscribe, updateProject, deleteProject } = useProjects()
const showDialog = ref(false)
const editingProject = ref<Project | undefined>()
const showDeleteConfirm = ref(false)
const deletingProject = ref<Project | undefined>()
const activeFilter = ref('all')

const filters = computed(() => [
  { label: 'All', value: 'all', count: projects.value.length },
  { label: 'Active', value: 'active', count: projects.value.filter((p) => p.status === 'active').length },
  { label: 'On Hold', value: 'on-hold', count: projects.value.filter((p) => p.status === 'on-hold').length },
  { label: 'Completed', value: 'completed', count: projects.value.filter((p) => p.status === 'completed').length },
  { label: 'Archived', value: 'archived', count: projects.value.filter((p) => p.status === 'archived').length },
])

const filteredProjects = computed(() =>
  activeFilter.value === 'all' ? projects.value : projects.value.filter((p) => p.status === activeFilter.value)
)

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = { vendor: 'mdi-handshake', contract: 'mdi-file-sign', project: 'mdi-clipboard-text', other: 'mdi-folder' }
  return icons[cat] || icons.other
}

function getStatusColor(s: string) {
  const colors: Record<string, string> = { active: 'success', 'on-hold': 'warning', completed: 'info', archived: 'grey' }
  return colors[s] || 'grey'
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

function editProject(p: Project) {
  editingProject.value = p
  showDialog.value = true
}

async function archiveProject(p: Project) {
  await updateProject(p.id, { status: 'archived' })
}

function confirmDelete(p: Project) {
  deletingProject.value = p
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (deletingProject.value) {
    await deleteProject(deletingProject.value.id)
  }
  showDeleteConfirm.value = false
  deletingProject.value = undefined
}

onMounted(() => subscribe())
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
.cursor-pointer { cursor: pointer; }
</style>
