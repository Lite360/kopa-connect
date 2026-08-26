<template>
  <header class="mobile-header md:hidden">
    <div class="flex items-center gap-3">
      <Logo size="sm" v-if="!showBack" />
      <button v-else @click="$router.back()" class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
        <i class="fas fa-arrow-left text-lg"></i>
      </button>
      <h1 v-if="title" class="text-lg font-bold text-gray-800">{{ title }}</h1>
    </div>
    
    <div class="flex items-center gap-2">
      <slot name="actions">
        <router-link to="/notifications" class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
          <i class="fas fa-bell text-lg"></i>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </router-link>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import Logo from '../common/Logo.vue'
import { useNotificationsStore } from '@/stores/notifications'

defineProps({
  title: String,
  showBack: Boolean
})

const notifStore = useNotificationsStore()
const unreadCount = computed(() => notifStore.unreadCount)
</script>
