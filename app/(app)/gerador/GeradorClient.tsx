'use client'

import { useState } from 'react'

export default function GeradorClient() {
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!description.trim()) return
    setLoading(true)
    setError(null)
    setPrompt('')

    try {
      const res = await fetch('/api/gerar-prompt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido')
      setPrompt(data.prompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar prompt')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-2xl text-white mb-1">Gerador de Prompt</h1>
        <p className="text-sm text-text-muted">
          Descreva em português o que você quer criar — o gerador transforma em um prompt estruturado pronto para o Estúdio UGC.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={5}
            placeholder="Ex: uma foto de produto numa praia ao pôr do sol, estilo editorial, com uma modelo segurando o produto de forma natural"
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[14px] px-4 py-3.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/50 transition-colors resize-none disabled:opacity-50"
          />
          <span className="absolute bottom-3 right-4 text-[11px] text-text-dim select-none">
            ⌘ Enter para gerar
          </span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
          className="btn-primary w-full py-3 text-sm relative disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Gerando...
            </span>
          ) : (
            'Gerar prompt'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {prompt && (
        <div className="mt-6 glass-card p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neon-blue-lt font-sora">Prompt gerado</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[8px] border transition-colors ${
                copied
                  ? 'bg-bow-green/10 border-bow-green/30 text-bow-green'
                  : 'bg-white/5 border-white/10 text-text-muted hover:text-text-off hover:bg-white/8'
              }`}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-text-off leading-relaxed">{prompt}</p>
        </div>
      )}
    </div>
  )
}
