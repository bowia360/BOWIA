import { createClient } from '@/utils/supabase/server'
import { getSubscriptionStatus } from '@/utils/subscription'
import NavRail from './NavRail'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const hasSubscription = await getSubscriptionStatus()

  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      <NavRail isAdmin={isAdmin} hasSubscription={hasSubscription} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
