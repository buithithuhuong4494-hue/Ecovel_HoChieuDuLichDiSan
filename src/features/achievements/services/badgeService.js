import { supabase } from '../../../lib/supabase.js'


export async function getBadges() {
  const {
    data,
    error
  } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('id', {
      ascending: true
    })

  if (error) {
    throw error
  }

  return data
}


export async function getMyBadges() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    return []
  }


  const {
    data,
    error
  } = await supabase
    .from('user_badges')
    .select(`
      id,
      earned_at,

      badges (
        id,
        name,
        description,
        icon_url,
        badge_type,
        requirement_value,
        journey_id
      )
    `)
    .eq(
      'user_id',
      user.id
    )
    .order(
      'earned_at',
      {
        ascending: false
      }
    )


  if (error) {
    throw error
  }

  return data
}


/* =========================================
   AWARD BADGE
   ========================================= */

async function awardBadge(
  userId,
  badgeId
) {
  const {
    data: existingBadge,
    error: existingError
  } = await supabase
    .from('user_badges')
    .select('id')
    .eq(
      'user_id',
      userId
    )
    .eq(
      'badge_id',
      badgeId
    )
    .maybeSingle()


  if (existingError) {
    throw existingError
  }


  /*
    Đã có huy hiệu rồi
    thì không insert lại.
  */
  if (existingBadge) {
    return null
  }


  /*
    Insert huy hiệu mới.

    Lấy luôn thông tin badge để
    popup có thể hiện tên,
    mô tả và loại huy hiệu.
  */
  const {
    data,
    error
  } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId
    })
    .select(`
      id,
      earned_at,

      badges (
        id,
        name,
        description,
        icon_url,
        badge_type,
        requirement_value,
        journey_id
      )
    `)
    .single()


  if (error) {
    throw error
  }

  return data
}


/* =========================================
   CHECK AND AWARD BADGES
   ========================================= */

export async function checkAndAwardBadges() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()


  if (userError) {
    throw userError
  }


  if (!user) {
    return []
  }


  const badges =
    await getBadges()


  /* =========================================
     CHECK-IN COUNT
     ========================================= */

  const {
    count: checkInCount,
    error: checkInError
  } = await supabase
    .from('check_ins')
    .select(
      '*',
      {
        count: 'exact',
        head: true
      }
    )
    .eq(
      'user_id',
      user.id
    )
    .eq(
      'status',
      'verified'
    )


  if (checkInError) {
    throw checkInError
  }


  /* =========================================
     COMPLETED JOURNEYS
     ========================================= */

  const {
    data: completedJourneys,
    error: journeyError
  } = await supabase
    .from('user_journeys')
    .select(
      'journey_id'
    )
    .eq(
      'user_id',
      user.id
    )
    .eq(
      'status',
      'completed'
    )


  if (journeyError) {
    throw journeyError
  }


  const completedJourneyIds =
    completedJourneys?.map(
      item =>
        item.journey_id
    ) ?? []


  /* =========================================
     CHECK BADGES
     ========================================= */

  const newlyAwarded = []


  for (
    const badge of badges
  ) {
    let qualified = false


    /*
      Huy hiệu theo số lần
      check-in.
    */
    if (
      badge.badge_type ===
      'checkin'
    ) {
      qualified =
        (checkInCount ?? 0) >=
        badge.requirement_value
    }


    /*
      Huy hiệu theo
      hành trình.
    */
    if (
      badge.badge_type ===
      'journey'
    ) {
      qualified =
        Boolean(
          badge.journey_id
        ) &&
        completedJourneyIds.includes(
          badge.journey_id
        )
    }


    if (!qualified) {
      continue
    }


    const awardedBadge =
      await awardBadge(
        user.id,
        badge.id
      )


    if (awardedBadge) {
      newlyAwarded.push(
        awardedBadge
      )
    }
  }


  return newlyAwarded
}