<script setup>
import { ref } from 'vue'

import {
  sendResetPasswordEmail
} from '../features/auth/services/authService.js'

import '../assets/styles/auth.css'


const email = ref('')

const loading = ref(false)
const message = ref('')
const success = ref(false)


async function handleResetPassword() {
  message.value = ''
  success.value = false

  if (!email.value.trim()) {
    message.value =
      'Vui lòng nhập email.'

    return
  }

  try {
    loading.value = true

    await sendResetPasswordEmail(
      email.value.trim()
    )

    success.value = true

    message.value =
      'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.'
  } catch (error) {
    console.error(
      'Lỗi gửi email reset:',
      error
    )

    message.value =
      error.message ||
      'Không thể gửi email đặt lại mật khẩu.'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <main class="password-page">

    <section class="password-card">

      <RouterLink
        to="/auth"
        class="password-back"
      >
        ← Quay lại đăng nhập
      </RouterLink>


      <span class="password-tag">
        KHÔI PHỤC TÀI KHOẢN
      </span>


      <h1>
        Quên mật khẩu?
      </h1>


      <p class="password-description">
        Nhập email đã đăng ký với ECOVEL.
        Chúng tôi sẽ gửi đường dẫn
        giúp bạn tạo mật khẩu mới.
      </p>


      <div class="password-form">

        <label>
          Email
        </label>

        <input
          v-model="email"
          type="email"
          placeholder="Nhập email của bạn"
          autocomplete="email"
          @keyup.enter="
            handleResetPassword
          "
        />


        <button
          type="button"
          :disabled="loading"
          @click="
            handleResetPassword
          "
        >
          {{
            loading
              ? 'Đang gửi...'
              : 'Gửi email khôi phục'
          }}
        </button>


        <p
          v-if="message"
          class="password-message"
          :class="{
            success
          }"
        >
          {{ message }}
        </p>
      </div>


      <div class="password-note">
        <span>
          ✦
        </span>

        <p>
          Nếu không thấy email,
          hãy kiểm tra cả thư mục Spam
          hoặc Thư rác.
        </p>
      </div>

    </section>

  </main>
</template>