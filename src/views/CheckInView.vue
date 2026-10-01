<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import CheckInSection from '../components/home/CheckInSection.vue'

import '../assets/styles/home.css'
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <CheckInSection />
    </main>

    <AppFooter />
  </div>
</template>