import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
}

export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'users:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ users: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'users:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, role } = body

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'email, password, and full_name are required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Hash with pgcrypto
    const { data: passwordHash, error: hashError } = await supabase.rpc('hash_password', { pwd: password })
    if (hashError) throw hashError

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: full_name.trim(),
        role: role || 'operator',
      })
      .select('id, email, full_name, role, is_active, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (err) {
    console.error('POST /api/users error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
