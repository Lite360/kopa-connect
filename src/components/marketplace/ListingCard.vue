<template>
  <AppCard class="mb-3 border border-gray-100 overflow-hidden" hoverable noPadding @click="$router.push(`/vendor/${listing.vendor_id}`)">
    <div v-if="primaryMedia" class="h-40 bg-gray-100 relative overflow-hidden">
      <img :src="primaryMedia" class="w-full h-full object-cover" loading="lazy" />
      <span v-if="listing.is_featured" class="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-gray-900 truncate">{{ listing.title }}</h3>
      <p class="text-sm text-gray-500 truncate mt-0.5">{{ listing.business_name }}</p>
      
      <div class="flex items-center justify-between mt-3">
        <span v-if="listing.price" class="text-lg font-bold text-primary-700">₦{{ Number(listing.price).toLocaleString() }}</span>
        <span v-else-if="listing.price_label" class="text-sm font-semibold text-primary-600">{{ listing.price_label }}</span>
        <span v-else class="text-sm text-gray-500">Contact for price</span>
        
        <span v-if="listing.is_negotiable" class="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">Negotiable</span>
      </div>

      <div v-if="listing.state_name" class="text-xs text-gray-500 mt-2">
        <i class="fas fa-map-marker-alt mr-1"></i>{{ listing.state_name }}
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '../common/AppCard.vue'

const props = defineProps({
  listing: { type: Object, required: true }
})

const primaryMedia = computed(() => {
  if (props.listing.media && props.listing.media.length > 0) return props.listing.media[0].url
  return null
})
</script>
