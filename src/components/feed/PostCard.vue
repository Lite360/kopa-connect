<template>
  <AppCard class="mb-3 sm:mb-4 border-b sm:border border-gray-100 rounded-none sm:rounded-2xl" hoverable>
    <div class="flex gap-3 relative">
      <!-- Avatar -->
      <router-link :to="`/profile/${post.author_id}`" class="flex-shrink-0 mt-1">
        <Avatar :src="post.author_avatar" :name="`${post.first_name} ${post.last_name}`" size="md" />
      </router-link>

      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div>
            <router-link :to="`/profile/${post.author_id}`" class="font-bold text-gray-900 hover:underline mr-1 truncate">
              {{ post.first_name }} {{ post.last_name }}
            </router-link>
            <span v-if="post.author_stage" class="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md capitalize font-medium">
              {{ post.author_stage.replace('_', ' ') }}
            </span>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ timeAgo }}
              <span v-if="post.state_name"> • {{ post.state_name }}</span>
            </div>
          </div>
          
          <!-- Menu (simplified) -->
          <button class="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="mt-2 text-gray-800 whitespace-pre-wrap break-words text-[15px]" @click="goToDetail">
          {{ post.content }}
        </div>

        <!-- Media -->
        <div v-if="post.media_url" class="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-h-96" @click="goToDetail">
          <!-- Depending on type, could be image/video, assume image for MVP -->
          <img :src="post.media_url" class="w-full h-full object-cover" loading="lazy" />
        </div>

        <!-- Actions -->
        <div class="mt-3 flex items-center justify-between text-gray-500 max-w-sm">
          <button 
            @click.stop="toggleLike"
            class="flex items-center gap-1.5 p-2 -ml-2 rounded-full transition-all duration-300 group active:scale-95"
            :class="post.is_liked ? 'text-red-500 bg-red-50/80 shadow-sm' : 'hover:text-red-500 hover:bg-red-50 hover:shadow-sm'"
          >
            <i :class="[post.is_liked ? 'fas text-red-500 scale-110' : 'far group-hover:text-red-500 group-hover:scale-110 transition-transform', 'fa-heart']"></i>
            <span class="text-xs font-medium">{{ formatCount(post.likes_count) }}</span>
          </button>

          <button 
            @click="goToDetail"
            class="flex items-center gap-1.5 p-2 rounded-full hover:text-primary-500 hover:bg-primary-50 hover:shadow-sm transition-all duration-300 group active:scale-95"
          >
            <i class="far fa-comment group-hover:text-primary-500 group-hover:scale-110 transition-transform"></i>
            <span class="text-xs font-medium">{{ formatCount(post.comments_count) }}</span>
          </button>
          
          <button class="flex items-center gap-1.5 p-2 rounded-full hover:text-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all duration-300 group active:scale-95">
            <i class="far fa-share-square group-hover:text-blue-500 group-hover:scale-110 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFeedStore } from '@/stores/feed'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../common/Avatar.vue'
import AppCard from '../common/AppCard.vue'

const props = defineProps({
  post: { type: Object, required: true }
})

const router = useRouter()
const feedStore = useFeedStore()

const timeAgo = computed(() => {
  try {
    return formatDistanceToNow(new Date(props.post.created_at), { addSuffix: true })
  } catch (e) {
    return ''
  }
})

const formatCount = (count) => {
  if (!count) return '0'
  return count > 999 ? (count/1000).toFixed(1) + 'k' : count
}

const goToDetail = () => {
  router.push(`/post/${props.post.id}`)
}

const toggleLike = () => {
  feedStore.toggleLike(props.post.id)
}
</script>
