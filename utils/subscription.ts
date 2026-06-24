import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

/**
 * Verifica se o usuário autenticado tem assinatura ativa.
 * Wrapped em cache() do React — duas chamadas na mesma request (layout + page)
 * resultam em apenas um hit no banco.
 *
 * RLS subscriptions_select_own escopa por profile_id automaticamente —
 * não adicionar .eq('profile_id', ...) manual.
 */
export const getSubscriptionStatus = cache(async (): Promise<boolean> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('status', 'active')
    .or(
      'current_period_end.is.null,current_period_end.gt.' +
        new Date().toISOString()
    )
    .limit(1)
    .maybeSingle()

  return !!data
})
