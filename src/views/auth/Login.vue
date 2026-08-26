<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <Logo size="lg" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Welcome back
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Sign in to your Kopa Connect account
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-card sm:rounded-3xl sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleLogin">
          
          <div class="form-group">
            <label for="identifier" class="label">Email, Phone, or State Code</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-user text-gray-400"></i>
              </div>
              <input 
                id="identifier" 
                v-model="form.identifier" 
                type="text" 
                required 
                class="input pl-11" 
                placeholder="e.g. LA/25C/1234"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="label">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input 
                id="password" 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                class="input pl-11 pr-11" 
                placeholder="••••••••"
                :disabled="loading"
              />
              <button 
                type="button"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded text-primary-600" />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <router-link to="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </router-link>
            </div>
          </div>

          <div>
            <AppButton type="submit" block size="lg" :loading="loading">
              Sign In
            </AppButton>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                New to Kopa Connect?
              </span>
            </div>
          </div>

          <div class="mt-6">
            <AppButton variant="outline" block size="lg" @click="$router.push('/register')" :disabled="loading">
              Create an account
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/common/Logo.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = inject('toast')

const loading = ref(false)
const showPassword = ref(false)
const form = ref({
  identifier: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.identifier || !form.value.password) return
  
  loading.value = true
  try {
    await authStore.login(form.value.identifier, form.value.password)
    toast.success('Welcome back!')
    
    // Redirect to intended page or home
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.')
  } finally {
    loading.value = false
  }
}
</script>
