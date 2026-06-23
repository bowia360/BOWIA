'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { markLessonComplete } from './actions'

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
  lessons: Lesson[]
}

type Track = {
  id: string
  title: string
  courses: Course[]
}

type Props = {
  lesson: Lesson
  formationTitle: string
  formationSlug: string
  curriculum: Track[]
  progressRecord: Record<string, boolean>
  prevLessonId: string | null
  nextLessonId: string | null
}

export default function LessonClient({
  lesson,
  formationTitle,
  formationSlug,
  curriculum,
  progressRecord,
  prevLessonId,
  nextLessonId,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [completed, setCompleted] = useState(progressRecord[lesson.id] === true)

  function handleMarkComplete() {
    if (completed) return
    setCompleted(true)
    startTransition(async () => {
      try {
        await markLessonComplete(lesson.id, formationSlug)
      } catch {
        setCompleted(false)
      }
    })
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-text-dim mb-5">
          <Link href="/formacoes" className="hover:text-text-muted transition-colors">
            Formações
          </Link>
          <span>/</span>
          <Link
            href={`/formacoes/${formationSlug}`}
            className="hover:text-text-muted transition-colors truncate max-w-[160px]"
          >
            {formationTitle}
          </Link>
          <span>/</span>
          <span className="text-text-muted truncate max-w-[160px]">{lesson.title}</span>
        </div>

        {/* Video player */}
        <div className="relative w-full rounded-[14px] overflow-hidden bg-black border border-[rgba(255,255,255,0.06)] mb-5"
          style={{ aspectRatio: '16/9' }}>
          {lesson.video_url ? (
            <iframe
              src={lesson.video_url}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-text-dim text-sm">Vídeo em breve</p>
            </div>
          )}
        </div>

        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-sora font-bold text-xl text-white leading-snug">
            {lesson.title}
          </h1>
          <button
            onClick={handleMarkComplete}
            disabled={completed || isPending}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-[10px] border text-sm transition-colors ${
              completed
                ? 'bg-bow-green/10 border-bow-green/30 text-bow-green cursor-default'
                : 'bg-white/5 border-white/10 text-text-muted hover:text-text-off hover:bg-white/8 disabled:opacity-50'
            }`}
          >
            {completed ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Concluída
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 10 11 15 8 12" />
                </svg>
                {isPending ? 'Salvando...' : 'Marcar como concluída'}
              </>
            )}
          </button>
        </div>

        {/* Prev / Next nav */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
          {prevLessonId ? (
            <Link
              href={`/formacoes/${formationSlug}/aulas/${prevLessonId}`}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-off transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Aula anterior
            </Link>
          ) : (
            <span />
          )}
          {nextLessonId ? (
            <Link
              href={`/formacoes/${formationSlug}/aulas/${nextLessonId}`}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-off transition-colors"
            >
              Próxima aula
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/formacoes/${formationSlug}`}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-off transition-colors"
            >
              Ver formação
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Sidebar curriculum */}
      <aside className="w-72 shrink-0 border-l border-[rgba(255,255,255,0.06)] overflow-auto">
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
          <Link
            href={`/formacoes/${formationSlug}`}
            className="text-xs font-sora font-semibold text-text-muted hover:text-text-off transition-colors"
          >
            ← {formationTitle}
          </Link>
        </div>
        <div className="py-2">
          {curriculum.map((track) => (
            <div key={track.id}>
              <div className="px-4 py-2 mt-1">
                <span className="text-[11px] font-semibold text-text-dim uppercase tracking-wide">
                  {track.title}
                </span>
              </div>
              {track.courses.map((course) => (
                <div key={course.id}>
                  {course.lessons.map((l) => {
                    const isActive = l.id === lesson.id
                    const isDone = progressRecord[l.id] === true || (isActive && completed)
                    return (
                      <Link
                        key={l.id}
                        href={`/formacoes/${formationSlug}/aulas/${l.id}`}
                        className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${
                          isActive
                            ? 'bg-neon-blue/10 border-r-2 border-neon-blue'
                            : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border ${
                            isDone
                              ? 'bg-bow-green/20 border-bow-green/40'
                              : isActive
                              ? 'border-neon-blue/60'
                              : 'border-[rgba(255,255,255,0.12)]'
                          }`}
                        >
                          {isDone && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#36E27B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-xs leading-snug ${
                            isActive ? 'text-text-off font-medium' : 'text-text-dim'
                          }`}
                        >
                          {l.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
