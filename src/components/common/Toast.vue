<template>
  <div class="fixed top-safe-top right-0 left-0 z-50 p-4 pointer-events-none flex flex-col gap-2 items-center">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-center p-4 rounded-xl shadow-float max-w-sm w-full transition-all duration-300',
          toast.type === 'error' ? 'bg-red-500 text-white' : 
          toast.type === 'success' ? 'bg-green-600 text-white' : 
          'bg-gray-800 text-white'
        ]"
      >
        <i :class="[
          'fas mr-3 text-lg',
          toast.type === 'error' ? 'fa-exclamation-circle' : 
          toast.type === 'success' ? 'fa-check-circle' : 
          'fa-info-circle'
        ]"></i>
        <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
        <button @click="remove(toast.id)" class="ml-4 opacity-70 hover:opacity-100 p-1">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

const show = (message, type = 'info', duration = 3000) => {
  const id = nextId++
  toasts.value.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
}

const remove = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) toasts.value.splice(index, 1)
}

// Expose methods to be used globally
defineExpose({ show, remove })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
