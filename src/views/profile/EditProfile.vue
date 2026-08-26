<template>
  <div class="pb-20 md:pb-0 min-h-screen bg-gray-50">
    <AppHeader title="Edit Profile" showBack class="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 px-4 py-3" />

    <form @submit.prevent="handleSubmit" class="p-4 max-w-xl mx-auto space-y-5">
      <!-- Avatar -->
      <div class="flex flex-col items-center py-4 bg-white rounded-2xl border border-gray-100">
        <div class="relative cursor-pointer" @click="$refs.avatarInput.click()">
          <Avatar :src="avatarPreview || form.avatar_url" :name="`${form.first_name} ${form.last_name}`" size="xl" class="border-4 border-white shadow-md" />
          <div class="absolute bottom-0 right-0 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
            <i class="fas fa-camera text-sm"></i>
          </div>
        </div>
        <input type="file" ref="avatarInput" accept="image/*" class="hidden" @change="handleAvatarSelect" />
        <p class="text-sm text-gray-500 mt-2">Tap to change photo</p>
      </div>

      <!-- Personal Info -->
      <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h3 class="font-bold text-gray-800">Personal Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="label">First Name</label><input v-model="form.first_name" class="input" /></div>
          <div class="form-group"><label class="label">Last Name</label><input v-model="form.last_name" class="input" /></div>
        </div>
        <div class="form-group"><label class="label">Bio</label><textarea v-model="form.bio" class="input min-h-[80px]" placeholder="Tell your story..."></textarea></div>
        <div class="form-group"><label class="label">Phone</label><input v-model="form.phone" type="tel" class="input" /></div>
        <div class="form-group"><label class="label">Instagram Handle</label><div class="relative"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">@</div><input v-model="form.instagram" class="input pl-8" placeholder="username" /></div></div>
        <div class="form-group"><label class="label">Twitter / X Handle</label><div class="relative"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">@</div><input v-model="form.twitter" class="input pl-8" placeholder="username" /></div></div>
      </div>

      <!-- Skills -->
      <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h3 class="font-bold text-gray-800">Skills</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="(skill, idx) in form.skills" :key="idx" class="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
            {{ skill }}
            <button type="button" @click="removeSkill(idx)" class="text-primary-400 hover:text-red-500 ml-1"><i class="fas fa-times text-xs"></i></button>
          </span>
        </div>
        <div class="flex gap-2">
          <input v-model="newSkill" class="input flex-1" placeholder="Add a skill..." @keydown.enter.prevent="addSkill" />
          <AppButton type="button" size="sm" @click="addSkill"><i class="fas fa-plus"></i></AppButton>
        </div>
      </div>

      <AppButton type="submit" block size="lg" :loading="loading">Save Changes</AppButton>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, API } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')
const loading = ref(false)
const newSkill = ref('')
const avatarPreview = ref(null)
const avatarFile = ref(null)

const form = ref({
  first_name: '', last_name: '', bio: '', phone: '', instagram: '', twitter: '', avatar_url: '', skills: []
})

const handleAvatarSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const addSkill = () => {
  const s = newSkill.value.trim()
  if (s && !form.value.skills.includes(s) && form.value.skills.length < 15) {
    form.value.skills.push(s)
    newSkill.value = ''
  }
}

const removeSkill = (idx) => { form.value.skills.splice(idx, 1) }

const handleSubmit = async () => {
  loading.value = true
  try {
    let avatarUrl = form.value.avatar_url

    if (avatarFile.value) {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(avatarFile.value); r.onload = () => res(r.result); r.onerror = rej })
      const { data } = await API.post('/upload', { filename: avatarFile.value.name, content_type: avatarFile.value.type, base64_data: base64 })
      avatarUrl = data.url
    }

    const { data } = await API.put('/users/profile', { ...form.value, avatar_url: avatarUrl })
    authStore.user = { ...authStore.user, ...data.user }
    toast.success('Profile updated!')
    router.push('/profile')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to update profile')
  } finally { loading.value = false }
}

onMounted(() => {
  if (authStore.user) {
    const u = authStore.user
    form.value = { first_name: u.first_name || '', last_name: u.last_name || '', bio: u.bio || '', phone: u.phone || '', instagram: u.instagram || '', twitter: u.twitter || '', avatar_url: u.avatar_url || '', skills: Array.isArray(u.skills) ? [...u.skills] : [] }
  }
})
</script>
