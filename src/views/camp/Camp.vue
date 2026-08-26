<template>
  <div class="pb-20 md:pb-0 h-full flex flex-col bg-gray-50">
    <AppHeader title="Camp Dashboard" showBack class="bg-primary-700 text-white border-none" />

    <div v-if="campStore.loading && !campStore.initialized" class="p-4 space-y-4">
      <SkeletonLoader type="card" height="200px" class="rounded-b-3xl" />
      <SkeletonLoader type="card" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="!campStore.camp" class="flex-1 flex flex-col justify-center p-4">
      <EmptyState 
        icon="fas fa-tent"
        title="No Active Camp"
        description="You are not currently assigned to an active orientation camp."
      />
    </div>

    <template v-else>
      <CampDashboard 
        :camp="campStore.camp" 
        @view-people="$router.push('/camp/people')" 
      />

      <div class="flex-1 p-4">
        <h3 class="font-bold text-gray-800 mb-4 px-2">Official Announcements</h3>
        
        <div v-if="campStore.announcements.length === 0">
          <EmptyState 
            icon="fas fa-bullhorn"
            title="No announcements"
            description="There are no official announcements for your camp yet."
          />
        </div>

        <div v-else class="space-y-4">
          <AppCard v-for="announcement in campStore.announcements" :key="announcement.id" class="border border-gray-100">
            <div class="flex gap-3 mb-3">
              <div class="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                <i class="fas fa-bullhorn"></i>
              </div>
              <div>
                <h4 class="font-bold text-gray-900">{{ announcement.title }}</h4>
                <p class="text-xs text-gray-500">{{ formatDate(announcement.created_at) }}</p>
              </div>
            </div>
            <p class="text-gray-700 whitespace-pre-wrap">{{ announcement.content }}</p>
          </AppCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCampStore } from '@/stores/camp'
import { format } from 'date-fns'
import AppHeader from '@/components/layout/AppHeader.vue'
import CampDashboard from '@/components/camp/CampDashboard.vue'
import AppCard from '@/components/common/AppCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const campStore = useCampStore()

const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

onMounted(() => {
  if (!campStore.initialized) {
    campStore.fetchCampData()
  }
})
</script>
