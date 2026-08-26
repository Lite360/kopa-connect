<template>
  <button 
    :class="[
      'btn', 
      variantClass, 
      sizeClass, 
      { 'opacity-75 cursor-wait': loading, 'w-full': block }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
    <i v-else-if="icon" :class="[icon, { 'mr-2': $slots.default }]"></i>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, ghost, danger
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
  },
  icon: String,
  loading: Boolean,
  disabled: Boolean,
  block: Boolean
})

const variantClass = computed(() => `btn-${props.variant}`)
const sizeClass = computed(() => `btn-${props.size}`)
</script>
