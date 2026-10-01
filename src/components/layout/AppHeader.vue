<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { supabase } from '../../lib/supabase.js'
import {
  getCurrentProfile
} from '../../features/profile/services/profileService.js'

const profile = ref(null)
const menuOpen = ref(false)

const router = useRouter()

onMounted(async () => {
  try {
    profile.value = await getCurrentProfile()
  } catch (error) {
    console.error(
      'Lỗi tải profile:',
      error
    )
  }
})

function closeMenu() {
  menuOpen.value = false
}

async function handleLogout() {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    console.error(
      'Lỗi đăng xuất:',
      error
    )
    return
  }

  profile.value = null
  menuOpen.value = false

  router.replace('/auth')
}
</script>

<template>
  <header class="top-navbar">
    <RouterLink
      to="/"
      class="top-logo"
      @click="closeMenu"
    >
      ECOVEL
    </RouterLink>

    <button
      type="button"
      class="menu-toggle"
      :class="{ active: menuOpen }"
      aria-label="Mở menu"
      @click="menuOpen = !menuOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div
      class="navbar-content"
      :class="{ open: menuOpen }"
    >
      <nav class="top-menu">
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

      <div
  v-if="profile"
  class="user-menu"
>
  <RouterLink
    to="/checkin"
    class="top-register"
    @click="closeMenu"
  >
    CHECK-IN
  </RouterLink>

  <RouterLink
    to="/profile"
    class="profile-link"
    @click="closeMenu"
  >
    Hồ sơ
  </RouterLink>

  <button
    type="button"
    class="logout-btn"
    @click="handleLogout"
  >
    Đăng xuất
  </button>
</div>

      <RouterLink
        v-else
        to="/auth"
        class="top-register"
        @click="closeMenu"
      >
        ĐĂNG NHẬP
      </RouterLink>
    </div>
  </header>
</template>