<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="relative mb-6">
      <div class="absolute inset-0 bg-primary-200/50 rounded-full animate-pulse-dot blur-md"></div>
      <div class="relative w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center text-primary-500 text-4xl shadow-sm border border-white">
        <i :class="icon" class="animate-bounce-slow"></i>
      </div>
    </div>
    <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>
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
