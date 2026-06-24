'use client'

import { useActionState } from 'react'
import { startCheckout, type CheckoutState } from './actions'

type Plan = {
  id: string
  name: string
  price_brl: number
  monthly_image_quota: number | null
  monthly_video_quota: number | null
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#36E27B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function PlanCard({
  plan,
  hasSubscription,
}: {
  plan: Plan
  hasSubscription: boolean
}) {
  const [state, action, isPending] = useActionState<CheckoutState, FormData>(
    startCheckout,
    null
  )

  const formatPrice = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="glass-card p-7 flex flex-col">
      <h2 className="font-sora font-bold text-lg text-white mb-1">{plan.name}</h2>
      <div className="mb-6">
        <span className="font-sora font-bold text-3xl text-neon-blue-lt">
          R$&nbsp;{formatPrice(plan.price_brl)}
        </span>
        <span className="text-text-dim text-sm">/mês</span>
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        <li className="flex items-center gap-2.5 text-sm text-text-muted">
          <CheckIcon />
          Acesso a todas as formações e trilhas
        </li>
        <li className="flex items-center gap-2.5 text-sm text-text-muted">
          <CheckIcon />
          Galeria completa de prompts
        </li>
        <li className="flex items-center gap-2.5 text-sm text-text-muted">
          <CheckIcon />
          Gerador de Prompt com Claude
        </li>
        <li className="flex items-center gap-2.5 text-sm text-text-muted">
          <CheckIcon />
          {plan.monthly_image_quota != null
            ? `${plan.monthly_image_quota} gerações de imagem/mês`
            : 'Estúdio UGC · Imagem'}
        </li>
        {plan.monthly_video_quota != null && (
          <li className="flex items-center gap-2.5 text-sm text-text-muted">
            <CheckIcon />
            {plan.monthly_video_quota} gerações de vídeo/mês
          </li>
        )}
      </ul>

      {hasSubscription ? (
        <button
          type="button"
          disabled
          className="btn-primary w-full py-3 rounded-[11px] font-sora font-semibold text-sm text-white opacity-50 cursor-default"
        >
          Plano ativo
        </button>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="planId" value={plan.id} />

          <div>
            <input
              name="cpf_cnpj"
              required
              placeholder="CPF (000.000.000-00) ou CNPJ"
              maxLength={18}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue/60 transition-colors"
            />
            {state?.error && (
              <p className="text-xs text-red-400 mt-1.5">{state.error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 rounded-[11px] font-sora font-semibold text-sm text-white disabled:opacity-50"
          >
            {isPending ? 'Redirecionando…' : 'Assinar'}
          </button>
        </form>
      )}
    </div>
  )
}
