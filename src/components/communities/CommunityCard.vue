<template>
  <AppCard class="mb-3 border border-gray-100" hoverable @click="$router.push(`/community/${community.id}`)">
    <div class="flex gap-3">
      <Avatar :src="community.avatar_url" :name="community.name" size="lg" />
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900 truncate">{{ community.name }}</h3>
        <p class="text-xs text-gray-500 mt-0.5"><i class="fas fa-users mr-1"></i>{{ community.members_count || 0 }} members<span v-if="community.state_name"> · {{ community.state_name }}</span></p>
        <p v-if="community.description" class="text-sm text-gray-600 line-clamp-2 mt-1">{{ community.description }}</p>
        <span v-if="community.is_member" class="inline-block mt-2 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium"><i class="fas fa-check mr-1"></i>Joined</span>
      </div>
    </div>
  </AppCard>
</template>
<script setup>
import Avatar from '../common/Avatar.vue'
import AppCard from '../common/AppCard.vue'
defineProps({ community: { type: Object, required: true } })
</script>
