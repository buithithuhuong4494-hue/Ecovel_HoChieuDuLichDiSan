<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import {
  getCurrentProfile,
  getProfileStats,
  getRecentCheckIns,
  updateCurrentProfile,
  uploadAvatar
} from '../features/profile/services/profileService.js'

import {
  getMyBadges
} from '../features/achievements/services/badgeService.js'

import '../assets/styles/home.css'


/* =========================================
   DATA
   ========================================= */

const profile = ref(null)

const myBadges = ref([])
const recentCheckIns = ref([])

const stats = ref({
  totalCheckIns: 0,
  completedJourneys: 0
})

const loading = ref(true)
const errorMessage = ref('')


/* =========================================
   EDIT PROFILE
   ========================================= */

const editing = ref(false)
const saving = ref(false)

const editForm = ref({
  fullName: '',
  phone: '',
  avatarUrl: ''
})

const editMessage = ref('')
const editSuccess = ref(false)
const selectedAvatarFile = ref(null)
const avatarPreview = ref('')


function openEditProfile() {
  editForm.value = {
    fullName:
      profile.value?.full_name || '',

    phone:
      profile.value?.phone || '',

    avatarUrl:
      profile.value?.avatar_url || ''
  }

  editMessage.value = ''
  editSuccess.value = false

  editing.value = true

  selectedAvatarFile.value = null

  avatarPreview.value =
    profile.value?.avatar_url || ''

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function handleAvatarChange(event) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    editMessage.value =
      'Vui lòng chọn file ảnh.'

    return
  }

  if (file.size > 5 * 1024 * 1024) {
    editMessage.value =
      'Ảnh không được vượt quá 5MB.'

    return
  }

  selectedAvatarFile.value =
    file

  avatarPreview.value =
    URL.createObjectURL(file)

  editMessage.value = ''
}

function closeEditProfile() {
  editing.value = false

  editMessage.value = ''
  editSuccess.value = false

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}


async function saveProfile() {
  editMessage.value = ''
  editSuccess.value = false

  if (
    !editForm.value.fullName.trim()
  ) {
    editMessage.value =
      'Vui lòng nhập họ và tên.'

    return
  }

  try {
    saving.value = true

    let avatarUrl =
      profile.value?.avatar_url || ''

    /*
      Nếu user chọn ảnh mới
      thì upload trước.
    */
    if (selectedAvatarFile.value) {
      avatarUrl =
        await uploadAvatar(
          selectedAvatarFile.value
        )
    }

    const updatedProfile =
      await updateCurrentProfile({
        fullName:
          editForm.value.fullName,

        phone:
          editForm.value.phone,

        avatarUrl
      })

    profile.value =
      updatedProfile

    editSuccess.value = true

    editMessage.value =
      'Cập nhật hồ sơ thành công.'

    setTimeout(() => {
      editing.value = false

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }, 700)
  } catch (error) {
    console.error(
      'Lỗi cập nhật hồ sơ:',
      error
    )

    editMessage.value =
      error.message ||
      'Không thể cập nhật hồ sơ.'
  } finally {
    saving.value = false
  }
}


/* =========================================
   LOAD PROFILE
   ========================================= */

onMounted(async () => {
  try {
    const [
      profileData,
      statsData,
      historyData,
      badgeData
    ] = await Promise.all([
      getCurrentProfile(),
      getProfileStats(),
      getRecentCheckIns(),
      getMyBadges()
    ])

    profile.value =
      profileData

    stats.value =
      statsData

    recentCheckIns.value =
      historyData

    myBadges.value =
      badgeData
  } catch (error) {
    console.error(
      'Lỗi tải hồ sơ:',
      error
    )

    errorMessage.value =
      'Không thể tải hồ sơ.'
  } finally {
    loading.value = false
  }
})


/* =========================================
   COMPUTED
   ========================================= */

const displayName = computed(() => {
  return (
    profile.value?.full_name ||
    'Nhà khám phá ECOVEL'
  )
})


const avatarLetter = computed(() => {
  return displayName.value
    .charAt(0)
    .toUpperCase()
})


const editAvatarLetter = computed(() => {
  const name =
    editForm.value.fullName.trim()

  if (!name) {
    return 'E'
  }

  return name
    .charAt(0)
    .toUpperCase()
})


