import { defineStore } from 'pinia'
import { API } from './auth'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    initialized: false,
    page: 1,
    hasMore: true,
  }),

  actions: {
    async fetchNotifications(reset = false) {
      if (this.loading) return
      if (reset) {
        this.page = 1
        this.notifications = []
        this.hasMore = true
      }

      this.loading = true
      try {
        const { data } = await API.get(`/notifications?page=${this.page}&limit=20`)
        const newNotifs = data.data || []

        if (reset || this.page === 1) {
          this.notifications = newNotifs
        } else {
          this.notifications = [...this.notifications, ...newNotifs]
        }

        this.unreadCount = data.unread_count ?? this.unreadCount
        this.hasMore = data.pagination?.hasMore || false
        if (this.hasMore) this.page++
        this.initialized = true
      } catch (err) {
        console.error('Fetch notifications failed:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      try {
        const { data } = await API.get('/notifications?limit=1')
        this.unreadCount = data.unread_count ?? 0
        this.initialized = true
      } catch (err) {
        console.error('Fetch unread count failed:', err)
      }
    },

    async markAsRead(id) {
      try {
        await API.put(`/notifications/${id}`)
        const notif = this.notifications.find(n => n.id === id)
        if (notif && !notif.is_read) {
          notif.is_read = true
          if (this.unreadCount > 0) this.unreadCount--
        }
      } catch (err) {
        console.error('Mark read failed:', err)
      }
    },

    async markAllAsRead() {
      try {
        await API.put('/notifications', { mark_all_read: true })
        this.notifications.forEach(n => { n.is_read = true })
        this.unreadCount = 0
      } catch (err) {
        console.error('Mark all read failed:', err)
      }
    },

    decrementUnread() {
      if (this.unreadCount > 0) this.unreadCount--
    },

    // Called from App.vue or polling interval to refresh count
    async pollUnreadCount() {
      try {
        const { data } = await API.get('/notifications?limit=1')
        this.unreadCount = data.unread_count ?? 0
      } catch {}
    }
  }
})
