<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <Logo size="lg" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Reset Password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email or phone to reset your password
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-card sm:rounded-3xl sm:px-10 border border-gray-100">
        
        <div v-if="success" class="text-center">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <i class="fas fa-check"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
          <p class="text-sm text-gray-500 mb-6">
            We've sent a temporary password to your email or phone number.
          </p>
          <AppButton block @click="$router.push('/login')">
            Return to Sign In
          </AppButton>
        </div>

        <form v-else class="space-y-6" @submit.prevent="handleReset">
          <div class="form-group">
            <label for="identifier" class="label">Email or Phone Number</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
              <input 
                id="identifier" 
                v-model="identifier" 
                type="text" 
                required 
                class="input pl-11" 
                placeholder="john@example.com"
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <AppButton type="submit" block size="lg" :loading="loading">
              Send Reset Link
            </AppButton>
          </div>
          
          <div class="text-center mt-4">
            <router-link to="/login" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              <i class="fas fa-arrow-left mr-1"></i> Back to sign in
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { API } from '@/stores/auth'
import Logo from '@/components/common/Logo.vue'
import AppButton from '@/components/common/AppButton.vue'

const toast = inject('toast')
const identifier = ref('')
const loading = ref(false)
const success = ref(false)

const handleReset = async () => {
  if (!identifier.value) return
  
  loading.value = true
  try {
    // Calling the endpoint we built in Phase 3
    await API.post('/auth/forgot-password', { identifier: identifier.value })
    success.value = true
    toast.success('Password reset instructions sent')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to send reset link')
  } finally {
    loading.value = false
  }
}
</script>