const explorerTitle = computed(() => {
  const checkIns =
    stats.value.totalCheckIns ?? 0

  const journeys =
    stats.value.completedJourneys ?? 0

  if (
    journeys >= 1 ||
    checkIns >= 3
  ) {
    return 'Nhà khám phá di sản'
  }

  if (checkIns >= 1) {
    return 'Hành trình đã bắt đầu'
  }

  return 'Nhà khám phá mới'
})


const explorerMessage = computed(() => {
  const checkIns =
    stats.value.totalCheckIns ?? 0

  if (checkIns === 0) {
    return 'Dấu ấn đầu tiên của bạn vẫn đang chờ được ghi lại.'
  }

  if (checkIns < 3) {
    return 'Mỗi điểm đến mới sẽ làm hộ chiếu ECOVEL của bạn phong phú hơn.'
  }

  return 'Bạn đang xây dựng một hành trình khám phá thật đáng nhớ cùng ECOVEL.'
})


function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Date(date)
    .toLocaleString(
      'vi-VN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
}
</script>


<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content profile-page">

      <!-- =====================================
           LOADING
           ===================================== -->

      <div v-if="loading" class="profile-state">
        <span>
          🧭
        </span>

        <p>
          Đang mở hộ chiếu ECOVEL của bạn...
        </p>
      </div>


      <!-- =====================================
           ERROR
           ===================================== -->

      <div v-else-if="errorMessage" class="profile-state">
        <span>
          !
        </span>

        <p>
          {{ errorMessage }}
        </p>
      </div>


      <!-- =====================================
           PROFILE
           ===================================== -->

      <template v-else-if="profile">

        <!-- ===================================
             EDIT MODE
             Khi editing = true:
             CHỈ HIỆN giao diện chỉnh sửa
             =================================== -->

        <section v-if="editing" class="profile-edit-page">
          <div class="profile-edit-page-header">
            <button type="button" class="profile-edit-back" @click="closeEditProfile">
              ← Quay lại hồ sơ
            </button>

            <span class="home-tag">
              CHỈNH SỬA HỒ SƠ
            </span>

            <h1>
              Cập nhật thông tin
              của bạn
            </h1>
          </div>


          <div class="profile-edit-card">

            <!-- AVATAR PREVIEW -->

            <div class="profile-edit-avatar-section">
              <div class="profile-edit-avatar">
                <img v-if="avatarPreview" :src="avatarPreview" alt="Ảnh đại diện" />

                <span v-else>
                  {{ editAvatarLetter }}
                </span>
              </div>

              <label class="profile-avatar-upload">
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleAvatarChange" />

                <span>
                  📷 Đổi ảnh đại diện
                </span>
              </label>

              <small>
                JPG, PNG hoặc WEBP · Tối đa 5MB
              </small>
            </div>


            <!-- FORM -->

            <div class="profile-edit-form">

              <!-- NAME -->

              <div class="profile-form-group">
                <label>
                  Họ và tên
                </label>

                <input v-model="editForm.fullName" type="text" placeholder="Nhập họ và tên" autocomplete="name" />
              </div>


              <!-- EMAIL -->

              <div class="profile-form-group">
                <label>
                  Email
                </label>

                <input :value="profile.email" type="email" disabled />

                <small>
                  Email được dùng để đăng nhập
                  và hiện chưa hỗ trợ thay đổi.
                </small>
              </div>


              <!-- PHONE -->

              <div class="profile-form-group">
                <label>
                  Số điện thoại
                </label>

                <input v-model="editForm.phone" type="tel" placeholder="Ví dụ: 0901234567" autocomplete="tel" />
              </div>
            </div>


            <!-- MESSAGE -->

            <div v-if="editMessage" class="profile-edit-message" :class="{
              success: editSuccess
            }">
              {{
                editMessage
              }}
            </div>


            <!-- BUTTONS -->

            <div class="profile-edit-actions">
              <button type="button" class="profile-cancel-button" :disabled="saving" @click="closeEditProfile">
                Hủy
              </button>

              <button type="button" class="profile-save-button" :disabled="saving" @click="saveProfile">
                {{
                  saving
                    ? 'Đang lưu...'
                    : 'Lưu thay đổi'
                }}
              </button>
            </div>
          </div>
        </section>


        <!-- ===================================
             NORMAL PROFILE
             Chỉ hiện khi KHÔNG chỉnh sửa
             =================================== -->

        <template v-else>

          <!-- HERO -->

          <section class="profile-hero">
            <div class="profile-hero-main">

              <div class="profile-avatar">
                <img v-if="profile.avatar_url" :src="profile.avatar_url" :alt="displayName" />

                <span v-else>
                  {{ avatarLetter }}
                </span>
              </div>


              <div class="profile-info">
                <span class="home-tag">
                  HỒ SƠ NHÀ KHÁM PHÁ
                </span>

                <h1>
                  {{ displayName }}
                </h1>

                <div class="profile-contact">
                  <span>
                    ✉ {{ profile.email }}
                  </span>

                  <span v-if="profile.phone">
                    ☎ {{ profile.phone }}
                  </span>
                </div>

                <button type="button" class="profile-edit-button" @click="openEditProfile">
                  ✎ Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>


            <div class="profile-explorer-card">
              <span class="profile-explorer-label">
                DANH HIỆU HIỆN TẠI
              </span>

              <strong>
                {{ explorerTitle }}
              </strong>

              <p>
                {{ explorerMessage }}
              </p>

              <RouterLink to="/map" class="profile-explorer-link">
                Tiếp tục khám phá →
              </RouterLink>
            </div>
          </section>


          <!-- STATS -->

          <section class="profile-stats">

            <article class="profile-stat-card">
              <span class="profile-stat-icon">
                📍
              </span>

              <strong class="profile-stat-number">
                {{ stats.totalCheckIns }}
              </strong>

              <span class="profile-stat-label">
                Địa điểm đã khám phá
              </span>

              <small>
                Những dấu ấn đã được lưu
              </small>
            </article>


            <article class="profile-stat-card">
              <span class="profile-stat-icon">
                🧭
              </span>

              <strong class="profile-stat-number">
                {{ stats.completedJourneys }}
              </strong>

              <span class="profile-stat-label">
                Hành trình hoàn thành
              </span>

              <small>
                Những câu chuyện đã đi qua
              </small>
            </article>


            <article class="profile-stat-card">
              <span class="profile-stat-icon">
                ✦
              </span>

              <strong class="profile-stat-number">
                {{ profile.total_points ?? 0 }}
              </strong>

              <span class="profile-stat-label">
                Điểm tích lũy
              </span>

              <small>
                Thành quả trên hành trình
              </small>
            </article>
          </section>


          <!-- PASSPORT -->

          <section class="profile-passport">
            <div class="profile-passport-content">

              <span class="home-tag">
                HỘ CHIẾU ECOVEL
              </span>

              <h2>
                Mỗi điểm đến
                là một dấu ấn riêng
              </h2>

              <p>
                Hành trình của bạn được tạo nên
                từ những nơi đã đặt chân đến,
                những câu chuyện đã khám phá
                và những thành tựu đã mở khóa.
              </p>
            </div>


            <div class="profile-passport-number">
              <span>
                DẤU ẤN
              </span>

              <strong>
                {{
                  String(
                    stats.totalCheckIns
                  ).padStart(
                    2,
                    '0'
                  )
                }}
              </strong>
            </div>
          </section>


          <!-- BADGES -->

          <section class="profile-badges">

            <div class="profile-section-heading">
              <div>
                <span class="home-tag">
                  THÀNH TỰU
                </span>

                <h2>
                  Huy hiệu của bạn
                </h2>

                <p>
                  Bạn đã mở khóa
                  {{ myBadges.length }}
                  huy hiệu trên
                  hành trình ECOVEL.
                </p>
              </div>

              <RouterLink to="/achievements" class="profile-section-link">
                Xem tất cả →
              </RouterLink>
            </div>


            <!-- NO BADGE -->

            <div v-if="
              myBadges.length === 0
            " class="profile-empty">
              <span>
                🏅
              </span>

              <h3>
                Chưa có huy hiệu
              </h3>

              <p>
                Check-in và hoàn thành hành trình
                để mở khóa thành tựu đầu tiên.
              </p>

              <RouterLink to="/journeys" class="home-primary-btn">
                Khám phá hành trình
              </RouterLink>
            </div>


            <!-- BADGE LIST -->

            <div v-else class="profile-badge-grid">
              <article v-for="
