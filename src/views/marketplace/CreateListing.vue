<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50"><AppHeader title="Create Listing" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />
    <form @submit.prevent="handleSubmit" class="p-4 max-w-xl mx-auto space-y-5">
      <div class="form-group"><label class="label">Title *</label><input v-model="form.title" required class="input" placeholder="What are you selling?" /></div>
      <div class="form-group"><label class="label">Description</label><textarea v-model="form.description" class="input min-h-[80px]" placeholder="Describe your product/service..."></textarea></div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="label">Price (₦)</label><input v-model="form.price" type="number" class="input" placeholder="5000" /></div>
        <div class="form-group"><label class="label">Category</label>
          <select v-model="form.category" class="input bg-white h-[48px]">
            <option value="">Select</option><option value="food">Food</option><option value="fashion">Fashion</option><option value="tech">Tech</option>
            <option value="beauty">Beauty</option><option value="services">Services</option><option value="education">Education</option><option value="other">Other</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-3"><input type="checkbox" v-model="form.is_negotiable" id="negotiable" class="h-4 w-4 text-primary-600 rounded" /><label for="negotiable" class="text-sm text-gray-700">Price is negotiable</label></div>
      <div class="form-group"><label class="label">Location</label><input v-model="form.location" class="input" placeholder="e.g. Ikeja, Lagos" /></div>
      <AppButton type="submit" block size="lg" :loading="loading">Post Listing</AppButton>
    </form>
  </div>
</template>
<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
const router = useRouter(); const toast = inject('toast'); const loading = ref(false)
const form = ref({ title:'', description:'', price:null, category:'', is_negotiable:false, location:'' })
const handleSubmit = async () => {
  loading.value = true
  try { await API.post('/marketplace', form.value); toast.success('Listing created!'); router.push('/marketplace') }
  catch (err) { toast.error(err.response?.data?.error || 'Failed to create listing') }
  finally { loading.value = false }
}
</script>
