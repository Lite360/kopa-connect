<template>
  <div class="px-4 py-3 bg-white border-b border-gray-100 mb-2">
    <div class="flex gap-3">
      <Avatar :src="user?.avatar_url" :name="`${user?.first_name} ${user?.last_name}`" size="md" />
      
      <div class="flex-1">
        <textarea 
          v-model="content"
          placeholder="What's happening in camp or your PPA?"
          class="w-full bg-transparent border-none focus:ring-0 resize-none p-0 text-gray-800 placeholder-gray-500 min-h-[60px]"
          rows="2"
          @input="resize"
          ref="textareaRef"
          :disabled="loading"
        ></textarea>
        
        <div v-if="previewUrl" class="mt-2 relative rounded-xl overflow-hidden max-h-64 border border-gray-100">
          <img :src="previewUrl" class="w-full h-full object-cover" />
          <button @click="removeImage" class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="flex items-center justify-between mt-3 border-t border-gray-50 pt-3">
          <div class="flex gap-1">
            <button @click="$refs.fileInput.click()" class="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors tooltip" :disabled="loading">
              <i class="far fa-image text-lg"></i>
            </button>
            <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFile" />
          </div>
          
          <AppButton @click="submit" :loading="loading" :disabled="!content.trim() && !previewUrl" size="sm" class="px-6 rounded-full font-bold">
            Post
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFeedStore } from '@/stores/feed'
import { API } from '@/stores/auth'
import Avatar from '../common/Avatar.vue'
import AppButton from '../common/AppButton.vue'

const authStore = useAuthStore()
const feedStore = useFeedStore()
const toast = inject('toast')
const user = authStore.user

const content = ref('')
const loading = ref(false)
const textareaRef = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

const resize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be less than 5MB')
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const removeImage = () => {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const submit = async () => {
  if (!content.value.trim() && !selectedFile.value) return
  
  loading.value = true
  try {
    let mediaUrl = null
    
    // Upload image first if selected
    if (selectedFile.value) {
      const base64 = await toBase64(selectedFile.value)
      const uploadRes = await API.post('/upload', {
        filename: selectedFile.value.name,
        content_type: selectedFile.value.type,
        base64_data: base64
      })
      mediaUrl = uploadRes.data.url
    }

    // Create post
    await feedStore.createPost({
      content: content.value.trim(),
      media_url: mediaUrl,
      media_type: mediaUrl ? 'image' : null
    })
    
    content.value = ''
    removeImage()
    toast.success('Posted successfully')
    
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to create post')
  } finally {
    loading.value = false
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  }
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
</script>
