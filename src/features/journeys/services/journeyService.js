import { supabase } from '../../../lib/supabase'

export async function getJourneys() {
  const { data, error } = await supabase
    .from('journeys')
    .select(`
      id,
      name,
      slug,
      description,
      cover_image_url,
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
    .order('id', { ascending: true })

  if (error) {
    throw error
  }

  return data
}