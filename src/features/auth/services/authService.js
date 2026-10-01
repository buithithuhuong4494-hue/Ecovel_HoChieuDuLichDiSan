import { supabase } from '../../../lib/supabase.js'

export async function login(email, password) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    })

  if (error) {
    throw error
  }

  return data
}

export async function register(
  fullName,
  email,
  password
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

  if (error) {
    throw error
  }

  return data
}