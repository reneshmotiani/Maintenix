import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deleteSession, clearSessionCookie, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (token) {
      await deleteSession(token)
    }
    const response = NextResponse.json({ success: true })
    clearSessionCookie(response)
    return response
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
