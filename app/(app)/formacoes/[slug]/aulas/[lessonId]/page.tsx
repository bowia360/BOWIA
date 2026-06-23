import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LessonClient from './LessonClient'

type Lesson = {
  id: string
  title: string
  video_url: string | null
  duration_seconds: number | null
  order_index: number
}

type Course = {
  id: string
  title: string
  slug: string
  order_index: number
  lessons: Lesson[]
}

type Track = {
  id: string
  title: string
  slug: string
  order_index: number
  courses: Course[]
}

type Formation = {
  id: string
  title: string
  slug: string
  tracks: Track[]
}

function sortCurriculum(f: Formation): Formation {
  return {
    ...f,
    tracks: [...(f.tracks ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((t) => ({
        ...t,
        courses: [...(t.courses ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map((c) => ({
            ...c,
            lessons: [...(c.lessons ?? [])].sort((a, b) => a.order_index - b.order_index),
          })),
      })),
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: raw } = await supabase
    .from('formations')
    .select(
      `id, title, slug,
       tracks(id, title, slug, order_index,
         courses(id, title, slug, order_index,
           lessons(id, title, video_url, duration_seconds, order_index)))`
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!raw) notFound()

  const formation = sortCurriculum(raw as unknown as Formation)
  const allLessons = formation.tracks.flatMap((t) => t.courses.flatMap((c) => c.lessons))
  const lesson = allLessons.find((l) => l.id === lessonId)
  if (!lesson) notFound()

  const idx = allLessons.indexOf(lesson)
  const prevLessonId = idx > 0 ? allLessons[idx - 1].id : null
  const nextLessonId = idx < allLessons.length - 1 ? allLessons[idx + 1].id : null

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed')
    .in('lesson_id', allLessons.map((l) => l.id))

  const progressRecord: Record<string, boolean> = {}
  for (const p of progressRows ?? []) {
    progressRecord[p.lesson_id] = p.completed
  }

  // Strip video_url from sidebar curriculum to reduce payload — only needed for current lesson
  const curriculumForSidebar = formation.tracks.map((t) => ({
    id: t.id,
    title: t.title,
    courses: t.courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        video_url: null,
        duration_seconds: null,
        order_index: l.order_index,
      })),
    })),
  }))

  return (
    <LessonClient
      lesson={lesson}
      formationTitle={formation.title}
      formationSlug={formation.slug}
      curriculum={curriculumForSidebar}
      progressRecord={progressRecord}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
    />
  )
}
