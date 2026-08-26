<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-white">
    <AppHeader title="Post" showBack
      class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <div v-if="loading && !post" class="p-4">
      <SkeletonLoader type="card" />
    </div>

    <div v-else-if="error" class="p-8 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="post" class="pb-16">
      <!-- Main Post -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <router-link :to="`/profile/${post.author_id}`" class="flex items-center gap-3">
            <Avatar :src="post.author_avatar" :name="`${post.first_name} ${post.last_name}`" size="md" />
            <div>
              <p class="font-bold text-gray-900 leading-tight">
                {{ post.first_name }} {{ post.last_name }}
              </p>
              <p class="text-sm text-gray-500">
                <span v-if="post.author_stage" class="capitalize">{{ post.author_stage.replace('_', ' ') }}</span>
                <span v-if="post.state_name"> • {{ post.state_name }}</span>
              </p>
            </div>
          </router-link>

          <button v-if="isAuthor || isSuperAdmin" @click="deletePost"
            class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <p class="text-gray-900 text-lg whitespace-pre-wrap break-words mb-4">{{ post.content }}</p>

        <div v-if="post.media_url" class="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-4">
          <img :src="post.media_url" class="w-full h-auto" />
        </div>

        <div class="text-sm text-gray-500 border-b border-gray-100 pb-3 mb-3">
          {{ formattedDate }}
        </div>

        <div class="flex items-center gap-6 text-gray-500">
          <button @click="toggleLike" class="flex items-center gap-2 p-1 transition-colors group"
            :class="post.is_liked ? 'text-red-500' : 'hover:text-red-500'">
            <i :class="[post.is_liked ? 'fas text-red-500' : 'far group-hover:text-red-500', 'fa-heart text-xl']"></i>
            <span class="font-medium">{{ post.likes_count || 0 }}</span>
          </button>

          <div class="flex items-center gap-2 p-1">
            <i class="far fa-comment text-xl"></i>
            <span class="font-medium">{{ comments.length }}</span>
          </div>
        </div>
      </div>

      <!-- Comments List -->
      <div class="divide-y divide-gray-50">
        <div v-for="comment in comments" :key="comment.id" class="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
          <router-link :to="`/profile/${comment.author_id}`" class="flex-shrink-0">
            <Avatar :src="comment.author_avatar" :name="`${comment.first_name} ${comment.last_name}`" size="sm" />
          </router-link>

          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <router-link :to="`/profile/${comment.author_id}`"
                class="font-bold text-sm text-gray-900 hover:underline">
                {{ comment.first_name }} {{ comment.last_name }}
              </router-link>
              <span class="text-xs text-gray-500">{{ formatTimeAgo(comment.created_at) }}</span>
            </div>
            <p class="text-gray-800 text-sm mt-1 whitespace-pre-wrap break-words">{{ comment.content }}</p>
          </div>
        </div>
      </div>

      <div v-if="loadingComments" class="p-4 text-center text-gray-500">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    </div>

    <!-- Comment Input Fixed Bottom -->
    <div v-if="post && isAuthenticated"
      class="fixed bottom-[60px] md:bottom-0 left-0 right-0 md:left-64 xl:right-[320px] bg-white border-t border-gray-200 p-3 flex gap-2 items-end z-30">
      <Avatar :src="authStore.user?.avatar_url" :name="`${authStore.user?.first_name} ${authStore.user?.last_name}`"
        size="sm" class="mb-1" />
      <div class="flex-1 bg-gray-100 rounded-2xl p-1 flex items-end">
        <textarea v-model="newComment" placeholder="Write a comment..."
          class="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm text-gray-800 max-h-32"
          rows="1" @input="resizeTextarea" ref="commentInputRef" :disabled="submittingComment"></textarea>
        <button @click="submitComment" :disabled="!newComment.trim() || submittingComment"
          class="p-2 text-primary-600 disabled:text-gray-400 mb-0.5">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, API } from '@/stores/auth'
import { format, formatDistanceToNow } from 'date-fns'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')

const postId = route.params.id
const post = ref(null)
const comments = ref([])
const loading = ref(true)
const loadingComments = ref(false)
const error = ref('')

const newComment = ref('')
const submittingComment = ref(false)
const commentInputRef = ref(null)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAuthor = computed(() => post.value?.author_id === authStore.user?.id)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const formattedDate = computed(() => {
  if (!post.value) return ''
  return format(new Date(post.value.created_at), 'h:mm a · MMM d, yyyy')
})

const formatTimeAgo = (date) => {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }) }
  catch { return '' }
}

const resizeTextarea = () => {
  if (commentInputRef.value) {
    commentInputRef.value.style.height = 'auto'
    commentInputRef.value.style.height = commentInputRef.value.scrollHeight + 'px'
  }
}

const loadPost = async () => {
  try {
    const { data } = await API.get(`/feed/posts/${postId}`)
    post.value = data.post
  } catch (err) {
    error.value = 'Post not found or deleted'
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  loadingComments.value = true
  try {
    const { data } = await API.get(`/feed/posts/${postId}/comments`)
    comments.value = data.comments
  } catch (err) {
    console.error('Failed to load comments', err)
  } finally {
    loadingComments.value = false
  }
}

const toggleLike = async () => {
  if (!isAuthenticated.value) return router.push('/login')

  const isLiked = post.value.is_liked
  post.value.is_liked = !isLiked
  post.value.likes_count = parseInt(post.value.likes_count) + (isLiked ? -1 : 1)

  try {
    if (isLiked) {
      await API.delete(`/feed/posts/${postId}/like`)
    } else {
      await API.post(`/feed/posts/${postId}/like`)
    }
  } catch (err) {
    post.value.is_liked = isLiked
    post.value.likes_count = parseInt(post.value.likes_count) + (isLiked ? 1 : -1)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  submittingComment.value = true
  try {
    const { data } = await API.post(`/feed/posts/${postId}/comments`, { content: newComment.value.trim() })
    comments.value.unshift(data.comment)
    post.value.comments_count = parseInt(post.value.comments_count) + 1
    newComment.value = ''
    if (commentInputRef.value) commentInputRef.value.style.height = 'auto'
  } catch (err) {
    toast.error('Failed to post comment')
  } finally {
    submittingComment.value = false
  }
}

const deletePost = async () => {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    await API.delete(`/feed/posts/${postId}`)
    toast.success('Post deleted')
    router.back()
  } catch (err) {
    toast.error('Failed to delete post')
  }
}

onMounted(() => {
  loadPost()
  loadComments()
})
</script>
