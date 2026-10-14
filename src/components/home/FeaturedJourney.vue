<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import {
  getJourneys
} from '../../features/journeys/services/journeyService.js'

const journeys = ref([])
const loading = ref(true)
const errorMessage = ref('')

const featuredJourney = computed(() => {
  return journeys.value[0] ?? null
})

const journeyLocations = computed(() => {
  if (!featuredJourney.value) {
    return []
  }

  return [
    ...(featuredJourney.value.journey_locations ?? [])
  ]
    .sort(
      (a, b) =>
        a.stop_order - b.stop_order
    )
    .map(item => item.locations)
    .filter(Boolean)
})

const journeyImage = computed(() => {
  return (
    featuredJourney.value?.cover_image_url ||
    journeyLocations.value[0]?.image_url ||
    '/images/Dinh_Doc_Lap.jpg'
  )
})

onMounted(async () => {
  try {
    journeys.value = await getJourneys()
  } catch (error) {
    console.error(
      'Lỗi tải hành trình nổi bật:',
      error
    )

    errorMessage.value =
      'Không thể tải hành trình nổi bật.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="featured-journey">
    <div class="home-section-heading">
      <span class="home-tag">
        HÀNH TRÌNH NỔI BẬT
      </span>

      <h2>
        Chọn hành trình bạn muốn khám phá
      </h2>

      <p>
        Mỗi hành trình kết nối những điểm đến
        theo một chủ đề văn hóa và di sản riêng.
      </p>
    </div>

    <p
      v-if="loading"
      class="featured-state"
    >
      Đang tải hành trình...
    </p>

    <p
      v-else-if="errorMessage"
      class="featured-state"
    >
      {{ errorMessage }}
    </p>

    <div
      v-else-if="featuredJourney"
      class="featured-journey-card"
    >
      <div class="featured-journey-image">
        <img
          :src="journeyImage"
          :alt="featuredJourney.name"
        />
      </div>

      <div class="featured-journey-content">
        <div class="featured-journey-top">
          <span class="journey-badge-new">
            HÀNH TRÌNH
          </span>

          <span class="journey-count-new">
            {{ journeyLocations.length }}
            điểm đến
          </span>
        </div>

        <h3>
          {{ featuredJourney.name }}
        </h3>

        <p class="featured-description">
          {{
            featuredJourney.description ||
            'Khám phá những địa điểm di sản nổi bật cùng ECOVEL.'
          }}
        </p>

        <div
          v-if="journeyLocations.length"
          class="featured-location-list"
        >
          <span
            v-for="location in journeyLocations"
            :key="location.id"
          >
            {{ location.name }}
          </span>
        </div>

        <RouterLink
          :to="`/journeys/${featuredJourney.id}`"
          class="featured-journey-button"
        >
          Khám phá hành trình →
        </RouterLink>
      </div>
    </div>

    <p
      v-else
      class="featured-state"
    >
      Chưa có hành trình nổi bật.
    </p>
  </section>
</template>