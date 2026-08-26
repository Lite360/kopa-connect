<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-white">
    <AppHeader title="Job Details" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <div v-if="loading" class="p-4"><SkeletonLoader type="card" height="200px" /></div>
    <div v-else-if="error" class="p-8 text-center text-red-500">{{ error }}</div>

    <div v-else-if="job" class="pb-24">
      <div class="p-5 border-b border-gray-100">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <i class="fas fa-briefcase text-2xl"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 leading-tight">{{ job.title }}</h1>
            <p v-if="job.company_name" class="text-gray-600 mt-0.5">{{ job.company_name }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span v-if="job.job_type" class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium capitalize">{{ job.job_type }}</span>
          <span v-if="job.state_name" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"><i class="fas fa-map-marker-alt mr-1"></i>{{ job.state_name }}</span>
          <span v-if="payRange" class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">{{ payRange }}</span>
        </div>

        <p class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i>Posted {{ timeAgo }} · {{ job.views_count || 0 }} views</p>
      </div>

      <div class="p-5 border-b border-gray-100">
        <h3 class="font-bold text-gray-800 mb-3">Description</h3>
        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ job.description }}</p>
      </div>

      <div v-if="job.requirements" class="p-5 border-b border-gray-100">
        <h3 class="font-bold text-gray-800 mb-3">Requirements</h3>
        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ job.requirements }}</p>
      </div>

      <div class="p-5 border-b border-gray-100">
        <h3 class="font-bold text-gray-800 mb-3">How to Apply</h3>
        <div class="space-y-3">
          <a v-if="job.application_email" :href="`mailto:${job.application_email}`" class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fas fa-envelope text-primary-600 text-lg w-6 text-center"></i>
            <span class="text-sm text-gray-700">{{ job.application_email }}</span>
          </a>
          <a v-if="job.application_phone" :href="`tel:${job.application_phone}`" class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fas fa-phone text-primary-600 text-lg w-6 text-center"></i>
            <span class="text-sm text-gray-700">{{ job.application_phone }}</span>
          </a>
          <a v-if="job.whatsapp_number" :href="`https://wa.me/${job.whatsapp_number}`" target="_blank" class="flex items-center gap-3 bg-green-50 p-3 rounded-xl hover:bg-green-100 transition-colors">
            <i class="fab fa-whatsapp text-green-600 text-lg w-6 text-center"></i>
            <span class="text-sm text-green-700">WhatsApp</span>
          </a>
          <a v-if="job.application_url" :href="job.application_url" target="_blank" class="flex items-center gap-3 bg-blue-50 p-3 rounded-xl hover:bg-blue-100 transition-colors">
            <i class="fas fa-external-link-alt text-blue-600 text-lg w-6 text-center"></i>
            <span class="text-sm text-blue-700">Apply Online</span>
          </a>
        </div>
      </div>

      <!-- Posted By -->
      <div class="p-5">
        <h3 class="font-bold text-gray-800 mb-3">Posted By</h3>
        <router-link :to="`/profile/${job.poster_id}`" class="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
          <Avatar :src="job.poster_avatar" :name="`${job.first_name} ${job.last_name}`" size="md" />
          <div>
            <p class="font-semibold text-gray-900">{{ job.first_name }} {{ job.last_name }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const route = useRoute()
const job = ref(null)
const loading = ref(true)
const error = ref('')

const timeAgo = computed(() => {
  try { return formatDistanceToNow(new Date(job.value.created_at), { addSuffix: true }) } catch { return '' }
})

const payRange = computed(() => {
  const j = job.value
  if (!j?.pay_min && !j?.pay_max) return null
  const c = j.pay_currency === 'NGN' ? '₦' : j.pay_currency || '₦'
  const fmt = (n) => Number(n).toLocaleString()
  if (j.pay_min && j.pay_max) return `${c}${fmt(j.pay_min)} - ${c}${fmt(j.pay_max)}${j.pay_period ? '/' + j.pay_period : ''}`
  if (j.pay_min) return `From ${c}${fmt(j.pay_min)}`
  return `Up to ${c}${fmt(j.pay_max)}`
})

onMounted(async () => {
  try {
    const { data } = await API.get(`/jobs/${route.params.id}`)
    job.value = data.job
  } catch (err) { error.value = 'Job not found' } finally { loading.value = false }
})
</script>
