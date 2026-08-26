<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-30">
      <div class="p-6 border-b border-gray-700">
        <Logo :dark="true" />
        <span class="mt-2 inline-block bg-red-600 text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to"
          :class="['flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium',
            $route.path.startsWith(item.to) ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white']">
          <i :class="[item.icon, 'w-5 text-center']"></i>
          {{ item.label }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <div class="flex items-center gap-3">
          <Avatar :src="authStore.user?.avatar_url" :name="`${authStore.user?.first_name} ${authStore.user?.last_name}`" size="sm" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate">{{ authStore.user?.first_name }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ authStore.user?.role?.replace('_', ' ') }}</p>
          </div>
          <button @click="authStore.logout()" class="p-2 text-gray-400 hover:text-red-400 transition-colors"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 flex-1 flex flex-col min-h-screen">
      <div class="flex-1 p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/common/Logo.vue'
import Avatar from '@/components/common/Avatar.vue'

const authStore = useAuthStore()

const navItems = [
  { to: '/assets/dashboard', label: 'Dashboard', icon: 'fas fa-chart-bar' },
  { to: '/assets/users', label: 'Users', icon: 'fas fa-users' },
  { to: '/assets/states', label: 'States', icon: 'fas fa-map' },
  { to: '/assets/camps', label: 'Camps', icon: 'fas fa-tent' },
  { to: '/assets/posts', label: 'Posts', icon: 'fas fa-newspaper' },
  { to: '/assets/jobs', label: 'Jobs', icon: 'fas fa-briefcase' },
  { to: '/assets/marketplace', label: 'Marketplace', icon: 'fas fa-store' },
  { to: '/assets/communities', label: 'Communities', icon: 'fas fa-users-cog' },
  { to: '/assets/events', label: 'Events', icon: 'fas fa-calendar' },
  { to: '/assets/reports', label: 'Reports', icon: 'fas fa-flag' },
  { to: '/assets/settings', label: 'Settings', icon: 'fas fa-cog' },
]
</script>
