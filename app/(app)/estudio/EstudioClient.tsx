'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

type Status = 'idle' | 'submitting' | 'queued' | 'generating_image' | 'done' | 'failed'

const STATUS_LABEL: Record<Status, string> = {
  idle: '',
  submitting: 'Enviando...',
  queued: 'Na fila...',
  generating_image: 'Gerando imagem...',
  done: 'Concluído',
  failed: 'Falhou',
}

export default function EstudioClient() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const generationIdRef = useRef<string | null>(null)

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  useEffect(() => () => stopPolling(), [])

  async function startPolling(generationId: string) {
    const supabase = createClient()
    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('generations')
        .select('status, output_url, error_message')
        .eq('id', generationId)
        .single()

      if (!data) return

      const s = data.status as Status
      setStatus(s)

      if (s === 'done') {
        setOutputUrl(data.output_url ?? null)
        stopPolling()
      } else if (s === 'failed') {
        setErrorMsg(data.error_message ?? 'Erro na geração')
        stopPolling()
      }
    }, 3000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    stopPolling()
    setStatus('submitting')
    setOutputUrl(null)
    setErrorMsg(null)

    const res = await fetch('/api/estudio/gerar-imagem', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.trim(),
        input_image_url: imageUrl.trim() || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setStatus('failed')
      setErrorMsg(data.error ?? 'Erro ao iniciar geração')
      return
    }

    generationIdRef.current = data.generation_id
    setStatus('queued')
    startPolling(data.generation_id)
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    stopPolling()
    setStatus('idle')
    setOutputUrl(null)
    setErrorMsg(null)
    generationIdRef.current = null
  }

  const isGenerating = status === 'submitting' || status === 'queued' || status === 'generating_image'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-2xl text-white mb-1">Estúdio UGC · Imagem</h1>
        <p className="text-sm text-text-muted">
          Descreva o que quer gerar — use um prompt da galeria ou escreva direto. A imagem chega em instantes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={5}
            placeholder="Ex: hyper-realistic editorial portrait, golden hour lighting, shallow depth of field, fashion magazine aesthetic"
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[14px] px-4 py-3.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/50 transition-colors resize-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">
            Imagem de referência <span className="text-text-dim">(URL, opcional)</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isGenerating}
            placeholder="https://..."
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[14px] px-4 py-3 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/50 transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {STATUS_LABEL[status]}
            </span>
          ) : (
            'Gerar imagem'
          )}
        </button>
      </form>

      {isGenerating && (
        <div className="mt-6 glass-card px-5 py-4 flex items-center gap-3">
          <div className="badge-dot shrink-0" />
          <span className="text-sm text-text-muted">{STATUS_LABEL[status]}</span>
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-6 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between gap-4">
          <span>{errorMsg}</span>
          <button onClick={handleReset} className="text-xs text-red-300 hover:text-red-200 shrink-0">
            Tentar novamente
          </button>
        </div>
      )}

      {status === 'done' && outputUrl && (
        <div className="mt-6 space-y-3">
          <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.08)]">
            <img
              src={outputUrl}
              alt="Imagem gerada"
              className="w-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <a
              href={outputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 py-2.5 text-sm text-center"
            >
              Abrir imagem
            </a>
            <button
              onClick={handleCopyPrompt}
              className={`px-4 py-2.5 text-sm rounded-[11px] border transition-colors ${
                copied
                  ? 'bg-bow-green/10 border-bow-green/30 text-bow-green'
                  : 'bg-white/5 border-white/10 text-text-muted hover:text-text-off'
              }`}
            >
              {copied ? 'Copiado!' : 'Copiar prompt'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm rounded-[11px] border border-white/10 bg-white/5 text-text-muted hover:text-text-off transition-colors"
            >
              Nova geração
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
