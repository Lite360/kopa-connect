import { defineStore } from 'pinia'
import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    initialized: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isStateAdmin: (state) => state.user?.role === 'state_admin',
    isAdmin: (state) => ['super_admin', 'state_admin'].includes(state.user?.role)
  },
  
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete API.defaults.headers.common['Authorization']
      window.location.href = '/login'
    },
    
    async init() {
      if (this.initialized) return
      this.initialized = true
      
      if (this.token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        try {
          this.loading = true
          const { data } = await API.get('/auth/me')
          this.user = data.user
        } catch (err) {
          console.error('Auth init failed:', err)
          this.logout()
        } finally {
          this.loading = false
        }
      }
    },
    
    async login(identifier, password) {
      const { data } = await API.post('/auth/login', { identifier, password })
      this.setToken(data.token)
      this.user = data.user
      return data
    },
    
    async register(payload) {
      const { data } = await API.post('/auth/register', payload)
      this.setToken(data.token)
      this.user = data.user
      return data
    },
    
    async updateProfile(payload) {
      const { data } = await API.put('/users/profile', payload)
      this.user = { ...this.user, ...data.profile }
      return data
    }
  }
})

// Setup API interceptor to handle 401s
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const store = useAuthStore()
      if (store.token) store.logout()
    }
    return Promise.reject(err)
  }
)

export { API }
