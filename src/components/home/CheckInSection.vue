<script setup>
import { onMounted, computed, ref } from 'vue'
import { getLocations } from '../../features/locations/services/locationService'
import { useCheckIn } from '../../composables/useCheckIn'
import CheckInPopup from './CheckInPopup.vue'
import { useRoute } from 'vue-router'

const locations = ref([])
const selectedId = ref(null)
const loadingLocations = ref(true)

const {
  result,
  history,
  popupVisible,
  popupText,
  loadingHistory,
  checkIn,
  loadHistory,
  closePopup
} = useCheckIn()

const route = useRoute()

onMounted(async () => {
  try {
    // Load danh sách địa điểm
    locations.value = await getLocations()

    if (locations.value.length > 0) {
      selectedId.value = locations.value[0].id
    }

    const locationIdFromQuery = Number(
  route.query.location
)

if (
  locationIdFromQuery &&
  locations.value.some(
    location =>
      location.id === locationIdFromQuery
  )
) {
  selectedId.value =
    locationIdFromQuery
}

    // Load lịch sử check-in
    await loadHistory()
  } catch (error) {
    console.error('Lỗi tải dữ liệu check-in:', error)
  } finally {
    loadingLocations.value = false
  }
})

const selectedLocation = computed(() => {
  return locations.value.find(
    location => location.id === selectedId.value
  )
})
</script>

<template>
  <section
    id="checkin"
    class="checkin-showcase"
  >
    <h2>Check-in địa điểm</h2>

    <div class="checkin-card">
      <label>
        Chọn địa điểm
      </label>

      <select
        v-model="selectedId"
        :disabled="loadingLocations"
      >
        <option
          v-for="location in locations"
          :key="location.id"
          :value="location.id"
        >
          {{ location.name }}
        </option>
      </select>

      <img
        v-if="selectedLocation?.image_url"
        :src="selectedLocation.image_url"
        class="place-img"
        :alt="selectedLocation.name"
      />

      <button
        type="button"
        :disabled="!selectedLocation"
        @click="checkIn(selectedLocation)"
      >
        Check-in
      </button>

      <p v-if="result">
        {{ result }}
      </p>

      <p class="note">
        Vui lòng đứng tại địa điểm để check-in.
      </p>

      <h3 class="history-title">
        Lịch sử check-in
      </h3>

      <p
        v-if="loadingHistory"
        class="note"
      >
        Đang tải lịch sử...
      </p>

      <p
        v-else-if="history.length === 0"
        class="note"
      >
        Chưa có lịch sử check-in.
      </p>

      <div
        v-else
        class="history-list"
      >
        <div
          v-for="item in history"
          :key="item.id"
          class="history-item"
        >
          <h4>
            {{ item.placeName }}
          </h4>

          <p>
            {{ item.time }}
          </p>

          <p v-if="item.distance != null">
            Khoảng cách:
            {{ Math.round(item.distance) }}m
          </p>
        </div>
      </div>
    </div>

    <CheckInPopup
      :visible="popupVisible"
      :text="popupText"
      @close="closePopup"
    />
  </section>
</template>