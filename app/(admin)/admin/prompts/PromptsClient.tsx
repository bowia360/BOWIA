'use client'

import { useState, useTransition } from 'react'
import { createPrompt, updatePrompt, deletePrompt } from './actions'

type Prompt = {
  id: string
  title: string
  prompt_text: string
  category: string | null
  tags: string[] | null
  is_published: boolean
  created_at: string
}

type Props = {
  prompts: Prompt[]
}

type FormState = {
  title: string
  prompt_text: string
  category: string
  tags: string
  is_published: boolean
}

const EMPTY_FORM: FormState = {
  title: '',
  prompt_text: '',
  category: '',
  tags: '',
  is_published: false,
}

function promptToForm(p: Prompt): FormState {
  return {
    title: p.title,
    prompt_text: p.prompt_text,
    category: p.category ?? '',
    tags: (p.tags ?? []).join(', '),
    is_published: p.is_published,
  }
}

export default function PromptsClient({ prompts }: Props) {
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

  function openEdit(p: Prompt) {
    setForm(promptToForm(p))
    setEditingId(p.id)
    setShowNew(true)
    setError(null)
  }

  function closeForm() {
    setShowNew(false)
    setEditingId(null)
    setError(null)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    fd.set('prompt_text', form.prompt_text)
    fd.set('category', form.category)
    fd.set('tags', form.tags)
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
          await updatePrompt(editingId, fd)
        } else {
          await createPrompt(fd)
        }
        closeForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Tem certeza que quer excluir este prompt?')) return
    startTransition(async () => {
      try {
        await deletePrompt(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir')
      }
    })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sora font-bold text-2xl text-white">Prompts</h1>
        <button
          onClick={openNew}
          className="btn-primary px-4 py-2 text-sm"
          disabled={isPending}
        >
          + Novo prompt
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
            {editingId ? 'Editar prompt' : 'Novo prompt'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Título</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Ex: Reels de produto lifestyle"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Texto do prompt</label>
              <textarea
                name="prompt_text"
                value={form.prompt_text}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Descreva o prompt completo aqui..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">Categoria</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ex: Moda, Beleza, Tech..."
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Tags <span className="text-text-dim">(separadas por vírgula)</span>
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Ex: reels, produto, ugc"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-neon-blue"
              />
              <span className="text-sm text-text-off">Publicado (visível na galeria)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar prompt'}
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
        {prompts.length === 0 && (
          <p className="text-text-dim text-sm py-12 text-center">Nenhum prompt ainda.</p>
        )}
        {prompts.map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-4 glass-card px-5 py-4 hover:border-[rgba(255,255,255,0.1)] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-sora font-medium text-sm text-text-off truncate">
                  {p.title}
                </span>
                {p.is_published ? (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-bow-green/10 text-bow-green border border-bow-green/20">
                    publicado
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">
                    rascunho
                  </span>
                )}
                {p.category && (
                  <span className="shrink-0 text-[10px] text-text-dim">{p.category}</span>
                )}
              </div>
              <p className="text-xs text-text-dim line-clamp-2">{p.prompt_text}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2 mt-0.5">
              <button
                onClick={() => openEdit(p)}
                className="text-xs text-text-muted hover:text-neon-blue-lt transition-colors px-2 py-1"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(p.id)}
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
