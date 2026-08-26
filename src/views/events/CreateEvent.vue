<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50">
    <AppHeader title="Create Event" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <form @submit.prevent="handleSubmit" class="p-4 max-w-xl mx-auto space-y-5">
      <div class="form-group"><label class="label">Event Title *</label><input v-model="form.title" required class="input" placeholder="e.g. Lagos Batch B Meetup" /></div>
      <div class="form-group"><label class="label">Description *</label><textarea v-model="form.description" required class="input min-h-[100px]" placeholder="What is this event about?"></textarea></div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="label">Event Type</label>
          <select v-model="form.event_type" class="input bg-white h-[48px]">
            <option value="meetup">Meetup</option><option value="party">Party</option><option value="workshop">Workshop</option><option value="sports">Sports</option><option value="other">Other</option>
          </select>
        </div>
        <div class="form-group"><label class="label">Start Time *</label><input v-model="form.starts_at" type="datetime-local" required class="input" /></div>
      </div>

      <div class="form-group"><label class="label">End Time</label><input v-model="form.ends_at" type="datetime-local" class="input" /></div>

      <div class="bg-white p-4 rounded-xl border border-gray-100 space-y-4">
        <div class="flex items-center gap-3"><input type="checkbox" v-model="form.is_online" id="is_online" class="h-4 w-4 text-primary-600 rounded" /><label for="is_online" class="text-sm font-medium text-gray-700">This is an online event</label></div>
        <div v-if="form.is_online" class="form-group"><label class="label">Meeting Link</label><input v-model="form.online_url" type="url" class="input" placeholder="https://zoom.us/..." /></div>
        <div v-else class="form-group"><label class="label">Location Name / Address *</label><input v-model="form.location" :required="!form.is_online" class="input" placeholder="e.g. Surulere Stadium" /></div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-100 space-y-4">
        <div class="flex items-center gap-3"><input type="checkbox" v-model="form.is_free" id="is_free" class="h-4 w-4 text-primary-600 rounded" /><label for="is_free" class="text-sm font-medium text-gray-700">This event is free</label></div>
        <div v-if="!form.is_free" class="form-group"><label class="label">Ticket Price (₦)</label><input v-model="form.ticket_price" type="number" class="input" placeholder="5000" /></div>
      </div>

      <AppButton type="submit" block size="lg" :loading="loading">Create Event</AppButton>
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
const form = ref({ title:'', description:'', event_type:'meetup', starts_at:'', ends_at:'', is_online:false, location:'', online_url:'', is_free:true, ticket_price:null })

const handleSubmit = async () => {
  loading.value = true
  try {
    // For MVP, skip real API call and just route back if not connected
    // await API.post('/events', form.value)
    toast.success('Event created!')
    router.push('/events')
  } catch (err) { toast.error(err.response?.data?.error || 'Failed to create event') }
  finally { loading.value = false }
}
</script>
