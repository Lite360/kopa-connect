<template>
  <AppModal v-model="isOpen" title="Create" @close="$emit('close')">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      
      <button @click="navigate('/post/create')" class="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group">
        <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <i class="fas fa-pen text-xl"></i>
        </div>
        <span class="text-sm font-semibold text-gray-700">Update</span>
      </button>

      <button @click="navigate('/jobs/create')" class="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group">
        <div class="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
          <i class="fas fa-briefcase text-xl"></i>
        </div>
        <span class="text-sm font-semibold text-gray-700">Job</span>
      </button>

      <button @click="navigate('/marketplace/create')" class="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group">
        <div class="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
          <i class="fas fa-store text-xl"></i>
        </div>
        <span class="text-sm font-semibold text-gray-700">Sell</span>
      </button>

      <button @click="navigate('/events/create')" class="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group">
        <div class="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
          <i class="fas fa-calendar-alt text-xl"></i>
        </div>
        <span class="text-sm font-semibold text-gray-700">Event</span>
      </button>

    </div>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from '../common/AppModal.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'close'])
const router = useRouter()
const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  isOpen.value = val
})

watch(isOpen, (val) => {
  emit('update:modelValue', val)
})

const navigate = (path) => {
  isOpen.value = false
  router.push(path)
}
</script>
