<script setup>
import { onMounted, ref } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import { getLocations } from '../features/locations/services/locationService.js'

import '../assets/styles/home.css'

const locations = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    locations.value = await getLocations()
  } catch (error) {
    console.error(
      'Lỗi tải địa điểm:',
      error
    )

    errorMessage.value =
      'Không thể tải danh sách địa điểm.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <section class="locations-page">
        <div class="home-section-heading">
          <span class="home-tag">
            ĐỊA ĐIỂM
          </span>

          <h1>
            Khám phá các địa điểm di sản
          </h1>

          <p>
            Tìm hiểu những điểm đến nổi bật và bắt đầu hành trình khám phá cùng ECOVEL.
          </p>
        </div>

        <p
          v-if="loading"
          class="section"
        >
          Đang tải địa điểm...
        </p>

        <p
          v-else-if="errorMessage"
          class="section"
        >
          {{ errorMessage }}
        </p>

        <div
          v-else
          class="locations-grid"
        >
          <article
            v-for="location in locations"
            :key="location.id"
            class="location-card"
          >
            <img
              v-if="location.image_url"
              :src="location.image_url"
              :alt="location.name"
              class="location-card-image"
            />

            <div class="location-card-content">
              <h2>
                {{ location.name }}
              </h2>

              <p>
                {{ location.description }}
              </p>

              <p class="location-address">
                <strong>Địa chỉ:</strong>
                {{ location.address }}
              </p>

              <RouterLink
                :to="`/checkin?location=${location.id}`"
                class="location-card-button"
              >
                Check-in địa điểm →
              </RouterLink>
            </div>
          </article>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>