<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-8" width="440" color="surface">
      <div class="text-center mb-6">
        <v-icon color="primary" size="48" class="mb-4">mdi-checkbox-marked-circle-outline</v-icon>
        <h1 class="text-h4 font-weight-bold">TaskManager</h1>
        <p class="text-body-2 text-medium-emphasis mt-2">Keep your projects organized</p>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
        {{ error }}
      </v-alert>

      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          class="mb-2"
          :disabled="submitting"
        />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          class="mb-4"
          :disabled="submitting"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="submitting"
        >
          Sign In
        </v-btn>
      </v-form>

      <div class="d-flex align-center my-6">
        <v-divider /><span class="mx-4 text-caption text-medium-emphasis">OR</span><v-divider />
      </div>

      <v-btn
        variant="outlined"
        size="large"
        block
        prepend-icon="mdi-google"
        :loading="googleLoading"
        @click="handleGoogle"
      >
        Continue with Google
      </v-btn>

      <p class="text-center mt-6 text-body-2">
        Don't have an account?
        <NuxtLink to="/register" class="text-primary font-weight-medium text-decoration-none">
          Sign Up
        </NuxtLink>
      </p>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { signIn, signInWithGoogle } = useAuth()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const submitting = ref(false)
const googleLoading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return
  submitting.value = true
  error.value = ''
  try {
    await signIn(email.value, password.value)
    navigateTo('/')
  } catch (e: any) {
    error.value = e.code === 'auth/invalid-credential'
      ? 'Invalid email or password'
      : e.message || 'Login failed'
  } finally {
    submitting.value = false
  }
}

async function handleGoogle() {
  googleLoading.value = true
  error.value = ''
  try {
    await signInWithGoogle()
    navigateTo('/')
  } catch (e: any) {
    if (e.code !== 'auth/popup-closed-by-user') {
      error.value = e.message || 'Google sign-in failed'
    }
  } finally {
    googleLoading.value = false
  }
}
</script>
