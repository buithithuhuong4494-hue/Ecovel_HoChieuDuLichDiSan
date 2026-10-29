import { supabase } from '../../../lib/supabase'


/* =========================================
   GET JOURNEYS
   ========================================= */

export async function getJourneys() {
  const {
    data,
    error
  } = await supabase
    .from('journeys')
    .select(`
      id,
      name,
      slug,
      description,
      cover_image_url,
      region,
      theme,

      journey_locations (
        id,
        stop_order,

        locations (
          id,
          name,
          image_url,
          address
        )
      )
    `)
    .eq('is_active', true)
    .order(
      'id',
      {
        ascending: true
      }
    )


  if (error) {
    throw error
  }


  return data
}


/* =========================================
   GET CURRENT USER JOURNEY
   ========================================= */

export async function getMyJourneyStatus(
  journeyId
) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth
    .getUser()


  if (userError) {
    throw userError
  }


  if (!user) {
    return null
  }


  const {
    data,
    error
  } = await supabase
    .from('user_journeys')
    .select(`
      id,
      user_id,
      journey_id,
      status,
      joined_at,
      completed_at
    `)
    .eq(
      'user_id',
      user.id
    )
    .eq(
      'journey_id',
      journeyId
    )
    .maybeSingle()


  if (error) {
    throw error
  }


  return data
}


/* =========================================
   JOIN JOURNEY
   ========================================= */

export async function joinJourney(
  journeyId
) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth
    .getUser()


  if (userError) {
    throw userError
  }


  if (!user) {
    throw new Error(
      'Bạn cần đăng nhập để bắt đầu hành trình.'
    )
  }


  /*
    Kiểm tra xem user đã tham gia chưa.
  */

  const {
    data: existingJourney,
    error: existingError
  } = await supabase
    .from('user_journeys')
    .select(`
      id,
      user_id,
      journey_id,
      status,
      joined_at,
      completed_at
    `)
    .eq(
      'user_id',
      user.id
    )
    .eq(
      'journey_id',
      journeyId
    )
    .maybeSingle()


  if (existingError) {
    throw existingError
  }


  /*
    Đã tham gia rồi
    thì trả lại dữ liệu cũ.
  */

  if (existingJourney) {
    return existingJourney
  }


  /*
    Chưa tham gia
    → tạo hành trình mới.
  */

  const {
    data,
    error
  } = await supabase
    .from('user_journeys')
    .insert({
      user_id:
        user.id,

      journey_id:
        journeyId,

      status:
        'joined'
    })
    .select(`
      id,
      user_id,
      journey_id,
      status,
      joined_at,
      completed_at
    `)
    .single()


  if (error) {
    throw error
  }


  return data
}