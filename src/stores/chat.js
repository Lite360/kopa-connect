import { defineStore } from 'pinia'
import { API } from './auth'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    loading: false,
    initialized: false
  }),
  
  getters: {
    totalUnread: (state) => state.conversations.reduce((acc, curr) => acc + parseInt(curr.unread_count || 0), 0)
  },
  
  actions: {
    async fetchConversations() {
      try {
        this.loading = true
        const { data } = await API.get('/chat/conversations')
        this.conversations = data.conversations
        this.initialized = true
      } catch (err) {
        console.error('Fetch conversations failed:', err)
      } finally {
        this.loading = false
      }
    },
    
    async createConversation(participantId) {
      const { data } = await API.post('/chat/conversations', { participant_id: participantId })
      return data.conversation_id
    },

    markAsRead(conversationId) {
      const conv = this.conversations.find(c => c.id === conversationId)
      if (conv) conv.unread_count = 0
    },

    updateLastMessage(conversationId, message) {
      const conv = this.conversations.find(c => c.id === conversationId)
      if (conv) {
        conv.last_message = message
        conv.last_message_at = message.created_at
        
        // Sort conversations
        this.conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
      }
    }
  }
})
