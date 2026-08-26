<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
    <p class="text-gray-500 mb-8">Platform configuration and management</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 class="font-bold text-gray-800">Platform Info</h2>
        <div class="form-group"><label class="label">Platform Name</label><input value="Kopa Connect" class="input" /></div>
        <div class="form-group"><label class="label">Support Email</label><input value="support@kopaconnect.ng" class="input" /></div>
        <AppButton class="mt-2">Save Settings</AppButton>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 class="font-bold text-gray-800">Current Batch</h2>
        <div class="form-group"><label class="label">Active Batch Year</label><input value="2025" class="input" /></div>
        <div class="form-group"><label class="label">Batch Stream</label><select class="input bg-white h-[48px]"><option>A</option><option>B</option></select></div>
        <AppButton class="mt-2">Update Batch</AppButton>
      </div>
    </div>
  </div>
</template>
<script setup>
import AppButton from '@/components/common/AppButton.vue'
</script>
