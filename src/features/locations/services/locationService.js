import { supabase } from '../../../lib/supabase'

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true })

  if (error) {
    throw error
  }

  return data
}