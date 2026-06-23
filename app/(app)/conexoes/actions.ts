'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/utils/crypto'

type Provider = 'fal_ai' | 'openai' | 'gemini' | 'claude'

async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return { supabase, user }
}

export async function saveConnection(provider: Provider, rawKey: string) {
  const { supabase, user } = await getAuthUser()

  const key = rawKey.trim()
  if (!key) throw new Error('Chave não pode ser vazia')

  const encryptedKey = encrypt(key)

  // Upsert — unique constraint (profile_id, provider) garante uma linha por provider
  const { error } = await supabase.from('api_connections').upsert(
    {
      profile_id: user.id,
      provider,
      encrypted_key: encryptedKey,
      is_active: true,
    },
    { onConflict: 'profile_id,provider' }
  )

  if (error) throw new Error(error.message)
  revalidatePath('/conexoes')
}

export async function removeConnection(provider: Provider) {
  const { supabase, user } = await getAuthUser()

  const { error } = await supabase
    .from('api_connections')
    .delete()
    .eq('profile_id', user.id)
    .eq('provider', provider)

  if (error) throw new Error(error.message)
  revalidatePath('/conexoes')
}
