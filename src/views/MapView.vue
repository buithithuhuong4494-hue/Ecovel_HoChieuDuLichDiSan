<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  getLocations
} from '../features/locations/services/locationService.js'

import {
  getMyCheckIns
} from '../features/checkin/services/checkinService.js'

import '../assets/styles/home.css'

const locations = ref([])
const checkedLocationIds = ref([])

const loading = ref(true)
const errorMessage = ref('')

const mapElement = ref(null)

let map = null

const completedCount = computed(() => {
  return checkedLocationIds.value.length
})

const remainingCount = computed(() => {
  return Math.max(
    locations.value.length -
      checkedLocationIds.value.length,
    0
  )
})

const progressPercent = computed(() => {
  if (!locations.value.length) {
    return 0
  }

  return Math.round(
    (
      completedCount.value /
      locations.value.length
    ) * 100
  )
})

const nextLocation = computed(() => {
  return locations.value.find(
    location =>
      !checkedLocationIds.value.includes(
        location.id
      )
  )
})

const mapMessage = computed(() => {
  if (progressPercent.value === 100) {
    return 'Bạn đã chinh phục tất cả điểm đến hiện có trên bản đồ ECOVEL.'
  }

  if (progressPercent.value >= 50) {
    return 'Bạn đã đi được hơn nửa bản đồ. Chỉ còn vài dấu ấn nữa đang chờ được mở khóa.'
  }

  if (completedCount.value > 0) {
    return 'Hành trình đã bắt đầu. Hãy chọn điểm đến tiếp theo trên bản đồ.'
  }

  return 'Mỗi điểm trên bản đồ là một câu chuyện đang chờ bạn khám phá.'
})

