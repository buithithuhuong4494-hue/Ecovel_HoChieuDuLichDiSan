<script setup>
import { computed, onMounted, ref } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  checkAndAwardBadges,
  getBadges,
  getMyBadges
} from '../features/achievements/services/badgeService.js'

import '../assets/styles/home.css'

const badges = ref([])
const myBadges = ref([])

const loading = ref(true)
const errorMessage = ref('')

const earnedBadgeIds = computed(() => {
  return new Set(
    myBadges.value
      .map(item => item.badges?.id)
      .filter(Boolean)
  )
})

onMounted(async () => {
  try {
    await checkAndAwardBadges()

    const [
      badgeData,
      myBadgeData
    ] = await Promise.all([
      getBadges(),
      getMyBadges()
    ])

    badges.value = badgeData
    myBadges.value = myBadgeData
  } catch (error) {
    console.error(
      'Lỗi tải huy hiệu:',
      error
    )

    errorMessage.value =
      'Không thể tải thành tựu.'
  } finally {
    loading.value = false
  }
})

function hasBadge(badgeId) {
  return earnedBadgeIds.value.has(badgeId)
}

function earnedDate(badgeId) {
  const item = myBadges.value.find(
    userBadge =>
      userBadge.badges?.id === badgeId
  )

  if (!item) {
    return ''
  }

  return new Date(
    item.earned_at
  ).toLocaleDateString('vi-VN')
}
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content achievements-page">
      <section class="achievements-hero">
        <span class="home-tag">
          THÀNH TỰU
        </span>

        <h1>
          Hành trình của nhà khám phá
        </h1>

        <p>
          Hoàn thành các cột mốc để mở khóa
          những huy hiệu đặc biệt của ECOVEL.
        </p>

        <strong v-if="!loading">
          {{ myBadges.length }}
          /
          {{ badges.length }}
          huy hiệu đã đạt
        </strong>
      </section>

      <p
        v-if="loading"
        class="section"
      >
        Đang tải thành tựu...
      </p>

      <p
        v-else-if="errorMessage"
        class="section"
      >
        {{ errorMessage }}
      </p>

      <section
        v-else
        class="badges-grid"
      >
        <article
          v-for="badge in badges"
          :key="badge.id"
          class="badge-card"
          :class="{
            unlocked: hasBadge(badge.id),
            locked: !hasBadge(badge.id)
          }"
        >
          <div class="badge-icon">
            <img
              v-if="badge.icon_url"
              :src="badge.icon_url"
              :alt="badge.name"
            />

            <span v-else>
              🏅
            </span>
          </div>

          <span
            v-if="hasBadge(badge.id)"
            class="status-badge checked"
          >
            ✓ Đã mở khóa
          </span>

          <span
            v-else
            class="status-badge pending"
          >
            Chưa đạt
          </span>

          <h2>
            {{ badge.name }}
          </h2>

          <p>
            {{ badge.description }}
          </p>

          <small v-if="hasBadge(badge.id)">
            Đạt ngày:
            {{ earnedDate(badge.id) }}
          </small>
        </article>
      </section>
    </main>

    <AppFooter />
  </div>
</template>