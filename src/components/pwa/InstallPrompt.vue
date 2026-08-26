<template>
  <!-- Bottom Sheet Install Banner -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="pwaStore.showInstallPrompt"
        class="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
      >
        <div class="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <!-- Green accent bar -->
          <div class="h-1 bg-gradient-to-r from-primary-500 to-primary-700"></div>

          <div class="p-5">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-md">
                K
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 text-base leading-tight">Install Kopa Connect</h3>
                <p class="text-sm text-gray-500 mt-1 leading-snug">
                  Add to your home screen for the full app experience — offline support, faster load, and notifications.
                </p>
              </div>

              <button
                @click="pwaStore.dismissInstallPrompt()"
                class="p-1.5 -mt-1 -mr-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Feature pills -->
            <div class="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
              <span class="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                <i class="fas fa-wifi-slash text-[10px]"></i> Works Offline
              </span>
              <span class="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                <i class="fas fa-bolt text-[10px]"></i> Faster
              </span>
              <span class="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                <i class="fas fa-bell text-[10px]"></i> Notifications
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4">
              <button
                @click="pwaStore.dismissInstallPrompt()"
                class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Not Now
              </button>
              <button
                @click="install"
                class="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
              >
                <i class="fas fa-download mr-1.5"></i> Install App
              </button>
            </div>

            <!-- iOS specific instructions -->
            <div v-if="pwaStore.isIOS && !pwaStore.isStandalone" class="mt-4 bg-blue-50 rounded-2xl p-3">
              <p class="text-xs text-blue-800 font-medium mb-2">To install on iPhone/iPad:</p>
              <div class="flex items-center gap-2 text-xs text-blue-700">
                <span class="bg-white rounded-lg px-2 py-1 font-medium shadow-sm">1.</span>
                <span>Tap the <strong>Share</strong> button <i class="fas fa-share-square"></i></span>
              </div>
              <div class="flex items-center gap-2 text-xs text-blue-700 mt-1">
                <span class="bg-white rounded-lg px-2 py-1 font-medium shadow-sm">2.</span>
                <span>Select <strong>"Add to Home Screen"</strong> <i class="fas fa-plus-square"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { usePWAStore } from '@/stores/pwa'

const pwaStore = usePWAStore()

const install = async () => {
  await pwaStore.triggerInstall()
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.pb-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
