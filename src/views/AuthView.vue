<script setup>
import { ref } from 'vue'
import LoginForm from '../features/auth/components/LoginForm.vue'
import RegisterForm from '../features/auth/components/RegisterForm.vue'

const activeTab = ref('login')
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">
      <h1>ECOVEL</h1>

      <p>
        Hộ chiếu Du lịch Di sản
      </p>

      <div class="auth-tabs">
        <button
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Đăng nhập
        </button>

        <button
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Đăng ký
        </button>
      </div>

      <LoginForm
        v-if="activeTab === 'login'"
      />

      <RegisterForm
        v-else
      />

      <RouterLink
        to="/"
        class="back-home"
      >
        ← Quay lại trang chủ
      </RouterLink>
    </div>
  </main>
</template>

<style src="../assets/styles/auth.css"></style>