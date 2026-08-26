<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <Logo size="lg" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Join the NYSC community platform
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
      <div class="bg-white py-8 px-4 shadow-card sm:rounded-3xl sm:px-10 border border-gray-100">
        
        <!-- Step Indicators -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div v-for="s in 3" :key="s" class="flex flex-col items-center relative z-10 flex-1">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              ]">
                {{ s }}
              </div>
              <span class="text-xs mt-2 font-medium" :class="step >= s ? 'text-primary-700' : 'text-gray-400'">
                {{ s === 1 ? 'Personal' : s === 2 ? 'NYSC Info' : 'Security' }}
              </span>
            </div>
          </div>
          <div class="relative -mt-8 mb-8 z-0 px-[16.66%]">
            <div class="h-1 bg-gray-200 rounded-full w-full">
              <div class="h-1 bg-primary-600 rounded-full transition-all duration-300" :style="`width: ${(step - 1) * 50}%`"></div>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitForm">
          
          <!-- Step 1: Personal Info -->
          <div v-show="step === 1" class="space-y-5 animate-fade-in">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="label">First Name *</label>
                <input v-model="form.first_name" type="text" required class="input" placeholder="John" />
              </div>
              <div class="form-group">
                <label class="label">Last Name *</label>
                <input v-model="form.last_name" type="text" required class="input" placeholder="Doe" />
              </div>
            </div>
            
            <div class="form-group">
              <label class="label">Email Address *</label>
              <input v-model="form.email" type="email" required class="input" placeholder="john@example.com" />
            </div>
            
            <div class="form-group">
              <label class="label">Phone Number *</label>
              <input v-model="form.phone" type="tel" required class="input" placeholder="08012345678" />
            </div>
          </div>

          <!-- Step 2: NYSC Info -->
          <div v-show="step === 2" class="space-y-5 animate-fade-in">
            <div class="form-group">
              <label class="label">Serving State *</label>
              <select v-model="form.serving_state_id" required class="input bg-white h-[48px]">
                <option value="" disabled>Select State</option>
                <!-- Hardcoded for MVP UI, ideally fetched from DB -->
                <option value="25">Lagos</option>
                <option value="15">FCT Abuja</option>
                <option value="33">Rivers</option>
                <option value="28">Ogun</option>
                <option value="31">Oyo</option>
                <option value="0" disabled>---</option>
                <option value="1">Abia</option>
                <option value="2">Adamawa</option>
                <option value="3">Akwa Ibom</option>
                <option value="4">Anambra</option>
                <option value="5">Bauchi</option>
                <option value="6">Bayelsa</option>
                <option value="7">Benue</option>
                <option value="8">Borno</option>
                <option value="9">Cross River</option>
                <option value="10">Delta</option>
                <option value="11">Ebonyi</option>
                <option value="12">Edo</option>
                <option value="13">Ekiti</option>
                <option value="14">Enugu</option>
                <option value="16">Gombe</option>
                <option value="17">Imo</option>
                <option value="18">Jigawa</option>
                <option value="19">Kaduna</option>
                <option value="20">Kano</option>
                <option value="21">Katsina</option>
                <option value="22">Kebbi</option>
                <option value="23">Kogi</option>
                <option value="24">Kwara</option>
                <option value="26">Nasarawa</option>
                <option value="27">Niger</option>
                <option value="29">Ondo</option>
                <option value="30">Osun</option>
                <option value="32">Plateau</option>
                <option value="34">Sokoto</option>
                <option value="35">Taraba</option>
                <option value="36">Yobe</option>
                <option value="37">Zamfara</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="label">NYSC State Code</label>
              <input v-model="form.nysc_state_code" type="text" class="input uppercase" placeholder="LA/25C/1234" />
              <p class="input-hint">Leave blank if you are a PCM (Before NYSC)</p>
            </div>
            
            <div class="form-group">
              <label class="label">LGA</label>
              <input v-model="form.lga" type="text" class="input" placeholder="e.g. Ikeja" />
            </div>
          </div>

          <!-- Step 3: Security -->
          <div v-show="step === 3" class="space-y-5 animate-fade-in">
            <div class="form-group">
              <label class="label">Password *</label>
              <input v-model="form.password" type="password" required minlength="8" class="input" placeholder="••••••••" />
              <p class="input-hint">Must be at least 8 characters</p>
            </div>
            
            <div class="form-group">
              <label class="label">Confirm Password *</label>
              <input v-model="form.confirm_password" type="password" required minlength="8" class="input" placeholder="••••••••" />
              <p v-if="passwordMismatch" class="error-msg">Passwords do not match</p>
            </div>
          </div>

          <!-- Navigation -->
          <div class="mt-8 flex gap-4">
            <AppButton v-if="step > 1" type="button" variant="outline" class="flex-1" @click="step--" :disabled="loading">
              Back
            </AppButton>
            
            <AppButton v-if="step < 3" type="button" class="flex-1" @click="validateStepAndNext">
              Continue
            </AppButton>
            
            <AppButton v-if="step === 3" type="submit" class="flex-1" :loading="loading" :disabled="passwordMismatch">
              Create Account
            </AppButton>
          </div>
        </form>

        <div class="mt-8 text-center text-sm">
          <span class="text-gray-500">Already have an account?</span>
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 ml-1">
            Sign in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/common/Logo.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')

const step = ref(1)
const loading = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  serving_state_id: '',
  nysc_state_code: '',
  lga: '',
  password: '',
  confirm_password: ''
})

const passwordMismatch = computed(() => {
  return form.value.password && form.value.confirm_password && form.value.password !== form.value.confirm_password
})

const validateStepAndNext = () => {
  if (step.value === 1) {
    if (!form.value.first_name || !form.value.last_name || (!form.value.email && !form.value.phone)) {
      toast.error('Please fill in all required fields')
      return
    }
  }
  if (step.value === 2) {
    if (!form.value.serving_state_id) {
      toast.error('Please select a serving state')
      return
    }
  }
  step.value++
}

const submitForm = async () => {
  if (passwordMismatch.value) return
  
  loading.value = true
  try {
    // Convert state ID to number
    const payload = { ...form.value }
    payload.serving_state_id = parseInt(payload.serving_state_id)
    
    await authStore.register(payload)
    toast.success('Account created successfully!')
    router.push('/')
  } catch (err) {
    let errMsg = 'Registration failed. Please try again.'
    if (err.response?.data?.error) errMsg = err.response.data.error
    if (err.response?.data?.errors) {
      errMsg = Object.values(err.response.data.errors)[0]
    }
    toast.error(errMsg)
  } finally {
    loading.value = false
  }
}
</script>
