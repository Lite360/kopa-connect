<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50">
    <AppHeader title="Place of Primary Assignment" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <form @submit.prevent="handleSubmit" class="p-4 max-w-xl mx-auto space-y-5">
      <div class="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 class="font-bold text-gray-800">PPA Details</h3>
        
        <div class="form-group">
          <label class="label">PPA Name / Organization *</label>
          <input v-model="form.name" required class="input" placeholder="e.g. Government Secondary School, Ikeja" />
        </div>

        <div class="form-group">
          <label class="label">Category *</label>
          <select v-model="form.category" required class="input bg-white h-[48px]">
            <option value="Education">Education / School</option>
            <option value="Healthcare">Healthcare / Hospital</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Public Sector">Public Sector / Govt Agency</option>
            <option value="Private Sector">Private Sector / Business</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Address / Location *</label>
          <input v-model="form.address" required class="input" placeholder="e.g. 12 Allen Avenue, Ikeja" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 class="font-bold text-gray-800">Allowance & Work Conditions</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="label">Monthly Stipend (₦)</label>
            <input v-model="form.stipend" type="number" class="input" placeholder="e.g. 20000" />
          </div>
          
          <div class="form-group">
            <label class="label">Accomodation Provided?</label>
            <select v-model="form.provides_accommodation" class="input bg-white h-[48px]">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="label">Transport Availability</label>
          <input v-model="form.transport_info" class="input" placeholder="e.g. Staff bus available, or ₦500 daily transport cost" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 class="font-bold text-gray-800">PPA Review & Tips</h3>
        <div class="form-group">
          <label class="label">Tips for Incoming Corps Members</label>
          <textarea v-model="form.review" class="input min-h-[80px]" placeholder="Share dress code, work hours, staff attitude, or general advice..."></textarea>
        </div>
      </div>

      <AppButton type="submit" block size="lg" :loading="loading">Save PPA Information</AppButton>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')
const loading = ref(false)

const form = ref({
  name: '',
  category: 'Education',
  address: '',
  stipend: null,
  provides_accommodation: false,
  transport_info: '',
  review: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // Save to server
    await API.put('/users/profile', {
      ppa_name: form.value.name,
      ppa_category: form.value.category,
      ppa_address: form.value.address,
      ppa_stipend: form.value.stipend,
      ppa_accommodation: form.value.provides_accommodation,
      ppa_transport: form.value.transport_info,
      ppa_review: form.value.review
    })
    
    // Update local store user object
    if (authStore.user) {
      authStore.user.ppa_name = form.value.name
      authStore.user.ppa_category = form.value.category
      authStore.user.ppa_address = form.value.address
      authStore.user.ppa_stipend = form.value.stipend
      authStore.user.ppa_accommodation = form.value.provides_accommodation
      authStore.user.ppa_transport = form.value.transport_info
      authStore.user.ppa_review = form.value.review
    }
    
    toast.success('PPA details updated successfully!')
    router.push('/profile')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to update PPA details')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    const u = authStore.user
    form.value = {
      name: u.ppa_name || '',
      category: u.ppa_category || 'Education',
      address: u.ppa_address || '',
      stipend: u.ppa_stipend || null,
      provides_accommodation: u.ppa_accommodation || false,
      transport_info: u.ppa_transport || '',
      review: u.ppa_review || ''
    }
  }
})
</script>
