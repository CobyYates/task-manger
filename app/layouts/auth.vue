<template>
  <v-app>
    <v-main class="d-flex align-center justify-center bg-background" style="min-height: 100vh">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
const { currentThemeId } = useThemeStore()

watch(currentThemeId, (id) => {
  if (theme.global.current.value.name !== id) {
    theme.change(id)
  }
}, { immediate: true })
</script>
