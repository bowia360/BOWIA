import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ConexoesClient from './ConexoesClient'

export default async function ConexoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  // Busca apenas provider e is_active — nunca traz encrypted_key para o servidor da rota
  const { data: connections } = await supabase
    .from('api_connections')
    .select('provider, is_active')
    .eq('profile_id', user.id)

  const connectedProviders = new Set(
    (connections ?? [])
      .filter((c) => c.is_active)
      .map((c) => c.provider as 'fal_ai' | 'openai' | 'gemini' | 'claude')
  )

  return <ConexoesClient connectedProviders={connectedProviders} />
}
