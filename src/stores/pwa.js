import { defineStore } from 'pinia'

const DISMISSED_KEY = 'kopa_pwa_dismissed'

export const usePWAStore = defineStore('pwa', {
  state: () => ({
    deferredPrompt: null,
    isInstallable: false,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isAndroid: /android/i.test(navigator.userAgent),
    dismissed: false,
  }),

  getters: {
    // Show the prompt if: installable (or iOS), not standalone, and not dismissed
    showInstallPrompt(state) {
      if (state.isStandalone || state.dismissed) return false
      if (state.isInstallable) return true
      // On iOS, show instructions since there's no beforeinstallprompt event
      if (state.isIOS) return !localStorage.getItem(DISMISSED_KEY)
      return false
    }
  },

  actions: {
    init() {
      // Restore dismissed state
      if (localStorage.getItem(DISMISSED_KEY)) {
        this.dismissed = true
      }

      // Android / Chrome install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.deferredPrompt = e
        this.isInstallable = true
      })

      // Installed callback
      window.addEventListener('appinstalled', () => {
        this.isInstallable = false
        this.isStandalone = true
        this.deferredPrompt = null
      })

      // Track display mode changes
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        this.isStandalone = e.matches
      })
    },

    async triggerInstall() {
      if (!this.deferredPrompt) return false

      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice

      if (outcome === 'accepted') {
        this.isInstallable = false
        this.deferredPrompt = null
        return true
      }
      return false
    },

    dismissInstallPrompt() {
      this.dismissed = true
      localStorage.setItem(DISMISSED_KEY, '1')
    }
  }
})

// Backwards-compat alias
export const usePwaStore = usePWAStore
