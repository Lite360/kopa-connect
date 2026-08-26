<template>
  <AppCard class="mb-3 border border-gray-100 overflow-hidden" hoverable noPadding
    @click="$router.push(`/event/${event.id}`)">
    <div v-if="event.cover_url" class="h-32 bg-gray-100"><img :src="event.cover_url" class="w-full h-full object-cover"
        loading="lazy" /></div>
    <div class="p-4">
      <div class="flex gap-3">
        <div
          class="w-12 h-14 bg-primary-50 rounded-xl flex flex-col items-center justify-center shrink-0 border border-primary-100">
          <span class="text-xs font-bold text-primary-600 uppercase">{{ monthStr }}</span>
          <span class="text-xl font-black text-primary-800 leading-none">{{ dayStr }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-gray-900 truncate">{{ event.title }}</h3>
          <p v-if="event.location" class="text-xs text-gray-500 mt-1 truncate"><i
              class="fas fa-map-marker-alt mr-1"></i>{{ event.location }}</p>
          <p v-if="event.is_online" class="text-xs text-blue-600 mt-1"><i class="fas fa-video mr-1"></i>Online Event</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{{ event.event_type
              }}</span>
            <span v-if="event.is_free"
              class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>
            <span v-else-if="event.ticket_price" class="text-xs text-primary-700 font-semibold">₦{{
              Number(event.ticket_price).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>
<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import AppCard from '../common/AppCard.vue'
const props = defineProps({ event: { type: Object, required: true } })
const monthStr = computed(() => { try { return format(new Date(props.event.starts_at), 'MMM') } catch { return '---' } })
const dayStr = computed(() => { try { return format(new Date(props.event.starts_at), 'd') } catch { return '--' } })
</script>
