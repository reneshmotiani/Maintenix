import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'ma_session'

export async function hashPassword(password) {
  // Use Supabase RPC to hash via pgcrypto
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase.rpc('hash_password', { pwd: password })
  if (error) throw error
  return data
}

export async function verifyPassword(password, hash) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase.rpc('verify_password', { pwd: password, hash })
  if (error) throw error
  return data
}

export async function createSession(userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
  const token = crypto.randomUUID() + '-' + Date.now()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const { error } = await supabase.from('sessions').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  })
  if (error) throw error
  return { token, expiresAt }
}

export async function getSessionUser(token) {
  if (!token) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, users(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !session) return null
  return session.users
}

export async function deleteSession(token) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
  await supabase.from('sessions').delete().eq('token', token)
}

export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
