import {
  createRouter,
  createWebHistory
} from 'vue-router'

import { supabase } from '../lib/supabase.js'

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
    path: '/map',
    name: 'map',
    component: MapView
  },

  {
    path: '/about',
    name: 'about',
    component: AboutView
  },

  {
    path: '/checkin',
    name: 'checkin',
    component: CheckInView,

    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,

    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/achievements',
    name: 'achievements',
    component: AchievementsView,

    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior() {
    return {
      top: 0
    }
  }
})


/* =========================================
   AUTH GUARD
   ========================================= */

router.beforeEach(async (to) => {
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error(
        'Lỗi kiểm tra đăng nhập:',
        error
      )
    }

    /*
      Trang yêu cầu đăng nhập
      nhưng user chưa đăng nhập
    */
    if (
      to.meta.requiresAuth &&
      !user
    ) {
      return {
        name: 'auth',

        query: {
          redirect: to.fullPath
        }
      }
    }

    /*
      Đã đăng nhập rồi
      nhưng vẫn vào /auth
      thì chuyển về trang chủ
    */
    if (
      to.name === 'auth' &&
      user
    ) {
      return {
        name: 'home'
      }
    }

    return true
  } catch (error) {
    console.error(
      'Lỗi router guard:',
      error
    )

    /*
      Nếu route cần đăng nhập
      nhưng không kiểm tra được user
      thì chuyển về trang đăng nhập
    */
    if (to.meta.requiresAuth) {
      return {
        name: 'auth'
      }
    }

    return true
  }
})


export default router