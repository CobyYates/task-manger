import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// ── Theme Definitions ──────────────────────────────────────────────

const themes = {
  // ─── Dark Themes ───────────────────────────────────────────────

  midnight: {
    dark: true,
    colors: {
      primary: '#6C63FF',
      secondary: '#03DAC6',
      accent: '#FF6B6B',
      background: '#121218',
      surface: '#1E1E2E',
      'surface-variant': '#252538',
      'on-background': '#E1E1E6',
      'on-surface': '#E1E1E6',
      error: '#CF6679',
      success: '#4CAF50',
      warning: '#FFB74D',
      info: '#64B5F6',
    },
  },

  ocean: {
    dark: true,
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#F472B6',
      background: '#0B1120',
      surface: '#111B2E',
      'surface-variant': '#172033',
      'on-background': '#CBD5E1',
      'on-surface': '#CBD5E1',
      error: '#F87171',
      success: '#34D399',
      warning: '#FBBF24',
      info: '#38BDF8',
    },
  },

  ember: {
    dark: true,
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FACC15',
      background: '#1A1008',
      surface: '#261C10',
      'surface-variant': '#302418',
      'on-background': '#E8D5C0',
      'on-surface': '#E8D5C0',
      error: '#EF4444',
      success: '#84CC16',
      warning: '#FACC15',
      info: '#FB923C',
    },
  },

  forest: {
    dark: true,
    colors: {
      primary: '#22C55E',
      secondary: '#4ADE80',
      accent: '#A78BFA',
      background: '#0A1410',
      surface: '#12201A',
      'surface-variant': '#1A2E24',
      'on-background': '#C6E0D2',
      'on-surface': '#C6E0D2',
      error: '#F87171',
      success: '#4ADE80',
      warning: '#FBBF24',
      info: '#67E8F9',
    },
  },

  // ─── Light Themes ──────────────────────────────────────────────

  clean: {
    dark: false,
    colors: {
      primary: '#6C63FF',
      secondary: '#03DAC6',
      accent: '#FF6B6B',
      background: '#F5F5FA',
      surface: '#FFFFFF',
      'surface-variant': '#F0F0F8',
      'on-background': '#1A1A2E',
      'on-surface': '#1A1A2E',
      error: '#B00020',
      success: '#4CAF50',
      warning: '#FB8C00',
      info: '#1976D2',
    },
  },

  blossom: {
    dark: false,
    colors: {
      primary: '#E84393',
      secondary: '#FD79A8',
      accent: '#A29BFE',
      background: '#FFF5F9',
      surface: '#FFFFFF',
      'surface-variant': '#FFEEF5',
      'on-background': '#2D1F2B',
      'on-surface': '#2D1F2B',
      error: '#E84393',
      success: '#55EFC4',
      warning: '#FDCB6E',
      info: '#74B9FF',
    },
  },

  lavender: {
    dark: false,
    colors: {
      primary: '#7C3AED',
      secondary: '#A78BFA',
      accent: '#F472B6',
      background: '#F5F3FF',
      surface: '#FFFFFF',
      'surface-variant': '#EDE9FE',
      'on-background': '#1E1B3A',
      'on-surface': '#1E1B3A',
      error: '#DC2626',
      success: '#10B981',
      warning: '#F59E0B',
      info: '#818CF8',
    },
  },

  sand: {
    dark: false,
    colors: {
      primary: '#B45309',
      secondary: '#D97706',
      accent: '#DC2626',
      background: '#FEFBF4',
      surface: '#FFFFFF',
      'surface-variant': '#FEF3E2',
      'on-background': '#292018',
      'on-surface': '#292018',
      error: '#DC2626',
      success: '#65A30D',
      warning: '#D97706',
      info: '#0284C7',
    },
  },

  sky: {
    dark: false,
    colors: {
      primary: '#0284C7',
      secondary: '#0EA5E9',
      accent: '#F43F5E',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      'surface-variant': '#E0F2FE',
      'on-background': '#0C2D48',
      'on-surface': '#0C2D48',
      error: '#E11D48',
      success: '#059669',
      warning: '#D97706',
      info: '#0EA5E9',
    },
  },

  // ─── Specialty Dark Themes ─────────────────────────────────────

  rose: {
    dark: true,
    colors: {
      primary: '#FB7185',
      secondary: '#FDA4AF',
      accent: '#C084FC',
      background: '#1A0A10',
      surface: '#28121C',
      'surface-variant': '#351A26',
      'on-background': '#F2D5DD',
      'on-surface': '#F2D5DD',
      error: '#FB7185',
      success: '#6EE7B7',
      warning: '#FCD34D',
      info: '#93C5FD',
    },
  },

  slate: {
    dark: true,
    colors: {
      primary: '#94A3B8',
      secondary: '#64748B',
      accent: '#38BDF8',
      background: '#0F172A',
      surface: '#1E293B',
      'surface-variant': '#283548',
      'on-background': '#CBD5E1',
      'on-surface': '#CBD5E1',
      error: '#F87171',
      success: '#4ADE80',
      warning: '#FCD34D',
      info: '#38BDF8',
    },
  },
}

