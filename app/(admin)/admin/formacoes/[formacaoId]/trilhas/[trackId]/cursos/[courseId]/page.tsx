import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import LessonsClient from './LessonsClient'

export default async function AdminCoursePage({
  params,
}: {
  params: Promise<{ formacaoId: string; trackId: string; courseId: string }>
}) {
  const { formacaoId, trackId, courseId } = await params
  const admin = createAdminClient()

  const [{ data: formacao }, { data: track }, { data: course }, { data: lessons }] =
    await Promise.all([
      admin.from('formations').select('id, title').eq('id', formacaoId).single(),
      admin.from('tracks').select('id, title').eq('id', trackId).single(),
      admin.from('courses').select('id, title').eq('id', courseId).single(),
      admin
        .from('lessons')
        .select('id, title, video_url, duration_seconds, order_index, is_published')
        .eq('course_id', courseId)
        .order('order_index'),
    ])

  if (!formacao || !track || !course) notFound()

  return (
    <LessonsClient
      formacaoId={formacaoId}
      formacaoTitle={formacao.title}
      trackId={trackId}
      trackTitle={track.title}
      courseId={courseId}
      courseTitle={course.title}
      lessons={lessons ?? []}
    />
  )
}
