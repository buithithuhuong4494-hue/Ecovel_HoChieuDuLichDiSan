// src/features/auth/services/authService.js

import { supabase } from '../../../lib/supabase.js'


export async function login(
  email,
  password
) {
  const {
    data,
    error
  } = await supabase.auth.signInWithPassword({
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
  const {
    data,
    error
  } = await supabase.auth.signUp({
    email,
    password,

    options: {
      data: {
        full_name: fullName
      },

      emailRedirectTo:
        `${window.location.origin}/auth`
    }
  })

  if (error) {
    throw error
  }

  return data
}


/* =========================================
   FORGOT PASSWORD
   ========================================= */

export async function sendResetPasswordEmail(
  email
) {
  const {
    data,
    error
  } = await supabase.auth
    .resetPasswordForEmail(
      email,
      {
        redirectTo:
          `${window.location.origin}/reset-password`
      }
    )

  if (error) {
    throw error
  }

  return data
}


/* =========================================
   UPDATE PASSWORD
   ========================================= */

export async function updatePassword(
  newPassword
) {
  const {
    data,
    error
  } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw error
  }

  return data
}