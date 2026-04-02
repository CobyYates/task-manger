<template>
  <v-dialog v-model="open" max-width="560" @update:model-value="onDialogToggle">
    <template #activator="{ props: activatorProps }">
      <v-list-item
        v-bind="activatorProps"
        prepend-icon="mdi-palette-outline"
        title="Theme"
        rounded="lg"
        class="mb-1"
      />
    </template>

    <v-card class="pa-5" color="surface">
      <div class="d-flex align-center justify-space-between mb-4">
        <v-card-title class="text-h6 font-weight-bold pa-0">Choose a Theme</v-card-title>
        <v-btn icon="mdi-close" variant="text" size="small" @click="cancel" />
      </div>

      <!-- Dark Themes -->
      <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase mb-2">Dark</div>
      <v-row density="comfortable" class="mb-4">
        <v-col
          v-for="t in darkThemes"
          :key="t.id"
          cols="6"
          sm="4"
        >
          <div
            class="theme-card"
            :class="{ 'theme-card--active': previewThemeId === t.id }"
            @click="previewTheme(t.id)"
          >
            <div
              class="theme-preview"
              :style="{ background: t.preview.background }"
            >
              <div class="theme-preview__sidebar" :style="{ background: t.preview.surface }" />
              <div class="theme-preview__content">
                <div class="theme-preview__bar" :style="{ background: t.preview.primary }" />
                <div class="theme-preview__card" :style="{ background: t.preview.surface }" />
                <div class="theme-preview__card theme-preview__card--sm" :style="{ background: t.preview.surface }" />
              </div>
            </div>
            <div class="d-flex align-center ga-2 pa-2">
              <v-icon size="16" :color="previewThemeId === t.id ? 'primary' : undefined">{{ t.icon }}</v-icon>
              <span class="text-caption font-weight-medium">{{ t.name }}</span>
              <v-spacer />
              <v-icon v-if="previewThemeId === t.id" size="16" color="primary">mdi-check-circle</v-icon>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Light Themes -->
      <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase mb-2">Light</div>
      <v-row density="comfortable">
        <v-col
          v-for="t in lightThemes"
          :key="t.id"
          cols="6"
          sm="4"
        >
          <div
            class="theme-card"
            :class="{ 'theme-card--active': previewThemeId === t.id }"
            @click="previewTheme(t.id)"
          >
            <div
              class="theme-preview"
              :style="{ background: t.preview.background }"
            >
              <div class="theme-preview__sidebar" :style="{ background: t.preview.surface, borderRight: '1px solid rgba(0,0,0,0.08)' }" />
              <div class="theme-preview__content">
                <div class="theme-preview__bar" :style="{ background: t.preview.primary }" />
                <div class="theme-preview__card" :style="{ background: t.preview.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }" />
                <div class="theme-preview__card theme-preview__card--sm" :style="{ background: t.preview.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }" />
              </div>
            </div>
            <div class="d-flex align-center ga-2 pa-2">
              <v-icon size="16" :color="previewThemeId === t.id ? 'primary' : undefined">{{ t.icon }}</v-icon>
              <span class="text-caption font-weight-medium">{{ t.name }}</span>
              <v-spacer />
              <v-icon v-if="previewThemeId === t.id" size="16" color="primary">mdi-check-circle</v-icon>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Actions -->
      <div class="d-flex align-center justify-end ga-2 mt-5">
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="previewThemeId === savedThemeId"
          :loading="saving"
          @click="save"
        >
          Save
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { themeOptions } from '~/plugins/vuetify'

const theme = useTheme()
const { currentThemeId, saveTheme } = useThemeStore()

const open = ref(false)
const saving = ref(false)
const previewThemeId = ref(currentThemeId.value)
const savedThemeId = ref(currentThemeId.value)

const darkThemes = themeOptions.filter((t) => t.dark)
const lightThemes = themeOptions.filter((t) => !t.dark)

function onDialogToggle(isOpen: boolean) {
  if (isOpen) {
    savedThemeId.value = currentThemeId.value
    previewThemeId.value = currentThemeId.value
  }
}

function previewTheme(id: string) {
  previewThemeId.value = id
  theme.change(id)
}

async function save() {
  saving.value = true
  try {
    await saveTheme(previewThemeId.value)
    savedThemeId.value = previewThemeId.value
    open.value = false
  } finally {
    saving.value = false
  }
}

function cancel() {
  // Revert to the saved theme
  theme.change(savedThemeId.value)
  previewThemeId.value = savedThemeId.value
  open.value = false
}
</script>

<style scoped lang="scss">
.theme-card {
  border-radius: 10px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(var(--v-theme-surface-variant), 0.3);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.4);
    transform: translateY(-1px);
  }

  &--active {
    border-color: rgb(var(--v-theme-primary));
  }
}

.theme-preview {
  height: 64px;
  display: flex;
  padding: 0;
  position: relative;
  overflow: hidden;

  &__sidebar {
    width: 20%;
    min-width: 20%;
    height: 100%;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__content {
    flex: 1;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__bar {
    height: 6px;
    width: 60%;
    border-radius: 3px;
  }

  &__card {
    height: 10px;
    width: 100%;
    border-radius: 3px;

    &--sm {
      width: 75%;
    }
  }
}
</style>
