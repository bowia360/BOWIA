'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createCourse, updateCourse, deleteCourse } from './actions'

type Course = {
  id: string
  title: string
  slug: string
  type: string
  instructor_name: string | null
  order_index: number
  is_published: boolean
}

type Props = {
  formacaoId: string
  formacaoTitle: string
  trackId: string
  trackTitle: string
  courses: Course[]
}

type FormState = {
  title: string
  type: string
  instructor_name: string
  order_index: number
  is_published: boolean
}
const EMPTY: FormState = { title: '', type: 'curso', instructor_name: '', order_index: 0, is_published: false }

export default function CoursesClient({ formacaoId, formacaoTitle, trackId, trackTitle, courses }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  function openNew() { setForm(EMPTY); setEditingId(null); setShowNew(true); setError(null) }
  function openEdit(c: Course) {
    setForm({ title: c.title, type: c.type, instructor_name: c.instructor_name ?? '', order_index: c.order_index, is_published: c.is_published })
    setEditingId(c.id); setShowNew(true); setError(null)
  }
  function close() { setShowNew(false); setEditingId(null); setError(null) }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null)
    const fd = new FormData()
    fd.set('title', form.title); fd.set('type', form.type)
    fd.set('instructor_name', form.instructor_name)
    fd.set('order_index', String(form.order_index))
    fd.set('is_published', String(form.is_published))
    startTransition(async () => {
      try {
        if (editingId) await updateCourse(trackId, editingId, fd)
        else await createCourse(trackId, fd)
        close()
      } catch (err) { setError(err instanceof Error ? err.message : 'Erro') }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este curso e todas as aulas vinculadas?')) return
    startTransition(async () => {
      try { await deleteCourse(trackId, id) }
      catch (err) { setError(err instanceof Error ? err.message : 'Erro ao excluir') }
    })
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-text-dim mb-6">
        <Link href="/admin/formacoes" className="hover:text-text-muted transition-colors">Formações</Link>
        <span>/</span>
        <Link href={`/admin/formacoes/${formacaoId}`} className="hover:text-text-muted transition-colors">{formacaoTitle}</Link>
        <span>/</span>
        <span className="text-text-muted">{trackTitle}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora font-bold text-xl text-white">Cursos</h1>
        <button onClick={openNew} disabled={isPending} className="btn-primary px-4 py-2 text-sm">+ Novo curso</button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {showNew && (
        <div className="glass-card p-6 mb-6">
          <h2 className="font-sora font-semibold text-base text-white mb-4">{editingId ? 'Editar curso' : 'Novo curso'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Título</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Introdução ao n8n"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Tipo</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off focus:outline-none focus:border-neon-blue/60 transition-colors">
                  <option value="curso">Curso</option>
                  <option value="projeto">Projeto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Instrutor</label>
                <input name="instructor_name" value={form.instructor_name} onChange={handleChange} placeholder="Nome"
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
              <span className="text-sm text-text-off">Publicado</span>
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
        {courses.length === 0 && <p className="text-text-dim text-sm text-center py-10">Nenhum curso ainda.</p>}
        {courses.map(c => (
          <div key={c.id} className="flex items-center gap-4 glass-card px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sora font-medium text-sm text-text-off truncate">{c.title}</span>
                {c.is_published
                  ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bow-green/10 text-bow-green border border-bow-green/20">publicado</span>
                  : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">rascunho</span>}
                {c.type === 'projeto' && <span className="text-[10px] text-neon-blue-lt">Projeto</span>}
                {c.instructor_name && <span className="text-[10px] text-text-dim">{c.instructor_name}</span>}
                <span className="text-[10px] text-text-dim">ordem {c.order_index}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/admin/formacoes/${formacaoId}/trilhas/${trackId}/cursos/${c.id}`}
                className="text-xs text-neon-blue-lt hover:text-white transition-colors px-2 py-1"
              >
                Aulas →
              </Link>
              <button onClick={() => openEdit(c)} className="text-xs text-text-muted hover:text-text-off transition-colors px-2 py-1">Editar</button>
              <button onClick={() => handleDelete(c.id)} disabled={isPending} className="text-xs text-text-dim hover:text-red-400 transition-colors px-2 py-1">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
