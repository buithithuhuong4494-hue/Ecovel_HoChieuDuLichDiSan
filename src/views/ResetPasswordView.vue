<script setup>
import {
  onMounted,
  onUnmounted,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  supabase
} from '../lib/supabase.js'

import {
  updatePassword
} from '../features/auth/services/authService.js'

import '../assets/styles/auth.css'


const router = useRouter()

const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const checkingSession = ref(true)

const message = ref('')
const success = ref(false)

let authSubscription = null


onMounted(async () => {
  /*
    Supabase sẽ tạo recovery session
    sau khi user bấm link trong email.
  */

  const {
    data: {
      subscription
    }
  } = supabase.auth.onAuthStateChange(
    (
      event
    ) => {
      if (
        event ===
        'PASSWORD_RECOVERY'
      ) {
        checkingSession.value =
          false
      }
    }
  )

  authSubscription =
    subscription


  const {
    data: {
      session
    }
  } = await supabase.auth
    .getSession()

  checkingSession.value =
    false

  if (!session) {
    message.value =
      'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'
  }
})


onUnmounted(() => {
  authSubscription?.unsubscribe()
})


async function handleUpdatePassword() {
  message.value = ''
  success.value = false

  if (
    !password.value ||
    !confirmPassword.value
  ) {
    message.value =
      'Vui lòng nhập đầy đủ mật khẩu.'

    return
  }

  if (
    password.value.length < 6
  ) {
    message.value =
      'Mật khẩu phải có ít nhất 6 ký tự.'

    return
  }

  if (
    password.value !==
    confirmPassword.value
  ) {
    message.value =
      'Mật khẩu xác nhận không khớp.'

    return
  }

  try {
    loading.value = true

    await updatePassword(
      password.value
    )

    success.value = true

    message.value =
      'Đổi mật khẩu thành công.'

    password.value = ''
    confirmPassword.value = ''

    setTimeout(async () => {
      await supabase.auth.signOut()

      router.replace(
        '/auth'
      )
    }, 1200)
  } catch (error) {
    console.error(
      'Lỗi đổi mật khẩu:',
      error
    )

    message.value =
      error.message ||
      'Không thể đổi mật khẩu.'
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
        ← Đăng nhập
      </RouterLink>


      <span class="password-tag">
        MẬT KHẨU MỚI
      </span>


      <h1>
        Tạo mật khẩu mới
      </h1>


      <p class="password-description">
        Chọn mật khẩu mới cho
        tài khoản ECOVEL của bạn.
      </p>


      <div
        v-if="checkingSession"
        class="password-loading"
      >
        Đang xác minh liên kết...
      </div>


      <div
        v-else
        class="password-form"
      >

        <label>
          Mật khẩu mới
        </label>

        <input
          v-model="password"
          type="password"
          placeholder="Ít nhất 6 ký tự"
          autocomplete="new-password"
        />


        <label>
          Xác nhận mật khẩu
        </label>

        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          autocomplete="new-password"
          @keyup.enter="
            handleUpdatePassword
          "
        />


        <button
          type="button"
          :disabled="
            loading
          "
          @click="
            handleUpdatePassword
          "
        >
          {{
            loading
              ? 'Đang cập nhật...'
              : 'Đổi mật khẩu'
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

    </section>

  </main>
</template>