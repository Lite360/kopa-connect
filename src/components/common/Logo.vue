<template>
  <div class="flex items-center gap-2 select-none">
    <div :class="['font-extrabold tracking-tight flex items-center gap-2', dark ? 'text-white' : 'text-primary-600', sizeClasses.text]">
      <div :class="['bg-primary-600 text-white font-black rounded-xl flex items-center justify-center shadow-sm border border-primary-500', sizeClasses.icon]">
        K
      </div>
      <span v-if="!iconOnly">Kopa Connect</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md' // sm, md, lg
  },
  dark: {
    type: Boolean,
    default: false
  },
  iconOnly: {
    type: Boolean,
    default: false
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return { text: 'text-base', icon: 'w-6 h-6 text-sm rounded-lg' }
    case 'lg': return { text: 'text-2xl', icon: 'w-10 h-10 text-xl rounded-2xl' }
    case 'md': 
    default: return { text: 'text-xl', icon: 'w-8 h-8 text-base rounded-xl' }
  }
})
</script>
