import { getSubscriptionStatus } from '@/utils/subscription'
import { redirect } from 'next/navigation'
import GeradorClient from './GeradorClient'

export default async function GeradorPage() {
  const hasSubscription = await getSubscriptionStatus()
  if (!hasSubscription) redirect('/planos')
  return <GeradorClient />
}
