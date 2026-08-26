<template>
  <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" @click="$router.push(`/profile/${person.id}`)">
    <Avatar :src="person.avatar_url" :name="`${person.first_name} ${person.last_name}`" size="md" />
    
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-gray-900 truncate">{{ person.first_name }} {{ person.last_name }}</h4>
      <p v-if="person.bio" class="text-sm text-gray-500 truncate">{{ person.bio }}</p>
      
      <div v-if="person.skills && person.skills.length" class="flex gap-1 mt-1 overflow-x-auto no-scrollbar">
        <span 
          v-for="(skill, idx) in person.skills.slice(0, 3)" 
          :key="idx"
          class="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap"
        >
          {{ skill }}
        </span>
        <span v-if="person.skills.length > 3" class="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
          +{{ person.skills.length - 3 }}
        </span>
      </div>
    </div>

    <button @click.stop="openChat" class="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors shrink-0">
      <i class="far fa-comment-dots text-xl"></i>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import Avatar from '../common/Avatar.vue'

const props = defineProps({
  person: { type: Object, required: true }
})

const router = useRouter()
const chatStore = useChatStore()

const openChat = async () => {
  try {
    const convId = await chatStore.createConversation(props.person.id)
    router.push(`/chat/${convId}`)
  } catch (err) {
    console.error('Failed to open chat', err)
  }
}
</script>
