<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-white">
    <AppHeader title="Event" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <div v-if="loading" class="p-4"><SkeletonLoader type="card" height="200px" /></div>
    <div v-else-if="event">
      <!-- Cover -->
      <div v-if="event.cover_url" class="h-48 bg-gray-100">
        <img :src="event.cover_url" class="w-full h-full object-cover" />
      </div>

      <div class="p-5">
        <!-- Date Badge + Title -->
        <div class="flex gap-4 mb-4">
          <div class="w-14 h-16 bg-primary-50 rounded-xl flex flex-col items-center justify-center shrink-0 border border-primary-100">
            <span class="text-xs font-bold text-primary-600 uppercase">{{ monthStr }}</span>
            <span class="text-2xl font-black text-primary-800 leading-none">{{ dayStr }}</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 leading-tight">{{ event.title }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ formattedTime }}</p>
          </div>
        </div>

        <!-- Info Pills -->
        <div class="flex flex-wrap gap-2 mb-5">
          <span v-if="event.event_type" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
            {{ event.event_type }}
          </span>
          <span v-if="event.is_online" class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            <i class="fas fa-video mr-1"></i>Online
          </span>
          <span v-if="event.is_free" class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Free</span>
          <span v-else-if="event.ticket_price" class="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
            ₦{{ Number(event.ticket_price).toLocaleString() }}
          </span>
        </div>

        <!-- Location -->
        <div v-if="event.location" class="flex items-start gap-3 mb-4 bg-gray-50 p-3 rounded-xl">
          <i class="fas fa-map-marker-alt text-primary-600 mt-0.5"></i>
          <div>
            <p class="text-sm font-medium text-gray-800">{{ event.location }}</p>
            <p v-if="event.state_name" class="text-xs text-gray-500">{{ event.state_name }}</p>
          </div>
        </div>

        <div v-if="event.online_url" class="flex items-center gap-3 mb-4 bg-blue-50 p-3 rounded-xl">
          <i class="fas fa-link text-blue-600"></i>
          <a :href="event.online_url" target="_blank" class="text-sm text-blue-700 font-medium truncate hover:underline">{{ event.online_url }}</a>
        </div>

        <!-- RSVP Button -->
        <AppButton 
          v-if="!event.is_attending" 
          block size="lg" 
          @click="rsvp" 
          :loading="rsvping"
          class="mb-5"
        >
          <i class="fas fa-calendar-check mr-2"></i>I'm Going
        </AppButton>
        <AppButton v-else variant="outline" block size="lg" disabled class="mb-5">
          <i class="fas fa-check mr-2"></i>You're Attending
        </AppButton>

        <!-- Description -->
        <div v-if="event.description" class="border-t border-gray-100 pt-4 mb-4">
          <h3 class="font-bold text-gray-800 mb-2">About This Event</h3>
          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ event.description }}</p>
        </div>

        <!-- Organizer -->
        <div class="border-t border-gray-100 pt-4">
          <h3 class="font-bold text-gray-800 mb-3">Organized By</h3>
          <router-link :to="`/profile/${event.organizer_id}`" class="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
            <Avatar :src="event.organizer_avatar" :name="`${event.first_name} ${event.last_name}`" size="md" />
            <p class="font-semibold text-gray-900">{{ event.first_name }} {{ event.last_name }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { API } from '@/stores/auth'
import { format } from 'date-fns'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import AppButton from '@/components/common/AppButton.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const route = useRoute()
const toast = inject('toast')
const event = ref(null)
const loading = ref(true)
const rsvping = ref(false)

const monthStr = computed(() => { try { return format(new Date(event.value.starts_at), 'MMM') } catch { return '' } })
const dayStr = computed(() => { try { return format(new Date(event.value.starts_at), 'd') } catch { return '' } })
const formattedTime = computed(() => {
  try {
    const start = format(new Date(event.value.starts_at), 'EEEE, MMMM d · h:mm a')
    if (event.value.ends_at) return `${start} - ${format(new Date(event.value.ends_at), 'h:mm a')}`
    return start
  } catch { return '' }
})

const rsvp = async () => {
  rsvping.value = true
  try {
    // For MVP, we just mark it optimistically
    event.value.is_attending = true
    toast.success("You're going! 🎉")
  } catch (err) {
    toast.error('Failed to RSVP')
  } finally {
    rsvping.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await API.get(`/events?search=`)
    event.value = data.data.find(e => e.id === route.params.id) || data.data[0]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
