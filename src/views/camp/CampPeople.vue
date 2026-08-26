<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Camp Mates" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <div v-if="loading && people.length === 0" class="p-4 space-y-2">
      <SkeletonLoader type="card" height="80px" v-for="i in 5" :key="i" />
    </div>

    <EmptyState 
      v-else-if="people.length === 0" 
      icon="fas fa-users"
      title="No one here yet"
      description="We couldn't find anyone else in your camp."
    />

    <div v-else class="flex-1 bg-white">
      <CampPeopleCard 
        v-for="person in people" 
        :key="person.id" 
        :person="person" 
      />

      <div v-if="hasMore" class="p-4 flex justify-center">
        <AppButton 
          v-if="!loading" 
          variant="outline" 
          size="sm" 
          @click="loadPeople"
        >
          Load More
        </AppButton>
        <div v-else class="text-primary-600">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import { useCampStore } from '@/stores/camp'
import AppHeader from '@/components/layout/AppHeader.vue'
import CampPeopleCard from '@/components/camp/CampPeopleCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'

const campStore = useCampStore()
const people = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

const loadPeople = async () => {
  if (!hasMore.value || loading.value) return
  
  if (!campStore.camp) {
    await campStore.fetchCampData()
  }

  if (!campStore.camp?.id) {
    loading.value = false
    hasMore.value = false
    return
  }

  loading.value = true
  try {
    const { data } = await API.get(`/camp/people?camp_id=${campStore.camp.id}&page=${page.value}&limit=20`)
    
    if (page.value === 1) {
      people.value = data.data
    } else {
      people.value = [...people.value, ...data.data]
    }
    
    hasMore.value = data.pagination.hasMore
    if (hasMore.value) page.value++
  } catch (err) {
    console.error('Failed to load camp people', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPeople()
})
</script>
