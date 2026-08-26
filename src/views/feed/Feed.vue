<template>
  <div class="pb-20 md:pb-0 h-full flex flex-col">
    <!-- Header -->
    <AppHeader title="Kopa Connect" class="hidden md:flex sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3">
      <template #actions>
        <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <i class="fas fa-search"></i>
        </button>
      </template>
    </AppHeader>

    <div class="md:hidden pt-2 px-4 pb-1">
      <Logo size="md" />
    </div>

    <!-- Tabs -->
    <FeedTabs v-model="currentTab" @update:modelValue="handleTabChange" />

    <!-- Create Post (only for logged in users) -->
    <CreatePost v-if="isAuthenticated" />

    <!-- Feed Content -->
    <div class="flex-1 overflow-y-auto">
      
      <!-- Loading State -->
      <div v-if="feedStore.loading && feedStore.posts.length === 0" class="p-4 space-y-4">
        <SkeletonLoader type="card" v-for="i in 3" :key="i" />
      </div>

      <!-- Empty State -->
      <EmptyState 
        v-else-if="feedStore.posts.length === 0" 
        icon="fas fa-newspaper"
        title="No posts yet"
        :description="emptyStateMessage"
      />

      <!-- Post List -->
      <div v-else class="sm:p-4">
        <PostCard 
          v-for="post in feedStore.posts" 
          :key="post.id" 
          :post="post" 
        />
        
        <!-- Load More Trigger -->
        <div v-if="feedStore.hasMore" class="p-4 flex justify-center">
          <AppButton 
            v-if="!feedStore.loading" 
            variant="outline" 
            size="sm" 
            @click="feedStore.fetchPosts(currentTab)"
          >
            Load More
          </AppButton>
          <div v-else class="text-primary-600">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-500 text-sm">
          You've caught up for now!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFeedStore } from '@/stores/feed'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import FeedTabs from '@/components/feed/FeedTabs.vue'
import CreatePost from '@/components/feed/CreatePost.vue'
import PostCard from '@/components/feed/PostCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'
import Logo from '@/components/common/Logo.vue'

const feedStore = useFeedStore()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentTab = ref(feedStore.currentTab)

const emptyStateMessage = computed(() => {
  switch(currentTab.value) {
    case 'following': return "You aren't following anyone yet, or they haven't posted."
    case 'camp': return "No updates from your camp yet. Be the first!"
    case 'state': return "No updates from your state yet."
    default: return "Nothing to see here right now."
  }
})

const handleTabChange = (tab) => {
  if (currentTab.value !== tab) {
    currentTab.value = tab
    feedStore.fetchPosts(tab, true)
  }
}

onMounted(() => {
  // Only fetch if empty to preserve scroll state on navigation
  if (feedStore.posts.length === 0) {
    feedStore.fetchPosts(currentTab.value, true)
  }
})
</script>
