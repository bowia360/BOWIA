import { createAdminClient } from '@/utils/supabase/admin'
import PromptsClient from './PromptsClient'

export default async function AdminPromptsPage() {
  const admin = createAdminClient()
  const { data: prompts } = await admin
    .from('prompts')
    .select('id, title, prompt_text, category, tags, is_published, created_at')
    .order('created_at', { ascending: false })

  return <PromptsClient prompts={prompts ?? []} />
}
