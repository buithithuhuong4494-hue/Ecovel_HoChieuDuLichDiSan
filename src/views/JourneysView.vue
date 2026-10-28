<script setup>
import { onMounted, ref } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  getJourneys
} from '../features/journeys/services/journeyService.js'

import '../assets/styles/home.css'

const journeys = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    journeys.value = await getJourneys()
  } catch (error) {
    console.error(
      'Lỗi tải hành trình:',
      error
    )

    errorMessage.value =
      'Không thể tải danh sách hành trình.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <section class="journeys-page">
        <div class="journeys-hero">
          <span class="home-tag">
            HÀNH TRÌNH KHÁM PHÁ
          </span>

          <h1>
            Chọn một hành trình,
            <br />
            bắt đầu câu chuyện của bạn
          </h1>

          <p>
            Mỗi hành trình kết nối những địa điểm
            văn hóa và di sản theo một chủ đề riêng.
          </p>
        </div>

        <div v-if="loading" class="journey-state">
          <span class="journey-state-icon">
            🧭
          </span>

          <p>
            Đang tải hành trình...
          </p>
        </div>

        <div v-else-if="errorMessage" class="journey-state">
          <span class="journey-state-icon">
            !
          </span>

          <p>
            {{ errorMessage }}
          </p>
        </div>

        <div v-else-if="journeys.length" class="journeys-grid">
          <RouterLink v-for="journey in journeys" :key="journey.id" :to="`/journeys/${journey.id}`"
            class="journey-list-card">
            <div class="journey-list-card-top">
              <span class="journey-badge">
                HÀNH TRÌNH
              </span>

              <span class="journey-count">
                {{
                  journey.journey_locations?.length ?? 0
                }}
                điểm đến
              </span>
            </div>

            <div class="journey-card-number">
              {{
                String(journey.id)
                  .padStart(2, '0')
              }}
            </div>

            <div class="journey-card-meta">
              <span v-if="journey.region" class="journey-region">
                📍 {{ journey.region }}
              </span>

              <span v-if="journey.theme" class="journey-theme">
                {{ journey.theme }}
              </span>
            </div>

            <h2>
              {{ journey.name }}
            </h2>

            <p class="journey-card-description">
              {{
                journey.description ||
              'Khám phá hành trình di sản cùng ECOVEL.'
              }}
            </p>

            <div v-if="journey.journey_locations?.length" class="journey-list-preview">
              <span v-for="stop in [...journey.journey_locations]
                .sort(
                  (a, b) =>
                    a.stop_order - b.stop_order
                )
                .slice(0, 4)" :key="stop.id">
                <span class="journey-preview-dot">
                  •
                </span>

                {{ stop.locations?.name }}
              </span>
            </div>

            <div class="journey-card-footer">
              <span class="journey-list-link">
                Khám phá hành trình
              </span>

              <span class="journey-arrow">
                →
              </span>
            </div>
          </RouterLink>
        </div>

        <div v-else class="journey-state">
          <span class="journey-state-icon">
            🗺️
          </span>

          <h2>
            Chưa có hành trình
          </h2>

          <p>
            Các hành trình mới sẽ sớm được cập nhật.
          </p>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>