item in
  myBadges.slice(0, 3)
                " :key="item.id" class="profile-badge-card">
                <div class="profile-badge-icon">
                  <img v-if="
                    item.badges?.icon_url
                  " :src="item.badges.icon_url
                    " :alt="item.badges?.name
                        " />

                  <span v-else>
                    🏅
                  </span>
                </div>


                <div class="profile-badge-content">
                  <span class="profile-badge-status">
                    ✓ ĐÃ MỞ KHÓA
                  </span>

                  <h3>
                    {{
                      item.badges?.name
                    }}
                  </h3>

                  <p>
                    {{
                      item.badges?.description
                    }}
                  </p>

                  <small v-if="
                    item.earned_at
                  ">
                    Đạt ngày
                    {{
                      new Date(
                        item.earned_at
                      ).toLocaleDateString(
                        'vi-VN'
                      )
                    }}
                  </small>
                </div>
              </article>
            </div>
          </section>


          <!-- HISTORY -->

          <section class="profile-history">

            <div class="profile-section-heading">
              <div>
                <span class="home-tag">
                  HOẠT ĐỘNG GẦN ĐÂY
                </span>

                <h2>
                  Những dấu chân
                  gần nhất
                </h2>

                <p>
                  Nhìn lại những địa điểm
                  bạn vừa ghi dấu cùng ECOVEL.
                </p>
              </div>

              <RouterLink to="/checkin" class="profile-section-link">
                Check-in mới →
              </RouterLink>
            </div>


            <!-- NO HISTORY -->

            <div v-if="
              recentCheckIns.length === 0
            " class="profile-empty">
              <span>
                📍
              </span>

              <h3>
                Chưa có lịch sử khám phá
              </h3>

              <p>
                Điểm đến đầu tiên đang chờ
                bạn ghi dấu trên hộ chiếu.
              </p>

              <RouterLink to="/locations" class="home-primary-btn">
                Xem địa điểm
              </RouterLink>
            </div>


            <!-- HISTORY LIST -->

            <div v-else class="profile-history-list">
              <article v-for="
                  (
item,
  index
                  ) in recentCheckIns
                " :key="item.id" class="profile-history-item">
                <div class="profile-history-number">
                  {{
                    String(
                      index + 1
                    ).padStart(
                      2,
                      '0'
                    )
                  }}
                </div>


                <div class="profile-history-image">
                  <img v-if="
                    item.locations?.image_url
                  " :src="item.locations.image_url
                    " :alt="item.locations?.name
                        " />

                  <div v-else class="profile-history-placeholder">
                    📍
                  </div>
                </div>


                <div class="profile-history-content">
                  <span class="profile-history-label">
                    ĐÃ CHECK-IN
                  </span>

                  <h3>
                    {{
                      item.locations?.name
                    }}
                  </h3>

                  <p>
                    {{
                      formatDate(
                        item.checked_in_at
                      )
                    }}
                  </p>

                  <p v-if="
                    item.distance_meters != null
                  " class="profile-history-distance">
                    ◎
                    {{
                      Math.round(
                        item.distance_meters
                      )
                    }}m từ điểm check-in
                  </p>
                </div>


                <span class="status-badge checked">
                  ✓ Đã khám phá
                </span>
              </article>
            </div>
          </section>


          <!-- FINAL CTA -->

          <section class="profile-final-cta">

            <div>
              <span class="home-tag">
                HÀNH TRÌNH TIẾP THEO
              </span>

              <h2>
                Hộ chiếu của bạn
                vẫn còn những trang đang chờ
              </h2>

              <p>
                Tiếp tục khám phá địa điểm mới,
                hoàn thành hành trình và mở khóa
                thêm những dấu ấn ECOVEL.
              </p>
            </div>


            <div class="profile-final-actions">
              <RouterLink to="/journeys" class="home-primary-btn">
                Xem hành trình
              </RouterLink>

              <RouterLink to="/map" class="profile-secondary-link">
                Mở bản đồ →
              </RouterLink>
            </div>
          </section>

        </template>
      </template>
    </main>

    <AppFooter />
  </div>
</template>