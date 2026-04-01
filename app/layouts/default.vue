<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="surface"
      class="border-e"
    >
      <v-list-item
        :prepend-icon="rail ? 'mdi-menu' : undefined"
        class="pa-4"
        @click="rail = !rail"
      >
        <template v-if="!rail">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-icon color="primary" size="28" class="mr-2">mdi-checkbox-marked-circle-outline</v-icon>
              <span class="text-h6 font-weight-bold">TaskManager</span>
            </div>
            <v-btn icon="mdi-chevron-left" variant="text" size="small" @click.stop="rail = true" />
          </div>
        </template>
      </v-list-item>

      <v-divider />

      <v-list nav density="comfortable" class="px-2 mt-2">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          to="/"
          rounded="lg"
          class="mb-1"
        />
        <v-list-item
          prepend-icon="mdi-folder-multiple-outline"
          title="Projects"
          to="/projects"
          rounded="lg"
          class="mb-1"
        />
        <v-list-item
          prepend-icon="mdi-checkbox-marked-circle-outline"
          title="All Tasks"
          to="/tasks"
          rounded="lg"
          class="mb-1"
        />
        <v-list-item
          prepend-icon="mdi-calendar-today"
          title="Daily Summary"
          to="/daily"
          rounded="lg"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-divider class="mb-2" />
          <v-list nav density="comfortable" class="px-0">
            <ThemePicker />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Sign Out"
              rounded="lg"
              @click="handleSignOut"
            />
          </v-list>
          <div v-if="!rail" class="text-center text-caption text-medium-emphasis pa-2">
            {{ currentUser?.displayName || currentUser?.email }}
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const drawer = ref(true)
const rail = ref(false)
const theme = useTheme()
const { currentUser, signOut } = useAuth()
const { currentThemeId } = useThemeStore()

// Keep Vuetify theme in sync with store (handles Firestore load after page render)
watch(currentThemeId, (id) => {
  if (theme.global.current.value.name !== id) {
    theme.change(id)
  }
}, { immediate: true })

async function handleSignOut() {
  await signOut()
}
</script>
