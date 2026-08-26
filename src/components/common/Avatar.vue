<template>
  <img 
    v-if="src && !imageError" 
    :src="src" 
    :alt="alt || name || 'Avatar'" 
    :class="['avatar', sizeClass, { 'ring-primary-500': active }]"
    @error="imageError = true"
  />
  <div 
    v-else
    :class="['avatar bg-primary-100 flex items-center justify-center text-primary-700 font-bold select-none', sizeClass, { 'ring-primary-500': active }]"
  >
    <span :class="textSizeClass">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: String,
  alt: String,
  size: {
    type: String,
    default: 'md' // sm, md, lg, xl, 2xl
  },
  name: String,
  active: Boolean
})

const imageError = ref(false)
const sizeClass = computed(() => `avatar-${props.size}`)

const textSizeClass = computed(() => ({
  'sm': 'text-xs', 'md': 'text-sm', 'lg': 'text-base', 'xl': 'text-lg', '2xl': 'text-2xl'
}[props.size] || 'text-sm'))

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})
</script>
