<script setup>
import { ref } from 'vue'
import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  login
} from '../services/authService.js'

const email = ref('')
const password = ref('')
const message = ref('')
const loading = ref(false)

const router = useRouter()
const route = useRoute()

async function handleLogin() {
  message.value = ''

  if (
    !email.value ||
    !password.value
  ) {
    message.value =
      'Vui lòng nhập đầy đủ email và mật khẩu.'

    return
  }

  try {
    loading.value = true

    await login(
      email.value,
      password.value
    )

    /*
      Nếu trước đó user bị chuyển
      về /auth từ một trang cần đăng nhập
      thì quay lại đúng trang đó.
    */
    const redirect =
      typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/'

    await router.replace(redirect)
  } catch (error) {
    console.error(
      'Lỗi đăng nhập:',
      error
    )

    message.value =
      error.message ||
      'Đăng nhập thất bại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-box">
    <h2>
      Đăng nhập
    </h2>

    <input
      v-model="email"
      type="email"
      placeholder="Email"
      autocomplete="email"
      @keyup.enter="handleLogin"
    />

    <input
      v-model="password"
      type="password"
      placeholder="Mật khẩu"
      autocomplete="current-password"
      @keyup.enter="handleLogin"
    />

    <button
      type="button"
      :disabled="loading"
      @click="handleLogin"
    >
      {{
        loading
          ? 'Đang đăng nhập...'
          : 'Đăng nhập'
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