onMounted(async () => {
  try {
    locations.value = await getLocations()

    try {
      const checkIns =
        await getMyCheckIns()

      checkedLocationIds.value =
        checkIns
          .filter(
            item =>
              item.status === 'verified'
          )
          .map(
            item =>
              item.locations?.id
          )
          .filter(Boolean)
    } catch (error) {
      console.log(
        'Chưa đăng nhập hoặc chưa có lịch sử check-in:',
        error
      )
    }

    loading.value = false

    await nextTick()

    createMap()
  } catch (error) {
    console.error(
      'Lỗi tải bản đồ:',
      error
    )

    errorMessage.value =
      'Không thể tải dữ liệu bản đồ.'

    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

function isCheckedIn(locationId) {
  return checkedLocationIds.value.includes(
    locationId
  )
}

function createMarkerIcon(checked) {
  return L.divIcon({
    className: 'ecovel-map-marker',

    html: `
      <div
        class="
          map-marker-dot
          ${checked ? 'completed' : 'pending'}
        "
      >
        ${checked ? '✓' : '•'}
      </div>
    `,

    iconSize: [42, 42],
    iconAnchor: [21, 21]
  })
}

function createMap() {
  if (!mapElement.value) {
    return
  }

  const validLocations =
    locations.value.filter(
      location =>
        location.latitude != null &&
        location.longitude != null
    )

  if (!validLocations.length) {
    errorMessage.value =
      'Các địa điểm chưa có tọa độ.'

    return
  }

  map = L.map(
    mapElement.value,
    {
      zoomControl: true
    }
  )

  L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  const bounds = []

  validLocations.forEach(location => {
    const lat =
      Number(location.latitude)

    const lng =
      Number(location.longitude)

    const checked =
      isCheckedIn(location.id)

    bounds.push([lat, lng])

    const description =
      location.description
        ? location.description
        : 'Một điểm đến đang chờ bạn khám phá.'

    L.marker(
      [lat, lng],
      {
        icon:
          createMarkerIcon(
            checked
          )
      }
    )
      .addTo(map)
      .bindPopup(`
        <div class="map-popup">
          <span class="map-popup-label">
            ${
              checked
                ? 'ĐÃ KHÁM PHÁ'
                : 'ĐIỂM ĐẾN'
            }
          </span>

          <strong>
            ${location.name}
          </strong>

          <p class="map-popup-description">
            ${description}
          </p>

          <p class="map-popup-address">
            📍 ${location.address ?? ''}
          </p>

          ${
            checked
              ? `
                <span
                  class="map-popup-completed"
                >
                  ✓ Dấu ấn đã được lưu
                </span>
              `
              : `
                <a
                  href="/checkin?location=${location.id}"
                  class="map-popup-button"
                >
                  Check-in tại đây →
                </a>
              `
          }
        </div>
      `)
  })

  map.fitBounds(
    bounds,
    {
      padding: [50, 50],
      maxZoom: 15
    }
  )

  setTimeout(() => {
    map?.invalidateSize()
  }, 100)
}
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <section class="map-page">
        <!-- HERO -->
        <div class="map-page-hero">
          <div class="map-page-heading">
            <span class="home-tag">
              BẢN ĐỒ ECOVEL
            </span>

            <h1>
              Bản đồ
              <br />
              chinh phục của bạn
            </h1>

            <p>
              Theo dõi những nơi bạn đã đặt chân đến,
              tìm điểm dừng tiếp theo và từng bước
              phủ đầy bản đồ bằng những dấu ấn ECOVEL.
            </p>
          </div>

          <div class="map-progress-card">
            <span class="map-progress-label">
              TIẾN ĐỘ KHÁM PHÁ
            </span>

            <strong>
              {{ progressPercent }}%
            </strong>

            <p>
              {{ mapMessage }}
            </p>

            <div class="map-progress-track">
              <div
                class="map-progress-value"
                :style="{
                  width:
                    progressPercent + '%'
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- LOADING -->
        <div
          v-if="loading"
          class="map-state"
        >
          <span>🗺️</span>

          <p>
            Đang mở bản đồ khám phá...
          </p>
        </div>

        <!-- ERROR -->
        <div
          v-else-if="errorMessage"
          class="map-state"
        >
          <span>!</span>

          <p>
            {{ errorMessage }}
          </p>
        </div>

        <template v-else>
          <!-- STATS -->
          <div class="map-stats">
            <div class="map-stat-card">
              <span>
                📍
              </span>

              <div>
                <strong>
                  {{ locations.length }}
                </strong>

                <p>
                  Tổng điểm đến
                </p>
              </div>
            </div>

            <div class="map-stat-card">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  {{ completedCount }}
                </strong>

                <p>
                  Đã chinh phục
                </p>
              </div>
            </div>

            <div class="map-stat-card">
              <span>
                🧭
              </span>

              <div>
                <strong>
                  {{ remainingCount }}
                </strong>

                <p>
                  Đang chờ khám phá
                </p>
              </div>
            </div>
          </div>

          <!-- MAP -->
          <div class="map-shell">
            <div class="map-toolbar">
              <div>
                <span class="map-toolbar-label">
                  BẢN ĐỒ KHÁM PHÁ
                </span>

                <h2>
                  Chọn điểm đến tiếp theo
                </h2>
              </div>

              <RouterLink
                v-if="nextLocation"
                :to="`/checkin?location=${nextLocation.id}`"
                class="map-next-link"
              >
                Gợi ý:
                {{ nextLocation.name }}
                →
              </RouterLink>
            </div>

            <div
              ref="mapElement"
              class="ecovel-map"
            ></div>

            <div class="map-legend">
              <span>
                <i
                  class="legend-dot completed"
                ></i>

                Đã check-in
              </span>

              <span>
                <i
                  class="legend-dot pending"
                ></i>

                Chưa khám phá
              </span>
            </div>
          </div>

          <!-- BOTTOM CTA -->
          <div class="map-bottom-cta">
            <div>
              <span class="home-tag">
                ĐIỂM DỪNG TIẾP THEO
              </span>

              <h2>
                {{
                  nextLocation
                    ? nextLocation.name
                    : 'Bạn đã chinh phục toàn bộ bản đồ'
                }}
              </h2>

              <p>
                {{
                  nextLocation
                    ? 'Một điểm đến mới đang chờ được ghi dấu trong hộ chiếu ECOVEL của bạn.'
                    : 'Hãy khám phá thêm những hành trình mới và tiếp tục mở rộng hộ chiếu ECOVEL.'
                }}
              </p>
            </div>

            <RouterLink
              :to="
                nextLocation
                  ? `/checkin?location=${nextLocation.id}`
                  : '/journeys'
              "
              class="home-primary-btn"
            >
              {{
                nextLocation
                  ? 'Check-in điểm tiếp theo'
                  : 'Khám phá hành trình khác'
              }}
            </RouterLink>
          </div>
        </template>
      </section>
    </main>

    <AppFooter />
  </div>
</template>