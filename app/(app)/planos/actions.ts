'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  findOrCreateCustomer,
  createSubscription,
  getFirstPaymentUrl,
} from '@/utils/asaas'

export type CheckoutState = { error: string } | null

function stripMask(value: string): string {
  return value.replace(/\D/g, '')
}

export async function startCheckout(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // --- 1. Validate CPF (11 digits) or CNPJ (14 digits) — no check digit validation ---
  const cpfCnpj = stripMask((formData.get('cpf_cnpj') as string) ?? '')
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return {
      error:
        'CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos (apenas números, sem pontuação).',
    }
  }

  // --- 2. Get current user ---
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Sessão expirada. Faça login novamente.' }

  // --- 3. Get plan ---
  const planId = formData.get('planId') as string
  const { data: plan } = await supabase
    .from('plans')
    .select('name, price_brl')
    .eq('id', planId)
    .eq('is_active', true)
    .single()
  if (!plan) return { error: 'Plano não encontrado ou inativo.' }

  // --- 4 & 5. Asaas: find/create customer → create subscription → get payment URL ---
  const customerName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email.split('@')[0]

  let invoiceUrl: string
  let asaasSubId: string
  try {
    const customerId = await findOrCreateCustomer({
      email: user.email,
      name: customerName,
      cpfCnpj,
      externalReference: user.id,
    })
    asaasSubId = await createSubscription({
      customerId,
      value: Number(plan.price_brl),
      description: plan.name,
      externalReference: user.id,
    })
    invoiceUrl = await getFirstPaymentUrl(asaasSubId)
  } catch (err) {
    console.error('[startCheckout] Asaas error:', err)
    return { error: 'Erro ao iniciar pagamento. Tente novamente em instantes.' }
  }

  // --- 6. Create local subscription (status='trialing' = awaiting first payment confirmation,
  //        NOT a free trial — 'trialing' is chosen because it does not grant access;
  //        getSubscriptionStatus requires status='active'. No 'pending' in the schema
  //        check constraint, so 'trialing' is repurposed here.) ---
  const admin = createAdminClient()
  const { error: dbError } = await admin.from('subscriptions').insert({
    profile_id: user.id,
    plan_id: planId,
    status: 'trialing',
    provider: 'asaas',
    provider_subscription_id: asaasSubId,
  })
  if (dbError) {
    // Non-fatal: subscription exists in Asaas. Webhook will activate it on payment.
    console.error('[startCheckout] DB insert error (non-fatal):', dbError)
  }

  // redirect() throws NEXT_REDIRECT — must be outside try/catch
  redirect(invoiceUrl)
}
