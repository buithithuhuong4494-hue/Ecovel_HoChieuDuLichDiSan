<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

import {
  useRoute
} from 'vue-router'

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

import {
  supabase
} from '../lib/supabase.js'

import '../assets/styles/home.css'


const route =
  useRoute()


const locations =
  ref([])

const checkedLocationIds =
  ref([])

const journey =
  ref(null)

const loading =
  ref(true)

const errorMessage =
  ref('')

const mapElement =
  ref(null)

let map =
  null


/* =========================================
   JOURNEY ID
   ========================================= */

const journeyId =
  computed(() => {

    const value =
      Number(
        route.query.journey
      )

    return (
      Number.isFinite(value) &&
      value > 0
    )
      ? value
      : null
  })


/* =========================================
   TITLE
   ========================================= */

const mapTitle =
  computed(() => {

    if (
      journey.value?.name
    ) {
      return journey.value.name
    }

    return (
      'Bản đồ chinh phục của bạn'
    )
  })


const mapSubtitle =
  computed(() => {

    if (
      journey.value?.name
    ) {
      return (
        'Bản đồ chỉ hiển thị các điểm đến thuộc hành trình này.'
      )
    }

    return (
      'Theo dõi những nơi bạn đã đặt chân đến, tìm điểm dừng tiếp theo và từng bước phủ đầy bản đồ bằng những dấu ấn ECOVEL.'
    )
  })


/* =========================================
   STATS
   ========================================= */

const completedCount =
  computed(() => {

    return locations.value
      .filter(
        location =>
          checkedLocationIds.value
            .includes(
              location.id
            )
      )
      .length
  })


const remainingCount =
  computed(() => {

    return Math.max(
      locations.value.length -
        completedCount.value,
      0
    )
  })


const progressPercent =
  computed(() => {

    if (
      !locations.value.length
    ) {
      return 0
    }

    return Math.round(
      (
        completedCount.value /
        locations.value.length
      ) * 100
    )
  })


const nextLocation =
  computed(() => {

    return locations.value
      .find(
        location =>
          !checkedLocationIds.value
            .includes(
              location.id
            )
      )
  })


const mapMessage =
  computed(() => {

    if (
      progressPercent.value ===
      100
    ) {
      return journey.value
        ? 'Bạn đã hoàn thành toàn bộ điểm đến trong hành trình này.'
        : 'Bạn đã chinh phục tất cả điểm đến hiện có trên bản đồ ECOVEL.'
    }


    if (
      progressPercent.value >=
      50
    ) {
      return (
        'Bạn đã đi được hơn nửa hành trình. Chỉ còn vài dấu ấn nữa đang chờ được mở khóa.'
      )
    }


    if (
      completedCount.value >
      0
    ) {
      return (
        'Hành trình đã bắt đầu. Hãy chọn điểm đến tiếp theo trên bản đồ.'
      )
    }


    return (
      'Mỗi điểm trên bản đồ là một câu chuyện đang chờ bạn khám phá.'
    )
  })


/* =========================================
   LOAD DATA
   ========================================= */

onMounted(async () => {
  try {

    /*
      Nếu URL có:
      /map?journey=2

      thì chỉ lấy điểm
      thuộc hành trình đó.
    */

    if (
      journeyId.value
    ) {
      await loadJourneyLocations(
        journeyId.value
      )
    } else {
      locations.value =
        await getLocations()
    }


    /*
      Lấy lịch sử check-in.
    */

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
        'Chưa đăng nhập hoặc chưa có lịch sử check-in:',
        error
      )
    }


    loading.value =
      false


    await nextTick()


    createMap()

  } catch (error) {

    console.error(
      'Lỗi tải bản đồ:',
      error
    )


    errorMessage.value =
      'Không thể tải dữ liệu bản đồ.'


    loading.value =
      false
  }
})


/* =========================================
   JOURNEY LOCATIONS
   ========================================= */

async function loadJourneyLocations(
  id
) {

  const {
    data,
    error
  } = await supabase
    .from(
      'journeys'
    )
    .select(`
      id,
      name,
      description,

      journey_locations (
        id,
        stop_order,

        locations (
          id,
          name,
          description,
          address,
          latitude,
          longitude,
          checkin_radius,
          image_url,
          is_active
        )
      )
    `)
    .eq(
      'id',
      id
    )
    .single()


  if (error) {
    throw error
  }


  journey.value =
    data


  /*
    Sort theo stop_order
    để marker + đường nối
    đúng thứ tự hành trình.
  */

  locations.value =
    (
      data
        ?.journey_locations ??
      []
    )
      .sort(
        (a, b) =>
          a.stop_order -
          b.stop_order
      )
      .map(
        item =>
          item.locations
      )
      .filter(
        location =>
          location &&
          location.is_active
      )
}


