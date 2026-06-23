'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function toggleFavorite(promptId: string, isFavorited: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  if (isFavorited) {
    await supabase
      .from('prompt_favorites')
      .delete()
      .eq('profile_id', user.id)
      .eq('prompt_id', promptId)
  } else {
    await supabase
      .from('prompt_favorites')
      .insert({ profile_id: user.id, prompt_id: promptId })
  }

  revalidatePath('/galeria')
  revalidatePath('/favoritos')
}
