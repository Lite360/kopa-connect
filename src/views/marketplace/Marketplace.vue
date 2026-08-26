<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Marketplace" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3">
      <template #actions>
        <router-link to="/marketplace/create" class="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"><i class="fas fa-plus text-lg"></i></router-link>
      </template>
    </AppHeader>

    <div class="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><i class="fas fa-search text-gray-400"></i></div>
        <input v-model="search" @input="debounceSearch" type="text" class="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Search products & services..." />
      </div>
      <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
        <button v-for="cat in categories" :key="cat.value" @click="selectCategory(cat.value)"
          :class="['px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors', category === cat.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 p-4">
      <div v-if="loading && listings.length === 0" class="grid grid-cols-2 gap-3">
        <SkeletonLoader type="card" height="200px" v-for="i in 4" :key="i" />
      </div>

      <EmptyState v-else-if="listings.length === 0" icon="fas fa-store" title="No listings yet" description="Be the first to sell something!" />

      <div v-else class="grid grid-cols-2 gap-3">
        <ListingCard v-for="listing in listings" :key="listing.id" :listing="listing" />
      </div>

      <div v-if="hasMore && listings.length > 0" class="py-4 flex justify-center">
        <AppButton v-if="!loading" variant="outline" size="sm" @click="loadListings">Load More</AppButton>
        <div v-else class="text-primary-600"><i class="fas fa-spinner fa-spin text-xl"></i></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import ListingCard from '@/components/marketplace/ListingCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'

const search = ref(''); const category = ref(''); const listings = ref([]); const loading = ref(false); const page = ref(1); const hasMore = ref(true)
let searchTimeout

const categories = [
  { value: '', label: 'All' }, { value: 'food', label: '🍛 Food' }, { value: 'fashion', label: '👗 Fashion' },
  { value: 'tech', label: '💻 Tech' }, { value: 'beauty', label: '💄 Beauty' }, { value: 'services', label: '🛠 Services' },
  { value: 'education', label: '📚 Education' }, { value: 'other', label: 'Other' }
]

const debounceSearch = () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => resetAndLoad(), 500) }
const selectCategory = (cat) => { category.value = cat; resetAndLoad() }
const resetAndLoad = () => { page.value = 1; listings.value = []; hasMore.value = true; loadListings() }

const loadListings = async () => {
  if (!hasMore.value || loading.value) return
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit: 12 })
    if (search.value) params.append('search', search.value)
    if (category.value) params.append('category', category.value)
    const { data } = await API.get(`/marketplace?${params}`)
    listings.value = page.value === 1 ? data.data : [...listings.value, ...data.data]
    hasMore.value = data.pagination.hasMore
    if (hasMore.value) page.value++
  } catch (err) { console.error(err) } finally { loading.value = false }
}

onMounted(() => loadListings())
</script>
