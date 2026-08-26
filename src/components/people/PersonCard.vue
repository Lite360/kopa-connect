<template>
  <AppCard class="mb-3 sm:mb-4 border border-gray-100" hoverable @click="$router.push(`/profile/${person.id}`)">
    <div class="flex gap-4">
      <Avatar :src="person.avatar_url" :name="`${person.first_name} ${person.last_name}`" size="lg" />
      
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <h3 class="font-bold text-gray-900 truncate text-lg">
          {{ person.first_name }} {{ person.last_name }}
        </h3>
        
        <div class="flex items-center gap-2 mt-0.5 mb-2">
          <span v-if="person.current_stage" class="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded capitalize font-medium">
            {{ person.current_stage.replace('_', ' ') }}
          </span>
          <span v-if="person.state_name" class="text-xs text-gray-500">
            <i class="fas fa-map-marker-alt mr-1"></i>{{ person.state_name }}
          </span>
        </div>

        <p v-if="person.bio" class="text-sm text-gray-600 line-clamp-2 mb-3">
          {{ person.bio }}
        </p>

        <div v-if="person.skills && person.skills.length" class="flex flex-wrap gap-1 mt-auto">
          <span 
            v-for="(skill, idx) in person.skills.slice(0, 4)" 
            :key="idx"
            class="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap"
          >
            {{ skill }}
          </span>
          <span v-if="person.skills.length > 4" class="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
            +{{ person.skills.length - 4 }}
          </span>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import Avatar from '../common/Avatar.vue'
import AppCard from '../common/AppCard.vue'

defineProps({
  person: { type: Object, required: true }
})
</script>
