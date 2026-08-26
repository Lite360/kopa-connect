<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-300 text-3xl mb-4">
      <i :class="icon"></i>
    </div>
    <h3 class="text-lg font-bold text-gray-800 mb-2">{{ title }}</h3>
    <p class="text-gray-500 text-sm max-w-xs mb-6 text-balance">{{ description }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'fas fa-inbox' },
  title: { type: String, default: 'Nothing here yet' },
  description: { type: String, default: 'There is no data to display at the moment.' }
})
</script>
