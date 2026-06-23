import { createClient } from '@/utils/supabase/server'
import GaleriaClient from './GaleriaClient'

export default async function GaleriaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const { data: favorites } = await supabase
    .from('prompt_favorites')
    .select('prompt_id')
    .eq('profile_id', user?.id ?? '')

  const favoriteIds = (favorites ?? []).map((f) => f.prompt_id as string)
  const categories = [
    ...new Set(
      (prompts ?? []).map((p) => p.category).filter((c): c is string => !!c)
    ),
  ]

  return (
    <div className="p-6 md:p-8 pb-0">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="font-sora font-bold text-2xl text-white mb-1">
          Galeria de Prompts
        </h1>
        <p className="text-text-muted text-sm">
          Prompts prontos para usar no Estúdio UGC e em outras ferramentas.
        </p>
      </div>
      <GaleriaClient
        prompts={prompts ?? []}
        favoriteIds={favoriteIds}
        categories={categories}
      />
    </div>
  )
}
