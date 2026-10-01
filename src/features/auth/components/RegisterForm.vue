<script setup>
import { ref } from 'vue'

import { register } from '../services/authService.js'

const fullName = ref('')
const email = ref('')
const password = ref('')

const message = ref('')
const loading = ref(false)

async function handleRegister() {
  message.value = ''

  if (
    !fullName.value ||
    !email.value ||
    !password.value
  ) {
    message.value =
      'Vui lòng nhập đầy đủ thông tin.'
    return
  }

  if (password.value.length < 6) {
    message.value =
      'Mật khẩu phải có ít nhất 6 ký tự.'
    return
  }

  try {
    loading.value = true

    await register(
      fullName.value,
      email.value,
      password.value
    )

    message.value =
      'Đăng ký thành công. Bạn có thể đăng nhập.'
  } catch (error) {
    message.value =
      error.message || 'Đăng ký thất bại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-box">
    <h2>Đăng ký</h2>

    <input
      v-model="fullName"
      type="text"
      placeholder="Họ và tên"
      autocomplete="name"
    />

    <input
      v-model="email"
      type="email"
      placeholder="Email"
      autocomplete="email"
    />

    <input
      v-model="password"
      type="password"
      placeholder="Mật khẩu"
      autocomplete="new-password"
    />

    <button
      type="button"
      :disabled="loading"
      @click="handleRegister"
    >
      {{
        loading
          ? 'Đang đăng ký...'
          : 'Đăng ký'
      }}
    </button>

    <p
      v-if="message"
      class="auth-message"
    >
      {{ message }}
    </p>
  </div>
</template>