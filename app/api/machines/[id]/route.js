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

// GET /api/machines/[id] — single machine detail
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const supabase = getSupabase()

    const { data: machine, error } = await supabase
      .from('machines')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !machine) return NextResponse.json({ error: 'Machine not found' }, { status: 404 })

    // Last 50 sensor readings
    const { data: readings } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('machine_id', id)
      .order('timestamp', { ascending: false })
      .limit(50)

    // Last 10 alerts
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('machine_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Last 5 AI analyses
    const { data: analyses } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('machine_id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      machine,
      readings: readings || [],
      alerts: alerts || [],
      analyses: analyses || [],
    })
  } catch (err) {
    console.error('GET /api/machines/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/machines/[id] — update machine status or details (admin)
export async function PATCH(request, { params }) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'machines:update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('machines')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ machine: data })
  } catch (err) {
    console.error('PATCH /api/machines/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/machines/[id] — admin only
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'machines:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const supabase = getSupabase()

    const { error } = await supabase.from('machines').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/machines/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
