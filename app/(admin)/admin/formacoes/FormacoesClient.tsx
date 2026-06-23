'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createFormacao, updateFormacao, deleteFormacao } from './actions'

type Formacao = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  is_published: boolean
  created_at: string
}

type Props = {
  formacoes: Formacao[]
}

type FormState = {
  title: string
  description: string
  cover_url: string
  is_published: boolean
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  cover_url: '',
  is_published: false,
}

function formacaoToForm(f: Formacao): FormState {
  return {
    title: f.title,
    description: f.description ?? '',
    cover_url: f.cover_url ?? '',
    is_published: f.is_published,
  }
}

export default function FormacoesClient({ formacoes }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowNew(true)
    setError(null)
  }

  function openEdit(f: Formacao) {
    setForm(formacaoToForm(f))
    setEditingId(f.id)
    setShowNew(true)
    setError(null)
  }

  function closeForm() {
    setShowNew(false)
    setEditingId(null)
    setError(null)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function buildFormData() {
    const fd = new FormData()
    fd.set('title', form.title)
    fd.set('description', form.description)
    fd.set('cover_url', form.cover_url)
    fd.set('is_published', String(form.is_published))
    return fd
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = buildFormData()
    startTransition(async () => {
      try {
        if (editingId) {
          await updateFormacao(editingId, fd)
        } else {
          await createFormacao(fd)
        }
        closeForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta formação? As trilhas vinculadas também serão afetadas.')) return
    startTransition(async () => {
      try {
        await deleteFormacao(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir')
      }
    })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sora font-bold text-2xl text-white">Formações</h1>
        <button
          onClick={openNew}
          className="btn-primary px-4 py-2 text-sm"
          disabled={isPending}
        >
          + Nova formação
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {showNew && (
        <div className="glass-card p-6 mb-8">
          <h2 className="font-sora font-semibold text-lg text-white mb-5">
            {editingId ? 'Editar formação' : 'Nova formação'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Título</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Ex: UGC do Zero ao Pro"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva o objetivo desta formação..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">URL da capa</label>
              <input
                name="cover_url"
                value={form.cover_url}
                onChange={handleChange}
                type="url"
                placeholder="https://..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-neon-blue"
              />
              <span className="text-sm text-text-off">Publicada (visível para alunos)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
              >
                {isPending
                  ? 'Salvando...'
                  : editingId
                  ? 'Salvar alterações'
                  : 'Criar formação'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2 text-sm text-text-muted hover:text-text-off transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {formacoes.length === 0 && (
          <p className="text-text-dim text-sm py-12 text-center">Nenhuma formação ainda.</p>
        )}
        {formacoes.map((f) => (
          <div
            key={f.id}
            className="flex items-start gap-4 glass-card px-5 py-4 hover:border-[rgba(255,255,255,0.1)] transition-colors"
          >
            {f.cover_url && (
              <img
                src={f.cover_url}
                alt=""
                className="w-14 h-14 rounded-[10px] object-cover shrink-0 opacity-80"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-sora font-medium text-sm text-text-off truncate">
                  {f.title}
                </span>
                {f.is_published ? (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-bow-green/10 text-bow-green border border-bow-green/20">
                    publicada
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">
                    rascunho
                  </span>
                )}
              </div>
              {f.description && (
                <p className="text-xs text-text-dim line-clamp-2">{f.description}</p>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2 mt-0.5">
              <Link
                href={`/admin/formacoes/${f.id}`}
                className="text-xs text-neon-blue-lt hover:text-white transition-colors px-2 py-1"
              >
                Trilhas →
              </Link>
              <button
                onClick={() => openEdit(f)}
                className="text-xs text-text-muted hover:text-neon-blue-lt transition-colors px-2 py-1"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(f.id)}
                disabled={isPending}
                className="text-xs text-text-dim hover:text-red-400 transition-colors px-2 py-1"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
