<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="pa-6" color="surface">
      <v-card-title class="text-h5 font-weight-bold pa-0 mb-4">
        {{ editing ? 'Edit Project' : 'New Project' }}
      </v-card-title>
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
        {{ error }}
      </v-alert>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.name"
          label="Project Name"
          placeholder="e.g. ACME Vendor Renewal"
          autofocus
          class="mb-2"
        />
        <v-textarea
          v-model="form.description"
          label="Description"
          placeholder="Brief description of this project..."
          rows="3"
          class="mb-2"
        />
        <v-select
          v-model="form.category"
          label="Category"
          :items="categories"
          class="mb-2"
        />
        <div class="mb-4">
          <label class="text-body-2 text-medium-emphasis d-block mb-2">Color</label>
          <div class="d-flex ga-2 flex-wrap">
            <v-avatar
              v-for="c in colors"
              :key="c"
              :color="c"
              size="32"
              class="cursor-pointer"
              :style="form.color === c ? 'outline: 2px solid white; outline-offset: 2px' : ''"
              @click="form.color = c"
            />
          </div>
        </div>
        <div class="d-flex ga-2 justify-end">
          <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
          <v-btn type="submit" color="primary" :loading="saving">
            {{ editing ? 'Save' : 'Create' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Project } from '~/composables/useProjects'

const props = defineProps<{
  modelValue: boolean
  project?: Project
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  created: []
  updated: []
}>()

const editing = computed(() => !!props.project)
const { addProject, updateProject } = useProjects()
const saving = ref(false)
const error = ref('')

const categories = [
  { title: 'Vendor Management', value: 'vendor' },
  { title: 'Contract Management', value: 'contract' },
  { title: 'Project Management', value: 'project' },
  { title: 'Other', value: 'other' },
]

const colors = ['#6C63FF', '#03DAC6', '#FF6B6B', '#FFB74D', '#4CAF50', '#64B5F6', '#E040FB', '#FF7043']

const form = ref({
  name: '',
  description: '',
  category: 'project' as Project['category'],
  color: '#6C63FF',
})

watch(() => props.modelValue, (open) => {
  if (open && props.project) {
    form.value = {
      name: props.project.name,
      description: props.project.description,
      category: props.project.category,
      color: props.project.color,
    }
  } else if (open) {
    form.value = { name: '', description: '', category: 'project', color: '#6C63FF' }
  }
})

async function handleSubmit() {
  if (!form.value.name.trim()) return
  saving.value = true
  error.value = ''
  try {
    if (editing.value && props.project) {
      await updateProject(props.project.id, form.value)
      emit('updated')
    } else {
      await addProject(form.value)
      emit('created')
    }
    emit('update:modelValue', false)
  } catch (e: any) {
    error.value = e.message || 'Failed to save project'
    console.error('ProjectDialog error:', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
