<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import {
  useRoute
} from 'vue-router'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  getLocationById
} from '../features/locations/services/locationService.js'

import {
  getMyCheckIns
} from '../features/checkin/services/checkinService.js'

import '../assets/styles/home.css'


const route = useRoute()

const location = ref(null)

const loading = ref(true)
const errorMessage = ref('')

const checkedLocationIds = ref([])


onMounted(async () => {
  try {
    location.value =
      await getLocationById(
        route.params.id
      )

    try {
      const checkIns =
        await getMyCheckIns()

      checkedLocationIds.value =
        checkIns
          .filter(
            item =>
              item.status ===
              'verified'
          )
          .map(
            item =>
              item.locations?.id
          )
          .filter(Boolean)
    } catch (error) {
      console.log(
        'Chưa đăng nhập hoặc chưa có check-in:',
        error
      )
    }
  } catch (error) {
    console.error(
      'Lỗi tải địa điểm:',
      error
    )

    errorMessage.value =
      'Không thể tải thông tin địa điểm.'
  } finally {
    loading.value = false
  }
})


const isCheckedIn = computed(() => {
  if (!location.value) {
    return false
  }

  return checkedLocationIds.value
    .includes(
      location.value.id
    )
})


const journeys = computed(() => {
  return (
    location.value
      ?.journey_locations
      ?.map(
        item =>
          item.journeys
      )
      .filter(Boolean) || []
  )
})
</script>


<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <!-- LOADING -->
      <div
        v-if="loading"
        class="location-detail-state"
      >
        <span>📍</span>

        <p>
          Đang mở câu chuyện của địa điểm...
        </p>
      </div>


      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="location-detail-state"
      >
        <span>!</span>

        <p>
          {{ errorMessage }}
        </p>

        <RouterLink
          to="/locations"
          class="home-primary-btn"
        >
          Quay lại địa điểm
        </RouterLink>
      </div>


      <template v-else-if="location">
        <section class="location-detail-page">
          <!-- HERO -->
          <div class="location-detail-hero">
            <div class="location-detail-image">
              <img
                v-if="location.image_url"
                :src="location.image_url"
                :alt="location.name"
              />

              <div
                v-else
                class="location-detail-placeholder"
              >
                📍
              </div>

              <span
                v-if="isCheckedIn"
                class="location-detail-status completed"
              >
                ✓ ĐÃ KHÁM PHÁ
              </span>

              <span
                v-else
                class="location-detail-status pending"
              >
                ĐIỂM ĐẾN ECOVEL
              </span>
            </div>


            <div class="location-detail-content">
              <span class="home-tag">
                ĐỊA ĐIỂM DI SẢN
              </span>

              <h1>
                {{ location.name }}
              </h1>

              <p class="location-detail-description">
                {{
                  location.description ||
                  'Một điểm đến đang chờ bạn khám phá cùng ECOVEL.'
                }}
              </p>

              <div class="location-detail-info">
                <div>
                  <span>
                    📍
                  </span>

                  <div>
                    <small>
                      ĐỊA CHỈ
                    </small>

                    <p>
                      {{ location.address }}
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    ◎
                  </span>

                  <div>
                    <small>
                      BÁN KÍNH CHECK-IN
                    </small>

                    <p>
                      {{
                        location.checkin_radius
                      }}
                      mét
                    </p>
                  </div>
                </div>
              </div>


              <div class="location-detail-actions">
                <RouterLink
                  v-if="!isCheckedIn"
                  :to="`/checkin?location=${location.id}`"
                  class="home-primary-btn"
                >
                  Check-in tại đây
                </RouterLink>

                <span
                  v-else
                  class="location-detail-completed"
                >
                  ✓ Dấu ấn đã được lưu
                </span>

                <RouterLink
                  to="/map"
                  class="location-detail-secondary"
                >
                  Xem trên bản đồ →
                </RouterLink>
              </div>
            </div>
          </div>


          <!-- STORY -->
          <section class="location-detail-story">
            <div>
              <span class="home-tag">
                CÂU CHUYỆN ĐIỂM ĐẾN
              </span>

              <h2>
                Một điểm dừng,
                một câu chuyện riêng
              </h2>
            </div>

            <div class="location-detail-story-text">
              <p>
                {{
                  location.description ||
                  'Địa điểm này là một phần trong hành trình khám phá di sản cùng ECOVEL.'
                }}
              </p>

              <p>
                Hãy dành thời gian quan sát,
                tìm hiểu không gian xung quanh
                và lưu lại dấu ấn của bạn
                thông qua hoạt động check-in ECOVEL.
              </p>
            </div>
          </section>


          <!-- JOURNEYS -->
          <section
            v-if="journeys.length"
            class="location-detail-journeys"
          >
            <div class="home-section-heading">
              <span class="home-tag">
                HÀNH TRÌNH LIÊN QUAN
              </span>

              <h2>
                Điểm đến này nằm trong
                hành trình nào?
              </h2>

              <p>
                Tiếp tục khám phá những điểm dừng
                khác trong cùng hành trình.
              </p>
            </div>

            <div class="location-journey-grid">
              <RouterLink
                v-for="journey in journeys"
                :key="journey.id"
                :to="`/journeys/${journey.id}`"
                class="location-journey-card"
              >
                <span>
                  HÀNH TRÌNH ECOVEL
                </span>

                <h3>
                  {{ journey.name }}
                </h3>

                <p>
                  {{
                    journey.description
                  }}
                </p>

                <strong>
                  Xem hành trình →
                </strong>
              </RouterLink>
            </div>
          </section>


          <!-- CTA -->
          <section class="location-detail-final">
            <div>
              <span class="home-tag">
                DẤU ẤN TIẾP THEO
              </span>

              <h2>
                Đừng chỉ ghé qua,
                hãy lưu lại hành trình
              </h2>

              <p>
                Check-in tại địa điểm,
                tiếp tục hành trình và
                mở khóa thêm những thành tựu ECOVEL.
              </p>
            </div>

            <div class="location-detail-final-actions">
              <RouterLink
                v-if="!isCheckedIn"
                :to="`/checkin?location=${location.id}`"
                class="home-primary-btn"
              >
                Check-in ngay
              </RouterLink>

              <RouterLink
                to="/locations"
                class="location-detail-secondary"
              >
                Xem địa điểm khác →
              </RouterLink>
            </div>
          </section>
        </section>
      </template>
    </main>

    <AppFooter />
  </div>
</template>