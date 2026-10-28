<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref
} from 'vue'

import {
  RouterLink,
  useRouter
} from 'vue-router'

import { supabase } from '../../lib/supabase.js'

import {
  getCurrentProfile
} from '../../features/profile/services/profileService.js'


const profile = ref(null)

const menuOpen = ref(false)
const accountOpen = ref(false)

const accountRef = ref(null)

const router = useRouter()


onMounted(async () => {
  try {
    profile.value =
      await getCurrentProfile()
  } catch (error) {
    console.error(
      'Lỗi tải profile:',
      error
    )
  }

  document.addEventListener(
    'click',
    handleOutsideClick
  )
})


onUnmounted(() => {
  document.removeEventListener(
    'click',
    handleOutsideClick
  )
})


const avatarLetter = computed(() => {
  const name =
    profile.value?.full_name?.trim()

  if (name) {
    return name
      .charAt(0)
      .toUpperCase()
  }

  return 'E'
})


function closeMenu() {
  menuOpen.value = false
}


function closeAccount() {
  accountOpen.value = false
}


function toggleAccount(event) {
  event.stopPropagation()

  accountOpen.value =
    !accountOpen.value
}


function handleOutsideClick(event) {
  if (
    accountRef.value &&
    !accountRef.value.contains(
      event.target
    )
  ) {
    accountOpen.value = false
  }
}


async function handleLogout() {
  const {
    error
  } = await supabase.auth
    .signOut()

  if (error) {
    console.error(
      'Lỗi đăng xuất:',
      error
    )

    return
  }

  profile.value = null

  accountOpen.value = false
  menuOpen.value = false

  await router.replace(
    '/auth'
  )
}
</script>


<template>
  <header class="top-navbar">

    <!-- LOGO -->
    <RouterLink
      to="/"
      class="top-logo"
      @click="closeMenu"
    >
      ECOVEL
    </RouterLink>


    <!-- MOBILE TOGGLE -->
    <button
      type="button"
      class="menu-toggle"
      :class="{
        active: menuOpen
      }"
      aria-label="Mở menu"
      @click="
        menuOpen = !menuOpen
      "
    >
      <span></span>
      <span></span>
      <span></span>
    </button>


    <!-- CENTER NAV -->
    <nav
      class="top-menu"
      :class="{
        open: menuOpen
      }"
    >
      <RouterLink
        to="/journeys"
        active-class="active"
        @click="closeMenu"
      >
        Hành trình
      </RouterLink>

      <RouterLink
        to="/locations"
        active-class="active"
        @click="closeMenu"
      >
        Địa điểm
      </RouterLink>

      <RouterLink
        to="/map"
        active-class="active"
        @click="closeMenu"
      >
        Bản đồ
      </RouterLink>

      <RouterLink
        to="/about"
        active-class="active"
        @click="closeMenu"
      >
        Về ECOVEL
      </RouterLink>
    </nav>


    <!-- ACCOUNT -->
    <div
      ref="accountRef"
      class="header-account"
    >

      <button
        type="button"
        class="header-avatar-button"
        aria-label="Tài khoản"
        @click="toggleAccount"
      >
        <img
          v-if="
            profile?.avatar_url
          "
          :src="
            profile.avatar_url
          "
          alt="Ảnh đại diện"
          class="header-avatar-image"
        />

        <span
          v-else
          class="header-avatar-letter"
        >
          {{ avatarLetter }}
        </span>
      </button>


      <!-- DROPDOWN -->
      <Transition
        name="account-dropdown"
      >
        <div
          v-if="accountOpen"
          class="account-dropdown"
        >

          <!-- LOGGED IN -->
          <template v-if="profile">
            <div class="account-user">
              <div
                class="
                  account-dropdown-avatar
                "
              >
                <img
                  v-if="
                    profile.avatar_url
                  "
                  :src="
                    profile.avatar_url
                  "
                  alt="Ảnh đại diện"
                />

                <span v-else>
                  {{ avatarLetter }}
                </span>
              </div>


              <div class="account-user-info">
                <strong>
                  {{
                    profile.full_name ||
                    'Người khám phá ECOVEL'
                  }}
                </strong>

                <span>
                  {{ profile.email }}
                </span>
              </div>
            </div>


            <div
              class="
                account-dropdown-divider
              "
            ></div>


            <RouterLink
              to="/profile"
              class="
                account-dropdown-item
              "
              @click="closeAccount"
            >
              <span>
                👤
              </span>

              Hồ sơ của tôi
            </RouterLink>


            <RouterLink
              to="/achievements"
              class="
                account-dropdown-item
              "
              @click="closeAccount"
            >
              <span>
                🏅
              </span>

              Thành tựu
            </RouterLink>


            <RouterLink
              to="/checkin"
              class="
                account-dropdown-item
                account-checkin-item
              "
              @click="closeAccount"
            >
              <span>
                📍
              </span>

              Check-in
            </RouterLink>


            <div
              class="
                account-dropdown-divider
              "
            ></div>


            <button
              type="button"
              class="
                account-dropdown-item
                account-logout
              "
              @click="handleLogout"
            >
              <span>
                ↪
              </span>

              Đăng xuất
            </button>
          </template>


          <!-- NOT LOGGED IN -->
          <template v-else>
            <div
              class="
                account-login-heading
              "
            >
              <span>
                ECOVEL
              </span>

              <strong>
                Chào mừng bạn
              </strong>

              <p>
                Đăng nhập để lưu
                hành trình và
                các dấu ấn của bạn.
              </p>
            </div>


            <RouterLink
              to="/auth"
              class="
                account-login-button
              "
              @click="closeAccount"
            >
              Đăng nhập
            </RouterLink>
          </template>

        </div>
      </Transition>

    </div>
  </header>
</template>