<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click="closeOnBackdrop && close()">
        <div class="modal-panel" @click.stop>
          <div class="modal-header">
            <h3 class="text-lg font-bold">{{ title }}</h3>
            <button @click="close" class="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100 transition-colors">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
          <div class="p-5">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="p-5 border-t border-gray-100 bg-gray-50 sm:rounded-b-3xl">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  closeOnBackdrop: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Lock body scroll when open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
