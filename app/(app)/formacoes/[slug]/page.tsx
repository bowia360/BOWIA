import { createClient } from '@/utils/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CoverImage } from '../CoverImage'

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
  type: string
  order_index: number
  lessons: Lesson[]
}

type Track = {
  id: string
  title: string
  slug: string
  level: string | null
  order_index: number
  courses: Course[]
}

type Formation = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_url: string | null
  tracks: Track[]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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

function flatLessons(f: Formation): Lesson[] {
  return f.tracks.flatMap((t) => t.courses.flatMap((c) => c.lessons))
}

export default async function FormacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: raw } = await supabase
    .from('formations')
    .select(
      `id, title, slug, description, cover_url,
       tracks(id, title, slug, level, order_index,
         courses(id, title, slug, type, order_index,
           lessons(id, title, video_url, duration_seconds, order_index)))`
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!raw) notFound()

  const formation = sortCurriculum(raw as unknown as Formation)
  const all = flatLessons(formation)

  const [{ data: progressRows }, hasSubscription] = await Promise.all([
    supabase
      .from('lesson_progress')
      .select('lesson_id, completed, progress_percent')
      .in('lesson_id', all.map((l) => l.id)),
    getSubscriptionStatus(),
  ])

  const progressMap = new Map(
    (progressRows ?? []).map((p) => [p.lesson_id, p.completed as boolean])
  )

  const firstIncomplete = all.find((l) => !progressMap.get(l.id))
  const ctaLesson = firstIncomplete ?? all[0]
  const completedCount = all.filter((l) => progressMap.get(l.id)).length

  const LEVEL_LABEL: Record<string, string> = {
    basico: 'Básico',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Hero */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="h-52 relative overflow-hidden bg-gradient-to-br from-neon-blue/20 to-[rgba(0,102,255,0.04)]">
          <div className="absolute inset-0 bg-grid opacity-30" />
          {formation.cover_url && (
            <CoverImage
              src={formation.cover_url}
              alt={formation.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
        </div>
        <div className="p-6">
          <h1 className="font-sora font-bold text-2xl text-white mb-2">
            {formation.title}
          </h1>
          {formation.description && (
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              {formation.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-text-dim mb-5">
            <span>{formation.tracks.length} trilha{formation.tracks.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{all.length} aula{all.length !== 1 ? 's' : ''}</span>
            {all.length > 0 && (
              <>
                <span>·</span>
                <span>{completedCount}/{all.length} concluídas</span>
              </>
            )}
          </div>
          {ctaLesson && !hasSubscription && (
            <Link
              href="/planos"
              className="btn-primary inline-block px-6 py-2.5 text-sm"
            >
              Assine para acessar
            </Link>
          )}
          {ctaLesson && hasSubscription && (
            <Link
              href={`/formacoes/${formation.slug}/aulas/${ctaLesson.id}`}
              className="btn-primary inline-block px-6 py-2.5 text-sm"
            >
              {completedCount === 0 ? 'Começar' : completedCount === all.length ? 'Revisitar' : 'Continuar'}
            </Link>
          )}
        </div>
      </div>

      {/* Curriculum */}
      {formation.tracks.length === 0 ? (
        <p className="text-text-dim text-sm text-center py-8">
          Conteúdo em preparação.
        </p>
      ) : (
        <div className="space-y-4">
          {formation.tracks.map((track) => {
            const trackLessons = track.courses.flatMap((c) => c.lessons)
            const trackCompleted = trackLessons.filter((l) => progressMap.get(l.id)).length
            return (
              <div key={track.id} className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sora font-semibold text-sm text-text-off">
                        {track.title}
                      </span>
                      {track.level && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">
                          {LEVEL_LABEL[track.level] ?? track.level}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-text-dim shrink-0">
                    {trackCompleted}/{trackLessons.length}
                  </span>
                </div>

                <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {track.courses.map((course) => (
                    <div key={course.id}>
                      {course.lessons.length > 0 && (
                        <div className="px-5 py-2 bg-[rgba(255,255,255,0.02)]">
                          <span className="text-xs font-medium text-text-dim">
                            {course.title}
                            {course.type === 'projeto' && (
                              <span className="ml-1.5 text-[10px] text-neon-blue-lt">· Projeto</span>
                            )}
                          </span>
                        </div>
                      )}
                      {course.lessons.map((lesson) => {
                        const done = progressMap.get(lesson.id) === true
                        return (
                          <Link
                            key={lesson.id}
                            href={`/formacoes/${formation.slug}/aulas/${lesson.id}`}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border transition-colors ${
                                done
                                  ? 'bg-bow-green/20 border-bow-green/40'
                                  : 'border-[rgba(255,255,255,0.12)] group-hover:border-neon-blue/40'
                              }`}
                            >
                              {done && (
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#36E27B"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span
                              className={`flex-1 text-sm ${done ? 'text-text-dim' : 'text-text-muted group-hover:text-text-off'} transition-colors`}
                            >
                              {lesson.title}
                            </span>
                            {lesson.duration_seconds && hasSubscription && (
                              <span className="text-xs text-text-dim shrink-0">
                                {formatDuration(lesson.duration_seconds)}
                              </span>
                            )}
                            {!hasSubscription && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-text-dim shrink-0"
                              >
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
