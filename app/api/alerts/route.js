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

// GET /api/alerts
export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const acknowledged = searchParams.get('acknowledged')
    const machineId = searchParams.get('machine_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = getSupabase()
    let query = supabase
      .from('alerts')
      .select('*, machines(name, type, location)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (acknowledged !== null && acknowledged !== '') {
      query = query.eq('acknowledged', acknowledged === 'true')
    }
    if (machineId) {
      query = query.eq('machine_id', machineId)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ alerts: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/alerts — acknowledge alert
export async function PATCH(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'alerts:acknowledge')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await request.json()
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('alerts')
      .update({
        acknowledged: true,
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ alert: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
