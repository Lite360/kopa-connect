<template>
  <div class="bg-primary-700 text-white p-6 md:rounded-b-3xl shadow-md relative overflow-hidden">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="camp-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#camp-pattern)" />
      </svg>
    </div>

    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <i class="fas fa-tent text-2xl text-white"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold leading-tight">{{ camp.name }}</h2>
          <p class="text-primary-100 text-sm">{{ camp.state_name }} State Orientation Camp</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
          <p class="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Batch</p>
          <p class="text-xl font-bold">{{ camp.batch_stream }}</p>
        </div>
        <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
          <p class="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Status</p>
          <div class="flex items-center gap-2">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p class="text-xl font-bold">Active</p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <button @click="$emit('view-people')" class="flex-1 bg-white text-primary-700 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
          <i class="fas fa-users mr-2"></i> Platoon Members
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  camp: { type: Object, required: true }
})
defineEmits(['view-people'])
</script>
