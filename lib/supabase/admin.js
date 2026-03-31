import { createClient } from '@supabase/supabase-js'

// Server-side admin client — only used in API routes / server actions
let adminClient = null

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    )
  }
  return adminClient
}