// Theme metadata for the picker UI
export const themeOptions: Array<{
  id: string
  name: string
  icon: string
  dark: boolean
  preview: { primary: string; background: string; surface: string }
}> = [
  { id: 'midnight', name: 'Midnight', icon: 'mdi-weather-night', dark: true, preview: { primary: '#6C63FF', background: '#121218', surface: '#1E1E2E' } },
  { id: 'ocean', name: 'Ocean', icon: 'mdi-waves', dark: true, preview: { primary: '#0EA5E9', background: '#0B1120', surface: '#111B2E' } },
  { id: 'ember', name: 'Ember', icon: 'mdi-fire', dark: true, preview: { primary: '#F97316', background: '#1A1008', surface: '#261C10' } },
  { id: 'forest', name: 'Forest', icon: 'mdi-pine-tree', dark: true, preview: { primary: '#22C55E', background: '#0A1410', surface: '#12201A' } },
  { id: 'rose', name: 'Rose', icon: 'mdi-flower-tulip', dark: true, preview: { primary: '#FB7185', background: '#1A0A10', surface: '#28121C' } },
  { id: 'slate', name: 'Slate', icon: 'mdi-circle-half-full', dark: true, preview: { primary: '#94A3B8', background: '#0F172A', surface: '#1E293B' } },
  { id: 'clean', name: 'Clean', icon: 'mdi-white-balance-sunny', dark: false, preview: { primary: '#6C63FF', background: '#F5F5FA', surface: '#FFFFFF' } },
  { id: 'blossom', name: 'Blossom', icon: 'mdi-flower', dark: false, preview: { primary: '#E84393', background: '#FFF5F9', surface: '#FFFFFF' } },
  { id: 'lavender', name: 'Lavender', icon: 'mdi-spa', dark: false, preview: { primary: '#7C3AED', background: '#F5F3FF', surface: '#FFFFFF' } },
  { id: 'sand', name: 'Sand', icon: 'mdi-weather-sunny', dark: false, preview: { primary: '#B45309', background: '#FEFBF4', surface: '#FFFFFF' } },
  { id: 'sky', name: 'Sky', icon: 'mdi-cloud', dark: false, preview: { primary: '#0284C7', background: '#F0F9FF', surface: '#FFFFFF' } },
]

export default defineNuxtPlugin((nuxtApp) => {
  // Read saved theme from localStorage before Vuetify initializes
  const savedTheme = import.meta.client
    ? (localStorage.getItem('tm-theme') || 'midnight')
    : 'midnight'

  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: savedTheme,
      themes,
    },
    defaults: {
      VCard: {
        rounded: 'lg',
        elevation: 0,
      },
      VBtn: {
        rounded: 'lg',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VChip: {
        rounded: 'lg',
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
