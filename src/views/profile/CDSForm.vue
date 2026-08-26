<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50">
    <AppHeader title="My CDS Group" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <form @submit.prevent="handleSubmit" class="p-4 max-w-xl mx-auto space-y-5">
      <div class="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 class="font-bold text-gray-800">CDS Details</h3>
        
        <div class="form-group">
          <label class="label">CDS Group Name *</label>
          <select v-model="form.name" required class="input bg-white h-[48px]">
            <option value="">Select CDS Group</option>
            <option value="Editorial / Publicity">Editorial / Publicity</option>
            <option value="FRSC (Road Safety)">FRSC (Road Safety)</option>
            <option value="NDLEA (Drug Free)">NDLEA (Drug Free)</option>
            <option value="ICT / Technology">ICT / Technology</option>
            <option value="Sanitation / Environment">Sanitation / Environment</option>
            <option value="Education / Charity">Education / Charity</option>
            <option value="Medical / Health">Medical / Health</option>
            <option value="Agric / Food Security">Agric / Food Security</option>
            <option value="Other">Other (Specify in Bio)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Meeting Day *</label>
          <select v-model="form.meeting_day" required class="input bg-white h-[48px]">
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Meeting Address / Venue *</label>
          <input v-model="form.venue" required class="input" placeholder="e.g. Local Govt Secretariat Hall" />
        </div>

        <div class="form-group">
          <label class="label">Role / Position</label>
          <input v-model="form.role" class="input" placeholder="e.g. Member, President, Secretary" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 class="font-bold text-gray-800">Project / Achievements</h3>
        <div class="form-group">
          <label class="label">Current Group Project</label>
          <textarea v-model="form.project" class="input min-h-[80px]" placeholder="Briefly describe what your CDS group is currently working on..."></textarea>
        </div>
      </div>

      <AppButton type="submit" block size="lg" :loading="loading">Save CDS Information</AppButton>
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
  meeting_day: 'Thursday',
  venue: '',
  role: 'Member',
  project: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // Save to server
    await API.put('/users/profile', {
      cds_name: form.value.name,
      cds_meeting_day: form.value.meeting_day,
      cds_venue: form.value.venue,
      cds_role: form.value.role,
      cds_project: form.value.project
    })
    
    // Update local store user object
    if (authStore.user) {
      authStore.user.cds_name = form.value.name
      authStore.user.cds_meeting_day = form.value.meeting_day
      authStore.user.cds_venue = form.value.venue
      authStore.user.cds_role = form.value.role
      authStore.user.cds_project = form.value.project
    }
    
    toast.success('CDS details updated successfully!')
    router.push('/profile')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to update CDS details')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    const u = authStore.user
    form.value = {
      name: u.cds_name || '',
      meeting_day: u.cds_meeting_day || 'Thursday',
      venue: u.cds_venue || '',
      role: u.cds_role || 'Member',
      project: u.cds_project || ''
    }
  }
})
</script>
