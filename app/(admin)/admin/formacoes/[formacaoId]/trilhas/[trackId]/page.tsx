import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import CoursesClient from './CoursesClient'

export default async function AdminTrackPage({
  params,
}: {
  params: Promise<{ formacaoId: string; trackId: string }>
}) {
  const { formacaoId, trackId } = await params
  const admin = createAdminClient()

  const [{ data: formacao }, { data: track }, { data: courses }] = await Promise.all([
    admin.from('formations').select('id, title').eq('id', formacaoId).single(),
    admin.from('tracks').select('id, title').eq('id', trackId).single(),
    admin
      .from('courses')
      .select('id, title, slug, type, instructor_name, order_index, is_published')
      .eq('track_id', trackId)
      .order('order_index'),
  ])

  if (!formacao || !track) notFound()

  return (
    <CoursesClient
      formacaoId={formacaoId}
      formacaoTitle={formacao.title}
      trackId={trackId}
      trackTitle={track.title}
      courses={courses ?? []}
    />
  )
}
