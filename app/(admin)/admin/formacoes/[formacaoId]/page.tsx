import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import TracksClient from './TracksClient'

export default async function AdminFormacaoPage({
  params,
}: {
  params: Promise<{ formacaoId: string }>
}) {
  const { formacaoId } = await params
  const admin = createAdminClient()

  const { data: formacao } = await admin
    .from('formations')
    .select('id, title')
    .eq('id', formacaoId)
    .single()

  if (!formacao) notFound()

  const { data: tracks } = await admin
    .from('tracks')
    .select('id, title, slug, level, order_index, is_published')
    .eq('formation_id', formacaoId)
    .order('order_index')

  return (
    <TracksClient
      formacaoId={formacaoId}
      formacaoTitle={formacao.title}
      tracks={tracks ?? []}
    />
  )
}
