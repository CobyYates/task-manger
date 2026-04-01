<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Set initial background color from localStorage before first paint to prevent flash
if (import.meta.client) {
  const themeId = localStorage.getItem('tm-theme') || 'midnight'
  // Map theme IDs to their background colors for instant paint
  const bgColors: Record<string, string> = {
    midnight: '#121218',
    ocean: '#0B1120',
    ember: '#1A1008',
    forest: '#0A1410',
    rose: '#1A0A10',
    slate: '#0F172A',
    clean: '#F5F5FA',
    blossom: '#FFF5F9',
    lavender: '#F5F3FF',
    sand: '#FEFBF4',
    sky: '#F0F9FF',
  }
  document.documentElement.style.backgroundColor = bgColors[themeId] || bgColors.midnight
}
</script>
