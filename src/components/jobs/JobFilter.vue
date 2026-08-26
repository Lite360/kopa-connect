<template>
  <div class="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
    <button 
      v-for="f in filters" :key="f.value"
      @click="$emit('update:modelValue', f.value)"
      :class="[
        'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors',
        modelValue === f.value 
          ? 'bg-primary-600 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
    >
      {{ f.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  filters: {
    type: Array,
    default: () => [
      { value: '', label: 'All Jobs' },
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'remote', label: 'Remote' },
      { value: 'internship', label: 'Internship' }
    ]
  }
})
defineEmits(['update:modelValue'])
</script>
