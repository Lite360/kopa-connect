<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Messages" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <div v-if="chatStore.loading && !chatStore.initialized" class="p-4 space-y-3">
      <SkeletonLoader type="card" height="72px" v-for="i in 5" :key="i" />
    </div>

    <EmptyState v-else-if="chatStore.conversations.length === 0" icon="fas fa-comment-dots" title="No messages yet" description="Start a conversation with someone from Discover or Camp." />

    <div v-else class="flex-1 bg-white divide-y divide-gray-50">
      <div v-for="conv in chatStore.conversations" :key="conv.id"
        @click="$router.push(`/chat/${conv.id}`)"
        class="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
      >
        <div class="relative">
          <Avatar :src="otherMember(conv)?.avatar_url" :name="convName(conv)" size="md" />
          <span v-if="conv.unread_count > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{{ conv.unread_count > 9 ? '9+' : conv.unread_count }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 :class="['font-semibold truncate', conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700']">{{ convName(conv) }}</h4>
            <span class="text-xs text-gray-400 whitespace-nowrap ml-2">{{ formatTime(conv.last_message_at) }}</span>
          </div>
          <p :class="['text-sm truncate mt-0.5', conv.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-500']">
            {{ conv.last_message?.content || 'Start chatting...' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { formatDistanceToNow } from 'date-fns'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const chatStore = useChatStore()

const otherMember = (conv) => conv.other_members?.[0] || {}
const convName = (conv) => {
  if (conv.name) return conv.name
  const m = otherMember(conv)
  return m.first_name ? `${m.first_name} ${m.last_name}` : 'Unknown'
}
const formatTime = (date) => {
  if (!date) return ''
  try { return formatDistanceToNow(new Date(date), { addSuffix: false }) } catch { return '' }
}

onMounted(() => { if (!chatStore.initialized) chatStore.fetchConversations() })
</script>
