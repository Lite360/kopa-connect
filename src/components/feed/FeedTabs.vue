<template>
  <div class="flex gap-4 border-b border-gray-100 mb-4 px-4 sticky top-0 bg-white z-10 pt-2">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      @click="$emit('update:modelValue', tab.id)"
      :class="[
        'pb-3 text-sm font-bold capitalize transition-colors relative',
        modelValue === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
      ]"
    >
      {{ tab.label }}
      <div v-if="modelValue === tab.id" class="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  tabs: {
    type: Array,
    default: () => [
      { id: 'for_you', label: 'For You' },
      { id: 'following', label: 'Following' },
      { id: 'camp', label: 'Camp' },
      { id: 'state', label: 'State' }
    ]
  }
})

defineEmits(['update:modelValue'])
</script>
