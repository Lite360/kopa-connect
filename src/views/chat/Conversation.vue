<template>
  <div class="flex flex-col h-screen md:h-[calc(100vh)] bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <button @click="$router.push('/chat')" class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><i class="fas fa-arrow-left text-lg"></i></button>
      <Avatar :src="otherUser?.avatar_url" :name="otherUserName" size="sm" />
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900 truncate text-sm">{{ otherUserName }}</h3>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="messagesContainer">
      <div v-if="loadingMessages" class="flex justify-center py-4"><i class="fas fa-spinner fa-spin text-primary-600 text-xl"></i></div>

      <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start']">
        <div :class="['max-w-[75%] px-4 py-2.5 rounded-2xl text-sm', msg.sender_id === authStore.user?.id ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md']">
          <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <p :class="['text-[10px] mt-1', msg.sender_id === authStore.user?.id ? 'text-primary-200' : 'text-gray-400']">{{ formatMsgTime(msg.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-gray-200 p-3 flex gap-2 items-end bg-white pb-safe-bottom">
      <div class="flex-1 bg-gray-100 rounded-2xl p-1 flex items-end">
        <textarea v-model="newMessage" placeholder="Type a message..." class="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm text-gray-800 max-h-24" rows="1" @keydown.enter.exact.prevent="sendMessage" @input="resizeInput" ref="inputRef" :disabled="sending"></textarea>
        <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="p-2 text-primary-600 disabled:text-gray-400 mb-0.5"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore, API } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { format } from 'date-fns'
import Avatar from '@/components/common/Avatar.vue'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const conversationId = route.params.id

const messages = ref([])
const loadingMessages = ref(true)
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const inputRef = ref(null)
let pollInterval = null

const conv = chatStore.conversations.find(c => c.id === conversationId)
const otherUser = conv?.other_members?.[0] || {}
const otherUserName = otherUser.first_name ? `${otherUser.first_name} ${otherUser.last_name}` : 'Chat'

const formatMsgTime = (d) => { try { return format(new Date(d), 'h:mm a') } catch { return '' } }
const resizeInput = () => { if (inputRef.value) { inputRef.value.style.height = 'auto'; inputRef.value.style.height = inputRef.value.scrollHeight + 'px' } }
const scrollToBottom = () => { nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight }) }

const loadMessages = async () => {
  try {
    const { data } = await API.get(`/chat/messages/${conversationId}`)
    messages.value = data.messages
    scrollToBottom()
    // Mark as read
    await API.put(`/chat/messages/${conversationId}`)
    chatStore.markAsRead(conversationId)
  } catch (err) { console.error(err) } finally { loadingMessages.value = false }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  const content = newMessage.value.trim()
  newMessage.value = ''
  if (inputRef.value) inputRef.value.style.height = 'auto'
  
  // Optimistic update
  const tempMsg = { id: Date.now(), sender_id: authStore.user.id, content, created_at: new Date().toISOString() }
  messages.value.push(tempMsg)
  scrollToBottom()
  
  sending.value = true
  try {
    const { data } = await API.post(`/chat/messages/${conversationId}`, { content })
    const idx = messages.value.findIndex(m => m.id === tempMsg.id)
    if (idx > -1) messages.value[idx] = data.message
    chatStore.updateLastMessage(conversationId, data.message)
  } catch (err) { console.error(err) } finally { sending.value = false }
}

const pollNewMessages = async () => {
  try {
    const { data } = await API.get(`/chat/messages/${conversationId}`)
    if (data.messages.length !== messages.value.length) {
      messages.value = data.messages
      scrollToBottom()
    }
  } catch {}
}

onMounted(() => { loadMessages(); pollInterval = setInterval(pollNewMessages, 5000) })
onUnmounted(() => { if (pollInterval) clearInterval(pollInterval) })
</script>
