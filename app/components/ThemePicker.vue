<template>
  <v-dialog v-model="open" max-width="560">
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
        <v-btn icon="mdi-close" variant="text" size="small" @click="open = false" />
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
            :class="{ 'theme-card--active': currentThemeId === t.id }"
            @click="selectTheme(t.id)"
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
              <v-icon size="16" :color="currentThemeId === t.id ? 'primary' : undefined">{{ t.icon }}</v-icon>
              <span class="text-caption font-weight-medium">{{ t.name }}</span>
              <v-spacer />
              <v-icon v-if="currentThemeId === t.id" size="16" color="primary">mdi-check-circle</v-icon>
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
            :class="{ 'theme-card--active': currentThemeId === t.id }"
            @click="selectTheme(t.id)"
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
              <v-icon size="16" :color="currentThemeId === t.id ? 'primary' : undefined">{{ t.icon }}</v-icon>
              <span class="text-caption font-weight-medium">{{ t.name }}</span>
              <v-spacer />
              <v-icon v-if="currentThemeId === t.id" size="16" color="primary">mdi-check-circle</v-icon>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { themeOptions } from '~/plugins/vuetify'

const theme = useTheme()
const { currentThemeId, saveTheme } = useThemeStore()

const open = ref(false)

const darkThemes = themeOptions.filter((t) => t.dark)
const lightThemes = themeOptions.filter((t) => !t.dark)

function selectTheme(id: string) {
  theme.change(id)
  saveTheme(id)
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
