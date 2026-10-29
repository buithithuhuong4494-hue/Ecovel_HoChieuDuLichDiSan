<script setup>
import { ref } from 'vue'

import LoginForm from '../features/auth/components/LoginForm.vue'
import RegisterForm from '../features/auth/components/RegisterForm.vue'

import '../assets/styles/auth.css'

const activeTab = ref('login')
</script>

<template>
  <main class="auth-page">
    <!-- LEFT -->
    <section class="auth-visual">
      <RouterLink
        to="/"
        class="auth-logo"
      >
        ECOVEL
      </RouterLink>

      <div class="auth-visual-content">
        <span class="auth-eyebrow">
          HỘ CHIẾU DU LỊCH DI SẢN
        </span>

        <h1>
          Bắt đầu hành trình
          <br />
          khám phá của riêng bạn
        </h1>

        <p>
          Khám phá các điểm đến di sản,
          check-in hành trình và lưu lại
          những dấu ấn đáng nhớ cùng ECOVEL.
        </p>

        <div class="auth-feature-list">
          <div class="auth-feature">
            <span>01</span>

            <p>
              Khám phá hành trình
              và điểm đến di sản.
            </p>
          </div>

          <div class="auth-feature">
            <span>02</span>

            <p>
              Check-in bằng vị trí
              tại điểm đến.
            </p>
          </div>

          <div class="auth-feature">
            <span>03</span>

            <p>
              Theo dõi tiến độ
              và mở khóa thành tựu.
            </p>
          </div>
        </div>
      </div>

      <div class="auth-visual-footer">
        <span>
          ECOVEL · 2026
        </span>

        <span>
          Du lịch xanh - Travel local - Trải nghiệm global
        </span>
      </div>
    </section>


    <!-- RIGHT -->
    <section class="auth-panel">
      <div class="auth-panel-inner">
        <RouterLink
          to="/"
          class="auth-back"
        >
          ← Quay lại trang chủ
        </RouterLink>

        <div class="auth-heading">
          <span>
            CHÀO MỪNG ĐẾN ECOVEL
          </span>

          <h2>
            {{
              activeTab === 'login'
                ? 'Tiếp tục hành trình'
                : 'Tạo hộ chiếu ECOVEL'
            }}
          </h2>

          <p>
            {{
              activeTab === 'login'
                ? 'Đăng nhập để xem lại những dấu ấn và tiếp tục hành trình khám phá của bạn.'
                : 'Tạo tài khoản để bắt đầu lưu lại những điểm đến và thành tựu của riêng bạn.'
            }}
          </p>
        </div>

        <!-- TABS -->
        <div class="auth-tabs">
          <button
            type="button"
            :class="{
              active:
                activeTab === 'login'
            }"
            @click="
              activeTab = 'login'
            "
          >
            Đăng nhập
          </button>

          <button
            type="button"
            :class="{
              active:
                activeTab === 'register'
            }"
            @click="
              activeTab = 'register'
            "
          >
            Đăng ký
          </button>
        </div>

        <!-- FORM -->
        <Transition
          name="auth-switch"
          mode="out-in"
        >
          <LoginForm
            v-if="
              activeTab === 'login'
            "
            key="login"
          />

          <RegisterForm
            v-else
            key="register"
          />
        </Transition>

        <div class="auth-bottom-note">
          <span>✦</span>

          <p>
            Mỗi tài khoản ECOVEL là
            một hộ chiếu lưu giữ
            hành trình khám phá của riêng bạn.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>