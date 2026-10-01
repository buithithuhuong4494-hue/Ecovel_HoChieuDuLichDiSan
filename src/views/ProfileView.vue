<script setup>
import { onMounted, ref } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  getCurrentProfile,
  getProfileStats,
  getRecentCheckIns
} from '../features/profile/services/profileService.js'

import {
  getMyBadges
} from '../features/achievements/services/badgeService.js'

import '../assets/styles/home.css'

const profile = ref(null)
const myBadges = ref([])
const recentCheckIns = ref([])

const stats = ref({
  totalCheckIns: 0,
  completedJourneys: 0
})

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const [
      profileData,
      statsData,
      historyData,
      badgeData
    ] = await Promise.all([
      getCurrentProfile(),
      getProfileStats(),
      getRecentCheckIns(),
      getMyBadges()
    ])

    profile.value = profileData
    stats.value = statsData
    recentCheckIns.value = historyData
    myBadges.value = badgeData
  } catch (error) {
    console.error('Lỗi tải hồ sơ:', error)

    errorMessage.value =
      'Không thể tải hồ sơ.'
  } finally {
    loading.value = false
  }
})

function formatDate(date) {
  return new Date(date)
    .toLocaleString('vi-VN')
}
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content profile-page">
      <p
        v-if="loading"
        class="section"
      >
        Đang tải hồ sơ...
      </p>

      <p
        v-else-if="errorMessage"
        class="section"
      >
        {{ errorMessage }}
      </p>

      <template v-else-if="profile">
        <!-- PROFILE INFO -->
        <section class="profile-hero">
          <div class="profile-avatar">
            <img
              v-if="profile.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.full_name"
            />

            <span v-else>
              {{
                profile.full_name
                  ?.charAt(0)
                  ?.toUpperCase()
              }}
            </span>
          </div>

          <div class="profile-info">
            <span class="home-tag">
              HỒ SƠ NHÀ KHÁM PHÁ
            </span>

            <h1>
              {{ profile.full_name }}
            </h1>

            <p>
              {{ profile.email }}
            </p>

            <p v-if="profile.phone">
              {{ profile.phone }}
            </p>
          </div>
        </section>

        <!-- STATS -->
        <section class="profile-stats">
          <div class="profile-stat-card">
            <span class="profile-stat-number">
              {{ stats.totalCheckIns }}
            </span>

            <span>
              Địa điểm đã khám phá
            </span>
          </div>

          <div class="profile-stat-card">
            <span class="profile-stat-number">
              {{ stats.completedJourneys }}
            </span>

            <span>
              Hành trình hoàn thành
            </span>
          </div>

          <div class="profile-stat-card">
            <span class="profile-stat-number">
              {{ profile.total_points ?? 0 }}
            </span>

            <span>
              Điểm tích lũy
            </span>
          </div>
        </section>

        <!-- BADGES -->
        <section class="profile-badges">
          <div class="home-section-heading">
            <span class="home-tag">
              HUY HIỆU
            </span>

            <h2>
              Thành tựu đã đạt
            </h2>

            <p>
              Bạn đã mở khóa
              {{ myBadges.length }}
              huy hiệu.
            </p>
          </div>

          <p
            v-if="myBadges.length === 0"
            class="profile-empty"
          >
            Bạn chưa đạt huy hiệu nào.
          </p>

          <div
            v-else
            class="profile-badge-grid"
          >
            <article
              v-for="item in myBadges.slice(0, 3)"
              :key="item.id"
              class="profile-badge-card"
            >
              <div class="profile-badge-icon">
                <img
                  v-if="item.badges?.icon_url"
                  :src="item.badges.icon_url"
                  :alt="item.badges.name"
                />

                <span v-else>
                  🏅
                </span>
              </div>

              <div>
                <h3>
                  {{ item.badges?.name }}
                </h3>

                <p>
                  {{ item.badges?.description }}
                </p>
              </div>
            </article>
          </div>

          <RouterLink
            to="/achievements"
            class="profile-view-all"
          >
            Xem tất cả thành tựu →
          </RouterLink>
        </section>

        <!-- HISTORY -->
        <section class="profile-history">
          <div class="home-section-heading">
            <span class="home-tag">
              HOẠT ĐỘNG
            </span>

            <h2>
              Lịch sử khám phá gần đây
            </h2>
          </div>

          <p
            v-if="recentCheckIns.length === 0"
            class="profile-empty"
          >
            Bạn chưa có lịch sử check-in.
          </p>

          <div
            v-else
            class="profile-history-list"
          >
            <article
              v-for="item in recentCheckIns"
              :key="item.id"
              class="profile-history-item"
            >
              <img
                v-if="item.locations?.image_url"
                :src="item.locations.image_url"
                :alt="item.locations.name"
              />

              <div>
                <h3>
                  {{ item.locations?.name }}
                </h3>

                <p>
                  {{ formatDate(item.checked_in_at) }}
                </p>

                <p
                  v-if="item.distance_meters != null"
                >
                  Khoảng cách:
                  {{ Math.round(item.distance_meters) }}m
                </p>
              </div>

              <span class="status-badge checked">
                ✓ Đã khám phá
              </span>
            </article>
          </div>
        </section>
      </template>
    </main>

    <AppFooter />
  </div>
</template>