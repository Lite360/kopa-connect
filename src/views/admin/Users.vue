<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
        <p class="text-gray-500 text-sm mt-0.5">Manage all registered corps members</p>
      </div>
      <div class="flex gap-3">
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input v-model="search" @input="debounceSearch" type="text" placeholder="Search..." class="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-56" />
        </div>
        <select v-model="stageFilter" @change="resetAndLoad" class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500">
          <option value="">All Stages</option>
          <option value="prospective">Prospective</option>
          <option value="camp">In Camp</option>
          <option value="ppa">PPA</option>
          <option value="cds">CDS</option>
          <option value="pass_out">Passed Out</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Loading -->
      <div v-if="loading && users.length === 0" class="divide-y divide-gray-50">
        <div v-for="i in 8" :key="i" class="p-4 flex gap-4 items-center">
          <div class="w-9 h-9 bg-gray-100 rounded-full animate-pulse"></div>
          <div class="flex-1 space-y-2"><div class="h-3 bg-gray-100 rounded w-40 animate-pulse"></div><div class="h-3 bg-gray-100 rounded w-60 animate-pulse"></div></div>
        </div>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <th class="px-5 py-3">User</th>
            <th class="px-5 py-3">Stage</th>
            <th class="px-5 py-3">State</th>
            <th class="px-5 py-3">Joined</th>
            <th class="px-5 py-3">Role</th>
            <th class="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <Avatar :src="user.avatar_url" :name="`${user.first_name} ${user.last_name}`" size="sm" />
                <div>
                  <p class="font-semibold text-gray-900">{{ user.first_name }} {{ user.last_name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3"><span class="capitalize text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{{ user.current_stage?.replace('_', ' ') || '–' }}</span></td>
            <td class="px-5 py-3 text-gray-600">{{ user.state_name || '–' }}</td>
            <td class="px-5 py-3 text-gray-500 text-xs">{{ timeAgo(user.created_at) }}</td>
            <td class="px-5 py-3">
              <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', user.role === 'super_admin' ? 'bg-red-100 text-red-700' : user.role === 'state_admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">
                {{ user.role?.replace('_', ' ') || 'user' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex gap-2">
                <router-link :to="`/profile/${user.id}`" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Profile"><i class="fas fa-eye text-xs"></i></router-link>
                <button @click="suspendUser(user)" :class="['p-1.5 rounded-lg transition-colors', user.is_suspended ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50']" :title="user.is_suspended ? 'Unsuspend' : 'Suspend'"><i :class="['fas text-xs', user.is_suspended ? 'fa-check-circle' : 'fa-ban']"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Load More -->
      <div v-if="hasMore" class="p-4 border-t border-gray-100 flex justify-center">
        <button @click="loadUsers" :disabled="loading" class="text-sm font-semibold text-primary-600 hover:underline disabled:opacity-50">{{ loading ? 'Loading...' : 'Load More' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { API } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '@/components/common/Avatar.vue'

const toast = inject('toast')
const search = ref(''); const stageFilter = ref(''); const users = ref([]); const loading = ref(false); const page = ref(1); const hasMore = ref(true)
let searchTimeout

const timeAgo = (d) => { try { return formatDistanceToNow(new Date(d), { addSuffix: true }) } catch { return '' } }
const debounceSearch = () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => resetAndLoad(), 400) }
const resetAndLoad = () => { page.value = 1; users.value = []; hasMore.value = true; loadUsers() }

const loadUsers = async () => {
  if (!hasMore.value || loading.value) return
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit: 20 })
    if (search.value) params.append('search', search.value)
    if (stageFilter.value) params.append('stage', stageFilter.value)
    const { data } = await API.get(`/admin/users?${params}`)
    users.value = page.value === 1 ? data.data : [...users.value, ...data.data]
    hasMore.value = data.pagination.hasMore
    if (hasMore.value) page.value++
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const suspendUser = async (user) => {
  try {
    await API.put(`/admin/users/${user.id}`, { is_suspended: !user.is_suspended })
    user.is_suspended = !user.is_suspended
    toast.success(user.is_suspended ? 'User suspended' : 'User unsuspended')
  } catch { toast.error('Action failed') }
}

onMounted(() => loadUsers())
</script>
