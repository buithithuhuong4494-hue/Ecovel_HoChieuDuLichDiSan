<script setup>
import { computed, onMounted, ref } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  getLocations
} from '../features/locations/services/locationService.js'

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

const totalLocations = computed(() => {
  return locations.value.length
})
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <section class="locations-page">
        <!-- HERO -->
        <div class="locations-hero">
          <span class="home-tag">
            ĐỊA ĐIỂM DI SẢN
          </span>

          <h1>
            Mỗi điểm đến,
            <br />
            một câu chuyện đang chờ bạn
          </h1>

          <p>
            Khám phá những địa danh văn hóa,
            kiến trúc và lịch sử nổi bật.
            Mỗi điểm check-in sẽ trở thành
            một dấu ấn trong hộ chiếu ECOVEL của bạn.
          </p>

          <div class="locations-hero-meta">
            <span>
              📍 {{ totalLocations }} địa điểm
            </span>

            <RouterLink to="/map" class="locations-map-link">
              Xem tất cả trên bản đồ →
            </RouterLink>
          </div>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="locations-state">
          <span class="locations-state-icon">
            📍
          </span>

          <p>
            Đang tìm những điểm đến dành cho bạn...
          </p>
        </div>

        <!-- ERROR -->
        <div v-else-if="errorMessage" class="locations-state">
          <span class="locations-state-icon">
            !
          </span>

          <p>
            {{ errorMessage }}
          </p>
        </div>

        <!-- LIST -->
        <div v-else-if="locations.length" class="locations-grid">
          <article v-for="(location, index) in locations" :key="location.id" class="location-card">
            <div class="location-card-image-wrap">
              <img v-if="location.image_url" :src="location.image_url" :alt="location.name"
                class="location-card-image" />

              <div class="location-card-number">
                {{
                  String(index + 1).padStart(2, '0')
                }}
              </div>

              <span class="location-card-label">
                ĐIỂM ĐẾN
              </span>
            </div>

            <div class="location-card-content">
              <h2>
                {{ location.name }}
              </h2>

              <p class="location-description">
                {{
                  location.description ||
                  'Một điểm đến đang chờ bạn khám phá cùng ECOVEL.'
                }}
              </p>

              <div class="location-address">
                <span>
                  📍
                </span>

                <p>
                  {{ location.address }}
                </p>
              </div>

              <div class="location-card-actions">
                <RouterLink :to="`/locations/${location.id}`" class="location-card-button">
                  Khám phá địa điểm
                </RouterLink>

                <RouterLink :to="`/checkin?location=${location.id}`" class="location-secondary-link">
                  Check-in →
                </RouterLink>
              </div>
            </div>
          </article>
        </div>

        <!-- EMPTY -->
        <div v-else class="locations-state">
          <span class="locations-state-icon">
            🗺️
          </span>

          <h2>
            Chưa có địa điểm
          </h2>

          <p>
            Những điểm đến mới sẽ sớm được cập nhật.
          </p>
        </div>

        <!-- BOTTOM CTA -->
        <div v-if="!loading && locations.length" class="locations-bottom-cta">
          <span class="home-tag">
            BẢN ĐỒ ECOVEL
          </span>

          <h2>
            Bạn muốn biết
            điểm đến nào gần mình nhất?
          </h2>

          <p>
            Mở bản đồ để xem vị trí các địa điểm
            và lựa chọn điểm dừng tiếp theo
            cho hành trình của bạn.
          </p>

          <RouterLink to="/map" class="home-primary-btn">
            Khám phá bản đồ
          </RouterLink>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>