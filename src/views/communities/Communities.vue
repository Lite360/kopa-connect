<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Communities" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />
    <div class="bg-white border-b border-gray-100 px-4 pt-3 pb-3 flex gap-2">
      <button @click="filter = 'all'; resetAndLoad()" :class="['px-4 py-1.5 rounded-full text-sm font-semibold', filter==='all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600']">All</button>
      <button @click="filter = 'joined'; resetAndLoad()" :class="['px-4 py-1.5 rounded-full text-sm font-semibold', filter==='joined' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600']">Joined</button>
    </div>
    <div class="flex-1 p-4">
      <div v-if="loading && communities.length === 0" class="space-y-3"><SkeletonLoader type="card" height="100px" v-for="i in 4" :key="i" /></div>
      <EmptyState v-else-if="communities.length === 0" icon="fas fa-users" title="No communities" description="Be the first to create one!" />
      <div v-else><CommunityCard v-for="c in communities" :key="c.id" :community="c" /></div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import CommunityCard from '@/components/communities/CommunityCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
const filter = ref('all'); const communities = ref([]); const loading = ref(false); const page = ref(1); const hasMore = ref(true)
const resetAndLoad = () => { page.value = 1; communities.value = []; hasMore.value = true; load() }
const load = async () => {
  if (!hasMore.value || loading.value) return; loading.value = true
  try { const params = new URLSearchParams({ page: page.value, limit: 15 }); if (filter.value === 'joined') params.append('filter', 'joined')
    const { data } = await API.get(`/communities?${params}`); communities.value = page.value === 1 ? data.data : [...communities.value, ...data.data]
    hasMore.value = data.pagination.hasMore; if (hasMore.value) page.value++
  } catch (err) { console.error(err) } finally { loading.value = false }
}
onMounted(() => load())
</script>
