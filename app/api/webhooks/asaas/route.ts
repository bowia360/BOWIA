import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  // --- Token validation ---
  const token = req.headers.get('asaas-access-token')
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body.event as string
  const payment = body.payment as Record<string, unknown> | undefined
  const subscription = body.subscription as Record<string, unknown> | undefined

  const admin = createAdminClient()

  // --- PAYMENT_CONFIRMED / PAYMENT_RECEIVED → activate subscription ---
  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    const asaasSubId = payment?.subscription as string | undefined
    if (!asaasSubId) {
      console.warn('[asaas-webhook] payment event missing subscription field:', event, body)
      return Response.json({ received: true })
    }

    // TODO: verify in first sandbox test whether payment.externalReference inherits
    // the externalReference set on the subscription. If it does, add a fallback lookup
    // here via externalReference (= profile_id) for edge cases where
    // provider_subscription_id doesn't match (e.g. manual subscriptions).
    const { data: sub } = await admin
      .from('subscriptions')
      .select('id')
      .eq('provider_subscription_id', asaasSubId)
      .eq('provider', 'asaas')
      .maybeSingle()

    if (!sub) {
      // Race condition (webhook arrived before INSERT in startCheckout) or unknown sub.
      // Return 200 so Asaas does not retry indefinitely — the next retry will likely
      // find the record once the INSERT completes.
      console.warn('[asaas-webhook] subscription not found for asaas_sub_id:', asaasSubId, '— returning 200, Asaas will retry')
      return Response.json({ received: true })
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await admin
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .eq('id', sub.id)

    return Response.json({ received: true })
  }

  // --- PAYMENT_OVERDUE → past_due ---
  if (event === 'PAYMENT_OVERDUE') {
    const asaasSubId = payment?.subscription as string | undefined
    if (!asaasSubId) return Response.json({ received: true })

    await admin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('provider_subscription_id', asaasSubId)
      .eq('provider', 'asaas')

    return Response.json({ received: true })
  }

  // --- SUBSCRIPTION_DELETED → canceled ---
  if (event === 'SUBSCRIPTION_DELETED') {
    const asaasSubId = subscription?.id as string | undefined
    // externalReference on the *subscription* object IS reliable (it's a subscription event,
    // not a payment event — the field comes directly from our POST /subscriptions payload).
    const profileId = subscription?.externalReference as string | undefined

    if (asaasSubId) {
      const { error } = await admin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('provider_subscription_id', asaasSubId)
        .eq('provider', 'asaas')
      if (error) {
        console.warn('[asaas-webhook] cancel by asaas_sub_id failed:', error)
      }
    } else if (profileId) {
      // Fallback: cancel by profile_id via externalReference (reliable for subscription events)
      await admin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('profile_id', profileId)
        .eq('provider', 'asaas')
        .in('status', ['active', 'past_due', 'trialing'])
    }

    return Response.json({ received: true })
  }

  // Unknown event — always acknowledge to prevent Asaas retries
  return Response.json({ received: true })
}