/* =========================================
   CLEAN MAP
   ========================================= */

onBeforeUnmount(() => {

  if (map) {
    map.remove()
    map = null
  }
})


/* =========================================
   HELPERS
   ========================================= */

function isCheckedIn(
  locationId
) {

  return checkedLocationIds
    .value
    .includes(
      locationId
    )
}


/* =========================================
   MARKER ICON
   ========================================= */

function createMarkerIcon(
  checked,
  order = null
) {

  return L.divIcon({
    className:
      'ecovel-map-marker',

    html: `
      <div
        class="
          map-marker-dot
          ${
            checked
              ? 'completed'
              : 'pending'
          }
        "
      >
        ${
          checked
            ? '✓'
            : order
              ? String(order)
                  .padStart(
                    2,
                    '0'
                  )
              : '•'
        }
      </div>
    `,

    iconSize: [
      42,
      42
    ],

    iconAnchor: [
      21,
      21
    ]
  })
}


/* =========================================
   CREATE MAP
   ========================================= */

function createMap() {

  if (
    !mapElement.value
  ) {
    return
  }


  const validLocations =
    locations.value
      .filter(
        location =>
          location.latitude !=
            null &&
          location.longitude !=
            null
      )


  if (
    !validLocations.length
  ) {
    errorMessage.value =
      'Các địa điểm chưa có tọa độ.'

    return
  }


  /*
    Xóa map cũ
    nếu còn tồn tại.
  */

  if (map) {
    map.remove()
    map = null
  }


  map = L.map(
    mapElement.value,
    {
      zoomControl: true
    }
  )


  /* =====================================
     TILE MAP - ESRI
     ===================================== */

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,

      attribution:
        'Tiles &copy; Esri'
    }
  ).addTo(map)


  const bounds = []


  /* =====================================
     MARKERS
     ===================================== */

  validLocations.forEach(
    (
      location,
      index
    ) => {

      const lat =
        Number(
          location.latitude
        )

      const lng =
        Number(
          location.longitude
        )


      const checked =
        isCheckedIn(
          location.id
        )


      bounds.push([
        lat,
        lng
      ])


      const description =
        location.description
          ? location.description
          : 'Một điểm đến đang chờ bạn khám phá.'


      /*
        Nếu đang xem map hành trình
        thì marker chưa check-in
        sẽ hiện 01, 02, 03...

        Nếu map tổng
        thì hiện dấu •
      */

      const markerOrder =
        journey.value
          ? index + 1
          : null


      L.marker(
        [
          lat,
          lng
        ],
        {
          icon:
            createMarkerIcon(
              checked,
              markerOrder
            )
        }
      )
        .addTo(map)
        .bindPopup(`
          <div
            class="map-popup"
          >

            <span
              class="map-popup-label"
            >
              ${
                checked
                  ? 'ĐÃ KHÁM PHÁ'
                  : journey.value
                    ? `ĐIỂM DỪNG ${String(
                        markerOrder
                      ).padStart(
                        2,
                        '0'
                      )}`
                    : 'ĐIỂM ĐẾN'
              }
            </span>


            <strong>
              ${location.name}
            </strong>


            <p
              class="
                map-popup-description
              "
            >
              ${description}
            </p>


            <p
              class="
                map-popup-address
              "
            >
              📍 ${
                location.address ??
                ''
              }
            </p>


            ${
              checked
                ? `
                  <span
                    class="
                      map-popup-completed
                    "
                  >
                    ✓ Dấu ấn đã được lưu
                  </span>
                `
                : `
                  <a
                    href="/checkin?location=${location.id}"
                    class="
                      map-popup-button
                    "
                  >
                    Check-in tại đây →
                  </a>
                `
            }

          </div>
        `)
    }
  )


  /* =====================================
     JOURNEY ROUTE LINE
     ===================================== */

  /*
    Chỉ vẽ tuyến khi đang xem
    một hành trình cụ thể.

    /map
    → không vẽ

    /map?journey=2
    → vẽ tuyến
  */

  if (
    journey.value &&
    validLocations.length > 1
  ) {

    const routePoints =
      validLocations.map(
        location => [
          Number(
            location.latitude
          ),

          Number(
            location.longitude
          )
        ]
      )


    L.polyline(
      routePoints,
      {
        color:
          '#2f6b3c',

        weight:
          4,

        opacity:
          0.85,

        dashArray:
          '10 8',

        lineCap:
          'round',

        lineJoin:
          'round'
      }
    ).addTo(map)
  }


  /* =====================================
     AUTO ZOOM
     ===================================== */

  if (
    bounds.length ===
    1
  ) {

    map.setView(
      bounds[0],
      14
    )

  } else {

    map.fitBounds(
      bounds,
      {
        padding: [
          60,
          60
        ],

        maxZoom:
          journey.value
            ? 11
            : 13
      }
    )
  }


  /*
    Leaflet đôi khi render
    trước khi container ổn định.
  */

  setTimeout(
    () => {

      map?.invalidateSize()

    },
    250
  )
}
</script>


