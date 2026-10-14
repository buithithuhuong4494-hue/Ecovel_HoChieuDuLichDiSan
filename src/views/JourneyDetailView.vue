<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import { useRoute } from 'vue-router'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import { supabase } from '../lib/supabase'

import '../assets/styles/home.css'

const route = useRoute()

const journey = ref(null)
const checkedLocationIds = ref([])

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    // Lấy thông tin hành trình
    const {
      data: journeyData,
      error: journeyError
    } = await supabase
      .from('journeys')
      .select(`
        id,
        name,
        description,
        cover_image_url,
        journey_locations (
          id,
          stop_order,
          locations (
            id,
            name,
            description,
            address,
            image_url,
            checkin_radius
          )
        )
      `)
      .eq('id', route.params.id)
      .single()

    if (journeyError) {
      throw journeyError
    }

    journey.value = journeyData

    // Lấy user đang đăng nhập
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    // Nếu đã đăng nhập thì lấy địa điểm đã check-in
    if (user) {
      const {
        data: checkIns,
        error: checkInError
      } = await supabase
        .from('check_ins')
        .select('location_id')
        .eq('user_id', user.id)
        .eq('status', 'verified')

      if (checkInError) {
        throw checkInError
      }

      checkedLocationIds.value =
        checkIns.map(
          item => item.location_id
        )
    }
  } catch (error) {
    console.error(
      'Lỗi tải chi tiết hành trình:',
      error
    )

    errorMessage.value =
      'Không thể tải thông tin hành trình.'
  } finally {
    loading.value = false
  }
})

const sortedStops = computed(() => {
  if (!journey.value?.journey_locations) {
    return []
  }

  return [
    ...journey.value.journey_locations
  ].sort(
    (a, b) =>
      a.stop_order - b.stop_order
  )
})

const totalLocations = computed(() => {
  return sortedStops.value.length
})

const completedLocations = computed(() => {
  return sortedStops.value.filter(
    stop =>
      checkedLocationIds.value.includes(
        stop.locations?.id
      )
  ).length
})

const progressPercent = computed(() => {
  if (totalLocations.value === 0) {
    return 0
  }

  return Math.round(
    (
      completedLocations.value /
      totalLocations.value
    ) * 100
  )
})

const nextStop = computed(() => {
  return sortedStops.value.find(
    stop =>
      !checkedLocationIds.value.includes(
        stop.locations?.id
      )
  )
})

const progressTitle = computed(() => {
  if (progressPercent.value === 100) {
    return 'Bạn đã hoàn thành hành trình 🎉'
  }

  if (progressPercent.value >= 50) {
    return 'Bạn đã đi được hơn nửa hành trình'
  }

  if (progressPercent.value > 0) {
    return 'Hành trình của bạn đã bắt đầu'
  }

  return 'Sẵn sàng cho điểm đến đầu tiên?'
})

const progressDescription = computed(() => {
  if (progressPercent.value === 100) {
    return 'Tất cả điểm đến đã được check-in. Hành trình này giờ đã trở thành một phần trong hộ chiếu ECOVEL của bạn.'
  }

  if (nextStop.value?.locations?.name) {
    return `Điểm dừng tiếp theo của bạn là ${nextStop.value.locations.name}.`
  }

  return 'Check-in từng điểm đến để ghi lại dấu ấn trên hành trình của bạn.'
})

