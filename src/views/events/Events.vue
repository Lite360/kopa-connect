<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Events" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3">
      <template #actions><router-link to="/events/create"
          class="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"><i
            class="fas fa-plus text-lg"></i></router-link></template>
    </AppHeader>
    <div class="bg-white border-b border-gray-100 px-4 pt-3 pb-3 flex gap-2">
      <button @click="timeframe = 'upcoming'; resetAndLoad()"
        :class="['px-4 py-1.5 rounded-full text-sm font-semibold', timeframe === 'upcoming' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600']">Upcoming</button>
      <button @click="timeframe = 'past'; resetAndLoad()"
        :class="['px-4 py-1.5 rounded-full text-sm font-semibold', timeframe === 'past' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600']">Past</button>
    </div>
    <div class="flex-1 p-4">
      <div v-if="loading && events.length === 0" class="space-y-3">
        <SkeletonLoader type="card" height="120px" v-for="i in 3" :key="i" />
      </div>
      <EmptyState v-else-if="events.length === 0" icon="fas fa-calendar-alt" title="No events"
        description="Check back later or create your own!" />
      <div v-else>
        <EventCard v-for="e in events" :key="e.id" :event="e" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import EventCard from '@/components/events/EventCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
const timeframe = ref('upcoming'); const events = ref([]); const loading = ref(false); const page = ref(1); const hasMore = ref(true)
const resetAndLoad = () => { page.value = 1; events.value = []; hasMore.value = true; load() }
const load = async () => {
  if (!hasMore.value || loading.value) return; loading.value = true
  try {
    const { data } = await API.get(`/events?timeframe=${timeframe.value}&page=${page.value}&limit=15`); events.value = page.value === 1 ? data.data : [...events.value, ...data.data]
    hasMore.value = data.pagination.hasMore; if (hasMore.value) page.value++
  } catch (err) { console.error(err) } finally { loading.value = false }
}
onMounted(() => load())
</script>
