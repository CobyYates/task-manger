<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-8" width="440" color="surface">
      <div class="text-center mb-6">
        <v-icon color="primary" size="48" class="mb-4">mdi-checkbox-marked-circle-outline</v-icon>
        <h1 class="text-h4 font-weight-bold">Create Account</h1>
        <p class="text-body-2 text-medium-emphasis mt-2">Get organized in minutes</p>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
        {{ error }}
      </v-alert>

      <v-form @submit.prevent="handleRegister">
        <v-text-field
          v-model="displayName"
          label="Full Name"
          prepend-inner-icon="mdi-account-outline"
          class="mb-2"
          :disabled="submitting"
        />
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
          hint="At least 6 characters"
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
          Create Account
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
        Already have an account?
        <NuxtLink to="/login" class="text-primary font-weight-medium text-decoration-none">
          Sign In
        </NuxtLink>
      </p>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { signUp, signInWithGoogle } = useAuth()
const displayName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const submitting = ref(false)
const googleLoading = ref(false)

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

async function handleRegister() {
  if (!displayName.value || !email.value || !password.value) return
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await signUp(email.value, password.value, displayName.value)
    navigateTo('/')
  } catch (e: any) {
    error.value = e.code === 'auth/email-already-in-use'
      ? 'An account with this email already exists'
      : e.message || 'Registration failed'
  } finally {
    submitting.value = false
  }
}
</script>
