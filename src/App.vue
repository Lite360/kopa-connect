<template>
  <div class="app-shell flex font-sans">
    
    <DesktopSidebar v-if="!isAdminRoute" @open-create="isCreateMenuOpen = true" />
    
    <main class="flex-1 flex flex-col min-w-0 max-w-2xl mx-auto md:max-w-none md:w-full md:border-r md:border-gray-100">
      <router-view v-slot="{ Component }">
        <transition name="fade-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <div v-if="!isAdminRoute" class="hidden xl:block w-80 p-6">
      <AppCard class="bg-primary-50 border-none shadow-none mb-6">
        <h3 class="font-bold text-primary-800 mb-2">Welcome to Kopa Connect</h3>
        <p class="text-sm text-primary-700">The social, opportunity, and community platform for Corps Members.</p>
      </AppCard>
    </div>

    <MobileNav v-if="!isAdminRoute" @open-create="isCreateMenuOpen = true" />
    
    <CreateMenu v-model="isCreateMenuOpen" />
    
    <Toast ref="toast" />
    
    <!-- PWA Install Prompt -->
    <InstallPrompt />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePWAStore } from '@/stores/pwa'
import DesktopSidebar from './components/layout/DesktopSidebar.vue'
import MobileNav from './components/layout/MobileNav.vue'
import CreateMenu from './components/layout/CreateMenu.vue'
import Toast from './components/common/Toast.vue'
import AppCard from './components/common/AppCard.vue'
import InstallPrompt from './components/pwa/InstallPrompt.vue'

const route = useRoute()
const pwaStore = usePWAStore()
const isCreateMenuOpen = ref(false)
const toast = ref(null)

const isAdminRoute = computed(() => route.path.startsWith('/assets'))

// Provide global toast system
provide('toast', {
  success: (msg) => toast.value?.show(msg, 'success'),
  error: (msg) => toast.value?.show(msg, 'error'),
  info: (msg) => toast.value?.show(msg, 'info')
})

// Set viewport meta for iOS PWA to prevent zooming on inputs
onMounted(() => {
  pwaStore.init()
  const meta = document.querySelector('meta[name="viewport"]')
  if (meta) {
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  }
})
</script>

<style>
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.2s ease;
}
.fade-page-enter-from,
.fade-page-leave-to {
  opacity: 0;
}
</style>
