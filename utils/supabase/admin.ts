import { createClient } from '@supabase/supabase-js'

// Bypassa RLS — usar EXCLUSIVAMENTE em server actions e server components de admin.
// Nunca importar em Client Components ou em rotas públicas.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
