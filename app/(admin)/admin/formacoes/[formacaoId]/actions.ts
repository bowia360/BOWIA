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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Acesso negado')
}

export async function createTrack(formacaoId: string, formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()
  const title = formData.get('title') as string
  const { error } = await admin.from('tracks').insert({
    formation_id: formacaoId,
    title,
    slug: toSlug(title),
    level: (formData.get('level') as string) || null,
    order_index: Number(formData.get('order_index') ?? 0),
    is_published: formData.get('is_published') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/formacoes/${formacaoId}`)
}

export async function updateTrack(formacaoId: string, trackId: string, formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('tracks').update({
    title: formData.get('title') as string,
    level: (formData.get('level') as string) || null,
    order_index: Number(formData.get('order_index') ?? 0),
    is_published: formData.get('is_published') === 'true',
  }).eq('id', trackId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/formacoes/${formacaoId}`)
}

export async function deleteTrack(formacaoId: string, trackId: string) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('tracks').delete().eq('id', trackId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/formacoes/${formacaoId}`)
}