<template>
  <div class="page-layout">

    <AppHeader />


    <main class="page-content">

      <section class="map-page">

        <!-- =================================
             HERO
             ================================= -->

        <div
          class="map-page-hero"
        >

          <div
            class="map-page-heading"
          >

            <span class="home-tag">
              {{
                journey
                  ? 'BẢN ĐỒ HÀNH TRÌNH'
                  : 'BẢN ĐỒ ECOVEL'
              }}
            </span>


            <h1>
              {{ mapTitle }}
            </h1>


            <p>
              {{ mapSubtitle }}
            </p>

          </div>


          <!-- PROGRESS -->
          <div
            class="map-progress-card"
          >

            <span
              class="
                map-progress-label
              "
            >
              TIẾN ĐỘ KHÁM PHÁ
            </span>


            <strong>
              {{ progressPercent }}%
            </strong>


            <p>
              {{ mapMessage }}
            </p>


            <div
              class="
                map-progress-track
              "
            >

              <div
                class="
                  map-progress-value
                "
                :style="{
                  width:
                    progressPercent +
                    '%'
                }"
              ></div>

            </div>

          </div>

        </div>


        <!-- =================================
             LOADING
             ================================= -->

        <div
          v-if="loading"
          class="map-state"
        >

          <span>
            🗺️
          </span>


          <p>
            Đang mở bản đồ khám phá...
          </p>

        </div>


        <!-- =================================
             ERROR
             ================================= -->

        <div
          v-else-if="
            errorMessage
          "
          class="map-state"
        >

          <span>
            !
          </span>


          <p>
            {{ errorMessage }}
          </p>

        </div>


        <!-- =================================
             CONTENT
             ================================= -->

        <template v-else>

          <!-- STATS -->
          <div
            class="map-stats"
          >

            <div
              class="map-stat-card"
            >

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


            <div
              class="map-stat-card"
            >

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


            <div
              class="map-stat-card"
            >

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


          <!-- =================================
               MAP
               ================================= -->

          <div
            class="map-shell"
          >

            <!-- TOOLBAR -->
            <div
              class="map-toolbar"
            >

              <div>

                <span
                  class="
                    map-toolbar-label
                  "
                >
                  {{
                    journey
                      ? 'BẢN ĐỒ HÀNH TRÌNH'
                      : 'BẢN ĐỒ KHÁM PHÁ'
                  }}
                </span>


                <h2>
                  {{
                    journey
                      ? journey.name
                      : 'Chọn điểm đến tiếp theo'
                  }}
                </h2>

              </div>


              <RouterLink
                v-if="
                  nextLocation
                "
                :to="
                  `/checkin?location=${nextLocation.id}`
                "
                class="
                  map-next-link
                "
              >
                Gợi ý:
                {{ nextLocation.name }}
                →
              </RouterLink>

            </div>


            <!-- MAP -->
            <div
              ref="mapElement"
              class="ecovel-map"
            ></div>


            <!-- LEGEND -->
            <div
              class="map-legend"
            >

              <span>

                <i
                  class="
                    legend-dot
                    completed
                  "
                ></i>

                Đã check-in

              </span>


              <span>

                <i
                  class="
                    legend-dot
                    pending
                  "
                ></i>

                Chưa khám phá

              </span>


              <span
                v-if="journey"
              >
                <i
                  class="
                    map-route-legend
                  "
                ></i>

                Tuyến hành trình
              </span>

            </div>

          </div>


          <!-- =================================
               BACK TO JOURNEY
               ================================= -->

          <div
            v-if="journey"
            class="
              map-journey-back
            "
          >

            <RouterLink
              :to="
                `/journeys/${journey.id}`
              "
            >
              ← Quay lại hành trình
            </RouterLink>

          </div>


          <!-- =================================
               BOTTOM CTA
               ================================= -->

          <div
            class="
              map-bottom-cta
            "
          >

            <div>

              <span class="home-tag">
                ĐIỂM DỪNG TIẾP THEO
              </span>


              <h2>
                {{
                  nextLocation
                    ? nextLocation.name
                    : journey
                      ? 'Bạn đã hoàn thành hành trình'
                      : 'Bạn đã chinh phục toàn bộ bản đồ'
                }}
              </h2>


              <p>
                {{
                  nextLocation
                    ? 'Một điểm đến mới đang chờ được ghi dấu trong hộ chiếu ECOVEL của bạn.'
                    : journey
                      ? 'Tất cả điểm đến trong hành trình này đã được bạn ghi dấu.'
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
              class="
                home-primary-btn
              "
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