import { ref } from 'vue'
import { getDistance } from '../utils/distance'
import {
  saveCheckIn,
  getMyCheckIns
} from '../features/checkin/services/checkinService'

export function useCheckIn() {
  const result = ref('')
  const history = ref([])

  const popupVisible = ref(false)
  const popupText = ref('')

  const loadingHistory = ref(false)

  async function loadHistory() {
    try {
      loadingHistory.value = true

      const data = await getMyCheckIns()

      history.value = data.map((item) => ({
        id: item.id,

        placeName:
          item.locations?.name ?? 'Địa điểm',

        time: new Date(
          item.checked_in_at
        ).toLocaleString('vi-VN'),

        distance:
          item.distance_meters,

        status:
          item.status
      }))
    } catch (error) {
      console.error(
        'Lỗi tải lịch sử check-in:',
        error
      )
    } finally {
      loadingHistory.value = false
    }
  }

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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
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
          distance <=
          location.checkin_radius
        ) {
          try {
            await saveCheckIn({
              locationId:
                location.id,

              latitude:
                lat,

              longitude:
                lng,

              distance
            })

            result.value =
              `✅ Check-in thành công tại ${location.name}`

            showPopup(
              location.name
            )

            await loadHistory()
          } catch (error) {
            console.error(
              'Lỗi check-in:',
              error
            )

            if (
              error.code === '23505'
            ) {
              result.value =
                'Bạn đã check-in địa điểm này rồi.'
            } else {
              result.value =
                error.message
            }
          }
        } else {
          result.value =
            `❌ Bạn chưa ở đúng địa điểm. Khoảng cách: ${Math.round(distance)} mét`
        }
      },

      () => {
        result.value =
          'Không lấy được GPS. Hãy cho phép quyền vị trí.'
      }
    )
  }

  function showPopup(placeName) {
    popupText.value =
      `Bạn đã khám phá ${placeName}`

    popupVisible.value = true
  }

  function closePopup() {
    popupVisible.value = false
  }

  return {
    result,
    history,

    popupVisible,
    popupText,

    loadingHistory,

    checkIn,
    loadHistory,
    closePopup
  }
}