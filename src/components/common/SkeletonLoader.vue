<template>
  <div :class="['skeleton', typeClass]" :style="customStyle"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'text' // text, avatar, card, image
  },
  width: String,
  height: String
})

const typeClass = computed(() => {
  switch (props.type) {
    case 'avatar': return 'rounded-full w-12 h-12'
    case 'card': return 'rounded-2xl h-32 w-full'
    case 'image': return 'rounded-2xl h-48 w-full'
    case 'text': 
    default: return 'h-4 w-full rounded'
  }
})

const customStyle = computed(() => {
  const style = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  return style
})
</script>
