import { getSubscriptionStatus } from '@/utils/subscription'
import { redirect } from 'next/navigation'
import EstudioClient from './EstudioClient'

export default async function EstudioPage() {
  const hasSubscription = await getSubscriptionStatus()
  if (!hasSubscription) redirect('/planos')
  return <EstudioClient />
}
