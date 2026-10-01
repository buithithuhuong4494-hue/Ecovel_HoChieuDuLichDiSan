import { supabase } from '../../../lib/supabase'

export async function saveCheckIn({
  locationId,
  latitude,
  longitude,
  distance
}) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error('Bạn cần đăng nhập để check-in.')
  }

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      location_id: locationId,
      latitude,
      longitude,
      distance_meters: distance,
      method: 'gps',
      status: 'verified'
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getMyCheckIns() {
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
      status,
      locations (
        id,
        name,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('checked_in_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}