import { NextResponse } from 'next/server'
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    const safeUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
    }
    return NextResponse.json({ user: safeUser })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
