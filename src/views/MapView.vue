<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import { getLocations } from '../features/locations/services/locationService.js'
import { getMyCheckIns } from '../features/checkin/services/checkinService.js'

import '../assets/styles/home.css'

const locations = ref([])
const checkedLocationIds = ref([])

const loading = ref(true)
const errorMessage = ref('')

const mapElement = ref(null)

let map = null

onMounted(async () => {
  try {
    locations.value = await getLocations()

    try {
      const checkIns = await getMyCheckIns()

      checkedLocationIds.value = checkIns
        .filter(item => item.status === 'verified')
        .map(item => item.locations?.id)
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
      <div class="map-marker-dot ${checked ? 'completed' : 'pending'}">
        ${checked ? '✓' : ''}
      </div>
    `,

    iconSize: [38, 38],
    iconAnchor: [19, 19]
  })
}

function createMap() {
  if (!mapElement.value) {
    return
  }

  const validLocations = locations.value.filter(
    location =>
      location.latitude != null &&
      location.longitude != null
  )

  if (!validLocations.length) {
    errorMessage.value =
      'Các địa điểm chưa có tọa độ.'
    return
  }

  map = L.map(mapElement.value)

  L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  const bounds = []

  validLocations.forEach(location => {
    const lat = Number(location.latitude)
    const lng = Number(location.longitude)

    const checked =
      isCheckedIn(location.id)

    bounds.push([lat, lng])

    L.marker(
      [lat, lng],
      {
        icon: createMarkerIcon(checked)
      }
    )
      .addTo(map)
  .bindPopup(`
  <div class="map-popup">
    <strong>
      ${location.name}
    </strong>

    <p>
      ${location.address ?? ''}
    </p>

    ${
      checked
        ? `
          <span class="map-popup-completed">
            ✓ Đã check-in
          </span>
        `
        : `
          <a
            href="/checkin?location=${location.id}"
            class="map-popup-button"
          >
            Check-in địa điểm
          </a>
        `
    }
  </div>
`)
  })

  map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 15
  })

  setTimeout(() => {
    map.invalidateSize()
  }, 100)
}
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <section class="map-page">
        <div class="home-section-heading">
          <span class="home-tag">
            BẢN ĐỒ
          </span>

          <h1>
            Bản đồ chinh phục
          </h1>

          <p>
            Theo dõi những địa điểm bạn đã khám phá
            trên hành trình ECOVEL.
          </p>
        </div>

        <p
          v-if="loading"
          class="section"
        >
          Đang tải bản đồ...
        </p>

        <p
          v-else-if="errorMessage"
          class="section"
        >
          {{ errorMessage }}
        </p>

        <template v-else>
          <div class="map-stats">
            <span>
              📍 {{ locations.length }}
              địa điểm
            </span>

            <span>
              ✓ {{ checkedLocationIds.length }}
              đã chinh phục
            </span>
          </div>

          <div
            ref="mapElement"
            class="ecovel-map"
          ></div>

          <div class="map-legend">
            <span>
              <i class="legend-dot completed"></i>
              Đã check-in
            </span>

            <span>
              <i class="legend-dot pending"></i>
              Chưa check-in
            </span>
          </div>
        </template>
      </section>
    </main>

    <AppFooter />
  </div>
</template>