<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

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


const unlockedCount = computed(() => {
  return myBadges.value.length
})


const totalCount = computed(() => {
  return badges.value.length
})


const progressPercent = computed(() => {
  if (!totalCount.value) {
    return 0
  }

  return Math.round(
    (
      unlockedCount.value /
      totalCount.value
    ) * 100
  )
})


const progressMessage = computed(() => {
  if (totalCount.value === 0) {
    return 'Các cột mốc mới đang được ECOVEL chuẩn bị.'
  }

  if (progressPercent.value === 100) {
    return 'Bạn đã mở khóa toàn bộ huy hiệu hiện có. Một hành trình thật đáng nhớ!'
  }

  if (progressPercent.value >= 50) {
    return 'Bạn đã đi được hơn nửa chặng đường thành tựu. Tiếp tục khám phá nhé.'
  }

  if (progressPercent.value > 0) {
    return 'Những dấu ấn đầu tiên đã được mở khóa. Hành trình vẫn còn phía trước.'
  }

  return 'Check-in và hoàn thành hành trình để mở khóa huy hiệu đầu tiên.'
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
  return earnedBadgeIds.value.has(
    badgeId
  )
}


function earnedDate(badgeId) {
  const item = myBadges.value.find(
    userBadge =>
      userBadge.badges?.id ===
      badgeId
  )

  if (!item?.earned_at) {
    return ''
  }

  return new Date(
    item.earned_at
  ).toLocaleDateString(
    'vi-VN'
  )
}
</script>


<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content achievements-page">
      <!-- HERO -->
      <section class="achievements-hero">
        <div class="achievements-hero-content">
          <span class="home-tag">
            THÀNH TỰU ECOVEL
          </span>

          <h1>
            Mỗi huy hiệu
            là một dấu mốc
            trên hành trình
          </h1>

          <p>
            Khám phá địa điểm,
            hoàn thành hành trình
            và mở khóa những huy hiệu
            đánh dấu từng cột mốc
            trong hộ chiếu ECOVEL của bạn.
          </p>

          <div
            v-if="!loading"
            class="achievements-hero-meta"
          >
            <span>
              🏅 {{ unlockedCount }}
              huy hiệu đã mở khóa
            </span>

            <span>
              ✦ {{ totalCount }}
              huy hiệu hiện có
            </span>
          </div>
        </div>

        <div
          v-if="!loading"
          class="achievements-progress-card"
        >
          <span class="achievements-progress-label">
            TIẾN ĐỘ THÀNH TỰU
          </span>

          <strong>
            {{ progressPercent }}%
          </strong>

          <p>
            {{ progressMessage }}
          </p>

          <div class="achievements-progress-track">
            <div
              class="achievements-progress-value"
              :style="{
                width:
                  progressPercent + '%'
              }"
            ></div>
          </div>

          <div class="achievements-progress-count">
            <span>
              {{ unlockedCount }}
            </span>

            <small>
              /
              {{ totalCount }}
              huy hiệu
            </small>
          </div>
        </div>
      </section>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="achievements-state"
      >
        <span>🏅</span>

        <p>
          Đang mở bộ sưu tập thành tựu...
        </p>
      </div>


      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="achievements-state"
      >
        <span>!</span>

        <p>
          {{ errorMessage }}
        </p>
      </div>


      <!-- BADGES -->
      <template v-else>
        <section class="achievements-collection">
          <div class="achievements-section-heading">
            <div>
              <span class="home-tag">
                BỘ SƯU TẬP
              </span>

              <h2>
                Huy hiệu hành trình
              </h2>

              <p>
                Mỗi huy hiệu đại diện
                cho một cột mốc bạn đã
                hoặc đang hướng tới.
              </p>
            </div>

            <RouterLink
              to="/profile"
              class="achievements-profile-link"
            >
              Xem hồ sơ →
            </RouterLink>
          </div>

          <div
            v-if="badges.length"
            class="badges-grid"
          >
            <article
              v-for="(badge, index) in badges"
              :key="badge.id"
              class="badge-card"
              :class="{
                unlocked:
                  hasBadge(badge.id),

                locked:
                  !hasBadge(badge.id)
              }"
            >
              <div class="badge-card-top">
                <span class="badge-number">
                  {{
                    String(
                      index + 1
                    ).padStart(2, '0')
                  }}
                </span>

                <span
                  v-if="
                    hasBadge(
                      badge.id
                    )
                  "
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
              </div>

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

              <div class="badge-card-content">
                <span
                  class="badge-card-label"
                >
                  {{
                    hasBadge(
                      badge.id
                    )
                      ? 'THÀNH TỰU ĐÃ GHI DẤU'
                      : 'CỘT MỐC ĐANG CHỜ'
                  }}
                </span>

                <h2>
                  {{ badge.name }}
                </h2>

                <p>
                  {{ badge.description }}
                </p>

                <div
                  v-if="
                    hasBadge(
                      badge.id
                    )
                  "
                  class="badge-earned-info"
                >
                  <span>
                    ✦
                  </span>

                  <div>
                    <small>
                      ĐÃ MỞ KHÓA
                    </small>

                    <strong>
                      {{
                        earnedDate(
                          badge.id
                        )
                      }}
                    </strong>
                  </div>
                </div>

                <div
                  v-else
                  class="badge-locked-info"
                >
                  <span>
                    🔒
                  </span>

                  <p>
                    Tiếp tục khám phá
                    để mở khóa huy hiệu này.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <div
            v-else
            class="achievements-empty"
          >
            <span>🏅</span>

            <h3>
              Chưa có huy hiệu
            </h3>

            <p>
              Bộ sưu tập thành tựu
              sẽ sớm được cập nhật.
            </p>
          </div>
        </section>


        <!-- GUIDE -->
        <section class="achievements-guide">
          <div class="achievements-guide-heading">
            <span class="home-tag">
              CÁCH MỞ KHÓA
            </span>

            <h2>
              Thành tựu được tạo nên
              từ hành trình thật
            </h2>

            <p>
              Mỗi hoạt động bạn thực hiện
              trong ECOVEL đều có thể trở thành
              một cột mốc đáng nhớ.
            </p>
          </div>

          <div class="achievements-guide-list">
            <article class="achievements-guide-item">
              <span>
                01
              </span>

              <div>
                <h3>
                  Khám phá địa điểm
                </h3>

                <p>
                  Ghé thăm các điểm đến
                  và ghi dấu bằng check-in.
                </p>
              </div>
            </article>

            <article class="achievements-guide-item">
              <span>
                02
              </span>

              <div>
                <h3>
                  Hoàn thành hành trình
                </h3>

                <p>
                  Check-in đầy đủ các điểm dừng
                  trong một hành trình.
                </p>
              </div>
            </article>

            <article class="achievements-guide-item">
              <span>
                03
              </span>

              <div>
                <h3>
                  Mở khóa huy hiệu
                </h3>

                <p>
                  Khi đạt đủ điều kiện,
                  thành tựu sẽ được lưu
                  vào hồ sơ của bạn.
                </p>
              </div>
            </article>
          </div>
        </section>


        <!-- FINAL CTA -->
        <section class="achievements-final-cta">
          <div>
            <span class="home-tag">
              CỘT MỐC TIẾP THEO
            </span>

            <h2>
              Huy hiệu tiếp theo
              đang chờ bạn mở khóa
            </h2>

            <p>
              Chọn một điểm đến mới
              hoặc tiếp tục hành trình
              còn dang dở để ghi thêm
              một dấu ấn vào hộ chiếu ECOVEL.
            </p>
          </div>

          <div class="achievements-final-actions">
            <RouterLink
              to="/journeys"
              class="home-primary-btn"
            >
              Khám phá hành trình
            </RouterLink>

            <RouterLink
              to="/map"
              class="achievements-map-link"
            >
              Xem bản đồ →
            </RouterLink>
          </div>
        </section>
      </template>
    </main>

    <AppFooter />
  </div>
</template>