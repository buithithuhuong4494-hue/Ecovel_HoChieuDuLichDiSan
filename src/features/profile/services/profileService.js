import { supabase } from '../../../lib/supabase'

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      phone,
      total_points
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    throw error
  }

  return {
    ...data,
    email: user.email
  }
}

export async function getProfileStats() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    return {
      totalCheckIns: 0,
      completedJourneys: 0
    }
  }

  const { count: checkInCount, error: checkInError } =
    await supabase
      .from('check_ins')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('user_id', user.id)
      .eq('status', 'verified')

  if (checkInError) {
    throw checkInError
  }

  const {
    count: journeyCount,
    error: journeyError
  } = await supabase
    .from('user_journeys')
    .select('*', {
      count: 'exact',
      head: true
    })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  if (journeyError) {
    throw journeyError
  }

  return {
    totalCheckIns: checkInCount ?? 0,
    completedJourneys: journeyCount ?? 0
  }
}

export async function getRecentCheckIns(limit = 5) {
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

  const { data, error } = await supabase
    .from('check_ins')
    .select(`
      id,
      checked_in_at,
      distance_meters,
      locations (
        id,
        name,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'verified')
    .order('checked_in_at', {
      ascending: false
    })
    .limit(limit)

  if (error) {
    throw error
  }

  return data
}