<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-500 mt-1">Platform overview and key metrics</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        :class="['bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow']">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-3', stat.bg]">
          <i :class="[stat.icon, 'text-xl', stat.color]"></i>
        </div>
        <p class="text-3xl font-black text-gray-900">
          <span v-if="loading"><i class="fas fa-spinner fa-spin text-xl text-gray-400"></i></span>
          <span v-else>{{ stat.value }}</span>
        </p>
        <p class="text-sm text-gray-500 font-medium mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Recent Users -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div class="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-bold text-gray-800 text-lg">Recent Registrations</h2>
        <router-link to="/assets/users" class="text-primary-600 text-sm font-semibold hover:underline">View all</router-link>
      </div>
      <div class="divide-y divide-gray-50">
        <div v-if="loading" v-for="i in 5" :key="i" class="p-4 flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-100 rounded-full animate-pulse"></div>
          <div class="flex-1 space-y-2"><div class="h-3 bg-gray-100 rounded-full w-1/3 animate-pulse"></div><div class="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse"></div></div>
        </div>
        <div v-else v-for="user in recentUsers" :key="user.id" class="p-4 flex items-center gap-3 hover:bg-gray-50">
          <Avatar :src="user.avatar_url" :name="`${user.first_name} ${user.last_name}`" size="sm" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 text-sm">{{ user.first_name }} {{ user.last_name }}</p>
            <p class="text-xs text-gray-500">{{ user.email }} · <span class="capitalize">{{ user.current_stage?.replace('_', ' ') }}</span></p>
          </div>
          <span class="text-xs text-gray-400">{{ timeAgo(user.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '@/components/common/Avatar.vue'

const loading = ref(true)
const recentUsers = ref([])
const stats = ref([
  { label: 'Total Users', value: '–', icon: 'fas fa-users', bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'Active Camp', value: '–', icon: 'fas fa-tent', bg: 'bg-green-50', color: 'text-green-600' },
  { label: 'Jobs Posted', value: '–', icon: 'fas fa-briefcase', bg: 'bg-purple-50', color: 'text-purple-600' },
  { label: 'Pending Reports', value: '–', icon: 'fas fa-flag', bg: 'bg-red-50', color: 'text-red-600' },
])

const timeAgo = (d) => { try { return formatDistanceToNow(new Date(d), { addSuffix: true }) } catch { return '' } }

onMounted(async () => {
  try {
    const { data } = await API.get('/admin/users?page=1&limit=5')
    recentUsers.value = data.data
    stats.value[0].value = data.pagination?.total?.toLocaleString() || '–'
  } catch (err) { console.error(err) } finally { loading.value = false }
})
</script>
