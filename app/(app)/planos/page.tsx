import { createClient } from '@/utils/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import Link from 'next/link'
import { PlanCard } from './PlanCard'

type Plan = {
  id: string
  name: string
  price_brl: number
  monthly_image_quota: number | null
  monthly_video_quota: number | null
}

export default async function PlanosPage() {
  const supabase = await createClient()
  const hasSubscription = await getSubscriptionStatus()

  const { data: plans } = await supabase
    .from('plans')
    .select('id, name, price_brl, monthly_image_quota, monthly_video_quota')
    .eq('is_active', true)
    .order('price_brl')

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
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(54,226,123,0.12)',
                border: '1px solid rgba(54,226,123,0.3)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#36E27B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <PlanCard
                key={plan.id}
                plan={plan as Plan}
                hasSubscription={hasSubscription}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
