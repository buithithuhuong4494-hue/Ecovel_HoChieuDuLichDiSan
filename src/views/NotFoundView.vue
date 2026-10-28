<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import '../assets/styles/home.css'
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <section class="not-found-page">
        <div class="not-found-card">
          <span class="not-found-code">
            404
          </span>

          <span class="home-tag">
            KHÔNG TÌM THẤY TRANG
          </span>

          <h1>
            Có vẻ bạn đã đi lạc
            khỏi hành trình
          </h1>

          <p>
            Trang bạn đang tìm không tồn tại
            hoặc đường dẫn đã được thay đổi.
            Hãy quay lại ECOVEL và tiếp tục
            hành trình khám phá di sản.
          </p>

          <div class="not-found-actions">
            <RouterLink
              to="/"
              class="home-primary-btn"
            >
              Về trang chủ
            </RouterLink>

            <RouterLink
              to="/journeys"
              class="not-found-secondary"
            >
              Khám phá hành trình →
            </RouterLink>
          </div>

          <div class="not-found-decoration">
            <span>
              ✦
            </span>

            <span>
              ◌
            </span>

            <span>
              ✧
            </span>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>