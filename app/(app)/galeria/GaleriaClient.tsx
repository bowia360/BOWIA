'use client'

import { useState, useTransition } from 'react'
import { toggleFavorite } from './actions'

export type Prompt = {
  id: string
  title: string
  category: string | null
  prompt_text: string
  preview_url: string | null
  is_published: boolean
  created_at: string
}

interface Props {
  prompts: Prompt[]
  favoriteIds: string[]
  categories: string[]
  emptyMessage?: string
}

export default function GaleriaClient({
  prompts,
  favoriteIds,
  categories,
  emptyMessage = 'Nenhum prompt encontrado.',
}: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [favIds, setFavIds] = useState(() => new Set(favoriteIds))
  const [copied, setCopied] = useState(false)
  const [, startTransition] = useTransition()

  const filtered = prompts.filter((p) => {
    const matchesSearch =
      !search || p.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || p.category === activeCategory
    return matchesSearch && matchesCategory
  })

  function openPrompt(prompt: Prompt) {
    setSelectedPrompt(prompt)
    setCopied(false)
  }

  function closeModal() {
    setSelectedPrompt(null)
    setCopied(false)
  }

  function handleToggleFavorite(e: React.MouseEvent, promptId: string) {
    e.stopPropagation()
    const isFav = favIds.has(promptId)
    setFavIds((prev) => {
      const next = new Set(prev)
      if (isFav) next.delete(promptId)
      else next.add(promptId)
      return next
    })
    startTransition(async () => {
      await toggleFavorite(promptId, isFav)
    })
  }

  async function handleCopy() {
    if (!selectedPrompt) return
    await navigator.clipboard.writeText(selectedPrompt.prompt_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-alt border border-[rgba(255,255,255,0.08)] rounded-bow-sm text-text-off placeholder-text-dim text-sm focus:outline-none focus:border-neon-blue transition-colors"
            />
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-sora font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-neon-blue text-white'
                  : 'bg-white/5 border border-white/10 text-text-muted hover:text-text-off hover:border-white/20'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-neon-blue text-white'
                    : 'bg-white/5 border border-white/10 text-text-muted hover:text-text-off hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-text-dim text-sm">
            {emptyMessage}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => openPrompt(prompt)}
                  className="glass-card rounded-bow p-5 cursor-pointer hover:border-[rgba(255,255,255,0.16)] transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      {prompt.category && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue-lt font-sora mb-2">
                          {prompt.category}
                        </span>
                      )}
                      <h3 className="font-sora font-semibold text-sm text-text-off group-hover:text-white transition-colors leading-snug">
                        {prompt.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => handleToggleFavorite(e, prompt.id)}
                      className="shrink-0 p-1.5 rounded-[8px] hover:bg-white/10 transition-colors"
                    >
                      <HeartIcon filled={favIds.has(prompt.id)} />
                    </button>
                  </div>
                  <p className="text-xs text-text-dim line-clamp-3 leading-relaxed">
                    {prompt.prompt_text}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-text-dim text-xs mt-5 text-center">
              {filtered.length} prompt{filtered.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative z-10 w-full max-w-lg glass-card rounded-bow-lg p-6 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
              <div className="min-w-0">
                {selectedPrompt.category && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue-lt font-sora mb-2">
                    {selectedPrompt.category}
                  </span>
                )}
                <h2 className="font-sora font-bold text-lg text-white leading-snug">
                  {selectedPrompt.title}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="shrink-0 p-1.5 rounded-[8px] text-text-dim hover:text-text-muted hover:bg-white/10 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Prompt text */}
            <div className="flex-1 overflow-y-auto mb-5 min-h-0">
              <div className="bg-bg-alt border border-[rgba(255,255,255,0.06)] rounded-[11px] p-4">
                <p className="text-sm text-text-off leading-relaxed whitespace-pre-wrap font-inter">
                  {selectedPrompt.prompt_text}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 shrink-0">
              <div className="relative flex-1">
                <button
                  onClick={handleCopy}
                  className={`btn-primary w-full py-2.5 px-4 rounded-bow-sm font-sora font-semibold text-sm text-white transition-colors ${
                    copied ? 'brightness-110' : ''
                  }`}
                >
                  {copied ? 'Copiado!' : 'Copiar prompt'}
                </button>
                {!copied && <span className="border-beam" />}
              </div>
              <button
                onClick={(e) => handleToggleFavorite(e, selectedPrompt.id)}
                className={`px-4 py-2.5 rounded-bow-sm border font-sora font-semibold text-sm transition-colors flex items-center gap-2 shrink-0 ${
                  favIds.has(selectedPrompt.id)
                    ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue-lt'
                    : 'bg-transparent border-[rgba(255,255,255,0.08)] text-text-muted hover:border-[rgba(255,255,255,0.16)] hover:text-text-off'
                }`}
              >
                <HeartIcon filled={favIds.has(selectedPrompt.id)} />
                {favIds.has(selectedPrompt.id) ? 'Salvo' : 'Favoritar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'text-neon-blue-lt' : 'text-text-dim'}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
