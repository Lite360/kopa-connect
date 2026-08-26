<template>
  <div :class="['card', { 'card-hover': hoverable, 'p-4': !noPadding }]">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  hoverable: Boolean,
  noPadding: Boolean
})
</script>
