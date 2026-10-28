import { supabase } from '../../../lib/supabase'


export async function getLocations() {
  const {
    data,
    error
  } = await supabase
    .from('locations')
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


export async function getLocationById(id) {
  const {
    data,
    error
  } = await supabase
    .from('locations')
    .select(`
      *,
      journey_locations (
        id,
        stop_order,
        journeys (
          id,
          name,
          description
        )
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    throw error
  }

  return data
}