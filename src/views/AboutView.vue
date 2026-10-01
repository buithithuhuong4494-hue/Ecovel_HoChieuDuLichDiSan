<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import AboutSection from '../components/home/AboutSection.vue'

import '../assets/styles/home.css'
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <AboutSection />
    </main>

    <AppFooter />
  </div>
</template>