import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import JourneysView from '../views/JourneysView.vue'
import JourneyDetailView from '../views/JourneyDetailView.vue'
import LocationsView from '../views/LocationsView.vue'
import CheckInView from '../views/CheckInView.vue'
import ProfileView from '../views/ProfileView.vue'
import AchievementsView from '../views/AchievementsView.vue'
import AboutView from '../views/AboutView.vue'
import AuthView from '../views/AuthView.vue'
import MapView from '../views/MapView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/journeys',
    name: 'journeys',
    component: JourneysView
  },
  {
    path: '/journeys/:id',
    name: 'journey-detail',
    component: JourneyDetailView
  },
  {
    path: '/locations',
    name: 'locations',
    component: LocationsView
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: CheckInView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: AchievementsView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  },
  {
    path: '/map',
    name: 'map',
    component: MapView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router