<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },

  text: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    v-if="visible"
    class="popup"
  >
    <div class="popup-content">
      <h2>🎉 Check-in thành công</h2>

      <p>{{ text }}</p>

      <button @click="emit('close')">
        Đóng
      </button>
    </div>
  </div>
</template>