function isCheckedIn(locationId) {
  return checkedLocationIds.value.includes(
    locationId
  )
}
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <div
        v-if="loading"
        class="journey-detail-state"
      >
        <span>🧭</span>

        <p>
          Đang chuẩn bị hành trình của bạn...
        </p>
      </div>

      <div
        v-else-if="errorMessage"
        class="journey-detail-state"
      >
        <span>!</span>

        <p>
          {{ errorMessage }}
        </p>
      </div>

      <template v-else-if="journey">
        <!-- HERO -->
        <section class="journey-detail-hero">
          <span class="home-tag">
            HÀNH TRÌNH ECOVEL
          </span>

          <h1>
            {{ journey.name }}
          </h1>

          <p class="journey-detail-intro">
            {{
              journey.description ||
              'Khám phá từng điểm đến và lưu lại dấu ấn trên hành trình di sản của riêng bạn.'
            }}
          </p>

          <div class="journey-detail-meta">
            <span>
              📍 {{ totalLocations }} điểm đến
            </span>

            <span>
              ✓ {{ completedLocations }} đã khám phá
            </span>
          </div>

          <!-- PROGRESS -->
          <div class="journey-progress">
            <div class="journey-progress-header">
              <span>
                Tiến độ hành trình
              </span>

              <strong>
                {{ progressPercent }}%
              </strong>
            </div>

            <div class="journey-progress-bar">
              <div
                class="journey-progress-value"
                :style="{
                  width: progressPercent + '%'
                }"
              ></div>
            </div>

            <div class="journey-progress-message">
              <h3>
                {{ progressTitle }}
              </h3>

              <p>
                {{ progressDescription }}
              </p>
            </div>

            <RouterLink
              v-if="
                progressPercent < 100 &&
                nextStop?.locations?.id
              "
              :to="`/checkin?location=${nextStop.locations.id}`"
              class="journey-next-button"
            >
              Tiếp tục hành trình →
            </RouterLink>

            <RouterLink
              v-else-if="progressPercent === 100"
              to="/achievements"
              class="journey-next-button"
            >
              Xem thành tựu của bạn →
            </RouterLink>
          </div>
        </section>

        <!-- LOCATIONS -->
        <section class="journey-detail-locations">
          <div class="home-section-heading">
            <span class="home-tag">
              CÁC ĐIỂM DỪNG
            </span>

            <h2>
              Mỗi điểm đến,
              một dấu ấn riêng
            </h2>

            <p>
              Khám phá lần lượt từng địa điểm,
              check-in khi bạn có mặt và hoàn thành
              hành trình ECOVEL của riêng mình.
            </p>
          </div>

          <div class="journey-location-grid">
            <article
              v-for="stop in sortedStops"
              :key="stop.id"
              class="journey-location-card"
              :class="{
                completed:
                  isCheckedIn(
                    stop.locations?.id
                  )
              }"
            >
              <div class="journey-stop-number">
                {{
                  String(
                    stop.stop_order
                  ).padStart(2, '0')
                }}
              </div>

              <div class="journey-location-image">
                <img
                  v-if="stop.locations?.image_url"
                  :src="stop.locations.image_url"
                  :alt="stop.locations.name"
                />

                <div
                  v-if="
                    isCheckedIn(
                      stop.locations?.id
                    )
                  "
                  class="journey-image-completed"
                >
                  ✓
                </div>
              </div>

              <div class="journey-location-info">
                <div class="journey-location-title">
                  <div>
                    <span class="journey-stop-label">
                      ĐIỂM DỪNG
                      {{
                        String(
                          stop.stop_order
                        ).padStart(2, '0')
                      }}
                    </span>

                    <h3>
                      {{ stop.locations?.name }}
                    </h3>
                  </div>

                  <span
                    v-if="
                      isCheckedIn(
                        stop.locations?.id
                      )
                    "
                    class="status-badge checked"
                  >
                    ✓ Đã khám phá
                  </span>

                  <span
                    v-else
                    class="status-badge pending"
                  >
                    Chưa check-in
                  </span>
                </div>

                <p class="journey-location-description">
                  {{
                    stop.locations?.description ||
                    'Một điểm đến đang chờ bạn khám phá trên hành trình này.'
                  }}
                </p>

                <p class="journey-location-address">
                  <span>📍</span>

                  {{ stop.locations?.address }}
                </p>

                <div class="journey-location-actions">
                  <RouterLink
                    v-if="
                      !isCheckedIn(
                        stop.locations?.id
                      )
                    "
                    :to="`/checkin?location=${stop.locations?.id}`"
                    class="home-primary-btn"
                  >
                    Check-in tại đây
                  </RouterLink>

                  <span
                    v-else
                    class="completed-text"
                  >
                    ✓ Dấu ấn đã được lưu
                  </span>

                  <RouterLink
                    to="/map"
                    class="journey-map-link"
                  >
                    Xem trên bản đồ →
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>

          <!-- FINAL MESSAGE -->
          <div class="journey-detail-footer">
            <span class="home-tag">
              DẤU ẤN HÀNH TRÌNH
            </span>

            <h2>
              {{
                progressPercent === 100
                  ? 'Một hành trình đã trở thành kỷ niệm'
                  : 'Còn những điểm đến đang chờ bạn'
              }}
            </h2>

            <p>
              {{
                progressPercent === 100
                  ? 'Bạn đã hoàn thành tất cả điểm đến trong hành trình này. Hãy tiếp tục khám phá những hành trình mới cùng ECOVEL.'
                  : 'Mỗi lần check-in là thêm một dấu ấn vào hộ chiếu du lịch ECOVEL của bạn.'
              }}
            </p>

            <RouterLink
              :to="
                progressPercent === 100
                  ? '/journeys'
                  : '/map'
              "
              class="home-primary-btn"
            >
              {{
                progressPercent === 100
                  ? 'Khám phá hành trình khác'
                  : 'Khám phá bản đồ'
              }}
            </RouterLink>
          </div>
        </section>
      </template>
    </main>

    <AppFooter />
  </div>
</template>