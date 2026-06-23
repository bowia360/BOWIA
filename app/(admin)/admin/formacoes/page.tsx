import { createAdminClient } from '@/utils/supabase/admin'
import FormacoesClient from './FormacoesClient'

export default async function AdminFormacoesPage() {
  const admin = createAdminClient()
  const { data: formacoes } = await admin
    .from('formations')
    .select('id, title, description, cover_url, is_published, created_at')
    .order('created_at', { ascending: false })

  return <FormacoesClient formacoes={formacoes ?? []} />
}
