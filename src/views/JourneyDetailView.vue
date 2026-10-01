<script setup>
import { computed, onMounted, ref } from 'vue'
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
    const { data: journeyData, error: journeyError } = await supabase
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

    // Nếu đã đăng nhập thì lấy các location đã check-in
    if (user) {
      const { data: checkIns, error: checkInError } = await supabase
        .from('check_ins')
        .select('location_id')
        .eq('user_id', user.id)
        .eq('status', 'verified')

      if (checkInError) {
        throw checkInError
      }

      checkedLocationIds.value =
        checkIns.map(item => item.location_id)
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

      <template v-else-if="journey">
        <!-- HERO -->
        <section class="journey-detail-hero">
          <span class="home-tag">
            HÀNH TRÌNH ECOVEL
          </span>

          <h1>
            {{ journey.name }}
          </h1>

          <p>
            {{ journey.description }}
          </p>

          <strong>
            {{ totalLocations }}
            điểm đến
          </strong>

          <!-- PROGRESS -->
          <div class="journey-progress">
            <div class="journey-progress-header">
              <span>
                Tiến độ hành trình
              </span>

              <strong>
                {{ completedLocations }}
                /
                {{ totalLocations }}
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

            <p>
              {{ progressPercent }}% hoàn thành
            </p>
          </div>
        </section>

        <!-- LOCATIONS -->
        <section class="journey-detail-locations">
          <div class="home-section-heading">
            <span class="home-tag">
              ĐIỂM ĐẾN
            </span>

            <h2>
              Các địa điểm trong hành trình
            </h2>

            <p>
              Khám phá lần lượt các điểm đến và hoàn thành hành trình.
            </p>
          </div>

          <div class="journey-location-grid">
            <article
              v-for="stop in sortedStops"
              :key="stop.id"
              class="journey-location-card"
            >
              <div class="journey-stop-number">
                {{ String(stop.stop_order).padStart(2, '0') }}
              </div>

              <img
                v-if="stop.locations?.image_url"
                :src="stop.locations.image_url"
                :alt="stop.locations.name"
              />

              <div class="journey-location-info">
                <div class="journey-location-title">
                  <h3>
                    {{ stop.locations?.name }}
                  </h3>

                  <span
                    v-if="isCheckedIn(stop.locations?.id)"
                    class="status-badge checked"
                  >
                    ✓ Đã check-in
                  </span>

                  <span
                    v-else
                    class="status-badge pending"
                  >
                    Chưa check-in
                  </span>
                </div>

                <p>
                  {{ stop.locations?.description }}
                </p>

                <p>
                  <strong>Địa chỉ:</strong>
                  {{ stop.locations?.address }}
                </p>

                <RouterLink
                  v-if="!isCheckedIn(stop.locations?.id)"
                  :to="`/checkin?location=${stop.locations?.id}`"
                  class="home-primary-btn"
                >
                  Check-in địa điểm
                </RouterLink>

                <span
                  v-else
                  class="completed-text"
                >
                  Địa điểm đã hoàn thành
                </span>
              </div>
            </article>
          </div>
        </section>
      </template>
    </main>

    <AppFooter />
  </div>
</template>