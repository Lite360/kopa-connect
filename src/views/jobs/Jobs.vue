<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Jobs & Opportunities" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3">
      <template #actions>
        <router-link to="/jobs/create" class="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
          <i class="fas fa-plus text-lg"></i>
        </router-link>
      </template>
    </AppHeader>

    <!-- Search -->
    <div class="bg-white px-4 pt-3 pb-1">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i class="fas fa-search text-gray-400"></i>
        </div>
        <input v-model="search" @input="debounceSearch" type="text" class="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Search jobs, companies..." />
      </div>
    </div>

    <JobFilter v-model="jobType" @update:modelValue="handleFilterChange" />

    <div class="flex-1 p-4">
      <div v-if="loading && jobs.length === 0" class="space-y-3">
        <SkeletonLoader type="card" height="100px" v-for="i in 4" :key="i" />
      </div>

      <EmptyState v-else-if="jobs.length === 0" icon="fas fa-briefcase" title="No jobs found" description="Try adjusting your search or filters." />

      <div v-else>
        <JobCard v-for="job in jobs" :key="job.id" :job="job" />
        
        <div v-if="hasMore" class="py-4 flex justify-center">
          <AppButton v-if="!loading" variant="outline" size="sm" @click="loadJobs">Load More</AppButton>
          <div v-else class="text-primary-600"><i class="fas fa-spinner fa-spin text-xl"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import JobCard from '@/components/jobs/JobCard.vue'
import JobFilter from '@/components/jobs/JobFilter.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'

const search = ref('')
const jobType = ref('')
const jobs = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
let searchTimeout

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => resetAndLoad(), 500)
}

const handleFilterChange = () => resetAndLoad()

const resetAndLoad = () => {
  page.value = 1; jobs.value = []; hasMore.value = true
  loadJobs()
}

const loadJobs = async () => {
  if (!hasMore.value || loading.value) return
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit: 15 })
    if (search.value) params.append('search', search.value)
    if (jobType.value) params.append('job_type', jobType.value)
    const { data } = await API.get(`/jobs?${params}`)
    jobs.value = page.value === 1 ? data.data : [...jobs.value, ...data.data]
    hasMore.value = data.pagination.hasMore
    if (hasMore.value) page.value++
  } catch (err) { console.error(err) } finally { loading.value = false }
}

onMounted(() => loadJobs())
</script>
