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

// GET /api/machines — list all machines with latest sensor reading
export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    const { data: machines, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Fetch latest sensor reading for each machine
    const machineIds = machines.map(m => m.id)
    const sensorPromises = machineIds.map(id =>
      supabase
        .from('sensor_readings')
        .select('*')
        .eq('machine_id', id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
    )

    const sensorResults = await Promise.all(sensorPromises)
    const latestReadings = {}
    sensorResults.forEach((res, i) => {
      if (res.data) latestReadings[machineIds[i]] = res.data
    })

    // Fetch latest AI analysis per machine
    const aiPromises = machineIds.map(id =>
      supabase
        .from('ai_analyses')
        .select('risk_score, risk_level, predicted_failure_at')
        .eq('machine_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    )
    const aiResults = await Promise.all(aiPromises)
    const latestAi = {}
    aiResults.forEach((res, i) => {
      if (res.data) latestAi[machineIds[i]] = res.data
    })

    const enriched = machines.map(m => ({
      ...m,
      latest_reading: latestReadings[m.id] || null,
      ai_analysis: latestAi[m.id] || null,
    }))

    return NextResponse.json({ machines: enriched })
  } catch (err) {
    console.error('GET /api/machines error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/machines — create a new machine (admin only)
export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'machines:create')) {
      return NextResponse.json({ error: 'Forbidden — Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, location, model, manufacturer, serial_number, installed_at, notes } = body

    if (!name || !type || !location) {
      return NextResponse.json(
        { error: 'name, type, and location are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('machines')
      .insert({
        name: name.trim(),
        type: type.trim(),
        location: location.trim(),
        model: model?.trim() || null,
        manufacturer: manufacturer?.trim() || null,
        serial_number: serial_number?.trim() || null,
        installed_at: installed_at || null,
        notes: notes?.trim() || null,
        status: 'offline',
        added_by: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Serial number already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ machine: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/machines error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
