'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Acesso negado')
}

export async function createPrompt(formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()

  const payload = {
    title: formData.get('title') as string,
    prompt_text: formData.get('prompt_text') as string,
    category: (formData.get('category') as string) || null,
    tags: formData.get('tags')
      ? (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    is_published: formData.get('is_published') === 'true',
  }

  const { error } = await admin.from('prompts').insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/prompts')
  revalidatePath('/galeria')
}

export async function updatePrompt(id: string, formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()

  const payload = {
    title: formData.get('title') as string,
    prompt_text: formData.get('prompt_text') as string,
    category: (formData.get('category') as string) || null,
    tags: formData.get('tags')
      ? (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    is_published: formData.get('is_published') === 'true',
  }

  const { error } = await admin.from('prompts').update(payload).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/prompts')
  revalidatePath('/galeria')
}

export async function deletePrompt(id: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('prompts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/prompts')
  revalidatePath('/galeria')
}
