import { createClient } from '@/utils/supabase/server'
import GaleriaClient, { type Prompt } from '@/app/(app)/galeria/GaleriaClient'

export default async function FavoritosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rows } = await supabase
    .from('prompt_favorites')
    .select('prompt_id, prompts(*)')
    .eq('profile_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  const prompts = (rows ?? [])
    .map((r) => r.prompts as unknown as Prompt | null)
    .filter((p): p is Prompt => p !== null && p.is_published === true)

  const favoriteIds = prompts.map((p) => p.id)
  const categories = [
    ...new Set(
      prompts.map((p) => p.category).filter((c): c is string => !!c)
    ),
  ]

  return (
    <div className="p-6 md:p-8 pb-0">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="font-sora font-bold text-2xl text-white mb-1">
          Meus Favoritos
        </h1>
        <p className="text-text-muted text-sm">
          Seus prompts salvos para acesso rápido.
        </p>
      </div>
      <GaleriaClient
        prompts={prompts}
        favoriteIds={favoriteIds}
        categories={categories}
        emptyMessage="Você ainda não favoritou nenhum prompt. Explore a Galeria e salve os que gostar."
      />
    </div>
  )
}
