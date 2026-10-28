import { ref } from 'vue'

import {
  getDistance
} from '../utils/distance'

import {
  saveCheckIn,
  getMyCheckIns
} from '../features/checkin/services/checkinService'

import {
  checkAndAwardBadges
} from '../features/achievements/services/badgeService'


export function useCheckIn() {
  const result = ref('')
  const history = ref([])

  const popupVisible =
    ref(false)

  const popupData =
    ref({
      placeName: '',
      checkInPoints: 10,
      badges: [],
      journeyCompleted: false
    })

  const loadingHistory =
    ref(false)


  /* =========================================
     LOAD HISTORY
     ========================================= */

  async function loadHistory() {
    try {
      loadingHistory.value =
        true

      const data =
        await getMyCheckIns()


      history.value =
        data.map(
          item => ({
            id:
              item.id,

            placeName:
              item.locations?.name ??
              'Địa điểm',

            time:
              new Date(
                item.checked_in_at
              ).toLocaleString(
                'vi-VN'
              ),

            distance:
              item.distance_meters,

            status:
              item.status
          })
        )
    } catch (error) {
      console.error(
        'Lỗi tải lịch sử check-in:',
        error
      )
    } finally {
      loadingHistory.value =
        false
    }
  }


  /* =========================================
     CHECK-IN
     ========================================= */

  function checkIn(location) {
    if (!location) {
      result.value =
        'Vui lòng chọn địa điểm.'

      return
    }


    if (!navigator.geolocation) {
      result.value =
        'Thiết bị không hỗ trợ GPS.'

      return
    }


    result.value =
      'Đang lấy vị trí GPS...'


    navigator.geolocation
      .getCurrentPosition(

        async position => {

          const lat =
            position.coords.latitude

          const lng =
            position.coords.longitude


          const distance =
            getDistance(
              lat,
              lng,
              location.latitude,
              location.longitude
            )


          if (
            distance >
            location.checkin_radius
          ) {
            result.value =
              `❌ Bạn chưa ở đúng địa điểm. Khoảng cách: ${Math.round(distance)} mét`

            return
          }


          try {

            /*
              1. Lưu check-in.

              Database trigger:
              +10 điểm.
            */

            await saveCheckIn({
              locationId:
                location.id,

              latitude:
                lat,

              longitude:
                lng,

              distance
            })


            /*
              2. Sau check-in,
              database đã có thể tự
              hoàn thành journey.

              Vì vậy kiểm tra badge
              sau bước saveCheckIn.
            */

            const newBadges =
              await checkAndAwardBadges()


            /*
              Nếu có badge loại journey
              vừa được mở khóa thì
              hành trình vừa hoàn thành.
            */

            const journeyCompleted =
              newBadges.some(
                item =>
                  item.badges
                    ?.badge_type ===
                  'journey'
              )


            result.value =
              `✅ Check-in thành công tại ${location.name}`


            /*
              3. Hiện popup đẹp.
            */

            showPopup({
              placeName:
                location.name,

              badges:
                newBadges,

              journeyCompleted
            })


            /*
              4. Refresh lịch sử.
            */

            await loadHistory()

          } catch (error) {

            console.error(
              'Lỗi check-in:',
              error
            )


            if (
              error.code ===
              '23505'
            ) {
              result.value =
                'Bạn đã check-in địa điểm này rồi.'
            } else {
              result.value =
                error.message ||
                'Check-in thất bại.'
            }
          }
        },


        () => {
          result.value =
            'Không lấy được GPS. Hãy cho phép quyền vị trí.'
        }
      )
  }


  /* =========================================
     POPUP
     ========================================= */

  function showPopup({
    placeName,
    badges = [],
    journeyCompleted = false
  }) {
    popupData.value = {
      placeName,

      checkInPoints: 10,

      badges,

      journeyCompleted
    }


    popupVisible.value =
      true
  }


  function closePopup() {
    popupVisible.value =
      false
  }


  return {
    result,
    history,

    popupVisible,
    popupData,

    loadingHistory,

    checkIn,
    loadHistory,
    closePopup
  }
}