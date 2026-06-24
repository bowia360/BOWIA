import { createClient } from '@/utils/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import Link from 'next/link'

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

export default async function PlanosPage() {
  const supabase = await createClient()
  const hasSubscription = await getSubscriptionStatus()

  const { data: plans } = await supabase
    .from('plans')
    .select('id, name, price_brl, monthly_image_quota, monthly_video_quota')
    .eq('is_active', true)
    .order('price_brl')

  const formatPrice = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-sora font-bold text-3xl text-white mb-3">
            Acesso completo ao BOW Creator
          </h1>
          <p className="text-text-muted text-base max-w-md mx-auto leading-relaxed">
            Desbloqueie todas as formações, ferramentas de IA e a galeria de prompts.
          </p>
        </div>

        {/* Active subscription banner */}
        {hasSubscription && (
          <div
            className="glass-card p-5 mb-10 flex items-center gap-4"
            style={{ borderColor: 'rgba(54,226,123,0.2)', background: 'rgba(54,226,123,0.04)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(54,226,123,0.12)', border: '1px solid rgba(54,226,123,0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#36E27B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sora font-semibold text-sm" style={{ color: '#36E27B' }}>
                Você já tem acesso ativo
              </p>
              <p className="text-xs text-text-dim mt-0.5">
                Sua assinatura está ativa — aproveite todos os recursos.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-neon-blue-lt hover:text-white transition-colors shrink-0"
            >
              Ir para o app →
            </Link>
          </div>
        )}

        {/* Plans */}
        {!plans || plans.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="font-sora font-semibold text-text-off mb-1">Em breve</p>
            <p className="text-sm text-text-dim">
              Os planos estão sendo configurados. Entre em contato para mais informações.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              (plans as Plan[]).length === 1
                ? 'max-w-sm mx-auto'
                : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {(plans as Plan[]).map((plan) => (
              <div key={plan.id} className="glass-card p-7 flex flex-col">
                <h2 className="font-sora font-bold text-lg text-white mb-1">
                  {plan.name}
                </h2>
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

                {/* TODO: Parte 2 — iniciar checkout Asaas */}
                <button
                  type="button"
                  disabled={hasSubscription}
                  className="btn-primary w-full py-3 rounded-[11px] font-sora font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-default"
                >
                  {hasSubscription ? 'Plano ativo' : 'Assinar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
