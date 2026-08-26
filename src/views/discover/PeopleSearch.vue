<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <div class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100">
      <div class="flex items-center p-3 gap-3">
        <button @click="$router.back()"
          class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0">
          <i class="fas fa-arrow-left text-lg"></i>
        </button>

        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
          <input v-model="searchQuery" @input="debounceSearch" type="text"
            class="w-full bg-gray-100 border-none rounded-xl py-2 pl-10 pr-10 text-sm text-gray-800 focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="Search people by name, skills..." autofocus />
          <button v-if="searchQuery" @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="px-3 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        <select v-model="filterState" @change="executeSearch"
          class="bg-white border border-gray-200 text-sm rounded-full px-3 py-1.5 focus:ring-0 focus:border-primary-500 text-gray-700">
          <option value="">All States</option>
          <option value="25">Lagos</option>
          <option value="15">FCT Abuja</option>
          <option value="33">Rivers</option>
          <!-- Additional states would be here, mapped from a store ideally -->
        </select>
      </div>
    </div>

    <div class="flex-1 p-3">
      <div v-if="loading && people.length === 0" class="space-y-3">
        <SkeletonLoader type="card" height="120px" v-for="i in 5" :key="i" />
      </div>

      <EmptyState v-else-if="people.length === 0" icon="fas fa-search" title="No results found"
        description="Try adjusting your search terms or filters." />

      <div v-else>
        <PersonCard v-for="person in people" :key="person.id" :person="person" />

        <div v-if="hasMore" class="py-4 flex justify-center">
          <AppButton v-if="!loading" variant="outline" size="sm" @click="loadMore">
            Load More
          </AppButton>
          <div v-else class="text-primary-600">
            <i class="fas fa-spinner fa-spin text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API } from '@/stores/auth'
import PersonCard from '@/components/people/PersonCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'

const route = useRoute()
const searchQuery = ref('')
const filterState = ref('')
const people = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

let searchTimeout

const clearSearch = () => {
  searchQuery.value = ''
  executeSearch()
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    executeSearch()
  }, 500)
}

const executeSearch = async () => {
  page.value = 1
  people.value = []
  hasMore.value = true
  await loadMore()
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return

  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value,
      limit: 15
    })

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (filterState.value) params.append('state_id', filterState.value)

    const { data } = await API.get(`/users/discover?${params.toString()}`)

    if (page.value === 1) {
      people.value = data.data
    } else {
      people.value = [...people.value, ...data.data]
    }

    hasMore.value = data.pagination.hasMore
    if (hasMore.value) page.value++
  } catch (err) {
    console.error('Search failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.filter === 'state') {
    // Ideally this would pre-fill with the user's actual state id
    filterState.value = '25' // Default to Lagos for demo if state filter selected
  }
  executeSearch()
})
</script>
