<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50"><AppHeader title="Vendor" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />
    <div v-if="loading" class="p-4"><SkeletonLoader type="card" height="200px" /></div>
    <div v-else-if="vendor" class="pb-4">
      <div class="bg-primary-700 text-white p-6"><div class="flex items-center gap-4 mb-3"><Avatar :src="vendor.logo_url" :name="vendor.business_name" size="xl" /><div><h1 class="text-xl font-bold">{{ vendor.business_name }}</h1><p v-if="vendor.category" class="text-primary-200 text-sm capitalize">{{ vendor.category }}</p><div v-if="vendor.rating" class="flex items-center gap-1 mt-1"><i class="fas fa-star text-yellow-400 text-sm"></i><span class="text-sm">{{ vendor.rating }}</span><span class="text-primary-200 text-xs">({{ vendor.total_reviews }} reviews)</span></div></div></div>
        <p v-if="vendor.description" class="text-primary-100 text-sm">{{ vendor.description }}</p>
        <div class="flex gap-2 mt-4">
          <a v-if="vendor.phone" :href="`tel:${vendor.phone}`" class="bg-white/20 p-2 rounded-lg"><i class="fas fa-phone"></i></a>
          <a v-if="vendor.whatsapp" :href="`https://wa.me/${vendor.whatsapp}`" target="_blank" class="bg-white/20 p-2 rounded-lg"><i class="fab fa-whatsapp"></i></a>
          <a v-if="vendor.email" :href="`mailto:${vendor.email}`" class="bg-white/20 p-2 rounded-lg"><i class="fas fa-envelope"></i></a>
        </div>
      </div>
      <div class="p-4"><h3 class="font-bold text-gray-800 mb-3">Products & Services</h3>
        <div v-if="listings.length === 0"><EmptyState icon="fas fa-box-open" title="No listings" description="This vendor hasn't posted anything yet." /></div>
        <div v-else class="grid grid-cols-2 gap-3"><ListingCard v-for="l in listings" :key="l.id" :listing="l" /></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import ListingCard from '@/components/marketplace/ListingCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
const route = useRoute(); const vendor = ref(null); const listings = ref([]); const loading = ref(true)
onMounted(async () => {
  try {
    const [vRes, lRes] = await Promise.all([API.get(`/marketplace/vendors`), API.get(`/marketplace?vendor_id=${route.params.id}`)])
    vendor.value = vRes.data.vendors.find(v => v.id === route.params.id)
    listings.value = lRes.data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
})
</script>
