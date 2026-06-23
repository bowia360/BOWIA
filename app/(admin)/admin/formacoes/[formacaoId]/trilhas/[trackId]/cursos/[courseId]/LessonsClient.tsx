'use client'

import { useState, useTransition } from 'react'
import { createLesson, updateLesson, deleteLesson } from './actions'
import Link from 'next/link'

type Lesson = {
  id: string
  title: string
  video_url: string | null
  duration_seconds: number | null
  order_index: number
  is_published: boolean
}

type Props = {
  formacaoId: string
  formacaoTitle: string
  trackId: string
  trackTitle: string
  courseId: string
  courseTitle: string
  lessons: Lesson[]
}

type FormState = {
  title: string
  video_url: string
  duration_seconds: string
  order_index: number
  is_published: boolean
}
const EMPTY: FormState = { title: '', video_url: '', duration_seconds: '', order_index: 0, is_published: false }

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function LessonsClient({ formacaoId, formacaoTitle, trackId, trackTitle, courseId, courseTitle, lessons }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  function openNew() { setForm(EMPTY); setEditingId(null); setShowNew(true); setError(null) }
  function openEdit(l: Lesson) {
    setForm({ title: l.title, video_url: l.video_url ?? '', duration_seconds: l.duration_seconds ? String(l.duration_seconds) : '', order_index: l.order_index, is_published: l.is_published })
    setEditingId(l.id); setShowNew(true); setError(null)
  }
  function close() { setShowNew(false); setEditingId(null); setError(null) }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null)
    const fd = new FormData()
    fd.set('title', form.title); fd.set('video_url', form.video_url)
    fd.set('duration_seconds', form.duration_seconds)
    fd.set('order_index', String(form.order_index))
    fd.set('is_published', String(form.is_published))
    startTransition(async () => {
      try {
        if (editingId) await updateLesson(courseId, editingId, fd)
        else await createLesson(courseId, fd)
        close()
      } catch (err) { setError(err instanceof Error ? err.message : 'Erro') }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta aula?')) return
    startTransition(async () => {
      try { await deleteLesson(courseId, id) }
      catch (err) { setError(err instanceof Error ? err.message : 'Erro ao excluir') }
    })
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-text-dim mb-6 flex-wrap">
        <Link href="/admin/formacoes" className="hover:text-text-muted transition-colors">Formações</Link>
        <span>/</span>
        <Link href={`/admin/formacoes/${formacaoId}`} className="hover:text-text-muted transition-colors">{formacaoTitle}</Link>
        <span>/</span>
        <Link href={`/admin/formacoes/${formacaoId}/trilhas/${trackId}`} className="hover:text-text-muted transition-colors">{trackTitle}</Link>
        <span>/</span>
        <span className="text-text-muted">{courseTitle}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora font-bold text-xl text-white">Aulas</h1>
        <button onClick={openNew} disabled={isPending} className="btn-primary px-4 py-2 text-sm">+ Nova aula</button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {showNew && (
        <div className="glass-card p-6 mb-6">
          <h2 className="font-sora font-semibold text-base text-white mb-4">{editingId ? 'Editar aula' : 'Nova aula'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Título</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: O que é n8n e por que usar"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">URL do vídeo (embed)</label>
              <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Duração (segundos)</label>
                <input name="duration_seconds" type="number" value={form.duration_seconds} onChange={handleChange} min={0} placeholder="Ex: 360 = 6 min"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Ordem</label>
                <input name="order_index" type="number" value={form.order_index} onChange={handleChange} min={0}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off focus:outline-none focus:border-neon-blue/60 transition-colors" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} className="w-4 h-4 accent-neon-blue" />
              <span className="text-sm text-text-off">Publicada</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={isPending} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">
                {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
              </button>
              <button type="button" onClick={close} className="px-4 py-2 text-sm text-text-muted hover:text-text-off transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {lessons.length === 0 && <p className="text-text-dim text-sm text-center py-10">Nenhuma aula ainda.</p>}
        {lessons.map(l => (
          <div key={l.id} className="flex items-center gap-4 glass-card px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sora font-medium text-sm text-text-off truncate">{l.title}</span>
                {l.is_published
                  ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bow-green/10 text-bow-green border border-bow-green/20">publicada</span>
                  : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">rascunho</span>}
                {l.duration_seconds && <span className="text-[10px] text-text-dim">{formatDuration(l.duration_seconds)}</span>}
                <span className="text-[10px] text-text-dim">ordem {l.order_index}</span>
              </div>
              {l.video_url && <p className="text-[11px] text-text-dim mt-0.5 truncate">{l.video_url}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => openEdit(l)} className="text-xs text-text-muted hover:text-text-off transition-colors px-2 py-1">Editar</button>
              <button onClick={() => handleDelete(l.id)} disabled={isPending} className="text-xs text-text-dim hover:text-red-400 transition-colors px-2 py-1">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
