<script setup>
import { onMounted, ref } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import { getJourneys } from '../features/journeys/services/journeyService.js'

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
        <div class="home-section-heading">
          <span class="home-tag">
            HÀNH TRÌNH
          </span>

          <h1>
            Hành trình khám phá
          </h1>

          <p>
            Lựa chọn hành trình phù hợp và khám phá
            từng địa điểm theo chủ đề.
          </p>
        </div>

        <p
          v-if="loading"
          class="section"
        >
          Đang tải hành trình...
        </p>

        <p
          v-else-if="errorMessage"
          class="section"
        >
          {{ errorMessage }}
        </p>

        <div
          v-else
          class="journeys-grid"
        >
          <RouterLink
            v-for="journey in journeys"
            :key="journey.id"
            :to="`/journeys/${journey.id}`"
            class="journey-list-card"
          >
            <div class="journey-list-card-top">
              <span class="journey-badge">
                Hành trình
              </span>

              <span class="journey-count">
                {{ journey.journey_locations?.length ?? 0 }}
                điểm đến
              </span>
            </div>

            <h2>
              {{ journey.name }}
            </h2>

            <p>
              {{ journey.description }}
            </p>

            <div class="journey-list-preview">
              <span
                v-for="stop in [...(journey.journey_locations ?? [])]
                  .sort((a, b) => a.stop_order - b.stop_order)"
                :key="stop.id"
              >
                ✓ {{ stop.locations?.name }}
              </span>
            </div>

            <span class="journey-list-link">
              Xem hành trình →
            </span>
          </RouterLink>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>