<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div><h1 class="text-2xl font-bold text-gray-900">Reports</h1><p class="text-gray-500 text-sm mt-0.5">Manage flagged content</p></div>
      <div class="flex gap-2">
        <button @click="statusFilter = 'pending'; loadReports()" :class="['px-4 py-2 rounded-xl text-sm font-semibold', statusFilter === 'pending' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600']">Pending</button>
        <button @click="statusFilter = 'resolved'; loadReports()" :class="['px-4 py-2 rounded-xl text-sm font-semibold', statusFilter === 'resolved' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600']">Resolved</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading && reports.length === 0" class="divide-y divide-gray-50">
        <div v-for="i in 5" :key="i" class="p-4 space-y-2"><div class="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div><div class="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div></div>
      </div>

      <div v-else-if="reports.length === 0" class="p-12 text-center text-gray-500">
        <i class="fas fa-flag text-4xl text-gray-300 mb-3 block"></i>No {{ statusFilter }} reports.
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div v-for="report in reports" :key="report.id" class="p-5 hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold uppercase tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded">{{ report.report_type }}</span>
                <span class="text-xs text-gray-500">{{ timeAgo(report.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-800 font-medium mb-1">{{ report.reason }}</p>
              <p class="text-xs text-gray-500">Reported by: <strong>{{ report.reporter_name }}</strong></p>
            </div>

            <div v-if="report.status === 'pending'" class="flex gap-2 shrink-0">
              <button @click="resolveReport(report, 'dismissed')" class="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Dismiss</button>
              <button @click="resolveReport(report, 'actioned')" class="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Take Action</button>
            </div>
            <span v-else class="text-xs font-bold px-2 py-1 rounded-full" :class="report.status === 'actioned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">{{ report.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { API } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'

const toast = inject('toast')
const reports = ref([]); const loading = ref(false); const statusFilter = ref('pending')
const timeAgo = (d) => { try { return formatDistanceToNow(new Date(d), { addSuffix: true }) } catch { return '' } }

const loadReports = async () => {
  loading.value = true
  reports.value = []
  try {
    const { data } = await API.get(`/admin/reports?status=${statusFilter.value}`)
    reports.value = data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const resolveReport = async (report, status) => {
  try {
    await API.put(`/admin/reports/${report.id}`, { status })
    report.status = status
    toast.success(`Report ${status}`)
  } catch { toast.error('Failed to update report') }
}

onMounted(() => loadReports())
</script>
