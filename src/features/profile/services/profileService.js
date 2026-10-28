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


export async function updateCurrentProfile({
  fullName,
  phone,
  avatarUrl
}) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'Bạn chưa đăng nhập.'
    )
  }

  const {
    data,
    error
  } = await supabase
    .from('profiles')
    .update({
      full_name:
        fullName.trim(),

      phone:
        phone?.trim() || null,

      avatar_url:
        avatarUrl?.trim() || null
    })
    .eq('id', user.id)
    .select(`
      id,
      full_name,
      avatar_url,
      phone,
      total_points
    `)
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

  const {
    count: checkInCount,
    error: checkInError
  } = await supabase
    .from('check_ins')
    .select('*', {
      count: 'exact',
      head: true
    })
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

  const {
    count: journeyCount,
    error: journeyError
  } = await supabase
    .from('user_journeys')
    .select('*', {
      count: 'exact',
      head: true
    })
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

  return {
    totalCheckIns:
      checkInCount ?? 0,

    completedJourneys:
      journeyCount ?? 0
  }
}


export async function getRecentCheckIns(
  limit = 5
) {
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
    .eq(
      'user_id',
      user.id
    )
    .eq(
      'status',
      'verified'
    )
    .order(
      'checked_in_at',
      {
        ascending: false
      }
    )
    .limit(limit)

  if (error) {
    throw error
  }

  return data
}

export async function uploadAvatar(file) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'Bạn chưa đăng nhập.'
    )
  }

  if (!file) {
    throw new Error(
      'Vui lòng chọn ảnh.'
    )
  }

  if (!file.type.startsWith('image/')) {
    throw new Error(
      'Vui lòng chọn đúng định dạng ảnh.'
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      'Ảnh không được vượt quá 5MB.'
    )
  }

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() || 'jpg'

  /*
    Xóa avatar cũ trong folder user
    để không tích quá nhiều ảnh.
  */
  const {
    data: oldFiles
  } = await supabase.storage
    .from('avatars')
    .list(user.id)

  if (
    oldFiles &&
    oldFiles.length > 0
  ) {
    const oldPaths =
      oldFiles.map(
        item =>
          `${user.id}/${item.name}`
      )

    await supabase.storage
      .from('avatars')
      .remove(oldPaths)
  }

  const filePath =
    `${user.id}/avatar-${Date.now()}.${extension}`

  const {
    error: uploadError
  } = await supabase.storage
    .from('avatars')
    .upload(
      filePath,
      file,
      {
        cacheControl: '3600',
        upsert: true
      }
    )

  if (uploadError) {
    throw uploadError
  }

  const {
    data
  } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}