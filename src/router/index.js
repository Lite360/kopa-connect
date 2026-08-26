import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Auth
  { path: '/login', component: () => import('@/views/auth/Login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/views/auth/Register.vue'), meta: { guest: true } },
  { path: '/forgot-password', component: () => import('@/views/auth/ForgotPassword.vue'), meta: { guest: true } },
  
  // Main
  { path: '/', component: () => import('@/views/feed/Feed.vue'), meta: { requiresAuth: false } },
  { path: '/post/:id', component: () => import('@/views/feed/PostDetail.vue'), meta: { requiresAuth: false } },
  
  // Discover
  { path: '/discover', component: () => import('@/views/discover/Discover.vue'), meta: { requiresAuth: false } },
  { path: '/people/search', component: () => import('@/views/discover/PeopleSearch.vue'), meta: { requiresAuth: false } },
  
  // Camp
  { path: '/camp', component: () => import('@/views/camp/Camp.vue'), meta: { requiresAuth: true } },
  { path: '/camp/people', component: () => import('@/views/camp/CampPeople.vue'), meta: { requiresAuth: true } },
  
  // Jobs
  { path: '/jobs', component: () => import('@/views/jobs/Jobs.vue'), meta: { requiresAuth: false } },
  { path: '/job/:id', component: () => import('@/views/jobs/JobDetail.vue'), meta: { requiresAuth: false } },
  { path: '/jobs/create', component: () => import('@/views/jobs/CreateJob.vue'), meta: { requiresAuth: true } },
  
  // Marketplace
  { path: '/marketplace', component: () => import('@/views/marketplace/Marketplace.vue'), meta: { requiresAuth: false } },
  { path: '/vendor/:id', component: () => import('@/views/marketplace/VendorProfile.vue'), meta: { requiresAuth: false } },
  { path: '/marketplace/create', component: () => import('@/views/marketplace/CreateListing.vue'), meta: { requiresAuth: true } },
  
  // Chat
  { path: '/chat', component: () => import('@/views/chat/Chat.vue'), meta: { requiresAuth: true } },
  { path: '/chat/:id', component: () => import('@/views/chat/Conversation.vue'), meta: { requiresAuth: true } },
  
  // Communities
  { path: '/communities', component: () => import('@/views/communities/Communities.vue'), meta: { requiresAuth: false } },
  { path: '/community/:id', component: () => import('@/views/communities/CommunityDetail.vue'), meta: { requiresAuth: false } },
  
  // Events
  { path: '/events', component: () => import('@/views/events/Events.vue'), meta: { requiresAuth: false } },
  { path: '/event/:id', component: () => import('@/views/events/EventDetail.vue'), meta: { requiresAuth: false } },
  { path: '/events/create', component: () => import('@/views/events/CreateEvent.vue'), meta: { requiresAuth: true } },
  
  // Profile
  { path: '/profile', component: () => import('@/views/profile/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/:id', component: () => import('@/views/profile/Profile.vue'), meta: { requiresAuth: false } },
  { path: '/profile/edit', component: () => import('@/views/profile/EditProfile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/cds', component: () => import('@/views/profile/CDSForm.vue'), meta: { requiresAuth: true } },
  { path: '/profile/ppa', component: () => import('@/views/profile/PPAMap.vue'), meta: { requiresAuth: true } },
  
  // Notifications
  { path: '/notifications', component: () => import('@/views/notifications/Notifications.vue'), meta: { requiresAuth: true } },
  
  // Admin — nested under AdminLayout
  {
    path: '/assets',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/assets/dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'users', component: () => import('@/views/admin/Users.vue') },
      { path: 'states', component: () => import('@/views/admin/States.vue') },
      { path: 'camps', component: () => import('@/views/admin/Camps.vue') },
      { path: 'posts', component: () => import('@/views/admin/Posts.vue') },
      { path: 'jobs', component: () => import('@/views/admin/Jobs.vue') },
      { path: 'marketplace', component: () => import('@/views/admin/Marketplace.vue') },
      { path: 'communities', component: () => import('@/views/admin/Communities.vue') },
      { path: 'events', component: () => import('@/views/admin/Events.vue') },
      { path: 'reports', component: () => import('@/views/admin/Reports.vue') },
      { path: 'settings', component: () => import('@/views/admin/Settings.vue'), meta: { requiresSuperAdmin: true } },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to init on first load
  if (!authStore.initialized && authStore.token) {
    await authStore.init()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && isAuthenticated) {
    next({ path: '/' })
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ path: '/' })
  } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    next({ path: '/assets' })
  } else {
    next()
  }
})

export default router
