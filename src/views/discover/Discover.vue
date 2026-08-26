<template>
  <div class="pb-20 md:pb-0 h-full flex flex-col bg-gray-50">
    <AppHeader title="Discover" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <div class="p-4 flex-1 overflow-y-auto">
      
      <!-- Search Bar -->
      <div class="mb-6 relative" @click="$router.push('/people/search')">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i class="fas fa-search text-gray-400"></i>
        </div>
        <input 
          type="text" 
          class="w-full bg-white border-none rounded-2xl py-3 pl-11 pr-4 shadow-sm text-gray-800 placeholder-gray-400 cursor-text focus:ring-2 focus:ring-primary-500 transition-all" 
          placeholder="Search for people, skills, locations..."
          readonly
        />
      </div>

      <!-- Categories Grid -->
      <h3 class="font-bold text-gray-800 mb-3 px-1">Explore by Category</h3>
      <div class="grid grid-cols-2 gap-3 mb-8">
        
        <router-link to="/people/search?filter=state" class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-sm hover:shadow-md transition-shadow">
          <i class="fas fa-map-marked-alt text-2xl mb-2 opacity-80"></i>
          <h4 class="font-bold">In Your State</h4>
          <p class="text-xs text-blue-100 mt-1">Connect with corps members nearby</p>
        </router-link>

        <router-link to="/people/search?filter=skills" class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-sm hover:shadow-md transition-shadow">
          <i class="fas fa-laptop-code text-2xl mb-2 opacity-80"></i>
          <h4 class="font-bold">By Skills</h4>
          <p class="text-xs text-purple-100 mt-1">Find freelancers and talent</p>
        </router-link>

        <router-link to="/marketplace" class="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white shadow-sm hover:shadow-md transition-shadow">
          <i class="fas fa-store text-2xl mb-2 opacity-80"></i>
          <h4 class="font-bold">Marketplace</h4>
          <p class="text-xs text-orange-100 mt-1">Discover student vendors</p>
        </router-link>

        <router-link to="/events" class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-sm hover:shadow-md transition-shadow">
          <i class="fas fa-calendar-alt text-2xl mb-2 opacity-80"></i>
          <h4 class="font-bold">Events</h4>
          <p class="text-xs text-green-100 mt-1">Parties, CDS meetups, and more</p>
        </router-link>
        
      </div>

      <!-- Suggested People -->
      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="font-bold text-gray-800">Suggested For You</h3>
        <router-link to="/people/search" class="text-sm font-semibold text-primary-600 hover:text-primary-700">See all</router-link>
      </div>

      <div v-if="loading" class="space-y-3">
        <SkeletonLoader type="card" height="120px" v-for="i in 3" :key="i" />
      </div>

      <div v-else-if="suggestedPeople.length > 0">
        <PersonCard 
          v-for="person in suggestedPeople" 
          :key="person.id" 
          :person="person" 
        />
      </div>

      <EmptyState 
        v-else 
        icon="fas fa-user-friends"
        title="No suggestions yet"
        description="We couldn't find any specific suggestions for you right now."
      />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import PersonCard from '@/components/people/PersonCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const suggestedPeople = ref([])
const loading = ref(true)

const loadSuggestions = async () => {
  try {
    // For MVP, just get recent active users as "suggestions"
    const { data } = await API.get('/users/discover?limit=5')
    suggestedPeople.value = data.data
  } catch (err) {
    console.error('Failed to load suggestions', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSuggestions()
})
</script>
