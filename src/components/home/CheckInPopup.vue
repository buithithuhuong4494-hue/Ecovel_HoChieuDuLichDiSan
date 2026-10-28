<script setup>
import {
  computed
} from 'vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },

  data: {
    type: Object,

    default: () => ({
      placeName: '',
      checkInPoints: 10,
      badges: [],
      journeyCompleted: false
    })
  }
})


const emit =
  defineEmits([
    'close'
  ])


/* =========================================
   BADGES
   ========================================= */

const newBadges =
  computed(() => {
    return (
      props.data?.badges ?? []
    )
  })


/* =========================================
   TOTAL POINTS
   ========================================= */

const totalPoints =
  computed(() => {

    let total =
      props.data
        ?.checkInPoints ?? 10


    /*
      +20 cho mỗi badge mới.
    */

    total +=
      newBadges.value.length *
      20


    /*
      +50 khi hoàn thành
      hành trình.
    */

    if (
      props.data
        ?.journeyCompleted
    ) {
      total += 50
    }


    return total
  })


function closePopup() {
  emit('close')
}
</script>


<template>
  <Transition name="reward-popup">
    <div
      v-if="visible"
      class="reward-overlay"
      @click.self="closePopup"
    >
      <div class="reward-popup">

        <!-- CLOSE -->
        <button
          type="button"
          class="reward-close"
          aria-label="Đóng"
          @click="closePopup"
        >
          ×
        </button>


        <!-- SUCCESS ICON -->
        <div class="reward-success-icon">
          ✓
        </div>


        <span class="reward-label">
          CHECK-IN THÀNH CÔNG
        </span>


        <h2>
          {{
            data.placeName ||
            'Điểm đến mới'
          }}
        </h2>


        <p class="reward-intro">
          Một dấu ấn mới đã được
          lưu vào hộ chiếu ECOVEL
          của bạn.
        </p>


        <!-- CHECK-IN POINT -->
        <div class="reward-point-row">
          <div class="reward-point-icon">
            📍
          </div>

          <div>
            <span>
              Check-in địa điểm
            </span>

            <strong>
              +{{
                data.checkInPoints ||
                10
              }}
              điểm
            </strong>
          </div>
        </div>


        <!-- JOURNEY COMPLETED -->
        <div
          v-if="
            data.journeyCompleted
          "
          class="
            reward-special
            journey-reward
          "
        >
          <div class="reward-special-icon">
            🎉
          </div>

          <div class="reward-special-content">
            <span>
              HOÀN THÀNH HÀNH TRÌNH
            </span>

            <h3>
              Một hành trình
              đã được hoàn thành
            </h3>

            <p>
              Bạn đã khám phá tất cả
              điểm đến trong hành trình.
            </p>
          </div>

          <strong class="reward-bonus">
            +50
          </strong>
        </div>


        <!-- NEW BADGES -->
        <div
          v-if="
            newBadges.length > 0
          "
          class="reward-badges"
        >
          <div class="reward-divider">
            <span>
              THÀNH TỰU MỚI
            </span>
          </div>


          <article
            v-for="
              badge in newBadges
            "
            :key="badge.id"
            class="reward-badge-card"
          >
            <div class="reward-badge-icon">
              <img
                v-if="
                  badge.badges
                    ?.icon_url
                "
                :src="
                  badge.badges
                    .icon_url
                "
                :alt="
                  badge.badges
                    ?.name
                "
              />

              <span v-else>
                🏅
              </span>
            </div>


            <div class="reward-badge-info">
              <span>
                MỞ KHÓA HUY HIỆU
              </span>

              <h3>
                {{
                  badge.badges
                    ?.name ||
                  'Huy hiệu mới'
                }}
              </h3>

              <p
                v-if="
                  badge.badges
                    ?.description
                "
              >
                {{
                  badge.badges
                    .description
                }}
              </p>
            </div>


            <strong class="reward-badge-points">
              +20
            </strong>
          </article>
        </div>


        <!-- TOTAL -->
        <div class="reward-total">
          <span>
            Điểm nhận được
          </span>

          <strong>
            +{{ totalPoints }}
            điểm
          </strong>
        </div>


        <!-- ACTIONS -->
        <div class="reward-actions">
          <RouterLink
            v-if="
              newBadges.length > 0 ||
              data.journeyCompleted
            "
            to="/achievements"
            class="reward-primary-button"
            @click="closePopup"
          >
            Xem thành tựu
          </RouterLink>

          <button
            type="button"
            class="reward-secondary-button"
            @click="closePopup"
          >
            Tiếp tục khám phá
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>