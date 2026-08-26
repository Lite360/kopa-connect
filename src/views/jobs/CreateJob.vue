<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50">
    <AppHeader title="Post a Job" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <form @submit.prevent="handleSubmit" class="p-4 max-w-xl mx-auto space-y-5">
      <div class="form-group"><label class="label">Job Title *</label><input v-model="form.title" required class="input" placeholder="e.g. Frontend Developer" /></div>
      <div class="form-group"><label class="label">Company / Organization</label><input v-model="form.company_name" class="input" placeholder="e.g. TechCorp Nigeria" /></div>
      <div class="form-group"><label class="label">Description *</label><textarea v-model="form.description" required class="input min-h-[120px]" placeholder="Describe the role, responsibilities..."></textarea></div>
      <div class="form-group"><label class="label">Requirements</label><textarea v-model="form.requirements" class="input min-h-[80px]" placeholder="Skills, experience needed..."></textarea></div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="label">Job Type</label>
          <select v-model="form.job_type" class="input bg-white h-[48px]">
            <option value="">Select</option><option value="full_time">Full Time</option><option value="part_time">Part Time</option>
            <option value="freelance">Freelance</option><option value="remote">Remote</option><option value="internship">Internship</option>
          </select>
        </div>
        <div class="form-group"><label class="label">Location</label><input v-model="form.location" class="input" placeholder="e.g. Ikeja, Lagos" /></div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="label">Pay Min (₦)</label><input v-model="form.pay_min" type="number" class="input" placeholder="50000" /></div>
        <div class="form-group"><label class="label">Pay Max (₦)</label><input v-model="form.pay_max" type="number" class="input" placeholder="150000" /></div>
      </div>

      <h3 class="font-bold text-gray-800 pt-2">Application Method</h3>
      <div class="form-group"><label class="label">Email</label><input v-model="form.application_email" type="email" class="input" placeholder="hr@company.com" /></div>
      <div class="form-group"><label class="label">Phone</label><input v-model="form.application_phone" type="tel" class="input" placeholder="08012345678" /></div>
      <div class="form-group"><label class="label">WhatsApp</label><input v-model="form.whatsapp_number" type="tel" class="input" placeholder="2348012345678" /></div>
      <div class="form-group"><label class="label">Application URL</label><input v-model="form.application_url" type="url" class="input" placeholder="https://..." /></div>

      <AppButton type="submit" block size="lg" :loading="loading">Post Job</AppButton>
    </form>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const toast = inject('toast')
const loading = ref(false)
const form = ref({ title:'', company_name:'', description:'', requirements:'', job_type:'', location:'', pay_min:null, pay_max:null, application_email:'', application_phone:'', whatsapp_number:'', application_url:'' })

const handleSubmit = async () => {
  loading.value = true
  try {
    await API.post('/jobs', form.value)
    toast.success('Job posted successfully!')
    router.push('/jobs')
  } catch (err) { toast.error(err.response?.data?.error || 'Failed to post job') }
  finally { loading.value = false }
}
</script>
