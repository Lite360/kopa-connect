<template>
  <nav class="mobile-nav md:hidden pb-safe-bottom">
    <div class="flex items-center justify-around w-full h-16">
      
      <router-link to="/" class="nav-item" active-class="nav-item-active" exact>
        <i class="fas fa-home text-xl mb-1"></i>
        <span class="nav-item-label">Home</span>
      </router-link>
      
      <router-link to="/discover" class="nav-item" active-class="nav-item-active">
        <i class="fas fa-compass text-xl mb-1"></i>
        <span class="nav-item-label">Discover</span>
      </router-link>
      
      <div class="flex-1 flex justify-center -mt-6">
        <button @click="$emit('open-create')" class="create-fab">
          <i class="fas fa-plus text-white text-xl"></i>
        </button>
      </div>
      
      <router-link to="/chat" class="nav-item relative" active-class="nav-item-active">
        <i class="fas fa-comment-dots text-xl mb-1"></i>
        <span v-if="unreadMessages > 0" class="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        <span class="nav-item-label">Chat</span>
      </router-link>
      
      <router-link to="/profile" class="nav-item" active-class="nav-item-active">
        <i class="fas fa-user text-xl mb-1"></i>
        <span class="nav-item-label">Profile</span>
      </router-link>
      
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const unreadMessages = computed(() => chatStore.totalUnread)

defineEmits(['open-create'])
</script>
