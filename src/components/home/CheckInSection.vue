<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import { useRoute } from 'vue-router'

import {
  getLocations
} from '../../features/locations/services/locationService'

import {
  useCheckIn
} from '../../composables/useCheckIn'

import CheckInPopup from './CheckInPopup.vue'

const route = useRoute()

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

onMounted(async () => {
  try {
    locations.value =
      await getLocations()

    if (locations.value.length > 0) {
      selectedId.value =
        locations.value[0].id
    }

    const locationIdFromQuery =
      Number(route.query.location)

    if (
      locationIdFromQuery &&
      locations.value.some(
        location =>
          location.id ===
          locationIdFromQuery
      )
    ) {
      selectedId.value =
        locationIdFromQuery
    }

    await loadHistory()
  } catch (error) {
    console.error(
      'Lỗi tải dữ liệu check-in:',
      error
    )
  } finally {
    loadingLocations.value = false
  }
})

const selectedLocation = computed(() => {
  return locations.value.find(
    location =>
      location.id === selectedId.value
  )
})

const totalCheckIns = computed(() => {
  return history.value.length
})

const selectedRadius = computed(() => {
  return (
    selectedLocation.value
      ?.checkin_radius ?? 0
  )
})
</script>

<template>
  <section
    id="checkin"
    class="checkin-showcase"
  >
    <!-- HERO -->
    <div class="checkin-heading">
      <span class="home-tag">
        CHECK-IN ECOVEL
      </span>

      <h1>
        Ghi dấu
        <br />
        điểm đến của bạn
      </h1>

      <p>
        Có mặt tại địa điểm,
        xác nhận vị trí và lưu lại
        một dấu ấn mới trong
        hộ chiếu du lịch ECOVEL.
      </p>

      <div class="checkin-heading-meta">
        <span>
          📍 {{ locations.length }}
          điểm đến
        </span>

        <span>
          ✓ {{ totalCheckIns }}
          lần check-in
        </span>
      </div>
    </div>

    <!-- MAIN -->
    <div class="checkin-layout">
      <!-- LOCATION -->
      <div class="checkin-card">
        <div class="checkin-card-top">
          <div>
            <span class="checkin-step-label">
              BƯỚC 01
            </span>

            <h2>
              Chọn điểm đến
            </h2>
          </div>

          <span class="checkin-step-number">
            01
          </span>
        </div>

        <label for="checkin-location">
          Địa điểm bạn đang khám phá
        </label>

        <select
          id="checkin-location"
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

        <div
          v-if="selectedLocation"
          class="checkin-location-preview"
        >
          <div class="checkin-image-wrap">
            <img
              v-if="
                selectedLocation.image_url
              "
              :src="
                selectedLocation.image_url
              "
              class="place-img"
              :alt="
                selectedLocation.name
              "
            />

            <span class="checkin-image-label">
              ĐIỂM ĐẾN
            </span>
          </div>

          <div class="checkin-location-info">
            <h3>
              {{ selectedLocation.name }}
            </h3>

            <p
              v-if="
                selectedLocation.description
              "
              class="checkin-location-description"
            >
              {{
                selectedLocation.description
              }}
            </p>

            <p
              v-if="
                selectedLocation.address
              "
              class="checkin-location-address"
            >
              <span>📍</span>

              {{ selectedLocation.address }}
            </p>
          </div>
        </div>

        <!-- CHECK-IN ACTION -->
        <div class="checkin-action-box">
          <div class="checkin-action-heading">
            <span class="checkin-step-label">
              BƯỚC 02
            </span>

            <h3>
              Xác nhận vị trí
            </h3>
          </div>

          <p>
            ECOVEL sẽ sử dụng vị trí hiện tại
            của bạn để kiểm tra khoảng cách
            tới điểm đến đã chọn.
          </p>

          <div
            v-if="selectedRadius"
            class="checkin-radius"
          >
            <span>◎</span>

            Phạm vi check-in:
            {{ selectedRadius }}m
          </div>

          <button
            type="button"
            class="checkin-main-button"
            :disabled="
              !selectedLocation
            "
            @click="
              checkIn(selectedLocation)
            "
          >
            <span>📍</span>
            Check-in tại đây
          </button>

          <p class="checkin-note">
            Hãy bật quyền truy cập vị trí
            và đứng gần địa điểm để
            check-in thành công.
          </p>

          <p
            v-if="result"
            class="checkin-result"
          >
            {{ result }}
          </p>
        </div>
      </div>

      <!-- GUIDE -->
      <aside class="checkin-guide">
        <span class="home-tag">
          CÁCH CHECK-IN
        </span>

        <h2>
          Ba bước để
          lưu một dấu ấn
        </h2>

        <div class="checkin-guide-list">
          <div class="checkin-guide-item">
            <span>01</span>

            <div>
              <h3>
                Chọn địa điểm
              </h3>

              <p>
                Chọn đúng nơi bạn
                đang ghé thăm.
              </p>
            </div>
          </div>

          <div class="checkin-guide-line"></div>

          <div class="checkin-guide-item">
            <span>02</span>

            <div>
              <h3>
                Xác nhận vị trí
              </h3>

              <p>
                Cho phép ECOVEL
                sử dụng vị trí hiện tại.
              </p>
            </div>
          </div>

          <div class="checkin-guide-line"></div>

          <div class="checkin-guide-item">
            <span>03</span>

            <div>
              <h3>
                Lưu dấu ấn
              </h3>

              <p>
                Check-in thành công
                sẽ được lưu vào
                hành trình của bạn.
              </p>
            </div>
          </div>
        </div>

        <RouterLink
          to="/map"
          class="checkin-map-link"
        >
          Xem bản đồ địa điểm →
        </RouterLink>
      </aside>
    </div>

    <!-- HISTORY -->
    <section class="checkin-history">
      <div class="checkin-history-heading">
        <div>
          <span class="home-tag">
            DẤU ẤN CỦA BẠN
          </span>

          <h2>
            Lịch sử check-in
          </h2>

          <p>
            Những địa điểm bạn đã
            ghi dấu cùng ECOVEL.
          </p>
        </div>

        <strong>
          {{ totalCheckIns }}
        </strong>
      </div>

      <div
        v-if="loadingHistory"
        class="checkin-history-state"
      >
        Đang tải lịch sử...
      </div>

      <div
        v-else-if="
          history.length === 0
        "
        class="checkin-history-empty"
      >
        <span>🧭</span>

        <h3>
          Chưa có dấu ấn nào
        </h3>

        <p>
          Hãy bắt đầu bằng
          điểm đến đầu tiên của bạn.
        </p>
      </div>

      <div
        v-else
        class="history-list"
      >
        <article
          v-for="(item, index) in history"
          :key="item.id"
          class="history-item"
        >
          <div class="history-number">
            {{
              String(
                index + 1
              ).padStart(2, '0')
            }}
          </div>

          <div class="history-content">
            <span class="history-label">
              ĐÃ CHECK-IN
            </span>

            <h4>
              {{ item.placeName }}
            </h4>

            <p>
              {{ item.time }}
            </p>
          </div>

          <div
            v-if="
              item.distance != null
            "
            class="history-distance"
          >
            <span>◎</span>

            {{
              Math.round(
                item.distance
              )
            }}m
          </div>

          <span class="history-completed">
            ✓
          </span>
        </article>
      </div>
    </section>

    <CheckInPopup
      :visible="popupVisible"
      :text="popupText"
      @close="closePopup"
    />
  </section>
</template>