<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader title="Notifications" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3">
      <template #actions>
        <button v-if="unreadCount > 0" @click="markAllRead" class="text-sm font-semibold text-primary-600 px-2">Mark all read</button>
      </template>
    </AppHeader>

    <div v-if="loading && notifications.length === 0" class="p-4 space-y-3">
      <SkeletonLoader type="card" height="72px" v-for="i in 5" :key="i" />
    </div>

    <EmptyState v-else-if="notifications.length === 0" icon="fas fa-bell" title="All caught up!" description="You have no notifications right now." />

    <div v-else class="flex-1 bg-white divide-y divide-gray-50">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        @click="handleNotifClick(notif)"
        :class="['flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors', !notif.is_read ? 'bg-primary-50/50' : '']"
      >
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white', notifColor(notif.type)]">
          <i :class="notifIcon(notif.type)"></i>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800 leading-snug" v-html="notif.message"></p>
          <p class="text-xs text-gray-500 mt-1">{{ timeAgo(notif.created_at) }}</p>
        </div>

        <span v-if="!notif.is_read" class="w-2 h-2 bg-primary-600 rounded-full mt-2 shrink-0"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDistanceToNow } from 'date-fns'
import AppHeader from '@/components/layout/AppHeader.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const notifStore = useNotificationsStore()

const notifications = computed(() => notifStore.notifications)
const loading = computed(() => notifStore.loading)
const unreadCount = computed(() => notifStore.unreadCount)

const timeAgo = (d) => { try { return formatDistanceToNow(new Date(d), { addSuffix: true }) } catch { return '' } }

const notifIcon = (type) => ({
  like: 'fas fa-heart', comment: 'fas fa-comment', connection: 'fas fa-user-plus',
  message: 'fas fa-envelope', mention: 'fas fa-at', job: 'fas fa-briefcase',
  event: 'fas fa-calendar', system: 'fas fa-bell'
}[type] || 'fas fa-bell')

const notifColor = (type) => ({
  like: 'bg-red-500', comment: 'bg-blue-500', connection: 'bg-primary-600',
  message: 'bg-purple-500', mention: 'bg-yellow-500', job: 'bg-indigo-500',
  event: 'bg-green-500', system: 'bg-gray-500'
}[type] || 'bg-gray-500')

const markAllRead = () => notifStore.markAllAsRead()

const handleNotifClick = (notif) => {
  if (!notif.is_read) notifStore.markAsRead(notif.id)
  if (notif.link) router.push(notif.link)
}

onMounted(() => {
  if (!notifStore.initialized) notifStore.fetchNotifications()
})
</script>
