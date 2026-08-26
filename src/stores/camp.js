import { defineStore } from 'pinia'
import { API } from './auth'

export const useCampStore = defineStore('camp', {
  state: () => ({
    camp: null,
    announcements: [],
    loading: false,
    initialized: false
  }),
  
  actions: {
    async fetchCampData() {
      try {
        this.loading = true
        const { data } = await API.get('/camp')
        this.camp = data.camp
        this.announcements = data.announcements || []
        this.initialized = true
      } catch (err) {
        console.error('Fetch camp data failed:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
