const BASE_URL =
  process.env.ASAAS_API_URL ?? 'https://api-sandbox.asaas.com/v3'
const API_KEY = process.env.ASAAS_API_KEY ?? ''

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  if (!API_KEY) throw new Error('ASAAS_API_KEY não configurada')
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      access_token: API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(
      `Asaas ${method} ${path} → ${res.status}: ${JSON.stringify(detail)}`
    )
  }
  return res.json() as Promise<T>
}

type CustomerList = { data: { id: string }[] }
type Customer = { id: string }
type Subscription = { id: string }
type PaymentList = {
  data: { invoiceUrl: string | null; bankSlipUrl: string | null }[]
}

export async function findOrCreateCustomer(params: {
  email: string
  name: string
  cpfCnpj: string
  externalReference: string
}): Promise<string> {
  const list = await request<CustomerList>(
    'GET',
    `/customers?email=${encodeURIComponent(params.email)}&limit=1`
  )
  if (list.data.length > 0) return list.data[0].id

  const customer = await request<Customer>('POST', '/customers', {
    name: params.name,
    email: params.email,
    cpfCnpj: params.cpfCnpj,
    externalReference: params.externalReference,
  })
  return customer.id
}

export async function createSubscription(params: {
  customerId: string
  value: number
  description: string
  externalReference: string
}): Promise<string> {
  // nextDueDate must be today or future; +1 day avoids timezone edge cases
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextDueDate = tomorrow.toISOString().split('T')[0]

  const sub = await request<Subscription>('POST', '/subscriptions', {
    customer: params.customerId,
    billingType: 'UNDEFINED', // Customer chooses method (PIX/boleto/cartão) on Asaas page
    value: params.value,
    nextDueDate,
    cycle: 'MONTHLY',
    description: params.description,
    externalReference: params.externalReference,
    // NOTE: whether externalReference propagates from subscription to auto-generated
    // payment objects in PAYMENT_CONFIRMED webhooks is unconfirmed — verify on first
    // sandbox test. Webhook lookup uses provider_subscription_id (payment.subscription)
    // as the reliable primary key; externalReference is used as fallback only on
    // SUBSCRIPTION_DELETED, where the subscription object itself carries the field.
  })
  return sub.id
}

export async function getFirstPaymentUrl(subscriptionId: string): Promise<string> {
  const payments = await request<PaymentList>(
    'GET',
    `/subscriptions/${subscriptionId}/payments?limit=1`
  )
  const first = payments.data[0]
  const url = first?.invoiceUrl ?? first?.bankSlipUrl
  if (!url) {
    throw new Error(
      'URL de pagamento não disponível para a subscription ' + subscriptionId
    )
  }
  return url
}
