'use client'

import { useState, useTransition } from 'react'
import { saveConnection, removeConnection } from './actions'

type Provider = 'fal_ai' | 'openai' | 'gemini' | 'claude'

type ConnectionInfo = {
  id: Provider
  label: string
  description: string
  placeholder: string
  docsUrl: string
}

const PROVIDERS: ConnectionInfo[] = [
  {
    id: 'fal_ai',
    label: 'fal.ai',
    description: 'Geração de imagem e vídeo (Nano Banana, Veo3)',
    placeholder: 'key-xxxxxxxxxxxxxxxxxxxxxxxx',
    docsUrl: 'https://fal.ai/dashboard/keys',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT-4 e outros modelos OpenAI',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    description: 'Gemini Pro, análise de imagem multimodal',
    placeholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'claude',
    label: 'Anthropic Claude',
    description: 'Claude Sonnet, Haiku — gerador de prompt avançado',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
]

type Props = {
  connectedProviders: Set<Provider>
}

export default function ConexoesClient({ connectedProviders }: Props) {
  const [isPending, startTransition] = useTransition()
  const [keyInputs, setKeyInputs] = useState<Partial<Record<Provider, string>>>({})
  const [replacing, setReplacing] = useState<Partial<Record<Provider, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<Provider, string>>>({})
  const [success, setSuccess] = useState<Partial<Record<Provider, boolean>>>({})

  function setKeyInput(provider: Provider, value: string) {
    setKeyInputs((prev) => ({ ...prev, [provider]: value }))
  }

  function handleSave(provider: Provider) {
    const key = keyInputs[provider] ?? ''
    setErrors((prev) => ({ ...prev, [provider]: undefined }))
    startTransition(async () => {
      try {
        await saveConnection(provider, key)
        setKeyInputs((prev) => ({ ...prev, [provider]: '' }))
        setReplacing((prev) => ({ ...prev, [provider]: false }))
        setSuccess((prev) => ({ ...prev, [provider]: true }))
        setTimeout(() => setSuccess((prev) => ({ ...prev, [provider]: false })), 3000)
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [provider]: err instanceof Error ? err.message : 'Erro ao salvar',
        }))
      }
    })
  }

  function handleRemove(provider: Provider) {
    if (!confirm(`Remover a chave de ${PROVIDERS.find((p) => p.id === provider)?.label}?`)) return
    setErrors((prev) => ({ ...prev, [provider]: undefined }))
    startTransition(async () => {
      try {
        await removeConnection(provider)
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [provider]: err instanceof Error ? err.message : 'Erro ao remover',
        }))
      }
    })
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-2xl text-white mb-1">Conexões</h1>
        <p className="text-sm text-text-muted">
          Plugue suas próprias chaves de API (BYOK) para usar seus créditos diretamente. As chaves são
          criptografadas antes de serem salvas — nunca ficam expostas.
        </p>
      </div>

      <div className="space-y-3">
        {PROVIDERS.map((provider) => {
          const isConnected = connectedProviders.has(provider.id)
          const isReplacing = replacing[provider.id] ?? false
          const showInput = !isConnected || isReplacing

          return (
            <div key={provider.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-sora font-semibold text-sm text-text-off">
                      {provider.label}
                    </span>
                    {isConnected && !isReplacing ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-bow-green/10 text-bow-green border border-bow-green/20">
                        conectado
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">
                        não conectado
                      </span>
                    )}
                    {success[provider.id] && (
                      <span className="text-[10px] text-bow-green">Salvo!</span>
                    )}
                  </div>
                  <p className="text-xs text-text-dim">{provider.description}</p>
                </div>

                {isConnected && !isReplacing && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setReplacing((prev) => ({ ...prev, [provider.id]: true }))}
                      className="text-xs text-text-muted hover:text-text-off transition-colors px-2 py-1"
                    >
                      Substituir
                    </button>
                    <button
                      onClick={() => handleRemove(provider.id)}
                      disabled={isPending}
                      className="text-xs text-text-dim hover:text-red-400 transition-colors px-2 py-1"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {showInput && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={keyInputs[provider.id] ?? ''}
                      onChange={(e) => setKeyInput(provider.id, e.target.value)}
                      placeholder={provider.placeholder}
                      disabled={isPending}
                      className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3 py-2 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/50 transition-colors font-mono disabled:opacity-50"
                    />
                    <button
                      onClick={() => handleSave(provider.id)}
                      disabled={isPending || !(keyInputs[provider.id] ?? '').trim()}
                      className="btn-primary px-4 py-2 text-sm shrink-0 disabled:opacity-50"
                    >
                      {isPending ? '...' : 'Salvar'}
                    </button>
                    {isReplacing && (
                      <button
                        onClick={() => {
                          setReplacing((prev) => ({ ...prev, [provider.id]: false }))
                          setKeyInputs((prev) => ({ ...prev, [provider.id]: '' }))
                        }}
                        className="text-xs text-text-dim hover:text-text-muted transition-colors px-2"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {errors[provider.id] && (
                    <p className="text-xs text-red-400">{errors[provider.id]}</p>
                  )}

                  <p className="text-xs text-text-dim">
                    Não tem uma chave?{' '}
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-blue-lt hover:underline"
                    >
                      Gerar em {provider.label} →
                    </a>
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
