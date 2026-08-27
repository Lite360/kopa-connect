<template>
  <AppCard class="mb-3 border border-gray-100" hoverable @click="handleClick">
    <div class="flex gap-3">
      <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
        <i class="fas fa-briefcase text-xl"></i>
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900 truncate">{{ job.title }}</h3>
        <p v-if="job.company_name" class="text-sm text-gray-600 truncate">{{ job.company_name }}</p>

        <div class="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
          <span v-if="job.state_name" class="flex items-center gap-1">
            <i class="fas fa-map-marker-alt text-gray-400"></i>
            {{ job.state_name }}
          </span>
          <span v-if="job.job_type" class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
            {{ job.job_type }}
          </span>
          <span v-if="payRange" class="text-primary-700 font-semibold">
            {{ payRange }}
          </span>
          <span v-if="job.is_external"
            class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <i class="fas fa-external-link-alt text-[10px]"></i> External
          </span>
        </div>

        <p class="text-xs text-gray-400 mt-2">{{ timeAgo }}</p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import AppCard from '../common/AppCard.vue'

const router = useRouter()

const props = defineProps({
  job: { type: Object, required: true }
})

const timeAgo = computed(() => {
  try { return formatDistanceToNow(new Date(props.job.created_at), { addSuffix: true }) }
  catch { return '' }
})

const payRange = computed(() => {
  const j = props.job
  if (!j.pay_min && !j.pay_max) return null
  const currency = j.pay_currency || '₦'
  const fmt = (n) => Number(n).toLocaleString()
  if (j.pay_min && j.pay_max) return `${currency}${fmt(j.pay_min)} - ${currency}${fmt(j.pay_max)}`
  if (j.pay_min) return `From ${currency}${fmt(j.pay_min)}`
  return `Up to ${currency}${fmt(j.pay_max)}`
})

const handleClick = () => {
  if (props.job.is_external) {
    if (props.job.application_url) {
      window.open(props.job.application_url, '_blank')
    } else {
      alert('This external job listing does not have a direct application link.')
    }
  } else {
    router.push(`/job/${props.job.id}`)
  }
}
</script>
