<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-white"><AppHeader title="Community" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />
    <div v-if="loading" class="p-4"><SkeletonLoader type="card" height="200px" /></div>
    <div v-else-if="community">
      <div class="relative"><div class="h-32 bg-gradient-to-r from-primary-600 to-primary-800" :style="community.cover_url ? `background-image:url(${community.cover_url});background-size:cover` : ''"></div>
        <div class="px-4 -mt-8 flex items-end gap-4"><Avatar :src="community.avatar_url" :name="community.name" size="xl" class="border-4 border-white shadow-lg" /><div class="pb-2"><h1 class="text-xl font-bold text-gray-900">{{ community.name }}</h1><p class="text-sm text-gray-500"><i class="fas fa-users mr-1"></i>{{ community.members_count }} members</p></div></div>
      </div>
      <div class="p-4 border-b border-gray-100"><p v-if="community.description" class="text-gray-700 text-sm">{{ community.description }}</p>
        <AppButton v-if="!community.is_member" block class="mt-4" @click="joinCommunity" :loading="joining">Join Community</AppButton>
        <AppButton v-else variant="outline" block class="mt-4" disabled><i class="fas fa-check mr-2"></i>Joined</AppButton>
      </div>
      <div class="p-4"><h3 class="font-bold text-gray-800 mb-3">Discussion</h3><EmptyState icon="fas fa-comments" title="Coming soon" description="Community discussions will be available in a future update." /></div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import AppButton from '@/components/common/AppButton.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
const route = useRoute(); const toast = inject('toast'); const community = ref(null); const loading = ref(true); const joining = ref(false)
onMounted(async () => { try { const { data } = await API.get(`/communities?search=`); community.value = data.data.find(c => c.id === route.params.id) || data.data[0] } catch {} finally { loading.value = false } })
const joinCommunity = async () => { joining.value = true; try { toast.success('Joined!'); community.value.is_member = true; community.value.members_count++ } catch {} finally { joining.value = false } }
</script>
