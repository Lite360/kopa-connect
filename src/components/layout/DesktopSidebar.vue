<template>
  <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
    <div class="p-6">
      <Logo size="lg" />
    </div>
    
    <div class="flex-1 overflow-y-auto px-4 py-2 space-y-1">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" 
                   class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                   active-class="bg-primary-50 text-primary-700 font-semibold">
        <i :class="['fas text-lg w-6 text-center', item.icon]"></i>
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          {{ item.badge }}
        </span>
      </router-link>

      <div class="my-4 pt-4 border-t border-gray-100">
        <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Explore</p>
        <router-link v-for="item in exploreItems" :key="item.path" :to="item.path" 
                     class="flex items-center gap-3 px-4 py-2.5 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                     active-class="bg-primary-50 text-primary-700 font-semibold">
          <i :class="['fas text-lg w-6 text-center text-gray-400', item.icon]"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>
    
    <div class="p-4 border-t border-gray-100">
      <button @click="$emit('open-create')" class="btn-primary btn-lg w-full mb-4">
        <i class="fas fa-plus mr-2"></i> Create
      </button>
      
      <div v-if="user" class="flex items-center gap-3 px-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors" @click="$router.push('/profile')">
        <Avatar :src="user.avatar_url" :name="user.first_name + ' ' + user.last_name" size="sm" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">{{ user.first_name }} {{ user.last_name }}</p>
          <p class="text-xs text-gray-500 truncate capitalize">{{ (user.current_stage || 'corps_member').replace('_', ' ') }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import Logo from '../common/Logo.vue'
import Avatar from '../common/Avatar.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const authStore = useAuthStore()
const chatStore = useChatStore()

const user = computed(() => authStore.user)

const navItems = computed(() => [
  { path: '/', label: 'Home', icon: 'fa-home' },
  { path: '/discover', label: 'Discover', icon: 'fa-compass' },
  { path: '/chat', label: 'Chat', icon: 'fa-comment-dots', badge: chatStore.totalUnread || null },
  { path: '/notifications', label: 'Notifications', icon: 'fa-bell' },
  { path: '/profile', label: 'Profile', icon: 'fa-user' }
])

const exploreItems = [
  { path: '/camp', label: 'Camp', icon: 'fa-tent' },
  { path: '/jobs', label: 'Jobs', icon: 'fa-briefcase' },
  { path: '/marketplace', label: 'Marketplace', icon: 'fa-store' },
  { path: '/communities', label: 'Communities', icon: 'fa-users' },
  { path: '/events', label: 'Events', icon: 'fa-calendar-alt' }
]

defineEmits(['open-create'])
</script>
