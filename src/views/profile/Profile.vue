<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50 flex flex-col">
    <AppHeader :title="isOwnProfile ? 'My Profile' : 'Profile'" :showBack="!isOwnProfile" class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3">
      <template #actions v-if="isOwnProfile">
        <router-link to="/settings" class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><i class="fas fa-cog text-lg"></i></router-link>
      </template>
    </AppHeader>

    <div v-if="loading" class="p-4 space-y-4">
      <SkeletonLoader type="card" height="250px" />
      <SkeletonLoader type="card" height="150px" />
    </div>

    <div v-else-if="user" class="flex-1">
      <div class="bg-white border-b border-gray-100 pb-5">
        <div class="h-32 bg-primary-600 relative overflow-hidden">
          <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
        </div>
        <div class="px-5 relative">
          <div class="flex justify-between items-end -mt-10 mb-4">
            <Avatar :src="user.avatar_url" :name="`${user.first_name} ${user.last_name}`" size="xl" class="border-4 border-white shadow-md" />
            
            <div v-if="!isOwnProfile" class="flex gap-2">
              <AppButton variant="outline" size="sm" class="rounded-full px-4"><i class="fas fa-user-plus mr-1"></i>Connect</AppButton>
              <AppButton size="sm" class="rounded-full w-10 h-10 p-0 flex items-center justify-center"><i class="fas fa-envelope"></i></AppButton>
            </div>
            <AppButton v-else variant="outline" size="sm" class="rounded-full px-4" @click="$router.push('/profile/edit')">Edit Profile</AppButton>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 leading-tight">{{ user.first_name }} {{ user.last_name }}</h1>
          <p class="text-sm font-medium text-gray-500 mb-3">{{ user.bio || 'Corps Member' }}</p>

          <div class="flex flex-wrap gap-2 mb-4 text-xs font-medium">
            <span v-if="user.current_stage" class="bg-primary-50 text-primary-700 px-3 py-1 rounded-full capitalize">{{ user.current_stage.replace('_', ' ') }}</span>
            <span v-if="user.state_name" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full"><i class="fas fa-map-marker-alt mr-1"></i>{{ user.state_name }}</span>
            <span v-if="user.batch_stream" class="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">Batch {{ user.batch_stream }}</span>
          </div>

          <div class="flex items-center gap-6 text-sm text-gray-600 font-medium">
            <div class="flex gap-1"><span class="font-bold text-gray-900">{{ user.connections_count || 0 }}</span> Connections</div>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-4">
        <!-- Skills -->
        <AppCard v-if="user.skills && user.skills.length">
          <h3 class="font-bold text-gray-800 mb-3">Skills</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="skill in user.skills" :key="skill" class="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">{{ skill }}</span>
          </div>
        </AppCard>

        <!-- NYSC Details (Only visible if own profile or connections) -->
        <AppCard>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">NYSC Info</h3>
            <button v-if="isOwnProfile" class="text-primary-600 text-sm font-medium"><i class="fas fa-pen"></i></button>
          </div>
          
          <div class="space-y-4 text-sm">
            <div>
              <p class="text-gray-500 font-medium text-xs mb-1">CALL-UP NUMBER</p>
              <p class="text-gray-900 font-medium">{{ user.callup_no || 'Not provided' }}</p>
            </div>
            <div v-if="user.platoon">
              <p class="text-gray-500 font-medium text-xs mb-1">PLATOON</p>
              <p class="text-gray-900 font-medium">Platoon {{ user.platoon }}</p>
            </div>
          </div>
        </AppCard>

        <!-- Posts Placeholder -->
        <div class="pt-2">
          <h3 class="font-bold text-gray-800 mb-3 px-1">Recent Posts</h3>
          <EmptyState icon="fas fa-pen-alt" title="No posts yet" description="This user hasn't posted anything." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore, API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const authStore = useAuthStore()

const user = ref(null)
const loading = ref(true)

const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id === authStore.user?.id
})

const loadProfile = async () => {
  loading.value = true
  try {
    if (isOwnProfile.value) {
      user.value = authStore.user
    } else {
      const { data } = await API.get(`/users/${route.params.id}`)
      user.value = data.user
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProfile())
</script>
