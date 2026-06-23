'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createTrack, updateTrack, deleteTrack } from './actions'

type Track = {
  id: string
  title: string
  slug: string
  level: string | null
  order_index: number
  is_published: boolean
}

type Props = {
  formacaoId: string
  formacaoTitle: string
  tracks: Track[]
}

type FormState = { title: string; level: string; order_index: number; is_published: boolean }
const EMPTY: FormState = { title: '', level: '', order_index: 0, is_published: false }

const LEVEL_LABEL: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' }

export default function TracksClient({ formacaoId, formacaoTitle, tracks }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  function openNew() { setForm(EMPTY); setEditingId(null); setShowNew(true); setError(null) }
  function openEdit(t: Track) {
    setForm({ title: t.title, level: t.level ?? '', order_index: t.order_index, is_published: t.is_published })
    setEditingId(t.id); setShowNew(true); setError(null)
  }
  function close() { setShowNew(false); setEditingId(null); setError(null) }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null)
    const fd = new FormData()
    fd.set('title', form.title); fd.set('level', form.level)
    fd.set('order_index', String(form.order_index)); fd.set('is_published', String(form.is_published))
    startTransition(async () => {
      try {
        if (editingId) await updateTrack(formacaoId, editingId, fd)
        else await createTrack(formacaoId, fd)
        close()
      } catch (err) { setError(err instanceof Error ? err.message : 'Erro') }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta trilha e todos os cursos/aulas vinculados?')) return
    startTransition(async () => {
      try { await deleteTrack(formacaoId, id) }
      catch (err) { setError(err instanceof Error ? err.message : 'Erro ao excluir') }
    })
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-text-dim mb-6">
        <Link href="/admin/formacoes" className="hover:text-text-muted transition-colors">Formações</Link>
        <span>/</span>
        <span className="text-text-muted">{formacaoTitle}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora font-bold text-xl text-white">Trilhas</h1>
        <button onClick={openNew} disabled={isPending} className="btn-primary px-4 py-2 text-sm">+ Nova trilha</button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {showNew && (
        <div className="glass-card p-6 mb-6">
          <h2 className="font-sora font-semibold text-base text-white mb-4">{editingId ? 'Editar trilha' : 'Nova trilha'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Título</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Módulo 1 — Fundamentos"
                className="w-full bg-white/4 border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Nível</label>
                <select name="level" value={form.level} onChange={handleChange}
                  className="w-full bg-white/4 border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off focus:outline-none focus:border-neon-blue/60 transition-colors">
                  <option value="">Sem nível</option>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Ordem</label>
                <input name="order_index" type="number" value={form.order_index} onChange={handleChange} min={0}
                  className="w-full bg-white/4 border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off focus:outline-none focus:border-neon-blue/60 transition-colors" />
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
        {tracks.length === 0 && <p className="text-text-dim text-sm text-center py-10">Nenhuma trilha ainda.</p>}
        {tracks.map(t => (
          <div key={t.id} className="flex items-center gap-4 glass-card px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sora font-medium text-sm text-text-off truncate">{t.title}</span>
                {t.is_published
                  ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bow-green/10 text-bow-green border border-bow-green/20">publicada</span>
                  : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">rascunho</span>}
                {t.level && <span className="text-[10px] text-text-dim">{LEVEL_LABEL[t.level] ?? t.level}</span>}
                <span className="text-[10px] text-text-dim">ordem {t.order_index}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/admin/formacoes/${formacaoId}/trilhas/${t.id}`}
                className="text-xs text-neon-blue-lt hover:text-white transition-colors px-2 py-1">
                Cursos →
              </Link>
              <button onClick={() => openEdit(t)} className="text-xs text-text-muted hover:text-text-off transition-colors px-2 py-1">Editar</button>
              <button onClick={() => handleDelete(t.id)} disabled={isPending} className="text-xs text-text-dim hover:text-red-400 transition-colors px-2 py-1">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
