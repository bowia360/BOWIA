'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

export async function createFormacao(formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()

  const title = formData.get('title') as string
  const payload = {
    title,
    slug: toSlug(title),
    description: (formData.get('description') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
    is_published: formData.get('is_published') === 'true',
  }

  const { error } = await admin.from('formations').insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/formacoes')
  revalidatePath('/formacoes')
}

export async function updateFormacao(id: string, formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()

  const payload = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
    is_published: formData.get('is_published') === 'true',
  }

  const { error } = await admin.from('formations').update(payload).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/formacoes')
  revalidatePath('/formacoes')
}

export async function deleteFormacao(id: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('formations').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/formacoes')
  revalidatePath('/formacoes')
}
